const API_URL = import.meta.env.VITE_API_URL;

export async function fetchMemos(userId, selectedDate) {
  const message = "메모 목록을 불러오는데 실패하였습니다.";
  try {
    const response = await fetch(
      `${API_URL}/api/memo/?userId=${userId}&selectedDate=${selectedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || message);
  }
}

export async function addMemo(memoData) {
  const message = "메모 추가에 실패하였습니다.";
  try {
    const response = await fetch(`${API_URL}/api/memo/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memoData),
    });
    if (!response.ok) {
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || message);
  }
}

export async function deleteMemo(memoId) {
  const message = "메모 삭제에 실패하였습니다.";
  try {
    const response = await fetch(`${API_URL}/api/memo/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoId }),
    });
    if (!response.ok) {
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || message);
  }
}

export async function toggleMemoCompletion(memoId) {
  const message = "메모 상태 변경에 실패하였습니다.";
  try {
    const response = await fetch(`${API_URL}/api/memo/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoId }),
    });
    if (!response.ok) {
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || message);
  }
}
