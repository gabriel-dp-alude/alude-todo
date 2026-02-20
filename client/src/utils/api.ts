const API_URL = process.env.REACT_APP_API_URL;

type CallbackFunctions = {
  onFail?: (e: any) => Promise<void> | void;
};

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: object } = {},
  callbacks: CallbackFunctions = {},
): Promise<T | undefined> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      body: JSON.stringify(options.body),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    console.log(response);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed");
    }

    const data: T = await response.json();
    return data;
  } catch (e) {
    if (callbacks.onFail) await callbacks.onFail(e);
    else throw e;
    return undefined;
  }
}
