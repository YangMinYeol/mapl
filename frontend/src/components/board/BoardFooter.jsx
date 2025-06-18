import Paging from "../common/Paging";

export default function BoardFooter({
  currentPage,
  totalCount,
  onPageChange,
  onWriteClick,
  canWrite,
}) {
  const totalPages = Math.ceil(totalCount / 15);
  return (
    <div className="flex justify-between mt-8">
      {/* 검색 */}
      <div>
        <input type="text" className="w-24" /> <button></button>
      </div>
      {/* 페이징 */}
      <Paging
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => onPageChange(page)}
      />
      {/* 글작성 */}
      {canWrite && (
        <button
          className="h-8 text-white rounded w-18 bg-deep-green hover:cursor-pointer"
          onClick={onWriteClick}
        >
          글쓰기
        </button>
      )}
    </div>
  );
}
