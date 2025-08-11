import { useEffect, useState } from "react";
import { fetchFreeBoard } from "../../../api/free";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { formatDateYYYYMMDD } from "../../../util/dateUtil";
import BoardList from "../BoardList";

export default function FreeBoard({ currentPage, setTotalCount, onPostClick }) {
  const [posts, setPosts] = useState([]);
  const handleError = useErrorHandler();

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await fetchFreeBoard(currentPage);
        setPosts(data.posts);
        setTotalCount(data.totalCount);
      } catch (error) {
        handleError(error);
      }
    }
    loadPost();
  }, [currentPage]);

  const columns = ["번호", "제목", "작성자", "작성일"];

  const rows = posts.map((post) => ({
    post,
    cells: [
      { content: post.id, style: "text-center" },
      { content: post.title, style: "text-left" },
      { content: post.name, style: "text-center" },
      { content: formatDateYYYYMMDD(post.createdAt), style: "text-center" },
    ],
  }));

  return (
    <BoardList
      columnTemplate={"grid-cols-[75px_1fr_75px_100px]"}
      columns={columns}
      rows={rows}
      onPostClick={onPostClick}
    />
  );
}
