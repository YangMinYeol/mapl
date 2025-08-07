import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 사용자별 가계부 카테고리 불러오기
export async function fetchAccountBookCategories(userId) {
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
}

// 가계부 카테고리 추가
export async function addAccountBookCategory(categoryItem) {
  const response = await fetchWithAuth(
    `${API_URL}/api/account-book-category/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryItem),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}

// 가계부 카테고리 수정
export async function updateAccountBookCategory(categoryItem) {
  const response = await fetchWithAuth(
    `${API_URL}/api/account-book-category/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryItem),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}

// 가계부 카테고리 삭제
export async function deleteAccountBookCategory(userId, type, categoryId) {
  // URL 생성 및 쿼리 파라미터 추가
  const url = new URL(`${API_URL}/api/account-book-category/${categoryId}`);
  url.searchParams.append("userId", userId);
  url.searchParams.append("type", type);

  const response = await fetchWithAuth(url.toString(), {
    method: "DELETE",
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

// 가계부 카테고리 재정렬
export async function reorderAccountBookCategory(reorderList) {
  const response = await fetchWithAuth(
    `${API_URL}/api/account-book-category/reorder`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reorderList),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
