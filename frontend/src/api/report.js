import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 오류 보고 게시판 목록 불러오기
export async function fetchReportBoard(page) {
  try {
    const response = await fetch(`${API_URL}/api/report/?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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

// 오류 보고 등록
export async function submitReport({ userId, type, title, content, images }) {
  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("type", type);
    formData.append("title", title);
    formData.append("content", content);

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetchWithAuth(`${API_URL}/api/report`, {
      method: "POST",
      body: formData, // 헤더 자동설정됨 (multipart/form-data)
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
