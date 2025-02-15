import { renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import useAuth from "./useAuth";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useAuth", () => {
  // Create mock router
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  // Mock localStorage
  const mockGetItem = jest.fn();
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem,
      },
      writable: true,
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
    });
  });

  it("should redirect to login if no user data exists", () => {
    // Mock localStorage.getItem to return null
    mockGetItem.mockReturnValue(null);

    // Render the hook
    renderHook(() => useAuth());

    // Check if router.push was called with '/login'
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should redirect to login if localStorage throws error", () => {
    // Mock localStorage.getItem to throw error
    mockGetItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    // Render the hook
    renderHook(() => useAuth());

    // Check if router.push was called with '/login'
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should not redirect if valid user data exists", () => {
    // Mock localStorage.getItem to return valid user data
    const mockUserData = { id: 1, name: "Test User" };
    mockGetItem.mockReturnValue(JSON.stringify(mockUserData));

    // Render the hook
    renderHook(() => useAuth());

    // Check that router.push was not called
    expect(mockPush).not.toHaveBeenCalled();
  });
});
