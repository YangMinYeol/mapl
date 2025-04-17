const API_URL = import.meta.env.VITE_API_URL;

// 색상 목록 불러오기
export async function fetchColor() {
  try {
    const response = await fetch(`${API_URL}/api/color`, {
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
