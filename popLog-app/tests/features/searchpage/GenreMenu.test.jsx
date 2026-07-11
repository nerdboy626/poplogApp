import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenreMenu from "../../../src/features/searchpage/GenreMenu.jsx";

const genreOptions = [
  { id: "action", name: "Action & Adventure" },
  { id: "animation", name: "Animation" },
  { id: "comedy", name: "Comedy" },
];

const defaultProps = {
  mediaCategory: "movies",
  options: genreOptions,
  selected: "",
  onChange: vi.fn(),
  showClear: false,
  onClear: vi.fn(),
};

const renderGenreMenu = (props = {}) =>
  render(<GenreMenu {...defaultProps} {...props} />);

describe("GenreMenu", () => {
  it("should render the movies label correctly", () => {
    renderGenreMenu();

    expect(
      screen.getByText(/browse popular movies & tv by genre/i),
    ).toBeInTheDocument();
  });

  it("should render the books label correctly", () => {
    renderGenreMenu({
      mediaCategory: "books",
    });

    expect(
      screen.getByText(/browse popular books by genre/i),
    ).toBeInTheDocument();
  });

  it("should render all provided genre options", () => {
    renderGenreMenu();

    expect(
      screen.getByRole("option", {
        name: /select a genre/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /action & adventure/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /animation/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /comedy/i,
      }),
    ).toBeInTheDocument();
  });

  it("should display the selected genre", () => {
    renderGenreMenu({
      selected: "action",
    });

    expect(screen.getByRole("combobox")).toHaveValue("action");
  });

  it("should call onChange when a genre is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderGenreMenu({
      onChange,
    });

    await user.selectOptions(screen.getByRole("combobox"), "action");

    expect(onChange).toHaveBeenCalledWith("action");
  });

  it("should disable the clear button when no genre is selected", () => {
    renderGenreMenu({
      showClear: false,
    });

    expect(
      screen.getByRole("button", {
        name: /clear genre/i,
      }),
    ).toBeDisabled();
  });

  it("should enable the clear button when a genre is selected", () => {
    renderGenreMenu({
      showClear: true,
    });

    expect(
      screen.getByRole("button", {
        name: /clear genre/i,
      }),
    ).toBeEnabled();
  });
});
