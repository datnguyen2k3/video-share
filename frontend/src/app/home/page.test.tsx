import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import VideoList from "./page";
import axios from "axios";
import { useWebSocket } from "../contexts/WebSocketContext";
import useAuth from "@/app/hooks/useAuth";

// Mock dependencies
jest.mock("axios");
jest.mock("../contexts/WebSocketContext", () => ({
  useWebSocket: jest.fn(() => ({ newMessage: null })),
}));
jest.mock("@/app/hooks/useAuth");

// Mock child components
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Headers", () => () => (
  <div data-testid="header">Mock Header</div>
));
// eslint-disable-next-line react/display-name
jest.mock("@/app/components/Video", () => ({ videoDetail }: any) => (
  <div data-testid={`video-${videoDetail.youtube_id}`}>Mock Video</div>
));
jest.mock("@/app/components/Toast", () =>
  // eslint-disable-next-line react/display-name
  ({ show, message }: any) => {
    return show ? <div data-testid="toast">{message}</div> : null;
  }
);

describe("VideoList Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockImplementation(() => {});
    (useWebSocket as jest.Mock).mockImplementation(() => ({
      newMessage: null,
    }));
  });

  it("does not fetch videos when there is no userData", () => {
    render(<VideoList />);
    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.queryByTestId(/video-/)).toBeNull();
  });

  it("fetches and displays videos when userData exists", async () => {
    const mockVideos = [
      {
        id: 1,
        youtube_id: "abc123",
        owner_id: 1,
        owner_email: "test@example.com",
        created_at: "2024-02-16T00:00:00Z",
        updated_at: "2024-02-16T00:00:00Z",
      },
      {
        id: 2,
        youtube_id: "def456",
        owner_id: 2,
        owner_email: "test2@example.com",
        created_at: "2024-02-16T00:00:00Z",
        updated_at: "2024-02-16T00:00:00Z",
      },
    ];
    localStorage.setItem("userData", JSON.stringify({ token: "dummy" }));
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { videos: mockVideos },
    });

    render(<VideoList />);

    await waitFor(() => {
      expect(screen.getByTestId("video-abc123")).toBeInTheDocument();
      expect(screen.getByTestId("video-def456")).toBeInTheDocument();
    });
    expect(axios.get).toHaveBeenCalled();
  });

  it("displays error toast when the API call fails", async () => {
    localStorage.setItem("userData", JSON.stringify({ token: "dummy" }));
    const error = {
      response: {
        status: "401",
        data: { error: "Unauthorized" },
      },
    };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    render(<VideoList />);

    await waitFor(() => {
      expect(screen.getByTestId("toast")).toHaveTextContent(
        "Unauthorized. Please log out and log in again."
      );
    });
  });

  it("adds a new video when a new WebSocket message is received", async () => {
    const initialVideos = [
      {
        id: 1,
        youtube_id: "abc123",
        owner_id: 1,
        owner_email: "test@example.com",
        created_at: "2024-02-16T00:00:00Z",
        updated_at: "2024-02-16T00:00:00Z",
      },
    ];
    localStorage.setItem("userData", JSON.stringify({ token: "dummy" }));
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { videos: initialVideos },
    });
    const { rerender } = render(<VideoList />);

    await waitFor(() => {
      expect(screen.getByTestId("video-abc123")).toBeInTheDocument();
    });

    const newVideo = {
      id: 2,
      youtube_id: "new123",
      owner_id: 2,
      owner_email: "new@example.com",
      created_at: "2024-02-16T00:00:00Z",
      updated_at: "2024-02-16T00:00:00Z",
    };
    (useWebSocket as jest.Mock).mockImplementation(() => ({
      newMessage: newVideo,
    }));
    rerender(<VideoList />);

    await waitFor(() => {
      expect(screen.getByTestId("video-new123")).toBeInTheDocument();
    });
  });

  it("does not add duplicate video from WebSocket message", async () => {
    const initialVideos = [
      {
        id: 1,
        youtube_id: "abc123",
        owner_id: 1,
        owner_email: "test@example.com",
        created_at: "2024-02-16T00:00:00Z",
        updated_at: "2024-02-16T00:00:00Z",
      },
    ];
    localStorage.setItem("userData", JSON.stringify({ token: "dummy" }));
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { videos: initialVideos },
    });
    const { rerender } = render(<VideoList />);

    await waitFor(() => {
      expect(screen.getByTestId("video-abc123")).toBeInTheDocument();
    });

    // Send duplicate video via newMessage
    (useWebSocket as jest.Mock).mockImplementation(() => ({
      newMessage: initialVideos[0],
    }));
    rerender(<VideoList />);

    await waitFor(() => {
      const videos = screen.getAllByTestId(/video-/);
      expect(videos.length).toBe(1);
    });
  });
});
