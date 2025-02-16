"use client";

import { useEffect, useState } from "react";
import styles from "../styles/video.module.css";
import { fetchYoutubeVideoData } from "../../../utils/youtubeApi";
import { VideoType } from "@/app/types/modals";
import Toast from "./Toast";

const Video: React.FC<{ videoDetail: VideoType }> = ({ videoDetail }) => {
  const [video, setVideo] = useState<VideoType>({} as VideoType);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  useEffect(() => {
    {
      fetchYoutubeVideoData(videoDetail.youtube_id)
        .then((res) => {
          setVideo({ ...res.snippet, likes: res.statistics.likeCount });
        })
        .catch((err) => {
          setToast({
            show: true,
            message: err.response.data.error,
            type: "error",
          });
        });
    }
  }, [videoDetail]);

  return (
    <div key={video.id} className={styles.videoCard}>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <iframe
        className={styles.video}
        src={`https://www.youtube.com/embed/${videoDetail.youtube_id}`}
        title={video.title || "YouTube video player"}
        frameBorder="0"
        allowFullScreen
        role="iframe"
      ></iframe>
      <div className={styles.details}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.sharedBy}>Shared by: {videoDetail.owner_email}</p>
        <p className={styles.reactions}>
          {video.likes} 👍 {video.dislikes} 👎
        </p>
        <p>Description:</p>
        <p className={styles.description}>{video.description}</p>
      </div>
    </div>
  );
};

export default Video;
