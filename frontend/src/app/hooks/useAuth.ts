import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAuth = () => {
  const router = useRouter();
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      if (!userData) {
        router.push("/login");
      }
    } catch (err) {
      console.error(err)
      router.push("/login");
    }
  }, [router]);
};

export default useAuth;
