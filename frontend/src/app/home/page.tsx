"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Headers";
import styles from "../../styles/video.module.css";
import axios from "axios";
import Video from "@/components/Video";
import { VideoType } from "@/types/modals";
import { getAuthorization } from "../../../utils/auth";
import useAuth from "@/hooks/useAuth";

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState([]);
  useAuth();
  useEffect(() => {
    if (!localStorage.getItem("userData")) {
      return;
    }
    axios
      .get(process.env.NEXT_PUBLIC_VIDEO_API || "", {
        headers: {
          Authorization: getAuthorization(),
        },
      })
      .then((res) => {
        setVideos(res.data.videos);
      });
  }, []);

  return (
    <>
      <Header />
      <div className={styles.container}>
        {videos.map((video: VideoType) => (
          <Video key={video.youtube_id} videoId={video.youtube_id} />
        ))}
      </div>
    </>
  );
};

export default VideoList;
