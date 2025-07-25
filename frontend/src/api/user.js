import { fetchWithAuth } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

// 비밀번호 검증
export async function verifyPassword(password) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/user/verify-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    throw error;
  }
}
