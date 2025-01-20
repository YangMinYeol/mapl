import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";

export default function FloatingLabelInput({
  id,
  text,
  type,
  isPassword = false,
  width = "w-96",
  onChange,
  value,
  error,
}) {
  const [show, setShow] = useState(false);

  function handleShow() {
    setShow(!show);
  }
  return (
    <div className="mb-3">
      <div className={`relative h-12  ${width}`}>
        <input
          type={isPassword && show ? "text" : type}
          id={id}
          className={`${
            isPassword && "pr-10"
          } block w-full h-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-800 peer`}
          placeholder=" "
          onChange={onChange}
          value={value}
        />
        <label
          htmlFor={id}
          className="absolute px-1 mx-1 text-sm text-gray-500 duration-300 scale-75 -translate-y-4 bg-white top-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-focus:scale-75 peer-focus:-translate-y-4"
        >
          {text}
        </label>
        {/* 패스워드일 경우 */}
        {isPassword && (
          <span className="absolute inset-y-0 flex items-center cursor-pointer right-3">
            <FontAwesomeIcon
              icon={show ? faEyeSlash : faEye}
              className="text-gray-500 hover:text-blue-800"
              onClick={handleShow}
              fixedWidth
            />
          </span>
        )}
      </div>
      <p className="text-xs text-red-500">{error}</p>
    </div>
  );
}
