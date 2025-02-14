import React from "react";
import styles from "../styles/toast.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error";
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.toast} ${styles[type]}`}>
        <div className={styles.iconContainer}>
          {type === "success" ? (
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          ) : (
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          )}
        </div>
        <div className={styles.content}>
          <h4 className={styles.title}>
            {type === "success" ? "Success!" : "Error!"}
          </h4>
          <p className={styles.message}>{message}</p>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
