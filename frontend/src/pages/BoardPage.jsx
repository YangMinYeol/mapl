import { useContext, useState } from "react";
import BoardFooter from "../components/board/BoardFooter";
import BoardHeader from "../components/board/BoardHeader";
import BoardPost from "../components/board/BoardPost";
import BoardTabs from "../components/board/BoardTabs";
import FreeBoard from "../components/board/free/FreeBoard";
import NoticeBoard from "../components/board/notice/NoticeBoard";
import ReportBoard from "../components/board/report/ReportBoard";
import {
  BOARD_SCREEN_MODE,
  BOARD_TYPE,
  POST_FORM_MODE,
} from "../constants/board";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";

const boardTabs = [
  {
    key: BOARD_TYPE.NOTICE,
    title: "공지사항",
    content: "마플에 새로운 소식과 정보를 전해드려요.",
  },
  {
    key: BOARD_TYPE.FREE,
    title: "자유게시판",
    content: "다른 사용자와 의견을 나눠보세요.",
  },
  {
    key: BOARD_TYPE.REPORT,
    title: "오류 보고",
    content: "마플을 사용하면서 발견한 오류와 개선점이 있으면 알려주세요.",
  },
];

export default function BoardPage() {
  const { openModal, openConfirm } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [activeBoard, setActiveBoard] = useState(boardTabs[0].key);
  const [screenMode, setScreenMode] = useState(BOARD_SCREEN_MODE.LIST);
  const [formMode, setFormMode] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useContext(UserContext);

  const canWrite = (() => {
    switch (activeBoard) {
      case BOARD_TYPE.NOTICE:
        return user.role === "admin";
      case BOARD_TYPE.REPORT:
        return true;
      case BOARD_TYPE.FREE:
        return true;
      default:
        return false;
    }
  })();

  // 탭 클릭
  function handleTabClick(tab) {
    setActiveBoard(tab.key);
    setScreenMode(BOARD_SCREEN_MODE.LIST);
    setFormMode(null);
    setSelectedPost(null);
    setCurrentPage(1);
    setTotalCount(0);
  }

  // 글쓰기 버튼 클릭
  function handleWriteClick() {
    setScreenMode(BOARD_SCREEN_MODE.POST);
    setFormMode(POST_FORM_MODE.CREATE);
    setSelectedPost(null);
  }

  // 상세보기 클릭 (게시글 선택)
  function handleViewPost(post) {
    setScreenMode(BOARD_SCREEN_MODE.POST);
    setFormMode(POST_FORM_MODE.VIEW);
    setSelectedPost(post);
  }

  // 화면 렌더링
  function renderBoardContent() {
    if (screenMode === BOARD_SCREEN_MODE.LIST) {
      switch (activeBoard) {
        case BOARD_TYPE.NOTICE:
          return (
            <NoticeBoard
              currentPage={currentPage}
              setTotalCount={setTotalCount}
              openModal={openModal}
              onPostClick={handleViewPost}
            />
          );
        case BOARD_TYPE.FREE:
          return (
            <FreeBoard
              currentPage={currentPage}
              setTotalCount={setTotalCount}
              openModal={openModal}
              onPostClick={handleViewPost}
            />
          );
        case BOARD_TYPE.REPORT:
          return (
            <ReportBoard
              currentPage={currentPage}
              setTotalCount={setTotalCount}
              openModal={openModal}
              onPostClick={handleViewPost}
            />
          );
        default:
          return null;
      }
    }

    // POST 화면일 때 (작성 / 수정 / 상세)
    return (
      <BoardPost
        user={user}
        formMode={formMode}
        setFormMode={setFormMode}
        boardType={activeBoard}
        post={selectedPost}
        onClose={() => setScreenMode(BOARD_SCREEN_MODE.LIST)}
        openModal={openModal}
        openConfirm={openConfirm}
      />
    );
  }

  return (
    <div className="flex min-[1080px] h-[900px] justify-center my-10">
      <BoardTabs
        onTabClick={handleTabClick}
        boardTabs={boardTabs}
        activeBoard={boardTabs.find((tab) => tab.key === activeBoard)}
      />
      <div className="w-[820px] px-5">
        <BoardHeader
          activeBoard={boardTabs.find((tab) => tab.key === activeBoard)}
        />
        <div>{renderBoardContent()}</div>
        {screenMode === BOARD_SCREEN_MODE.LIST && (
          <BoardFooter
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onWriteClick={handleWriteClick}
            canWrite={canWrite}
          />
        )}
      </div>
    </div>
  );
}
