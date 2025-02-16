import { render, screen, waitFor } from "@testing-library/react";
import Video from "./Video";
import { fetchYoutubeVideoData } from "../../../utils/youtubeApi";
import { act } from "react";

// Mock the YouTube API call
jest.mock("../../../utils/youtubeApi");
const mockFetchYoutubeVideoData = fetchYoutubeVideoData as jest.MockedFunction<
  typeof fetchYoutubeVideoData
>;

describe("Video Component", () => {
  const mockVideoDetail = {
    id: 1,
    youtube_id: "test123",
    owner_id: 1,
    owner_email: "test@example.com",
    owner_name: "Test User",
    created_at: "2025-02-16T04:33:42.887Z",
    updated_at: "2025-02-16T04:33:42.887Z",
  } as any;

  const mockYoutubeData = {
    snippet: {
      title: "Test Video Title",
      description: "Test Video Description",
    },
    statistics: {
      likeCount: "1000",
    },
  };

  beforeEach(() => {
    mockFetchYoutubeVideoData.mockResolvedValue(mockYoutubeData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders video component with correct data", async () => {
    await act(async () => {
      render(<Video videoDetail={mockVideoDetail} />);
    });

    // Wait for YouTube data to be loaded
    await waitFor(() => {
      expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    });

    // Check if iframe is rendered with correct src
    const iframe = screen.getByRole("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      `https://www.youtube.com/embed/${mockVideoDetail.youtube_id}`
    );

    // Check if all elements are rendered
    expect(screen.getByText("Shared by: test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Description:")).toBeInTheDocument();
    expect(screen.getByText("Test Video Description")).toBeInTheDocument();
  });

  it("handles YouTube API error gracefully", async () => {
    // Remove console.error spy; it's no longer needed
    mockFetchYoutubeVideoData.mockRejectedValue({
      response: { data: { error: "YouTube API Error" } },
    });

    render(<Video videoDetail={mockVideoDetail} />);

    // Wait for the toast to display the error message
    await waitFor(() => {
      expect(screen.getByText("YouTube API Error")).toBeInTheDocument();
    });
  });

  it("updates when videoDetail prop changes", async () => {
    const { rerender } = render(<Video videoDetail={mockVideoDetail} />);

    await waitFor(() => {
      expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    });

    const newVideoDetail = {
      ...mockVideoDetail,
      youtube_id: "newTest456",
    };

    const newMockYoutubeData = {
      snippet: {
        title: "New Test Video Title",
        description: "New Test Video Description",
      },
      statistics: {
        likeCount: "2000",
      },
    };

    mockFetchYoutubeVideoData.mockResolvedValue(newMockYoutubeData);

    await act(async () => {
      rerender(<Video videoDetail={newVideoDetail} />);
    });

    await waitFor(() => {
      expect(screen.getByText("New Test Video Title")).toBeInTheDocument();
      expect(screen.getByText(/2000/)).toBeInTheDocument();
      expect(
        screen.getByText("New Test Video Description")
      ).toBeInTheDocument();
    });
  });
});
