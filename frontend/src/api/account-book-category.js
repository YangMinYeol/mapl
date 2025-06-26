import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 사용자별 가계부 카테고리 불러오기
export async function fetchAccountBookCategories(userId) {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/account-book-category/?userId=${userId}`,
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
  } catch (error) {
    throw error;
  }
}
