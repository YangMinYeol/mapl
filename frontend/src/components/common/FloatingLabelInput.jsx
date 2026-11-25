import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useState, forwardRef } from "react";

const FloatingLabelInput = forwardRef(
  (
    {
      id,
      text,
      type,
      isPassword = false,
      width = "w-96",
      onChange,
      onBlur,
      onKeyUp,
      value,
      error,
      required,
      readOnly,
    },
    ref
  ) => {
    const [show, setShow] = useState(false);

    function handleShow() {
      setShow(!show);
    }

    return (
      <div className="mapl-floating-input mb-3">
        <div className={`relative h-12 ${width}`}>
          <input
            type={isPassword && show ? "text" : type}
            id={id}
            className={`mapl-input block w-full h-full px-2 py-2 text-sm peer ${isPassword ? "pr-10" : ""}`}
            placeholder=" "
            onChange={onChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            value={value}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            ref={ref}
          />
          <label
            htmlFor={id}
            className="mapl-floating-label"
          >
            {text}
          </label>
          {isPassword && (
            <button
              type="button"
              className="mapl-field-action absolute top-1/2 right-2 -translate-y-1/2 flex size-8 cursor-pointer items-center justify-center rounded-md text-mapl-black hover:bg-[var(--mapl-hover)]"
              onClick={handleShow}
              aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              <FontAwesomeIcon
                icon={show ? faEyeSlash : faEye}
                className="text-lg"
                fixedWidth
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        {error && <p id={`${id}-error`} className="mapl-field-error">{error}</p>}
      </div>
    );
  }
);

export default FloatingLabelInput;
