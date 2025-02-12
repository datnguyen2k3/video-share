"use client";
import React, { useEffect, useState } from "react";
import styles from "../../styles/youtubeShareForm.module.css";
import Headers from "../../components/Headers";
import { useRouter } from "next/navigation";

const YoutubeShareForm: React.FC = () => {
    const [url, setUrl] = useState<string>("");
    const router = useRouter();
    const user = localStorage.getItem("user");

    // useEffect(() => {
    //     if (!user) {
    //         router.push("/login");
    //     }
    // }, [user, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Shared URL: ${url}`);
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
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setUrl(e.target.value)}
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
