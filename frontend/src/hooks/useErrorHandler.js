import { useModal } from "../context/ModalContext";
import { LoginExpiredError } from "../util/error";

export function useErrorHandler(onCloseCurrentModal) {
  const { openModal } = useModal();

  return function handleError(error, { closeCurrentModal = false } = {}) {
    if (error instanceof LoginExpiredError || error?.name === "AbortError") return;
    const message = error?.message || "알 수 없는 오류가 발생하였습니다.";

    if (closeCurrentModal && onCloseCurrentModal) {
      onCloseCurrentModal();
    }

    console.error("[ERROR]", error);
    openModal(message);
  };
}
