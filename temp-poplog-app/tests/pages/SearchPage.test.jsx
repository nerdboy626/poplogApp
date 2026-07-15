import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import SearchPage from "../../src/pages/SearchPage.jsx";
import { API_BASE_URL } from "../../src/config/env.js";

const mockUseLoaderData = vi.fn();
const mockUseGameGenres = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useLoaderData: () => mockUseLoaderData(),
  };
});

vi.mock("../../src/features/searchpage/hooks/useGameGenres", () => ({
  default: () => mockUseGameGenres(),
}));

vi.mock("../../src/features/searchpage/SearchDisplay", () => ({
  default: ({ item }) => <div data-testid="search-display">{item.title}</div>,
}));

const renderSearchPage = () =>
  render(
    <MemoryRouter>
      <SearchPage />
    </MemoryRouter>,
  );

describe("SearchPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    mockUseLoaderData.mockReturnValue({
      category: "movies",
    });

    mockUseGameGenres.mockReturnValue([]);

    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();

    global.fetch = vi.fn();
  });

  it("should render the welcome message on initial load", () => {
    renderSearchPage();

    expect(
      screen.getByRole("heading", {
        name: /find your/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/search for/i)).toBeInTheDocument();
  });

  it("should disable search button when search input is empty or contains only whitespace", async () => {
    const user = userEvent.setup();

    renderSearchPage();

    const button = screen.getByRole("button", {
      name: /search/i,
    });

    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Search input"), "   ");

    expect(button).toBeDisabled();
  });

  it("should allow the user to enter a search query", async () => {
    const user = userEvent.setup();

    renderSearchPage();

    const input = screen.getByLabelText("Search input");

    await user.type(input, "Matilda");

    expect(input).toHaveValue("Matilda");
  });

  it("should fetch search results when submitting a valid search", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [
        {
          title: "Matilda",
        },
      ],
    });

    renderSearchPage();

    await user.type(screen.getByLabelText("Search input"), "Matilda");

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/movies/search?query=Matilda`,
      );
    });
  });

  it("should display search results after a successful search", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [
        {
          title: "Spiderman",
        },
        {
          title: "Superman",
        },
      ],
    });

    renderSearchPage();

    await user.type(screen.getByLabelText("Search input"), "hero");

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    expect(await screen.findByText("Spiderman")).toBeInTheDocument();

    expect(screen.getByText("Superman")).toBeInTheDocument();

    expect(screen.getAllByTestId("search-display")).toHaveLength(2);
  });

  it("should clear the search input when clicking clear", async () => {
    const user = userEvent.setup();

    renderSearchPage();

    const input = screen.getByLabelText("Search input");

    await user.type(input, "Matilda");

    await user.click(
      screen.getByRole("button", {
        name: /clear search/i,
      }),
    );

    expect(input).toHaveValue("");

    expect(
      screen.queryByRole("button", {
        name: /clear search/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("should show no results message when search returns no results", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [],
    });

    renderSearchPage();

    await user.type(screen.getByLabelText("Search input"), "doesnotexist");

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    expect(await screen.findByText(/no results found/i)).toBeInTheDocument();

    expect(screen.getByText(/doesnotexist/i)).toBeInTheDocument();
  });

  it("should fetch genre results when selecting a genre", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [
        { title: "Toy Story" },
        { title: "Avatar: The Last Airbender" },
      ],
    });

    renderSearchPage();

    await user.selectOptions(
      screen.getByLabelText(/browse popular movies/i),
      "animation",
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/movies/genre/animation`,
      );
    });

    expect(await screen.findByText("Toy Story")).toBeInTheDocument();
    expect(screen.getByText("Avatar: The Last Airbender")).toBeInTheDocument();
  });

  it("should clear the selected genre when clicking Clear Genre", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [{ title: "Toy Story" }],
    });

    renderSearchPage();

    const select = screen.getByLabelText(/browse popular movies/i);

    await user.selectOptions(select, "animation");

    await screen.findByText("Toy Story");

    await user.click(
      screen.getByRole("button", {
        name: /clear genre/i,
      }),
    );

    expect(select).toHaveValue("");

    expect(screen.queryByText("Toy Story")).not.toBeInTheDocument();
  });

  it("should hide the genre menu after performing a search", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [{ title: "Matilda" }],
    });

    renderSearchPage();

    await user.type(screen.getByLabelText("Search input"), "Matilda");

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    expect(await screen.findByText("Matilda")).toBeInTheDocument();

    expect(
      screen.queryByLabelText(/browse popular movies/i),
    ).not.toBeInTheDocument();
  });

  it("should restore cached search results from localStorage", async () => {
    Storage.prototype.getItem = vi.fn(() =>
      JSON.stringify({
        movies: {
          query: "Matilda",
          searchResults: [{ title: "Matilda" }],
          genre: "",
          genreResults: [],
        },
        books: {
          query: "",
          searchResults: [],
          genre: "",
          genreResults: [],
        },
        games: {
          query: "",
          searchResults: [],
          genre: "",
          genreResults: [],
        },
      }),
    );

    renderSearchPage();

    expect(await screen.findByText("Matilda")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Matilda")).toBeInTheDocument();
  });

  it("should save the search cache to localStorage", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: async () => [{ title: "Matilda" }],
    });

    renderSearchPage();

    await user.type(screen.getByLabelText("Search input"), "Matilda");

    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      }),
    );

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "searchCache",
        expect.any(String),
      );
    });
  });
});
