import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "../../../src/features/searchpage/SearchBar.jsx";

const defaultProps = {
  mediaCategory: "movies",
  inputValue: "",
  onInputChange: vi.fn(),
  onSearchSubmit: vi.fn(),
  showClear: false,
  onClear: vi.fn(),
  error: "",
};

const renderSearchBar = (props = {}) =>
  render(
    <MemoryRouter>
      <SearchBar {...defaultProps} {...props} />
    </MemoryRouter>,
  );

describe("SearchBar", () => {
  it("should render all media category links", () => {
    renderSearchBar();

    expect(screen.getByText(/movies & tv/i)).toBeInTheDocument();
    expect(screen.getByText(/games/i)).toBeInTheDocument();
    expect(screen.getByText(/books/i)).toBeInTheDocument();
  });

  it("should highlight the active media category", () => {
    renderSearchBar({
      mediaCategory: "games",
    });

    const gamesLink = screen.getByRole("link", {
      name: /games/i,
    });

    expect(gamesLink).toHaveClass("active");
  });

  it("should render the movies placeholder correctly", () => {
    renderSearchBar({
      mediaCategory: "movies",
    });

    expect(
      screen.getByPlaceholderText(/search all movies & tv/i),
    ).toBeInTheDocument();
  });

  it("should render the books placeholder correctly", () => {
    renderSearchBar({
      mediaCategory: "books",
    });

    expect(
      screen.getByPlaceholderText(/search all books/i),
    ).toBeInTheDocument();
  });

  it("should call onInputChange when the user types", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();

    renderSearchBar({
      onInputChange,
    });

    await user.type(screen.getByLabelText(/search input/i), "Matilda");

    expect(onInputChange).toHaveBeenCalledTimes(7);
  });

  it("should call onSearchSubmit when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSearchSubmit = vi.fn();

    renderSearchBar({
      inputValue: "Matilda",
      onSearchSubmit,
    });

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    expect(onSearchSubmit).toHaveBeenCalledOnce();
  });

  it("should call onClear when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    renderSearchBar({
      showClear: true,
      onClear,
    });

    await user.click(
      screen.getByRole("button", {
        name: /clear search/i,
      }),
    );

    expect(onClear).toHaveBeenCalledOnce();
  });
});
