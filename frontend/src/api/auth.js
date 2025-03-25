import { LoginExpiredError } from "../util/error";
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      throw new LoginExpiredError();
    }
  }

  return response;
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("리프레시 토큰이 유효하지 않습니다.");
    }
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error("리프레시 토큰 갱신 실패:", error);
    throw new LoginExpiredError();
  }
}
