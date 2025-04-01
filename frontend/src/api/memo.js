import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchMemos(userId, selectedDate) {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/memo/?userId=${userId}&selectedDate=${selectedDate}`,
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

export async function addMemo(memoArray) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/memo/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memoArray),
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

export async function deleteMemo(memoId) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/memo/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoId }),
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

export async function toggleMemoCompletion(memoId) {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/memo/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoId }),
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
