import { fetchWithAuth } from "../api/auth";
import { POST_FORM_MODE } from "../constants/board";
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

// 오류 보고 등록 및 수정
export async function submitReport({
  userId,
  type,
  title,
  content,
  serverImages = [],
  newImages = [],
  postId,
  mode,
}) {
  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("type", type);
    formData.append("title", title);
    formData.append("content", content);

    // 기존 서버에 남겨둘 이미지 경로 전달
    serverImages.forEach((path) => {
      formData.append("serverImages", path);
    });

    // 새로 추가된 이미지 파일들
    newImages.forEach((file) => {
      formData.append("newImages", file);
    });

    let url = `${API_URL}/api/report`;
    let method = "POST";

    if (mode === POST_FORM_MODE.EDIT && postId) {
      url = `${API_URL}/api/report/${postId}`;
      method = "PUT";
    }

    const response = await fetchWithAuth(url, {
      method,
      body: formData,
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

// 오류 보고 게시글 삭제
export async function deleteReport(id) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/report/${id}`, {
      method: "DELETE",
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

// 진행상태 변경
export async function updateStatus(id, newStatus) {
  const response = await fetchWithAuth(`${API_URL}/api/report/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
}
