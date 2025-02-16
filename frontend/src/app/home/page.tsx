"use client";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/app/components/Headers";
import styles from "@/app/styles/video.module.css";
import axios from "axios";
import Video from "@/app/components/Video";
import { VideoType } from "@/app/types/modals";
import { getAuthorization } from "../../../utils/auth";
import useAuth from "@/app/hooks/useAuth";
import Toast from "@/app/components/Toast";
import { createCable } from "@anycable/web";

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [newMessage, setNewMessage] = useState<any>({});
  const cableRef = useRef<any>(null);
  useAuth();

  useEffect(() => {
    if (!localStorage.getItem("userData")) {
      return;
    }
    axios
      .get(process.env.NEXT_PUBLIC_BE_HOST + "video/" || "", {
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

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      return;
    }
    const userData: any = JSON.parse(userDataString);
    if (!userData) {
      return;
    }
    const token = userData?.auth?.access_token;
    const cable = createCable(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL + `?token=${token}` || ""
    );
    cableRef.current = cable;
    cable.connect();
    const channel = cable.subscribeTo("NotificationChannel");
    channel.on("message", (data: any) => {
      setNewMessage(data);
      console.log({ userData });
      if (userData?.email === data.owner_email) {
        return;
      }
      console.log({ data });
      setToast({
        show: true,
        message: `Received message from ${data.owner_email}`,
        type: "success",
      });
      return () => {
        if (cableRef.current) {
          cableRef.current.disconnect();
        }
      };
    });
  }, []);

  useEffect(() => {
    if (newMessage && Object.keys(newMessage).length > 0) {
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
