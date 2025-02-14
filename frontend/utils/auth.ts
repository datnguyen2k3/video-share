import { AxiosResponse } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const getAuthorization = () => {
  return `${
    JSON.parse(localStorage.getItem("userData") || "{}").auth?.access_token ||
    ""
  }`;
};

export const authSuccessfully = (
  res: AxiosResponse,
  email: string,
  router: AppRouterInstance,
) => {
  const userData = {
    ...res.data,
    email: email,
  };
  console.log({ userData });
  localStorage.setItem("userData", JSON.stringify(userData));
  router.push("/");
};
