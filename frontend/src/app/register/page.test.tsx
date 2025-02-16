import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./page";
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
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Headers", () => () => (
  <div data-testid="header">Mock Header</div>
));
jest.mock("@/app/components/Toast", () => {
  // eslint-disable-next-line react/display-name
  return ({ show, message }: any) =>
    show ? <div data-testid="toast">{message}</div> : null;
});
// Since we import styles, we can mock them
jest.mock("@/app/styles/authen.module.css", () => ({
  container: "container",
  title: "title",
  form: "form",
  label: "label",
  input: "input",
  button: "button",
}));

describe("Register Component", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("renders register page correctly", () => {
    render(<Register />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    // Select heading element by role with proper level to avoid ambiguity
    expect(
      screen.getByRole("heading", { level: 2, name: /Register/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i })
    ).toBeInTheDocument();
  });

  it("shows validation error for invalid password", async () => {
    render(<Register />);
    const nameInput = screen.getByLabelText(/Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const registerButton = screen.getByRole("button", { name: /Register/i });

    // Enter valid name and email but invalid password (e.g. missing uppercase & special char)
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "invalid123" } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByTestId("toast")).toHaveTextContent(
        "Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters"
      );
    });
    expect(axios.post).not.toHaveBeenCalled();
    expect(authSuccessfully).not.toHaveBeenCalled();
  });

  it("calls axios and authSuccessfully on valid submission", async () => {
    const mockResponse = { data: {} };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<Register />);
    const nameInput = screen.getByLabelText(/Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const registerButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    // Valid password
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: "Test User",
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

  it("displays error toast if axios post fails", async () => {
    const errorResponse = {
      response: { data: { error: "Registration failed" } },
    };
    (axios.post as jest.Mock).mockRejectedValueOnce(errorResponse);

    render(<Register />);
    const nameInput = screen.getByLabelText(/Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const registerButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByTestId("toast")).toHaveTextContent(
        "Registration failed"
      );
    });
  });
});
