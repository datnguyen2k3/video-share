"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/styles/youtubeShareForm.module.css";
import Headers from "@/app/components/Headers";
import axios from "axios";
import { getAuthorization } from "../../../utils/auth";
import useAuth from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createCable } from "@anycable/web";
import Toast from "../components/Toast";

const YoutubeShareForm: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const router = useRouter();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const cableRef = useRef<any>(null);
  useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(
        process.env.NEXT_PUBLIC_BE_HOST + "video/" || "",
        { url },
        {
          headers: {
            Authorization: getAuthorization(),
          },
        }
      )
      .then(() => {
        router.push("/");
      })
      .catch((err) => {
        setToast({
          show: true,
          message: err.response.data.error,
          type: "error",
        });
      });
  };

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
      if (userData?.email == data.owner_email) {
        return;
      }
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

  return (
    <>
      <Headers />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Share a Youtube movie</h2>
          <label className={styles.label}>
            Youtube URL:
            <input
              type="text"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              className={styles.input}
            />
          </label>
          <button type="submit" className={styles.button}>
            Share
          </button>
        </form>
      </div>
    </>
  );
};

export default YoutubeShareForm;
