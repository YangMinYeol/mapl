import { fetchWithAuth } from "../api/auth";
const API_URL = import.meta.env.VITE_API_URL;

// 메모 목록 불러오기
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

// 달력 표기용 메모 목록 불러오기
export async function fetchCalendarMemos(userId, currentDate) {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/memo/calendar?userId=${userId}&currentDate=${currentDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// 메모 추가
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

// 메모 삭제
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

// 링크된 메모 일괄 삭제
export async function deleteLinkedMemos(linkId) {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/memo/linked/${linkId}`,
      {
        method: "DELETE",
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

// 메모 완료 상태 변경
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

// 링크된 메모 완료 상태 일괄 변경
export async function toggleLinkedMemosCompletion(linkId) {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/memo/complete-linked`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ linkId }),
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
