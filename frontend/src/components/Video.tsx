"use client";

import { useEffect, useState } from "react";
import styles from "../styles/video.module.css";
import { fetchYoutubeVideoData } from "../../utils/youtubeApi";
import { VideoType } from "@/types/modals";

const Video: React.FC<{ videoDetail: VideoType }> = ({ videoDetail }) => {
  const [video, setVideo] = useState<VideoType>({} as VideoType);
  useEffect(() => {
    {
      fetchYoutubeVideoData(videoDetail.youtube_id).then((res) => {
        setVideo({ ...res.snippet, likes: res.statistics.likeCount });
      });
    }
  }, [videoDetail]);

  return (
    <div key={video.id} className={styles.videoCard}>
      <iframe
        className={styles.video}
        src={`https://www.youtube.com/embed/${videoDetail.youtube_id}`}
        title={video.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <div className={styles.details}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.sharedBy}>Shared by: {videoDetail.owner_email}</p>
        <p className={styles.reactions}>
          {video.likes} 👍 {video.dislikes} 👎
        </p>
        <p className={styles.description}>{video.description}</p>
      </div>
    </div>
  );
};

export default Video;
