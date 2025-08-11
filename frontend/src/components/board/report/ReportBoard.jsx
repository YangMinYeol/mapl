import { useEffect, useState } from "react";
import { fetchReportBoard } from "../../../api/report";
import { REPORT_TYPE_MAP, STATUS_LABEL_MAP } from "../../../constants/report";
import { formatDateYYYYMMDD } from "../../../util/dateUtil";
import BoardList from "../BoardList";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

export default function ReportBoard({
  currentPage,
  setTotalCount,
  onPostClick,
}) {
  const [posts, setPosts] = useState([]);
  const handleError = useErrorHandler();

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await fetchReportBoard(currentPage);
        setPosts(data.posts);
        setTotalCount(data.totalCount);
      } catch (error) {
        handleError(error);
      }
    }

    loadPost();
  }, [currentPage]);

  const columns = ["번호", "제목", "진행상태", "작성자", "작성일"];
  const rows = posts.map((post) => ({
    post,
    cells: [
      { content: post.id, style: "text-center" },
      {
        content: `${REPORT_TYPE_MAP[post.type]} - ${post.title}`,
        style: "text-left",
      },
      { content: STATUS_LABEL_MAP[post.status], style: "text-center" },
      { content: post.name, style: "text-center" },
      { content: formatDateYYYYMMDD(post.createdAt), style: "text-center" },
    ],
  }));

  return (
    <BoardList
      columnTemplate={"grid-cols-[75px_1fr_75px_75px_100px]"}
      columns={columns}
      rows={rows}
      onPostClick={onPostClick}
    />
  );
}
