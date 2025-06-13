export default function BoardList({
  columnTemplate,
  columns,
  rows,
  onPostClick,
}) {
  return (
    <div>
      <div className={`grid ${columnTemplate} items-center text-center h-12`}>
        {columns.map((col, index) => (
          <div key={index}>{col}</div>
        ))}
      </div>
      <div className="divide-y border-y divide-mapl-slate">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`grid ${columnTemplate} items-center py-3 hover:cursor-pointer hover:bg-gray-50`}
            onClick={() => onPostClick(row.post)}
          >
            {row.cells.map((cell, i) => (
              <div key={i} className={cell.style}>
                {cell.content}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
