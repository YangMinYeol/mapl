import DashboardSubMemoItem from "./DashboardSubMemoItem";

const bucketListMemos = [
  { id: 1, content: "가족 사진 찍기" },
  { id: 2, content: "가족 여행 가기" },
  { id: 3, content: "해외 여행 가기" },
  { id: 4, content: "혼자 여행 가기" },
  { id: 5, content: "블로그 쓰기" },
  { id: 6, content: "국토대장정" },
  { id: 7, content: "다이어트 성공하기" },
  { id: 8, content: "봉사활동하기" },
  { id: 9, content: "마라톤 완주하기" },
  { id: 10, content: "번지점프하기" },
  { id: 11, content: "영어 공부하기" },
  { id: 12, content: "내 집 장만" },
  { id: 13, content: "드림카 장만" },
  { id: 14, content: "책 100권 읽기" },
  { id: 15, content: "피아노 배우기" },
  { id: 16, content: "유럽 여행 가기" },
  { id: 17, content: "스카이다이빙 도전" },
  { id: 18, content: "캠핑카 타고 전국 일주" },
  { id: 19, content: "자격증 취득하기" },
  { id: 20, content: "바다에서 스쿠버다이빙" },
  { id: 21, content: "장거리 자전거 여행" },
  { id: 22, content: "친구와 함께 뮤직 페스티벌" },
  { id: 23, content: "패러글라이딩 체험하기" },
  { id: 24, content: "자작 소설 쓰기" },
  { id: 25, content: "한 달 살기 도전" },
  { id: 26, content: "직접 키운 채소로 요리하기" },
];

export default function DashboardSubContent({
  dashboardMemos,
  selectedValue,
  selectedPeriod,
  checkedIds,
  handleToggle,
}) {
  return (
    <div className="h-[300px] overflow-auto dashboard-sub-content">
      <ul>
        {selectedPeriod.name == "Bucket List"
          ? bucketListMemos.map((memo) => (
              <li key={memo.id}>
                <DashboardSubMemoItem
                  memo={memo}
                  checked={checkedIds.includes(memo.id)}
                  onToggle={() => handleToggle(memo.id)}
                />
              </li>
            ))
          : dashboardMemos
              .filter(
                (memo) => memo.periodId == selectedValue && !memo.completed
              )
              .map((memo) => (
                <li key={memo.id}>
                  <DashboardSubMemoItem
                    memo={memo}
                    checked={checkedIds.includes(memo.id)}
                    onToggle={() => handleToggle(memo.id)}
                  />
                </li>
              ))}
      </ul>
    </div>
  );
}
