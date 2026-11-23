import { forwardRef } from "react";
import "../../styles/dropdown.css";

const Dropdown = forwardRef(function Dropdown({ className = "", compact = false, children, ...props }, ref) {
  return (
    <span className={`mapl-dropdown${compact ? " mapl-dropdown--compact" : ""} ${className}`}>
      <select ref={ref} {...props}>
        {children}
      </select>
    </span>
  );
});

export default Dropdown;
