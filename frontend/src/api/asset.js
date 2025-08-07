import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 자산 불러오기
export async function fetchAsset(userId) {
  const response = await fetchWithAuth(
    `${API_URL}/api/asset/?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
