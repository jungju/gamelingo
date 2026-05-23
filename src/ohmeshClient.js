import {
  GUEST_APP_KEY,
  HOME_PATH,
  LEGACY_GUEST_EDITH_FINCH_KEY,
  LEGACY_PENDING_GUEST_SAVE_KEY,
  OHMESH_APP_SLUG,
  OHMESH_BASE_URL,
  PENDING_GUEST_SAVE_KEY,
  REGISTERED_REDIRECT_URL,
} from "./constants";
import {
  createDefaultAppData,
  normalizeAppData,
  normalizeEdithFinchData,
  serializeAppData,
} from "./gameState";

export function normalizeRoutePath(path) {
  const pathname = path.split("?")[0].replace(/\/+$/, "");
  return pathname || HOME_PATH;
}

export function readRoutePath() {
  if (typeof window === "undefined") return HOME_PATH;

  const searchParams = new URLSearchParams(window.location.search);
  const redirectedPath = searchParams.get("path");

  if (redirectedPath) {
    const routePath = normalizeRoutePath(redirectedPath);
    window.history.replaceState({}, "", routePath);
    return routePath;
  }

  return normalizeRoutePath(window.location.pathname);
}

export function loadGuestAppData() {
  if (typeof window === "undefined") return createDefaultAppData();

  try {
    const savedData = window.localStorage.getItem(GUEST_APP_KEY);

    if (savedData) {
      return normalizeAppData(JSON.parse(savedData));
    }
  } catch {
    // 새 저장값이 깨졌다면 legacy fallback까지 확인한다.
  }

  try {
    const legacyEdithFinchData = window.localStorage.getItem(LEGACY_GUEST_EDITH_FINCH_KEY);
    return legacyEdithFinchData
      ? createDefaultAppData(normalizeEdithFinchData(JSON.parse(legacyEdithFinchData)))
      : createDefaultAppData();
  } catch {
    return createDefaultAppData();
  }
}

export function saveGuestAppData(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GUEST_APP_KEY, JSON.stringify(serializeAppData(data)));
  } catch {
    // 게스트 저장 실패는 앱 사용을 막지 않는다.
  }
}

export function markPendingGuestSave() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PENDING_GUEST_SAVE_KEY, "1");
  } catch {
    // 로그인은 계속 진행한다.
  }
}

export function hasPendingGuestSave() {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(PENDING_GUEST_SAVE_KEY) === "1" ||
      window.localStorage.getItem(LEGACY_PENDING_GUEST_SAVE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function clearPendingGuestSave() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PENDING_GUEST_SAVE_KEY);
    window.localStorage.removeItem(LEGACY_PENDING_GUEST_SAVE_KEY);
  } catch {
    // 제거 실패는 다음 저장 때 다시 정리된다.
  }
}

function getCurrentAppUrl() {
  if (typeof window === "undefined") return REGISTERED_REDIRECT_URL;

  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";

  if (!isRegisteredRedirectUrl(currentUrl)) {
    return REGISTERED_REDIRECT_URL;
  }

  return currentUrl.toString();
}

function isRegisteredRedirectUrl(url) {
  const registeredUrl = new URL(REGISTERED_REDIRECT_URL);
  return url.origin === registeredUrl.origin && url.pathname.startsWith(registeredUrl.pathname);
}

export function createOhmeshRedirectUrl(path) {
  const url = new URL(path, OHMESH_BASE_URL);
  url.searchParams.set("app", OHMESH_APP_SLUG);
  url.searchParams.set("redirect_url", getCurrentAppUrl());
  return url.toString();
}

export function ohmeshFetch(path, options = {}) {
  return fetch(`${OHMESH_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}

export async function readResponseJson(response) {
  if (response.status === 204) return null;

  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return null;
  }
}

export async function getResponseErrorMessage(response, fallbackMessage) {
  const errorBody = await readResponseJson(response);
  return errorBody?.error || fallbackMessage || `ohmesh 요청 실패 (${response.status})`;
}

export function selectLatestRecord(records) {
  return [...records].sort((firstRecord, secondRecord) => {
    const firstTime = new Date(firstRecord.updated_at || firstRecord.created_at || 0).getTime();
    const secondTime = new Date(secondRecord.updated_at || secondRecord.created_at || 0).getTime();
    return secondTime - firstTime;
  })[0] || null;
}

export function getUserDisplayName(user) {
  return user?.name || user?.email || "로그인됨";
}

export function getSyncStatusLabel(syncState) {
  if (syncState.status === "local") return "브라우저 저장";
  if (syncState.status === "loading") return "불러오는 중";
  if (syncState.status === "saving") return "저장 중";
  if (syncState.status === "saved") return "저장됨";
  if (syncState.status === "error") return "저장 오류";
  return "대기";
}
