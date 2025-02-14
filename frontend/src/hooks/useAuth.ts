import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAuth = () => {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("userData")) {
      router.push("/login");
    }
  }, [router]);
};

export default useAuth;
