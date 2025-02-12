"use client";
import React, { useState } from "react";
import styles from "../../styles/authen.module.css";
import Header from "@/components/Headers";

const Register: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Registered with Name: ${name}, Email: ${email}`);
        //Call api, store user in local storage
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <h2 className={styles.title}>Register</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />
                    </label>
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
                        Register
                    </button>
                </form>
            </div>
        </>
    );
};

export default Register;
