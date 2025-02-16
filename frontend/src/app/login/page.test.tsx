import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./page";
import axios from "axios";
import { useRouter } from "next/navigation";
import { authSuccessfully } from "../../../utils/auth";

// Mock dependencies
jest.mock("axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("../../../utils/auth", () => ({
  authSuccessfully: jest.fn(),
}));

// Mock child components
jest.mock("@/app/components/Headers", () => () => (
  <div data-testid="header">Mock Header</div>
));
jest.mock(
  "@/app/components/Toast",
  () =>
    ({ show, message }: any) =>
      show ? <div data-testid="toast">{message}</div> : null
);
jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

describe("Login Component", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("renders login page correctly", () => {
    render(<Login />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation error for invalid password", async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    // Invalid password (missing uppercase, special char, etc.)
    fireEvent.change(passwordInput, { target: { value: "invalidpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId("toast")).toHaveTextContent(
        "Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters"
      );
    });
    expect(axios.post).not.toHaveBeenCalled();
    expect(authSuccessfully).not.toHaveBeenCalled();
  });

  it("submits form and calls axios and authSuccessfully on valid login", async () => {
    const mockResponse = { data: {} };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    // Valid password: meets regex criteria
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          email: "test@example.com",
          password: "Valid@123",
        })
      );
      expect(authSuccessfully).toHaveBeenCalledWith(
        mockResponse,
        "test@example.com",
        expect.any(Object)
      );
    });
  });

  it("displays error toast when axios post fails", async () => {
    const errorResponse = {
      response: { data: { error: "Invalid credentials" } },
    };
    (axios.post as jest.Mock).mockRejectedValueOnce(errorResponse);

    render(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId("toast")).toHaveTextContent(
        "Invalid credentials"
      );
    });
  });
});
