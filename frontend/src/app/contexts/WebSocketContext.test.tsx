import { render, screen, waitFor } from "@testing-library/react";
import { WebSocketProvider, useWebSocket } from "./WebSocketContext";
import { createCable } from "@anycable/web";

// Mock AnyCable
const mockOn = jest.fn();
const mockDisconnect = jest.fn();
const mockSubscribeTo = jest.fn(() => ({
  on: mockOn,
}));

jest.mock("@anycable/web", () => ({
  createCable: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: mockDisconnect,
    subscribeTo: mockSubscribeTo,
  })),
}));

// Mock local storage
const mockLocalStorage: { [key: string]: string } = {};

beforeAll(() => {
  global.Storage.prototype.getItem = jest.fn(
    (key: string) => mockLocalStorage[key] || null
  );
  global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  });
  global.Storage.prototype.clear = jest.fn(() => {
    Object.keys(mockLocalStorage).forEach(
      (key) => delete mockLocalStorage[key]
    );
  });
});

// Test Component to access context
const TestComponent = () => {
  const { newMessage } = useWebSocket();
  return <div data-testid="message">{JSON.stringify(newMessage)}</div>;
};

describe("WebSocketContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    console.warn = jest.fn(); // Suppress console warnings
    console.log = jest.fn(); // Suppress console logs
  });

  it("does not connect when no user data exists", () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    expect(createCable).not.toHaveBeenCalled();
    expect(screen.getByTestId("message")).toHaveTextContent("{}");
  });

  it("connects and subscribes when user data exists", () => {
    const mockUserData = {
      email: "test@example.com",
      auth: { access_token: "test-token" },
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    expect(createCable).toHaveBeenCalledWith(
      expect.stringContaining("?token=test-token")
    );
    expect(mockSubscribeTo).toHaveBeenCalledWith("NotificationChannel");
  });

  it("shows toast when receiving message from different user", async () => {
    const mockUserData = {
      email: "test@example.com",
      auth: { access_token: "test-token" },
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    // Get the message callback and simulate message
    const messageCallback = mockOn.mock.calls.find(
      ([event]) => event === "message"
    )?.[1];
    const messageData = {
      owner_email: "other@example.com",
      content: "test message",
    };
    messageCallback(messageData);

    await waitFor(() => {
      expect(
        screen.getByText("Received message from other@example.com")
      ).toBeInTheDocument();
    });
  });

  it("cleans up WebSocket connection on unmount", async () => {
    const mockUserData = {
      email: "test@example.com",
      auth: { access_token: "test-token" },
    };
    localStorage.setItem("userData", JSON.stringify(mockUserData));

    const { unmount } = render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    unmount();

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
