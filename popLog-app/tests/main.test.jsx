import { render, screen } from "@testing-library/react";

function TestComponent() {
  return <h1>Hello World</h1>;
}

describe("TestComponent", () => {
  it("renders text", () => {
    render(<TestComponent />);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
