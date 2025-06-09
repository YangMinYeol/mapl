import { useEffect, useState } from "react";
import { fetchReportBoard } from "../../api/report";
import { formatDateYYYYMMDD } from "../../util/dateUtil";

const reportTypeMap = {
  functional: "기능",
  ui: "UI",
  typo: "오타",
  etc: "기타",
};

const statusLabelMap = {
  open: "접수",
  in_progress: "처리중",
  closed: "완료",
  no_plan: "처리 불가",
};

export default function ReportBoard({ currentPage, setTotalCount, onError }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await fetchReportBoard(currentPage);
        setPosts(data.posts);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        onError(error);
      }
    }

    loadPost();
  }, [currentPage]);

  return (
    <div>
      <div className="grid grid-cols-[75px_1fr_75px_100px] items-center text-center h-12 border-t-2 ">
        <div>번호</div>
        <div>제목</div>
        <div>진행상태</div>
        <div>작성일</div>
      </div>
      <div className="divide-y border-y divide-mapl-slate">
        {posts.map((post) => {
          return (
            <div
              key={post.id}
              className="grid grid-cols-[75px_1fr_75px_100px] items-center py-3 hover:cursor-pointer hover:bg-gray-50"
            >
              <div className="text-center">{post.id}</div>
              <div>
                [{reportTypeMap[post.reportType]}] - {post.title}
              </div>
              <div className="text-center">{statusLabelMap[post.status]}</div>
              <div className="text-center">
                {formatDateYYYYMMDD(post.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
