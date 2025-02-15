"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {createCable} from "@anycable/web";
import Toast from "@/app/components/Toast";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cable, setCable] = useState<ReturnType<typeof createCable> | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    const token = userData?.auth?.access_token;
    const cable = createCable(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL + `?token=${token}` || "",
    );
    console.log(process.env.NEXT_PUBLIC_WEBSOCKET_URL + `?token=${token}` || "",)
    cable.connect();
    const channel = cable.subscribeTo("NotificationChannel");
    channel.on("message", (data: any) => {
      if (userData?.email == data.owner_email){
        return
      }
      setToast({
        show: true,
        message: `Received message from ${data.owner_email}`,
        type: "success",
      });
    });
    setCable(cable)
  }, []);
  return <>
    <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
    />  <WebSocketContext.Provider value={{ cable }}>{children}</WebSocketContext.Provider>;
  </>
};

export const useWebSocket = () => useContext(WebSocketContext);
