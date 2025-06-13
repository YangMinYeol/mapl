export default function BoardHeader({activeBoard}) {
  return (
    <div className="flex items-center border-b-2 pb-7 min-h-16">
      <div>
        <span className="text-2xl">{activeBoard.title}</span>
      </div>
      <div className="ml-3">
        <span className="text-[#666]">{activeBoard.content}</span>
      </div>
    </div>
  );
}
