import { ClientOptions, fetch } from "@tauri-apps/plugin-http";
import { AUTH_TOKEN_LOCAL_STORAGE_KEY } from "./auth/authenticator.component";

export const useFetchWrapper = () => {
  const internalFetchImpl = async (
    input: URL | Request | string,
    init?: RequestInit & ClientOptions,
  ) => {
    return await fetch(input, {
      ...init,
      headers: {
        ...(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)
          ? {
              Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)}`,
            }
          : {}),
        ...init?.headers,
      },
    });
  };

  return {
    fetch: internalFetchImpl,
  };
};
