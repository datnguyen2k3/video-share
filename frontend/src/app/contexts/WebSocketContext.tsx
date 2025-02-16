"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createCable } from "@anycable/web";
import Toast from "@/app/components/Toast";
import { UserDataToken } from "../types/modals";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserDataToken | null>(null);
  const [message, setMessage] = useState<any>({});
  const cableRef = useRef<any>(null);
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");

    if (!userData) {
      console.warn("No token found, skipping WebSocket connection");
      return;
    }
    setUserData(userData);
  }, []);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
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
      setMessage(data);
      if (userData?.email == data.owner_email) {
        return;
      }
      console.log({ data });
      setToast({
        show: true,
        message: `Received message from ${data.owner_email}`,
        type: "success",
      });
    });
  }, [userData]);
  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <WebSocketContext.Provider value={{ newMessage: message }}>
        {children}
      </WebSocketContext.Provider>
    </>
  );
};
export const useWebSocket = () => useContext(WebSocketContext);
