import { LoginExpiredError } from "../util/error";
import { ERROR_TYPE } from "../util/errorType";

const API_URL = import.meta.env.VITE_API_URL;
export const SESSION_EXPIRED_EVENT = "mapl:session-expired";
let session = new AbortController();
let pendingRefresh;
let pendingLogout;

export function resetAuthRequests() {
  session.abort();
  session = new AbortController();
  pendingRefresh = undefined;
}

export function clearRefreshCookie() {
  pendingLogout = fetch(`${API_URL}/api/user/logout`, { method: "POST", credentials: "include" })
    .catch((error) => console.warn("로그아웃 요청 실패", error));
}

export async function waitForLogout() {
  await pendingLogout;
}

// 인증 토큰을 포함하여 API 요청을 보내고, 필요 시 토큰을 갱신하여 재요청합니다.
export async function fetchWithAuth(url, options = {}) {
  const sessionSignal = session.signal;
  const signal = options.signal ? AbortSignal.any([options.signal, sessionSignal]) : sessionSignal;
  const accessToken = localStorage.getItem("accessToken");
  let response = await fetchWithToken(url, { ...options, signal }, accessToken);

  if (response.status !== 401) return response;

  const data = await parseJsonSafely(response);
  sessionSignal.throwIfAborted();

  if (!isRetryableError(response, data)) return response;

  let newAccessToken = localStorage.getItem("accessToken");
  if (!newAccessToken || newAccessToken === accessToken) {
    pendingRefresh ??= refreshAccessToken(sessionSignal).finally(() => {
      if (!sessionSignal.aborted) pendingRefresh = undefined;
    });
    try {
      newAccessToken = await pendingRefresh;
    } catch (error) {
      sessionSignal.throwIfAborted();
      if (error instanceof LoginExpiredError) expireSession();
      throw error;
    }
  }

  response = await fetchWithToken(url, { ...options, signal }, newAccessToken);
  if (response.status === 401 && isRetryableError(response, await parseJsonSafely(response))) {
    sessionSignal.throwIfAborted();
    expireSession();
    throw new LoginExpiredError();
  }
  return response;
}

function expireSession() {
  if (session.signal.aborted) return;
  session.abort();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

// 주어진 토큰을 Authorization 헤더에 포함하여 fetch 요청을 보냅니다.
function fetchWithToken(url, options, token) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// 비밀번호 오류가 아닌 경우 토큰 갱신 후 재요청이 가능한지 검사합니다.
function isRetryableError(response, data) {
  return response.status === 401 && data.type !== ERROR_TYPE.INVALID_PASSWORD;
}

// 응답 객체를 JSON으로 안전하게 파싱하며, 실패 시 빈 객체를 반환합니다.
async function parseJsonSafely(response) {
  try {
    return await response.clone().json();
  } catch {
    return {};
  }
}

// 리프레시 토큰을 사용해 새로운 액세스 토큰을 발급받고 로컬스토리지에 저장합니다.
async function refreshAccessToken(signal) {
  const response = await fetch(`${API_URL}/api/user/refresh`, {
    method: "POST",
    credentials: "include",
    signal,
  });

  if (response.status === 401 || response.status === 403) throw new LoginExpiredError();
  if (!response.ok) throw new Error("로그인 상태를 확인하지 못했어요. 다시 시도해 주세요.");

  const { accessToken } = await response.json();
  signal.throwIfAborted();
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
}
