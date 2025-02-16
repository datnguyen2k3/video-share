import { renderHook } from "@testing-library/react";
import useAuth from "./useAuth";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useAuth", () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should redirect to /login when userData is not found", () => {
    localStorage.removeItem("userData");
    renderHook(() => useAuth());
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should redirect to /login when localStorage returns invalid JSON", () => {
    localStorage.setItem("userData", "invalid-json");
    renderHook(() => useAuth());
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should not redirect when valid userData exists", () => {
    const validUserData = { id: 1, name: "Test User" };
    localStorage.setItem("userData", JSON.stringify(validUserData));
    renderHook(() => useAuth());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should redirect to /login when localStorage.getItem throws an error", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage error");
    });
    renderHook(() => useAuth());
    expect(mockPush).toHaveBeenCalledWith("/login");
    // Restore the original implementation
    (Storage.prototype.getItem as jest.Mock).mockRestore();
  });
});
