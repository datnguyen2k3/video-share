import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import YoutubeShareForm from "./page";
import axios from "axios";
import { fetchYoutubeVideoData } from "../../../utils/youtubeApi";

// --- Mocks ---

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock getAuthorization to return a dummy token.
jest.mock("../../../utils/auth", () => ({
  getAuthorization: jest.fn(() => "Bearer token"),
}));

// Mock Next.js useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock useAuth hook as a no-op.
jest.mock("@/app/hooks/useAuth", () => () => {});

// Mock Headers component.
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Headers", () => () => <div>Header Component</div>);

// Updated Toast mock that renders a Close button to trigger onClose.
jest.mock(
  "../components/Toast",
  () =>
    // eslint-disable-next-line react/display-name
    ({
      show,
      message,
      onClose,
    }: {
      show: boolean;
      message: string;
      onClose: () => void;
    }) =>
      show ? (
        <div>
          {message}
          <button onClick={onClose}>Close</button>
        </div>
      ) : null
);

// Mock fetchYoutubeVideoData.
jest.mock("../../../utils/youtubeApi", () => ({
  fetchYoutubeVideoData: jest.fn(),
}));

// Create a channel mock to capture the cable message callback.
let messageCallback: (data: any) => any = () => {};
const channelMock = {
  on: jest.fn((event: string, cb: (data: any) => any) => {
    if (event === "message") {
      messageCallback = cb;
    }
  }),
};
// Create a fake cable instance.
const cableMock = {
  connect: jest.fn(),
  subscribeTo: jest.fn(() => channelMock),
  disconnect: jest.fn(),
};

// Mock createCable.
jest.mock("@anycable/web", () => ({
  createCable: jest.fn(() => cableMock),
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  pushMock.mockClear();
});

describe("YoutubeShareForm", () => {
  test("renders form and headers correctly", () => {
    render(<YoutubeShareForm />);
    // Check for the mocked header.
    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
    // The form title.
    expect(
      screen.getByRole("heading", { name: /Share a Youtube movie/i })
    ).toBeInTheDocument();
    // The URL input and Share button.
    expect(screen.getByLabelText(/Youtube URL:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share/i })).toBeInTheDocument();
  });

  test("submits form and calls axios.post and navigates using router.push", async () => {
    // Set environment variable for backend host.
    process.env.NEXT_PUBLIC_BE_HOST = "http://localhost/";

    // Ensure axios.post returns a promise.
    mockedAxios.post.mockResolvedValue({ data: {} });

    const testUrl = "https://youtu.be/testvideo";
    render(<YoutubeShareForm />);

    const urlInput = screen.getByLabelText(/Youtube URL:/i);
    fireEvent.change(urlInput, { target: { value: testUrl } });

    // Submit the form.
    fireEvent.click(screen.getByRole("button", { name: /Share/i }));

    // Wait until axios.post is called with the expected arguments.
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost/video/",
        { url: testUrl },
        { headers: { Authorization: "Bearer token" } }
      );
    });

    // Expect router.push("/") to be called after form submission.
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  test("displays toast when receiving cable message with a different owner_email", async () => {
    // Set up localStorage with userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    // Set env var for websocket url.
    process.env.NEXT_PUBLIC_WEBSOCKET_URL = "ws://localhost/";

    // Mock fetchYoutubeVideoData to successfully resolve.
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });

    render(<YoutubeShareForm />);

    // The cable should be connected and subscribed.
    expect(cableMock.connect).toHaveBeenCalled();
    expect(cableMock.subscribeTo).toHaveBeenCalledWith("NotificationChannel");

    // Simulate receiving a cable message from a different user.
    const messageData = {
      youtube_id: "vid123",
      owner_email: "other@example.com",
      owner_name: "John Doe",
    };
    act(() => {
      messageCallback(messageData);
    });

    // Expect a toast message to be displayed with the new pattern.
    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from John Doe/i)
      ).toBeInTheDocument();
    });
  });

  test("does not update toast if received cable message is from the same user", async () => {
    // Set up localStorage with userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    process.env.NEXT_PUBLIC_WEBSOCKET_URL = "ws://localhost/";

    render(<YoutubeShareForm />);

    // Simulate receiving a cable message from the same user.
    act(() => {
      messageCallback({ owner_email: "user@example.com" });
    });

    // Expect that no toast message is set.
    await waitFor(() => {
      expect(screen.queryByText(/Received video with title/)).toBeNull();
    });
  });

  test("does not connect cable if no userData exists", () => {
    render(<YoutubeShareForm />);
    // When localStorage is empty, useEffect returns early.
    expect(cableMock.connect).not.toHaveBeenCalled();
    expect(cableMock.subscribeTo).not.toHaveBeenCalled();
  });

  test("calls cleanup disconnect from cable when cleanup function is invoked", async () => {
    // Set up localStorage with userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    process.env.NEXT_PUBLIC_WEBSOCKET_URL = "ws://localhost/";
    // Mock fetchYoutubeVideoData to resolve.
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });
    render(<YoutubeShareForm />);

    // Simulate receiving a cable message from a different user and capture the cleanup function.
    let cleanup: any;
    act(() => {
      cleanup = messageCallback({
        youtube_id: "vid456",
        owner_email: "other2@example.com",
        owner_name: "Alice",
      });
    });
    // Ensure the toast is shown.
    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from Alice/i)
      ).toBeInTheDocument();
    });
    // Invoke the cleanup function.
    act(() => {
      if (cleanup) cleanup();
    });
    expect(cableMock.disconnect).toHaveBeenCalled();
  });

  test("closes toast when onClose is triggered", async () => {
    // Set up localStorage with userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    process.env.NEXT_PUBLIC_WEBSOCKET_URL = "ws://localhost/";

    // Mock fetchYoutubeVideoData to resolve.
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });
    render(<YoutubeShareForm />);

    // Simulate a cable message that displays the toast.
    act(() => {
      messageCallback({
        youtube_id: "vid789",
        owner_email: "other@example.com",
        owner_name: "Jane Doe",
      });
    });

    // Ensure the toast message is shown.
    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from Jane Doe/i)
      ).toBeInTheDocument();
    });

    // Click the toast's Close button.
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    // The toast message is dismissed.
    await waitFor(() => {
      expect(
        screen.queryByText(
          /Received video with title: Test Title from Jane Doe/i
        )
      ).toBeNull();
    });
  });
});
