import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 가계부 목록 불러오기
export async function fetchAccountBooks(userId, startDate, endDate) {
  const params = new URLSearchParams();
  params.append("userId", userId.toString());
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetchWithAuth(
    `${API_URL}/api/account-book?${params.toString()}`,
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
