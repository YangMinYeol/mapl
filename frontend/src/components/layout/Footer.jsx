export default function Footer() {
  return (
    <footer className="bg-[#f3f6f4] px-4 py-4 text-center text-xs text-[#53655d]">
      <div className="mx-auto max-w-[1560px] space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>제작: 양민열</span>
          <a href="mailto:minyeol0125@gmail.com" className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
            minyeol0125@gmail.com
          </a>
        </div>
        <p>&copy; 2024 My Planner. All Rights Reserved</p>
      </div>
    </footer>
  );
}
