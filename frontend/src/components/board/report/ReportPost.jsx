import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { submitReport } from "../../../api/report";
import { POST_FORM_MODE } from "../../../constants/board";
import { REPORT_TYPE_MAP } from "../../../constants/report";
import { UserContext } from "../../../context/UserContext";
import SelectArrow from "../../common/SelectArrow";

const MAX_TITLE_LENGTH = 50;
const MAX_LENGTH = 2000;
const MAX_IMAGES = 6;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
];

export default function ReportPost({
  formMode = POST_FORM_MODE.CREATE,
  onClose,
  openModal,
  post,
}) {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const typeRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const isReadOnly = formMode === POST_FORM_MODE.VIEW;

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      typeRef.current.value = post.type || Object.keys(REPORT_TYPE_MAP)[0];
      // 이미지도 추가
      console.log(post);
    }
  }, [formMode, post]);

  // 이미지 유효성 검사
  function isValidImage(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      openModal(`허용하지 않는 파일 확장자입니다: ${file.name}`);
      return false;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      openModal(`허용하지 않는 파일 형식입니다: ${file.name}`);
      return false;
    }
    if (
      images.some((img) => img.name === file.name && img.size === file.size)
    ) {
      openModal("같은 이미지를 중복해서 추가할 수 없습니다.");
      return false;
    }
    return true;
  }

  // 이미지 선택 핸들러
  function handleImageSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    let updatedImages = [...images];

    for (const file of selectedFiles) {
      if (!isValidImage(file)) continue;

      updatedImages.push(file);

      if (updatedImages.length > MAX_IMAGES) {
        openModal(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
        updatedImages = updatedImages.slice(0, MAX_IMAGES);
        break;
      }
    }

    setImages(updatedImages);
    e.target.value = ""; // 선택 초기화
  }

  // 이미지 제거
  function handleRemoveImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  // 제목, 내용 입력값 검증
  function validateInputs() {
    if (!title.trim()) {
      openModal("제목을 입력해주세요.");
      return false;
    }
    if (!content.trim()) {
      openModal("내용을 입력해주세요.");
      return false;
    }
    return true;
  }

  // 오류 보고 등록
  async function handleSubmitReport() {
    if (!validateInputs()) return;

    try {
      const type = typeRef.current.value;
      await submitReport({ userId: user.id, type, title, content, images });
      onClose();
    } catch (error) {
      openModal(error.message || "등록 중 오류가 발생했습니다.");
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col p-5">
      <div className="border-b border-mapl-slate">
        {/* 유형 선택 */}
        <FormRow label="유형">
          <div className="relative w-full">
            <select
              ref={typeRef}
              className="w-full h-full p-3 pr-10 border rounded appearance-none border-mapl-slate hover:cursor-pointer"
              defaultValue={Object.keys(REPORT_TYPE_MAP)[0]}
              disabled={isReadOnly}
            >
              {Object.entries(REPORT_TYPE_MAP).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </FormRow>

        {/* 제목 입력 */}
        <FormRow label="제목">
          <input
            type="text"
            className="w-full p-3 border rounded border-mapl-slate"
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={(e) => {
              if (e.target.value.length <= MAX_TITLE_LENGTH) {
                setTitle(e.target.value);
              }
            }}
            readOnly={isReadOnly}
          />
        </FormRow>

        {/* 내용 입력 */}
        <FormRow label="내용" isTextarea>
          <textarea
            className="w-full p-3 border rounded border-mapl-slate h-[450px] resize-none"
            placeholder="내용을 자세히 작성할수록 개선에 도움이됩니다."
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH)
                setContent(e.target.value);
            }}
            readOnly={isReadOnly}
          />
          <div className="text-sm text-right text-gray-500">
            {content.length} / {MAX_LENGTH}
          </div>
        </FormRow>

        {/* 이미지 첨부 */}
        <FormRow label="">
          <div className="flex w-full gap-8">
            {isReadOnly
              ? post?.images?.map((imgPath, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 overflow-hidden border rounded border-mapl-slate hover:cursor-pointer"
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_API_URL}${imgPath}`,
                        "_blank"
                      )
                    }
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}${imgPath}`}
                      alt={`이미지-${idx}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))
              : images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 overflow-hidden border rounded border-mapl-slate"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`preview-${idx}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-gray-500 rounded-full hover:cursor-pointer"
                      onClick={() => handleRemoveImage(idx)}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faXmark} color="white" />
                    </button>
                  </div>
                ))}

            {!isReadOnly && images.length < MAX_IMAGES && (
              <div
                className="flex items-center justify-center w-20 h-20 border rounded border-mapl-slate hover:cursor-pointer"
                onClick={() => fileInputRef.current.click()}
                role="button"
                tabIndex={0}
              >
                <FontAwesomeIcon icon={faCamera} color="#666" size="xl" />
              </div>
            )}

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageSelect}
              multiple
            />
          </div>
        </FormRow>
      </div>

      {/* 버튼 영역 */}
      <div className="flex items-center justify-center mt-7">
        <button
          className="h-14 mx-8 text-base border rounded text-[#666] font-semibold border-mapl-slate w-36 hover:cursor-pointer"
          onClick={onClose}
          type="button"
        >
          취소
        </button>
        {!isReadOnly && (
          <button
            className="mx-8 text-base font-semibold text-white rounded h-14 w-36 bg-deep-green hover:cursor-pointer"
            onClick={handleSubmitReport}
            type="button"
          >
            등록
          </button>
        )}
      </div>
    </div>
  );
}

function FormRow({ label, children, isTextarea = false }) {
  return (
    <div className="flex justify-center mb-5">
      <label
        className={`flex items-${
          isTextarea ? "start pt-2" : "center"
        } font-medium w-28`}
      >
        {label}
      </label>
      <div className="w-full">{children}</div>
    </div>
  );
}
