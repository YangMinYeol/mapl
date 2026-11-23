import { useEffect } from "react";

export default function Loading({ placement = "page", label = "불러오는 중" }) {
  useEffect(() => {
    if (placement !== "page") return;

    function blockPageKeys(event) {
      if (event.target instanceof Element && event.target.closest('[aria-modal="true"]')) return;
      if (event.key !== "Tab" && !document.getElementById("root")?.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    }

    document.addEventListener("keydown", blockPageKeys, true);
    return () => document.removeEventListener("keydown", blockPageKeys, true);
  }, [placement]);

  return (
    <div className={`mapl-loading mapl-loading-${placement}`} role="status">
      <span className="mapl-loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
