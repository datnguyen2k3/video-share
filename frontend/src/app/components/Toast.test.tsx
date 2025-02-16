import { render, screen, fireEvent } from "@testing-library/react";
import Toast from "./Toast";

describe("Toast Component", () => {
  const defaultProps = {
    message: "Test message",
    type: "success" as const,
    show: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders success toast correctly", () => {
    render(<Toast {...defaultProps} />);

    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders error toast correctly", () => {
    render(<Toast {...defaultProps} type="error" />);

    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(<Toast {...defaultProps} show={false} />);

    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<Toast {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("automatically closes after 3 seconds", () => {
    render(<Toast {...defaultProps} />);

    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("clears timeout on unmount", () => {
    const { unmount } = render(<Toast {...defaultProps} />);
    unmount();
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("clears timeout when show changes to false", () => {
    const { rerender } = render(<Toast {...defaultProps} />);
    rerender(<Toast {...defaultProps} show={false} />);
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("renders correct icon for success type", () => {
    render(<Toast {...defaultProps} />);

    const successIcon = document.querySelector("svg path");
    expect(successIcon).toHaveAttribute(
      "d",
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    );
  });

  it("renders correct icon for error type", () => {
    render(<Toast {...defaultProps} type="error" />);

    const errorIcon = document.querySelector("svg path");
    expect(errorIcon).toHaveAttribute(
      "d",
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
    );
  });
});
