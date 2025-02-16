import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./page";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Next.js useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock the authSuccessfully function
const authSuccessfullyMock = jest.fn();
jest.mock("../../../utils/auth", () => ({
  authSuccessfully: (res: any, email: string, router: any) =>
    authSuccessfullyMock(res, email, router),
}));

// Mock child components
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Headers", () => () => <div>Header Component</div>);
jest.mock(
  "@/app/components/Toast",
  () =>
    // eslint-disable-next-line react/display-name
    ({
      show,
      message,
    }: {
      show: boolean;
      message: string;
      onClose: () => void;
    }) =>
      show ? <div>{message}</div> : null
);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Login Page", () => {
  test("renders login page with form fields", () => {
    render(<Login />);
    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("displays error toast when password is invalid", async () => {
    render(<Login />);

    // Fill in email and an invalid password.
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: "invalid" }, // does not meet regex criteria
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Expect error toast message.
    await waitFor(() => {
      expect(
        screen.getByText(
          /Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters/i
        )
      ).toBeInTheDocument();
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test("calls axios post and authSuccessfully on valid login", async () => {
    const fakeResponse = { data: { token: "dummy-token" } };
    mockedAxios.post.mockResolvedValueOnce(fakeResponse);

    render(<Login />);

    // Provide valid credentials.
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: "ValidPass1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait until axios.post is called with expected URL and payload.
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("auth/token/"),
        { email: "user@example.com", password: "ValidPass1!" }
      );
    });

    // Verify authSuccessfully was called on successful post.
    await waitFor(() => {
      expect(authSuccessfullyMock).toHaveBeenCalledWith(
        fakeResponse,
        "user@example.com",
        expect.any(Object)
      );
    });
  });

  test("displays error toast when axios post fails", async () => {
    const errorResponse = { response: { data: { error: "Login failed" } } };
    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    render(<Login />);

    // Provide valid credentials but axios will fail.
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: "ValidPass1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Expect the error toast message from axios failure.
    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });
});
