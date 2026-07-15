import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MediaRate from "../../../src/features/mediadetails/MediaRate.jsx";

describe("MediaRate", () => {
  const defaultProps = {
    rating: 7,
    favorite: false,
    onRatingChange: vi.fn(),
    onFavoriteToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the rating and favorite headings", () => {
    render(<MediaRate {...defaultProps} />);

    expect(screen.getByText("Your Rating")).toBeInTheDocument();
    expect(screen.getByText("Favorite")).toBeInTheDocument();
  });

  it("should render seven stars", () => {
    const { container } = render(<MediaRate {...defaultProps} />);

    const stars = container.querySelectorAll(".media-rate__star-icon.active");

    expect(stars).toHaveLength(7);
  });

  it("should call onRatingChange when a star is clicked", async () => {
    const user = userEvent.setup();

    const { container } = render(<MediaRate {...defaultProps} />);

    const stars = container.querySelectorAll(".media-rate__star-icon");

    await user.click(stars[4]);

    expect(defaultProps.onRatingChange).toHaveBeenCalledWith(5);
    expect(defaultProps.onRatingChange).toHaveBeenCalledTimes(1);
  });

  it("should call onFavoriteToggle when the heart is clicked", async () => {
    const user = userEvent.setup();

    const { container } = render(<MediaRate {...defaultProps} />);

    const heart = container.querySelector(".media-rate__heart-icon");

    await user.click(heart);

    expect(defaultProps.onFavoriteToggle).toHaveBeenCalledTimes(1);
  });

  it("should render a filled heart when favorite is true", () => {
    const { container } = render(
      <MediaRate {...defaultProps} favorite={true} />,
    );

    const heart = container.querySelector(".media-rate__heart-icon");

    expect(heart).toHaveClass("active");
  });
});
