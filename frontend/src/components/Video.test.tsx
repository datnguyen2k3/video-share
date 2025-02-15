import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Video from "./Video";
import { fetchYoutubeVideoData } from "../../utils/youtubeApi";
import { VideoType } from "@/types/modals";

// Mock the YouTube API utility
jest.mock("../../utils/youtubeApi");

describe("Video Component", () => {
  const mockVideoDetail: VideoType = {
    id: 1,
    youtube_id: "test123",
    owner_email: "test@example.com",
    title: "",
    description: "",
    likes: 0,
    dislikes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockYoutubeData = {
    snippet: {
      title: "Test Video Title",
      description: "Test video description",
      id: "test123",
    },
    statistics: {
      likeCount: "1000",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchYoutubeVideoData as jest.Mock).mockResolvedValue(mockYoutubeData);
  });

  it("renders video iframe with correct src", () => {
    render(<Video videoDetail={mockVideoDetail} />);

    const iframe = screen.getByTitle("");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      `https://www.youtube.com/embed/${mockVideoDetail.youtube_id}`,
    );
  });

  it("displays owner email", () => {
    render(<Video videoDetail={mockVideoDetail} />);

    expect(
      screen.getByText(`Shared by: ${mockVideoDetail.owner_email}`),
    ).toBeInTheDocument();
  });

  it("fetches and displays video data from YouTube API", async () => {
    render(<Video videoDetail={mockVideoDetail} />);

    await waitFor(() => {
      expect(
        screen.getByText(mockYoutubeData.snippet.title),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(mockYoutubeData.snippet.description),
    ).toBeInTheDocument();
    expect(screen.getByText(/1000 👍/)).toBeInTheDocument();
  });

  it("handles API error gracefully", async () => {
    (fetchYoutubeVideoData as jest.Mock).mockRejectedValue(
      new Error("API Error"),
    );

    const consoleSpy = jest.spyOn(console, "log");
    render(<Video videoDetail={mockVideoDetail} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("res", expect.any(Error));
    });
  });

  it("updates when videoDetail prop changes", async () => {
    const { rerender } = render(<Video videoDetail={mockVideoDetail} />);

    await waitFor(() => {
      expect(
        screen.getByText(mockYoutubeData.snippet.title),
      ).toBeInTheDocument();
    });

    const newMockYoutubeData = {
      snippet: {
        title: "New Video Title",
        description: "New video description",
        id: "newtest456",
      },
      statistics: {
        likeCount: "2000",
      },
    };

    (fetchYoutubeVideoData as jest.Mock).mockResolvedValue(newMockYoutubeData);

    const newVideoDetail: VideoType = {
      ...mockVideoDetail,
      youtube_id: "newtest456",
    };

    rerender(<Video videoDetail={newVideoDetail} />);

    await waitFor(() => {
      expect(
        screen.getByText(newMockYoutubeData.snippet.title),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/2000 👍/)).toBeInTheDocument();
  });
});
