import { fetchWithAuth } from "../api/auth";
import { POST_FORM_MODE } from "../constants/board";
const API_URL = import.meta.env.VITE_API_URL;

// 공지사항 목록 불러오기
export async function fetchNoticeBoard(page) {
  const response = await fetch(`${API_URL}/api/notice/?page=${page}`, {
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
}

// 공지사항 등록 및 수정
export async function submitNotice({
  userId,
  title,
  content,
  serverImages = [],
  newImages = [],
  postId,
  mode,
}) {
  const formData = new FormData();
  formData.append("userId", userId);
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

  let url = `${API_URL}/api/notice`;
  let method = "POST";

  if (mode === POST_FORM_MODE.EDIT && postId) {
    url = `${API_URL}/api/notice/${postId}`;
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
}

// 공지사항 게시글 삭제
export async function deleteNotice(id) {
  const response = await fetchWithAuth(`${API_URL}/api/notice/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
