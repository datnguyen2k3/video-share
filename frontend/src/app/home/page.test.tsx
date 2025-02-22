import React, { Component } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import VideoList from "./page";
import axios from "axios";
import { fetchYoutubeVideoData } from "../../../utils/youtubeApi";

// --- Mocks ---

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fetchYoutubeVideoData.
jest.mock("../../../utils/youtubeApi", () => ({
  fetchYoutubeVideoData: jest.fn(),
}));

// Mock getAuthorization to return a dummy token.
jest.mock("../../../utils/auth", () => ({
  getAuthorization: jest.fn(() => "Bearer testtoken"),
}));

// Mock useAuth hook as a no‑op.
jest.mock("@/app/hooks/useAuth", () => () => {});

// Mock Header component.
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Headers", () => () => <div>Header Component</div>);

// Updated Toast mock that renders a Close button for onClose handling.
jest.mock(
  "@/app/components/Toast",
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

// Mock Video component.
jest.mock("@/app/components/Video", () =>
  // eslint-disable-next-line react/display-name
  ({ videoDetail }: { videoDetail: any }) => (
    <div data-testid="video">Video: {videoDetail.youtube_id}</div>
  )
);

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

// A simple error boundary for testing purposes.
class ErrorBoundary extends Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? (
      <div>Error occurred</div>
    ) : (
      this.props.children
    );
  }
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  // Restore messageCallback
  messageCallback = () => {};
  // Set required environment variables
  process.env.NEXT_PUBLIC_BE_HOST = "http://localhost/";
  process.env.NEXT_PUBLIC_WEBSOCKET_URL = "ws://localhost/";
});

describe("VideoList (Home Page)", () => {
  test("renders header, toast, and video container", () => {
    // No axios.get call is expected when userData is missing.
    render(<VideoList />);
    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
    // Toast is rendered but hidden.
    expect(screen.queryByRole("button", { name: /Close/i })).toBeNull();
  });

  test("fetches videos on mount when userData exists and displays videos", async () => {
    // Set valid userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    const videosData = {
      videos: [{ youtube_id: "vid1" }, { youtube_id: "vid2" }],
      next_cursor: 5,
    };
    mockedAxios.get.mockResolvedValueOnce({ data: videosData });

    render(<VideoList />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost/video/", {
        params: { cursor: 0 },
        headers: { Authorization: "Bearer testtoken" },
      });
    });

    // Expect videos to be rendered.
    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(2);
      expect(screen.getByText(/vid1/)).toBeInTheDocument();
      expect(screen.getByText(/vid2/)).toBeInTheDocument();
    });
  });

  test("shows error toast if axios.get fails with 401 error", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    const errorResponse = {
      response: { status: 401, data: { error: "Unauthorized" } },
    };
    mockedAxios.get.mockRejectedValueOnce(errorResponse);

    render(<VideoList />);

    await waitFor(() => {
      expect(
        screen.getByText(/Unauthorized\. Please log out and log in again\./i)
      ).toBeInTheDocument();
    });
  });

  test("does not fetch videos if userData is missing", () => {
    render(<VideoList />);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test("handles a cable message from a different user by showing a toast and adding a new video", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Start with one video.
    const videosData = { videos: [{ youtube_id: "vid1" }], next_cursor: null };
    mockedAxios.get.mockResolvedValueOnce({ data: videosData });
    // Mock youtube API to return a title.
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });

    render(<VideoList />);

    // Wait for the initial video to be rendered.
    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(1);
    });

    // Simulate receiving a cable message from a different owner.
    const newVideo = {
      youtube_id: "vid2",
      owner_email: "other@example.com",
      owner_name: "John Doe",
    };
    let cleanupFn: any;
    act(() => {
      cleanupFn = messageCallback(newVideo);
    });

    // Toast should appear with fetched video title.
    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from John Doe/i)
      ).toBeInTheDocument();
    });
    // New video should be added.
    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(2);
      expect(screen.getByText(/vid2/)).toBeInTheDocument();
    });

    if (cleanupFn) act(() => cleanupFn());
  });

  test("ignores cable message from the same user (no toast, no new video)", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Start with one video.
    const videosData = { videos: [{ youtube_id: "vid1" }], next_cursor: null };
    mockedAxios.get.mockResolvedValueOnce({ data: videosData });

    render(<VideoList />);

    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(1);
    });

    // Send cable message from the same user.
    const sameUserMessage = {
      youtube_id: "vid2",
      owner_email: "user@example.com",
      owner_name: "User Self",
    };
    act(() => {
      messageCallback(sameUserMessage);
    });

    // Expect no toast.
    await waitFor(() => {
      expect(screen.queryByText(/Received video/)).toBeNull();
    });
    // Video count remains unchanged.
    expect(screen.getAllByTestId("video").length).toBe(1);
  });

  test("dismisses toast when Close button is clicked", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    // Ensure axios.get resolves so that the component mounts without error.
    mockedAxios.get.mockResolvedValueOnce({
      data: { videos: [], next_cursor: null },
    });
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });

    render(<VideoList />);

    // Trigger a toast via a cable message.
    const newToastMsg = {
      youtube_id: "vid3",
      owner_email: "other@example.com",
      owner_name: "Jane Doe",
    };
    act(() => {
      messageCallback(newToastMsg);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from Jane Doe/i)
      ).toBeInTheDocument();
    });

    // Click the Close button.
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Received video with title/)).toBeNull();
    });
  });

  test("calls cable.disconnect during cleanup (from channel subscription)", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    mockedAxios.get.mockResolvedValueOnce({
      data: { videos: [], next_cursor: null },
    });
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValueOnce({
      snippet: { title: "Test Title" },
    });

    render(<VideoList />);

    let cleanupFn: any;
    act(() => {
      cleanupFn = messageCallback({
        youtube_id: "vid4",
        owner_email: "other2@example.com",
        owner_name: "Alice",
      });
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Received video with title: Test Title from Alice/i)
      ).toBeInTheDocument();
    });
    if (cleanupFn) act(() => cleanupFn());
    expect(cableMock.disconnect).toHaveBeenCalled();
  });

  test("fetches more videos on scroll (infinite scrolling)", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // First call returns videos with a positive nextCursor.
    mockedAxios.get.mockResolvedValueOnce({
      data: { videos: [{ youtube_id: "vid1" }], next_cursor: 10 },
    });
    // Second call returns additional videos and no nextCursor.
    mockedAxios.get.mockResolvedValueOnce({
      data: { videos: [{ youtube_id: "vid2" }], next_cursor: null },
    });

    render(<VideoList />);

    await waitFor(() => {
      expect(screen.getByText(/vid1/)).toBeInTheDocument();
    });

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        value: 1000,
      });
      Object.defineProperty(window, "scrollY", { writable: true, value: 900 });
      Object.defineProperty(document.body, "offsetHeight", {
        writable: true,
        value: 1800,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText(/vid2/)).toBeInTheDocument();
    });
  });

  test("shows error fallback if fetchYoutubeVideoData fails from cable message", async () => {
    // Suppress console error to keep the test output clean.
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    (fetchYoutubeVideoData as jest.Mock).mockRejectedValueOnce({
      response: { data: { error: "Fetch error" } },
    });

    render(
      <ErrorBoundary>
        <VideoList />
      </ErrorBoundary>
    );

    const errorMessagePayload = {
      youtube_id: "vidError",
      owner_email: "other@example.com",
      owner_name: "Error User",
    };
    act(() => {
      messageCallback(errorMessagePayload);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error occurred/i)).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });
});
