import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLoaderData, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../src/utils/useAuth.js";
import { fetchWithAuth } from "../../src/utils/fetchWithAuth";
import MediaDetails from "../../src/pages/MediaDetails.jsx";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useLoaderData: vi.fn(),
    useParams: vi.fn(),
  };
});

vi.mock("../../src/utils/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/utils/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));

vi.mock("../../src/features/mediadetails/MediaRate", () => ({
  default: () => <div>Media Rate</div>,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseLoaderData = vi.mocked(useLoaderData);
const mockUseParams = vi.mocked(useParams);
const mockUseAuth = vi.mocked(useAuth);
const mockFetchWithAuth = vi.mocked(fetchWithAuth);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

const movie = {
  title: "Matilda",
  releaseYear: 1996,
  summary: "Matilda Wormwood is an brilliant and intelligent little girl.",
  creators: "Danny DeVito",
  coverUrl: "poster.jpg",
  runtime: "1h 38m",
  rating: 7.2,
  genres: ["Comedy", "Family"],
  mediaType: "movie",
};

describe("MediaDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLoaderData.mockReturnValue(movie);

    mockUseParams.mockReturnValue({
      mediaType: "movie",
      id: "1",
    });

    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      user: null,
    });
  });

  it("should render the media information", () => {
    render(<MediaDetails />);

    expect(
      screen.getByRole("heading", {
        name: "Matilda (1996)",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/directed by danny devito/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        "Matilda Wormwood is an brilliant and intelligent little girl.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Runtime: 1h 38m")).toBeInTheDocument();

    expect(screen.getByText("Comedy")).toBeInTheDocument();

    expect(screen.getByText("Family")).toBeInTheDocument();
  });

  it("should render the cover image when one exists", () => {
    render(<MediaDetails />);

    expect(
      screen.getByRole("img", {
        name: /movie poster/i,
      }),
    ).toHaveAttribute("src", "poster.jpg");
  });

  it("should render a placeholder when no cover image exists", () => {
    mockUseLoaderData.mockReturnValue({
      ...movie,
      coverUrl: null,
    });

    render(<MediaDetails />);

    expect(screen.getByText(/no image/i)).toBeInTheDocument();

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should render the user's notes textarea", () => {
    render(<MediaDetails />);

    expect(
      screen.getByRole("textbox", {
        name: /your notes/i,
      }),
    ).toBeInTheDocument();
  });

  it("should fetch the user's existing review when logged in", async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockResolvedValue({
      json: async () => ({
        rating: 9,
        favorite: true,
        notes: "A nostalgic classic.",
        mediaId: 15,
      }),
    });

    render(<MediaDetails />);

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("/api/reviews/movie/1"),
        {
          method: "GET",
        },
        expect.objectContaining({
          isLoggedIn: true,
        }),
      );
    });
  });

  it("should populate the user's existing review data", async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockResolvedValue({
      json: async () => ({
        rating: 9,
        favorite: true,
        notes: "A nostalgic classic.",
        mediaId: 15,
      }),
    });

    render(<MediaDetails />);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("A nostalgic classic."),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", {
        name: /delete/i,
      }),
    ).toBeInTheDocument();
  });

  it("should not show save button when review has not changed", async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockResolvedValue({
      json: async () => ({
        rating: 9,
        favorite: true,
        notes: "A nostalgic classic.",
        mediaId: 15,
      }),
    });

    render(<MediaDetails />);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("A nostalgic classic."),
      ).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", {
      name: /save/i,
    });

    expect(saveButton).not.toHaveClass("show");
  });

  it("should show an error toast when saving while logged out", async () => {
    const user = userEvent.setup();

    render(<MediaDetails />);

    const notes = screen.getByRole("textbox", {
      name: /your notes/i,
    });

    await user.type(notes, "My thoughts on Matilda");

    const saveButton = screen.getByRole("button", {
      name: /save/i,
    });

    await user.click(saveButton);

    expect(mockToastError).toHaveBeenCalledWith("You must be logged in.", {
      id: "main",
    });

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  it("should save review when a user with no existing review writes one and saves", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockImplementation((url, options) => {
      if (options.method === "GET") {
        return Promise.resolve({
          ok: true,
          json: async () => null, // no existing review — component's `if (data)` guard skips setting state
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ media_id: 25 }),
      });
    });

    render(<MediaDetails />);

    await user.type(
      screen.getByRole("textbox", {
        name: /your notes/i,
      }),
      "A nostalgic classic.",
    );

    await user.click(
      screen.getByRole("button", {
        name: /save/i,
      }),
    );

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalled();
    });

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/api/reviews/save"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: "1",
          mediaType: "movie",
          title: "Matilda",
          summary:
            "Matilda Wormwood is an brilliant and intelligent little girl.",
          releaseYear: 1996,
          coverUrl: "poster.jpg",
          rating: 0,
          favorite: false,
          notes: "A nostalgic classic.",
        }),
      }),
      expect.objectContaining({
        isLoggedIn: true,
      }),
    );
  });

  it("should show delete button after successfully saving", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({
        media_id: 25,
      }),
    });

    render(<MediaDetails />);

    await user.type(
      screen.getByRole("textbox", {
        name: /your notes/i,
      }),
      "A nostalgic classic.",
    );

    await user.click(
      screen.getByRole("button", {
        name: /save/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /delete entry/i,
        }),
      ).toBeInTheDocument();
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("Entry saved!", {
      id: "main",
    });
  });

  it("should open and close the delete confirmation modal", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockImplementation((url, options) => {
      if (options.method === "GET") {
        return Promise.resolve({
          json: async () => ({
            rating: 9,
            favorite: true,
            notes: "A nostalgic classic.",
            mediaId: 15,
          }),
        });
      }
    });

    render(<MediaDetails />);

    const deleteButton = await screen.findByRole("button", {
      name: /delete entry/i,
    });

    await user.click(deleteButton);

    expect(screen.getByText(/delete journal entry\?/i)).toBeInTheDocument();

    expect(
      screen.getByText(/this will permanently remove this entry/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    );

    expect(
      screen.queryByText(/delete journal entry\?/i),
    ).not.toBeInTheDocument();
  });

  it("should delete the review successfully", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: {
        token: "fake-token",
      },
    });

    mockFetchWithAuth.mockImplementation((url, options) => {
      if (options.method === "GET") {
        return Promise.resolve({
          json: async () => ({
            rating: 8,
            favorite: true,
            notes: "Great movie",
            mediaId: 25,
          }),
        });
      }

      if (options.method === "DELETE") {
        return Promise.resolve({
          ok: true,
        });
      }
    });

    render(<MediaDetails />);

    await user.click(
      await screen.findByRole("button", {
        name: /delete entry/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /confirm delete/i,
      }),
    );

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("/api/reviews/delete/25"),
        {
          method: "DELETE",
        },
        expect.objectContaining({
          isLoggedIn: true,
        }),
      );
    });

    expect(
      screen.queryByRole("button", {
        name: /delete entry/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("should show the show more button for long summaries", () => {
    mockUseLoaderData.mockReturnValue({
      ...movie,
      summary: "A".repeat(600),
    });

    render(<MediaDetails />);

    expect(
      screen.getByRole("button", {
        name: /show more/i,
      }),
    ).toBeInTheDocument();
  });

  it("should expand and collapse the summary", async () => {
    const user = userEvent.setup();

    mockUseLoaderData.mockReturnValue({
      ...movie,
      summary: "A".repeat(600),
    });

    render(<MediaDetails />);

    const button = screen.getByRole("button", {
      name: /show more/i,
    });

    await user.click(button);

    expect(
      screen.getByRole("button", {
        name: /show less/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /show less/i,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: /show more/i,
      }),
    ).toBeInTheDocument();
  });
});
