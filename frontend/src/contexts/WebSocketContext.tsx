"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createCable } from "@anycable/web";

interface WebSocketContextType {
  subscription: any | null;
  connected: boolean;
  notifications: Notification[];
}

const WebSocketContext = createContext<WebSocketContextType>({
  subscription: null,
  connected: false,
  notifications: [],
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNotification = (data: Notification) => {
    setNotifications((prev) => [...prev, data]);
    // Handle different notification types
    //
    switch (data.type) {
      case "new_video":
        // Handle new video notification
        break;
      case "like":
        // Handle like notification
        break;
      // Add other cases as needed
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    const token = userData.auth.access_token;
    console.log({ token });

    const cable = createCable(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/cable`);
    console.log({ cable });

    const newSubscription = cable.subscribeTo("NotificationChannel", {
      token,
    });

    setSubscription(newSubscription);

    newSubscription.on("message", (msg) =>
      console.log(`${msg.name}: ${msg.text}`),
    );

    return () => {
      if (newSubscription) {
        newSubscription.disconnect();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ subscription, connected, notifications }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
