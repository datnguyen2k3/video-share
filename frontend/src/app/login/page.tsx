"use client";
import React, { useState } from "react";
import styles from "../../styles/authen.module.css";
import Header from "@/components/Headers";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const validatePassword = (password: string) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword(password)) {
            //Todo: Add a reusable alert component
            return;
        }
        axios
            .post(process.env.NEXT_PUBLIC_LOGIN_API || "", {
                email,
                password,
            })
            .then((res) => {
                localStorage.setItem("user", JSON.stringify(res.data));
                router.push("/");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <h2 className={styles.title}>Login</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </label>
                    <label className={styles.label}>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </label>
                    <button type="submit" className={styles.button}>
                        Login
                    </button>
                </form>
                <p className={styles.registerLink}>
                    Don&apos;t have an account?{" "}
                    <Link href="/register">Register here</Link>
                </p>
            </div>
        </>
    );
};

export default Login;
