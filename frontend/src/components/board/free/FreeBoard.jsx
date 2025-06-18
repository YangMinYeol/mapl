import { useEffect, useState } from "react";
import BoardList from "../BoardList";
import { fetchFreeBoard } from "../../../api/free";
import { formatDateYYYYMMDD } from "../../../util/dateUtil";

export default function FreeBoard({currentPage, setTotalCount, openModal, onPostClick}) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await fetchFreeBoard(currentPage);
        setPosts(data.posts);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        openModal(error.message);
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
