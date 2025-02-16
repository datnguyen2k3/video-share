import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import Header from "./Headers";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Header Component", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Clear localStorage
    localStorage.clear();
  });

  it("renders logo and login button when user is not logged in", () => {
    render(<Header />);

    expect(screen.getByText("Funny Movies")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
  });

  it("renders welcome message and logout button when user is logged in", () => {
    const mockUserData = {
      email: "test@example.com",
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    render(<Header />);

    expect(
      screen.getByText(`Welcome ${mockUserData.email}`)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /share a movie/i })
    ).toBeInTheDocument();
  });

  it("navigates to login page when login button is clicked", () => {
    render(<Header />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("handles logout correctly", () => {
    const mockUserData = {
      email: "test@example.com",
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    render(<Header />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("userData")).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("navigates to share video page when share button is clicked", () => {
    const mockUserData = {
      email: "test@example.com",
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    render(<Header />);

    const shareButton = screen.getByRole("button", { name: /share a movie/i });
    fireEvent.click(shareButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/shareVideo");
  });

  it("navigates to home page when logo is clicked", () => {
    render(<Header />);

    const logo = screen.getByText("Funny Movies");
    fireEvent.click(logo);

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("renders home emoji with correct accessibility attributes", () => {
    render(<Header />);

    const homeEmoji = screen.getByRole("img", { name: /home/i });
    expect(homeEmoji).toBeInTheDocument();
    expect(homeEmoji).toHaveAttribute("aria-label", "home");
  });
});
