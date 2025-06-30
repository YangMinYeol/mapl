import { useModal } from "../context/ModalContext";
import { LoginExpiredError } from "../util/error";
import { useLoginExpiredHandler } from "./useLoginExpiredHandler";

export function useErrorHandler() {
  const { openModal } = useModal();
  const handleLoginExpired = useLoginExpiredHandler();

  return function handleError(error) {
    const message = error?.message || "알 수 없는 오류가 발생하였습니다.";

    if (error instanceof LoginExpiredError) {
      handleLoginExpired(message);
    } else {
      console.error("[ERROR]", error);
      openModal(message);
    }
  };
}
