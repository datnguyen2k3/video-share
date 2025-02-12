"use client";
import React, { useState } from "react";
import styles from "../styles/header.module.css";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
    const [email, setEmail] = useState(localStorage.getItem("user") || null);
    const router = useRouter();

    function handleLogout(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void {
        event.preventDefault();
        localStorage.removeItem("user");
        setEmail("");
    }

    function handleShareMovie(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void {
        event.preventDefault();
        router.push("/shareVideo");
    }

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span role="img" aria-label="home">
                    🏠
                </span>{" "}
                Funny Movies
            </div>
            <div className={styles.userActions}>
                {email && (
                    <span className={styles.welcome}>Welcome {email}</span>
                )}
                <button className={styles.button} onClick={handleShareMovie}>
                    Share a movie
                </button>
                {email ? (
                    <button className={styles.button} onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <button
                        className={styles.button}
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
