import axios from "axios";

export async function fetchYoutubeVideoData(videoId: string) {
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }
  const response = await axios(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.data;
  if (data.items.length === 0) {
    throw new Error("Video not found");
  }
  return data.items[0];
}
