import { useState } from "react";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../context/ModalContext";
import ReportBoard from "../components/board/ReportBoard";
import BoardFooter from "../components/board/BoardFooter";
import NoticeBoard from "../components/board/NoticeBoard";
import FreeBoard from "../components/board/FreeBoard";

export default function BoardPage() {
  const { openModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [handleWriteClick, setHandleWriteClick] = useState(() => () => {});

  function handleError(error) {
    openModal(error.message);
  }

  const boardTabs = [
    {
      key: "notice",
      title: "공지사항",
      content: "마플에 새로운 소식과 정보를 전해드려요.",
    },
    {
      key: "free",
      title: "게시판",
      content: "다른 사용자와 의견을 나눠보세요.",
    },
    {
      key: "report",
      title: "오류 보고",
      content: "마플을 사용하면서 발견한 오류와 개선점이 있으면 알려주세요.",
    },
  ];

  const [activeBoard, setActiveBoard] = useState(boardTabs[0]);

  // 탭 클릭
  function handleTabClick(tab) {
    setActiveBoard(tab);
    setCurrentPage(1);
    setTotalCount(0);
    switch (tab.key) {
      case "notice":
        setHandleWriteClick(() => () => {
          console.log("공지사항 작성 버튼 클릭");
        });
        break;
      case "free":
        setHandleWriteClick(() => () => {
          console.log("자유 게시판 글쓰기 버튼 클릭");
        });
        break;
      case "report":
        setHandleWriteClick(() => () => {
          console.log("오류 보고 글쓰기 버튼 클릭");
        });
        break;
      default:
        setHandleWriteClick(() => () => {});
    }
  }

  // 현재 선택된 게시판 컴포넌트 렌더링
  function renderBoard() {
    switch (activeBoard.key) {
      case "notice":
        return <NoticeBoard />;
      case "free":
        return <FreeBoard />;
      case "report":
        return (
          <ReportBoard
            onError={handleError}
            currentPage={currentPage}
            setTotalCount={setTotalCount}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex min-[1080px] h-[900px] justify-center my-10">
      <div className="min-w-[200px]">
        <div className="pb-7 min-h-16">
          <span className="text-3xl">고객센터</span>
        </div>
        <div className="w-full border divide-y border-mapl-slate divide-mapl-slate">
          {boardTabs.map((tab) => {
            const isSelected = activeBoard.key === tab.key;
            return (
              <div
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`h-12 flex items-center justify-between px-4 cursor-pointer
                  font-medium
                  ${
                    isSelected
                      ? "bg-gray-50 text-green-900"
                      : "text-[#666] hover:bg-gray-50 hover:text-green-900"
                  }
                `}
              >
                <span>{tab.title}</span>
                <FontAwesomeIcon icon={faAngleRight} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-[820px] px-5">
        <div className="flex items-center pb-7 min-h-16">
          <div>
            <span className="text-2xl">{activeBoard.title}</span>
          </div>
          <div className="ml-3">
            <span className="text-[#666]">{activeBoard.content}</span>
          </div>
        </div>
        <div>{renderBoard()}</div>
        <div>
          <BoardFooter
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onWriteClick={handleWriteClick}
          />
        </div>
      </div>
    </div>
  );
}
