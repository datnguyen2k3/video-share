"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const cableRef = useRef<any>(null);
  useAuth();

  const fetchVideos = useCallback(async (cursor: number | null) => {
    if (cursor === null) return;
    setLoading(true);
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_BE_HOST + "video/", {
        params: { cursor },
        headers: {
          Authorization: getAuthorization(),
        },
      });
      setVideos((prevVideos) => [...prevVideos, ...res.data.videos]);
      setNextCursor(res.data.next_cursor);
    } catch (err: any) {
      let additionalMessage = "";
      if (err.response && err.response.status === 401) {
        additionalMessage = "Please log out and log in again.";
      }
      setToast({
        show: true,
        message: `${
          err.response?.data?.error || "Error occurred"
        }. ${additionalMessage}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("userData")) {
      return;
    }
    fetchVideos(0);
  }, [fetchVideos]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        nextCursor !== null
      ) {
        fetchVideos(nextCursor);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchVideos, loading, nextCursor]);

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
      console.log({ userData });
      if (userData?.email === data.owner_email) {
        return;
      }
      setNewMessage(data);
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
        {loading && <p>Loading...</p>}
      </div>
    </>
  );
};

export default VideoList;
