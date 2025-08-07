import { fetchWithAuth } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

// 비밀번호 검증
export async function verifyPassword(password) {
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
}

// 회원 탈퇴
export async function deleteAccount() {
  const response = await fetchWithAuth(`${API_URL}/api/user/me`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
}

// 아이디/이메일 중복 확인
export async function checkDuplicate(field, value) {
  try {
    const response = await fetch(`${API_URL}/api/user/check-duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ field, value }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return { isDuplicate: data.isDuplicate, error: null };
  } catch (error) {
    console.error(`${field} 중복 확인 에러: `, error);
    return {
      isDuplicate: null,
      error: error.message,
    };
  }
}

// 회원 정보 수정
export async function updateProfile({
  password,
  email,
  zipcode,
  address,
  detailAddress,
}) {
  const response = await fetchWithAuth(`${API_URL}/api/user/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, email, zipcode, address, detailAddress }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
}
