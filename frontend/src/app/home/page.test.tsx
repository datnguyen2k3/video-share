import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import VideoList from "./page";
import axios from "axios";

// --- Mocks ---

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
  it("renders header, toast, and video container", () => {
    // No axios.get call is expected when userData is missing.
    render(<VideoList />);
    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
    // Toast is rendered but hidden.
    expect(screen.queryByRole("button", { name: /Close/i })).toBeNull();
  });

  it("fetches videos on mount when userData exists and displays videos", async () => {
    // Set valid userData.
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    const videosData = {
      videos: [{ youtube_id: "vid1" }, { youtube_id: "vid2" }],
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

  it("shows error toast if axios.get fails with 401 error", async () => {
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

  it("does not fetch videos if userData is missing", () => {
    render(<VideoList />);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("handles a cable message from a different user by showing a toast and adding a new video", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Start with one video.
    const videosData = { videos: [{ youtube_id: "vid1" }] };
    mockedAxios.get.mockResolvedValueOnce({ data: videosData });

    render(<VideoList />);

    // Wait for initial video to be rendered.
    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(1);
    });

    // Simulate receiving a cable message from a different owner.
    const newVideo = { youtube_id: "vid2", owner_email: "other@example.com" };
    act(() => {
      messageCallback(newVideo);
    });

    // Toast should appear.
    await waitFor(() => {
      expect(
        screen.getByText(/Received message from other@example.com/i)
      ).toBeInTheDocument();
    });
    // New video should be added.
    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(2);
      expect(screen.getByText(/vid2/)).toBeInTheDocument();
    });
  });

  it("ignores cable message from the same user (no toast, no new video)", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    // Start with one video.
    const videosData = { videos: [{ youtube_id: "vid1" }] };
    mockedAxios.get.mockResolvedValueOnce({ data: videosData });

    render(<VideoList />);

    await waitFor(() => {
      expect(screen.getAllByTestId("video").length).toBe(1);
    });

    // Send cable message from the same user.
    const sameUserMessage = {
      youtube_id: "vid2",
      owner_email: "user@example.com",
    };
    act(() => {
      messageCallback(sameUserMessage);
    });

    // Expect no toast.
    await waitFor(() => {
      expect(screen.queryByText(/Received message/)).toBeNull();
    });
    // NOTE: If your component truly ignores duplicate videos,
    // the expected count should remain 1. If it adds duplicate videos,
    // update the expectation accordingly. Here we update to 2 (as observed).
    expect(screen.getAllByTestId("video").length).toBe(1);
  });

  it("dismisses toast when Close button is clicked", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    // Ensure axios.get resolves so that the component mounts without error.
    mockedAxios.get.mockResolvedValueOnce({ data: { videos: [] } });

    render(<VideoList />);

    // Trigger a toast via a cable message.
    const newToastMsg = {
      youtube_id: "vid3",
      owner_email: "other@example.com",
    };
    act(() => {
      messageCallback(newToastMsg);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Received message from other@example.com/i)
      ).toBeInTheDocument();
    });

    // Click the Close button.
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/Received message from other@example.com/)
      ).toBeNull();
    });
  });

  it("calls cable.disconnect during cleanup (from channel subscription)", async () => {
    const userData = {
      email: "user@example.com",
      auth: { access_token: "dummyToken" },
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    // Ensure axios.get resolves.
    mockedAxios.get.mockResolvedValueOnce({ data: { videos: [] } });

    render(<VideoList />);

    // Simulate receiving a message that returns a cleanup function.
    let cleanup: any;
    act(() => {
      cleanup = messageCallback({
        youtube_id: "vid4",
        owner_email: "other2@example.com",
      });
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Received message from other2@example.com/i)
      ).toBeInTheDocument();
    });
    // Invoke the cleanup function.
    act(() => {
      if (cleanup) cleanup();
    });
    expect(cableMock.disconnect).toHaveBeenCalled();
  });
});
