import { authStore } from "../models/AuthStore";

const API_URL = process.env.REACT_APP_API_URL;

type CallbackFunctions<T> = {
  onSuccess?: (data: T) => Promise<void> | void;
  onFail?: (e: any) => Promise<void> | void;
};

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: object } = {},
  callbacks: CallbackFunctions<T> = {},
): Promise<T | undefined> {
  const url = `${API_URL}${path}`;
  try {
    let response = await fetch(url, {
      ...options,
      body: JSON.stringify(options.body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore().access_token}`,
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 && path !== "/auth/refresh") {
        await authStore().refresh();

        // retry request once
        response = await fetch(url, {
          ...options,
          body: JSON.stringify(options.body),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore().access_token}`,
            ...options.headers,
          },
          credentials: "include",
        });
      }
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }
    }

    if (response.status === 204) {
      if (callbacks.onSuccess) await callbacks.onSuccess(true as T);
      return true as T;
    }

    const data: T = await response.json();
    if (callbacks.onSuccess) await callbacks.onSuccess(data);

    return data;
  } catch (e) {
    if (callbacks.onFail) await callbacks.onFail(e);
    else if (path !== "/auth/refresh") console.warn(e);
    return undefined;
  }
}
