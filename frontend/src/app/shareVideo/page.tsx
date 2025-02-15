"use client";
import React, { useState } from "react";
import styles from "../../styles/youtubeShareForm.module.css";
import Headers from "../../components/Headers";
import axios from "axios";
import { getAuthorization } from "../../../utils/auth";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const YoutubeShareForm: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const router = useRouter();
  useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post(
      process.env.NEXT_PUBLIC_VIDEO_API || "",
      { url },
      {
        headers: {
          Authorization: getAuthorization(),
        },
      },
    );
    router.push("/");
  };

  return (
    <>
      <Headers />
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
