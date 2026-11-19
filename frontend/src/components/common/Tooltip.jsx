import { useLayoutEffect, useRef, useState } from "react";

export default function Tooltip({ children, content }) {
  const anchor = useRef(null);
  const popup = useRef(null);
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    if (!visible) return;
    function position() {
      const rect = anchor.current.getBoundingClientRect();
      const tip = popup.current;
      const margin = 8;
      const top = rect.bottom + margin + tip.offsetHeight <= window.innerHeight
        ? rect.bottom + margin : rect.top - margin - tip.offsetHeight;
      tip.style.top = Math.max(margin, top) + "px";
      tip.style.left = Math.max(margin, Math.min(rect.left, document.documentElement.clientWidth - tip.offsetWidth - margin)) + "px";
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [visible, content]);
  return (
    <div ref={anchor} className="relative inline-block"
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}
      onKeyDown={(event) => { if (event.key === "Escape") setVisible(false); }}>
      {children}
      {visible && <div ref={popup} className="planner-tooltip planner-tag-tooltip" role="tooltip">{content}</div>}
    </div>
  );
}
