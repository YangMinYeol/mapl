import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { deleteReport, submitReport } from "../../../api/report";
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
  setFormMode,
  onClose,
  openModal,
  openConfirm,
  post,
}) {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const typeRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serverImages, setServerImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const isReadOnly = formMode === POST_FORM_MODE.VIEW;
  const isWriter = user?.id === post?.userId;

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      typeRef.current.value = post.type || Object.keys(REPORT_TYPE_MAP)[0];
      setServerImages(post.images || []);
      setNewImages([]);
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
    return true;
  }

  // 이미지 선택
  function handleImageSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    let updatedImages = [...newImages];

    for (const file of selectedFiles) {
      if (!isValidImage(file)) continue;
      updatedImages.push(file);
      if (serverImages.length + updatedImages.length > MAX_IMAGES) {
        openModal(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
        updatedImages = updatedImages.slice(
          0,
          MAX_IMAGES - serverImages.length
        );
        break;
      }
    }

    setNewImages(updatedImages);
    e.target.value = "";
  }

  // 기존 이미지 삭제
  function handleRemoveServerImage(index) {
    setServerImages((prev) => prev.filter((_, i) => i !== index));
  }

  // 새로 추가된 이미지 삭제
  function handleRemoveNewImage(index) {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  // Input 유효성 검사
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

  // 오류 보고서 등록
  async function handleSubmitReport() {
    if (!validateInputs()) return;
    try {
      const type = typeRef.current.value;
      await submitReport({
        userId: user.id,
        type,
        title,
        content,
        serverImages,
        newImages,
        postId: post?.id,
        mode: formMode,
      });
      onClose();
    } catch (error) {
      openModal(error.message || "등록 중 오류가 발생했습니다.");
      console.error(error);
    }
  }

  async function handleDeleteReport() {
    openConfirm(
      "정말로 삭제하시겠습니까?",
      "한번 삭제한 게시글은 되돌릴 수 없습니다.",
      async () => {
        try {
          if (!isWriter) return;
          await deleteReport(post.id);
          onClose();
        } catch (error) {
          openModal(error.message || "삭제 중 오류가 발생했습니다.");
          console.error(error);
        }
      }
    );
  }

  // 편집
  async function handleEditReport() {
    setFormMode(POST_FORM_MODE.EDIT);
  }

  // 편집 취소
  function handleEditCancelReport() {
    setFormMode(POST_FORM_MODE.VIEW);
  }

  return (
    <div className="flex flex-col p-5">
      <div className="border-b border-mapl-slate">
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

        <FormRow label="">
          <div className="flex w-full gap-8">
            {/* 기존 서버 이미지 */}
            {serverImages.map((imgPath, idx) => (
              <div
                key={`server-${idx}`}
                className="relative w-20 h-20 overflow-hidden border rounded border-mapl-slate"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${imgPath}`}
                  alt={`서버이미지-${idx}`}
                  className="object-cover w-full h-full"
                />
                {!isReadOnly && (
                  <button
                    className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-gray-500 rounded-full hover:cursor-pointer"
                    onClick={() => handleRemoveServerImage(idx)}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faXmark} color="white" />
                  </button>
                )}
              </div>
            ))}

            {/* 새로 추가된 이미지 */}
            {newImages.map((img, idx) => (
              <div
                key={`local-${idx}`}
                className="relative w-20 h-20 overflow-hidden border rounded border-mapl-slate"
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className="object-cover w-full h-full"
                />
                <button
                  className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-gray-500 rounded-full hover:cursor-pointer"
                  onClick={() => handleRemoveNewImage(idx)}
                  type="button"
                >
                  <FontAwesomeIcon icon={faXmark} color="white" />
                </button>
              </div>
            ))}

            {!isReadOnly &&
              serverImages.length + newImages.length < MAX_IMAGES && (
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
        {formMode === POST_FORM_MODE.VIEW && (
          <>
            {isWriter ? (
              <>
                <Button text="편집" onClick={handleEditReport} color="green" />
                <Button text="목록" onClick={onClose} />
                <Button text="삭제" onClick={handleDeleteReport} color="red" />
              </>
            ) : (
              <Button text="목록" onClick={onClose} />
            )}
          </>
        )}
        {formMode === POST_FORM_MODE.CREATE && (
          <>
            <Button text="목록" onClick={onClose} />
            <Button text="등록" onClick={handleSubmitReport} color="green" />
          </>
        )}
        {formMode === POST_FORM_MODE.EDIT && (
          <>
            <Button text="취소" onClick={handleEditCancelReport} />
            <Button text="등록" onClick={handleSubmitReport} color="green" />
          </>
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

function Button({ text, onClick, color = "default" }) {
  const base =
    "h-14 mx-3 text-base font-semibold rounded w-36 hover:cursor-pointer";
  const colorClass =
    color === "green"
      ? "text-white bg-deep-green"
      : color === "red"
      ? "text-white bg-red-500"
      : "text-[#666] border border-mapl-slate";

  return (
    <button className={`${base} ${colorClass}`} onClick={onClick} type="button">
      {text}
    </button>
  );
}
