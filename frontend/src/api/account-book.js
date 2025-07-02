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

// 가계부 데이터 추가
export async function addAccountBookItem(accountItem) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/account-book/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountItem),
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

// 가계부 항목 수정
export async function editAccountBookItem(accountItem) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/account-book/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountItem),
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

// 가계부 항목 삭제
export async function deleteAccountBookItem(itemId) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/account-book/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
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
