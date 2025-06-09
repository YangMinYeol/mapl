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
