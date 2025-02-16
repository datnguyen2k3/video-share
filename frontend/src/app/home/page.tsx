"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/Headers";
import styles from "@/app/styles/video.module.css";
import axios from "axios";
import Video from "@/app/components/Video";
import { VideoType } from "@/app/types/modals";
import { getAuthorization } from "../../../utils/auth";
import useAuth from "@/app/hooks/useAuth";
import Toast from "@/app/components/Toast";
import { useWebSocket } from "../contexts/WebSocketContext";

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  useAuth();
  const { newMessage } = useWebSocket();
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
      })
      .catch((err) => {
        let additionalMessage = "";
        if (err.response.status == "401") {
          additionalMessage = "Please log out and log in again.";
        }
        setToast({
          show: true,
          message: `${err.response.data.error}. ${additionalMessage}`,
          type: "error",
        });
      });
  }, []);

  // Add new video when receiving WebSocket message
  useEffect(() => {
    console.log({ newMessage });
    if (newMessage && Object.keys(newMessage).length > 0) {
      // Check if video already exists to avoid duplicates
      const videoExists = videos.some(
        (video) => video.youtube_id === newMessage.youtube_id
      );

      if (!videoExists) {
        setVideos((prevVideos) => [newMessage, ...prevVideos]);
      }
    }
  }, [newMessage]);

  return (
    <>
      <Header />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className={styles.container}>
        {videos.map((video: VideoType) => (
          <Video key={video.youtube_id} videoDetail={video} />
        ))}
      </div>
    </>
  );
};

export default VideoList;
