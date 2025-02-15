"use client";
import React, { useState } from "react";
import styles from "@/app/styles/authen.module.css";
import Header from "@/app/components/Headers";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authSuccessfully } from "../../../utils/auth";
import Toast from "@/app/components/Toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const router = useRouter();

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setToast({
        show: true,
        message:
          "Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters",
        type: "error",
      });
      return;
    }
    axios
      .post(process.env.NEXT_PUBLIC_LOGIN_API || "", {
        email,
        password,
      })
      .then((res) => {
        authSuccessfully(res, email, router);
      })
      .catch((err) => {
        setToast({
          show: true,
          message: err.response.data.error,
          type: "error",
        });
      });
  };

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
