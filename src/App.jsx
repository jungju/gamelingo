import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_RECORD_TYPE,
  HOME_PATH,
  LEGACY_EDITH_FINCH_RECORD_TYPE,
  OHMESH_APP_SLUG,
} from "./constants";
import { AuthStatePage } from "./components/AuthStatePage";
import { HomePage } from "./components/HomePage";
import { StudyBoardPage } from "./components/StudyBoardPage";
import {
  createDefaultAppData,
  createDefaultGameNoteData,
  createGameId,
  createGameLibrary,
  getKnownGameIds,
  hasCustomAppData,
  normalizeAppData,
  normalizeEdithFinchData,
  normalizeGameNoteData,
  serializeAppData,
} from "./gameState";
import {
  clearPendingGuestSave,
  createOhmeshRedirectUrl,
  getResponseErrorMessage,
  hasPendingGuestSave,
  loadGuestAppData,
  markPendingGuestSave,
  normalizeRoutePath,
  ohmeshFetch,
  readResponseJson,
  readRoutePath,
  saveGuestAppData,
  selectLatestRecord,
} from "./ohmeshClient";
import "./App.css";

export default function App() {
  const [routePath, setRoutePath] = useState(readRoutePath);
  const [authState, setAuthState] = useState({
    status: "checking",
    user: null,
    app: null,
    session: null,
    message: "로그인 상태를 확인하는 중입니다.",
  });
  const [appData, setAppData] = useState(loadGuestAppData);
  const [storageRecord, setStorageRecord] = useState(null);
  const [syncState, setSyncState] = useState({
    status: "local",
    message: "로그인 전에는 이 브라우저에만 저장됩니다.",
  });
  const [isRemoteDataReady, setIsRemoteDataReady] = useState(false);
  const [storageReloadKey, setStorageReloadKey] = useState(0);
  const lastSavedDataJsonRef = useRef("");

  const clearRemoteData = useCallback(() => {
    setStorageRecord(null);
    setIsRemoteDataReady(false);
    lastSavedDataJsonRef.current = "";
  }, []);

  const handleSessionProblem = useCallback(
    (response) => {
      if (response.status === 401) {
        clearRemoteData();
        setAuthState({
          status: "signed-out",
          user: null,
          app: null,
          session: null,
          message: "로그인이 필요합니다. 다시 로그인해주세요.",
        });
        setSyncState({
          status: "local",
          message: "로그인 전에는 이 브라우저에만 저장됩니다.",
        });
        return true;
      }

      if (response.status === 403) {
        clearRemoteData();
        setAuthState({
          status: "wrong-app",
          user: null,
          app: null,
          session: null,
          message: "현재 세션이 gamelingo 앱용이 아닙니다.",
        });
        return true;
      }

      return false;
    },
    [clearRemoteData]
  );

  const loadAuthState = useCallback(async () => {
    try {
      const response = await ohmeshFetch("/auth/me");

      if (response.status === 401) {
        clearRemoteData();
        setAuthState({
          status: "signed-out",
          user: null,
          app: null,
          session: null,
          message: "로그인하면 문장 노트를 안전하게 저장할 수 있습니다.",
        });
        setSyncState({
          status: "local",
          message: "로그인 전에는 이 브라우저에만 저장됩니다.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response, "로그인 상태를 확인하지 못했습니다."));
      }

      const sessionInfo = await readResponseJson(response);

      if (sessionInfo?.app?.slug && sessionInfo.app.slug !== OHMESH_APP_SLUG) {
        clearRemoteData();
        setAuthState({
          status: "wrong-app",
          user: sessionInfo.user || null,
          app: sessionInfo.app || null,
          session: sessionInfo.session || null,
          message: "현재 세션이 gamelingo 앱용이 아닙니다.",
        });
        return;
      }

      setAuthState({
        status: "signed-in",
        user: sessionInfo?.user || null,
        app: sessionInfo?.app || null,
        session: sessionInfo?.session || null,
        message: "",
      });
    } catch (error) {
      clearRemoteData();
      setSyncState({
        status: "local",
        message: "ohmesh 확인에 실패해 이 브라우저에만 저장됩니다.",
      });
      setAuthState({
        status: "error",
        user: null,
        app: null,
        session: null,
        message: error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다.",
      });
    }
  }, [clearRemoteData]);

  const checkAuth = useCallback(() => {
    setAuthState((previousState) => ({
      ...previousState,
      status: "checking",
      message: "로그인 상태를 확인하는 중입니다.",
    }));
    loadAuthState();
  }, [loadAuthState]);

  useEffect(() => {
    function syncRoutePath() {
      setRoutePath(readRoutePath());
    }

    window.addEventListener("popstate", syncRoutePath);
    return () => window.removeEventListener("popstate", syncRoutePath);
  }, []);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadAuthAfterMount() {
      await Promise.resolve();
      if (!shouldIgnore) loadAuthState();
    }

    loadAuthAfterMount();

    return () => {
      shouldIgnore = true;
    };
  }, [loadAuthState]);

  useEffect(() => {
    if (authState.status !== "signed-out" && authState.status !== "error") return;

    saveGuestAppData(appData);
  }, [authState.status, appData]);

  useEffect(() => {
    if (authState.status !== "signed-in") return undefined;

    let shouldIgnore = false;

    async function loadRemoteData() {
      await Promise.resolve();
      if (shouldIgnore) return;

      setStorageRecord(null);
      setIsRemoteDataReady(false);
      setSyncState({ status: "loading", message: "ohmesh에서 노트를 불러오는 중입니다." });
      lastSavedDataJsonRef.current = "";

      try {
        async function loadLatestRecord(recordType) {
          const listResponse = await ohmeshFetch(
            `/api/apps/${OHMESH_APP_SLUG}/records?type=${encodeURIComponent(recordType)}&limit=100&offset=0`
          );

          if (shouldIgnore || handleSessionProblem(listResponse)) return undefined;

          if (!listResponse.ok) {
            throw new Error(await getResponseErrorMessage(listResponse, "노트를 불러오지 못했습니다."));
          }

          const recordList = await readResponseJson(listResponse);
          const recordSummary = selectLatestRecord(Array.isArray(recordList?.records) ? recordList.records : []);

          if (!recordSummary) return null;

          const recordResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${recordSummary.id}`);

          if (shouldIgnore || handleSessionProblem(recordResponse)) return undefined;

          if (!recordResponse.ok) {
            throw new Error(await getResponseErrorMessage(recordResponse, "노트를 읽지 못했습니다."));
          }

          return readResponseJson(recordResponse);
        }

        let activeRecord = await loadLatestRecord(APP_RECORD_TYPE);
        if (shouldIgnore || activeRecord === undefined) return;

        let migratedLegacyData = null;

        if (!activeRecord) {
          const legacyRecord = await loadLatestRecord(LEGACY_EDITH_FINCH_RECORD_TYPE);
          if (shouldIgnore || legacyRecord === undefined) return;

          if (legacyRecord) {
            migratedLegacyData = createDefaultAppData(normalizeEdithFinchData(legacyRecord.data));
          }
        }

        const pendingGuestData = hasPendingGuestSave() ? loadGuestAppData() : null;
        const shouldUploadGuestData = Boolean(pendingGuestData && hasCustomAppData(pendingGuestData));
        const normalizedData = shouldUploadGuestData
          ? pendingGuestData
          : activeRecord
            ? normalizeAppData(activeRecord.data)
            : migratedLegacyData || createDefaultAppData();
        const compactData = serializeAppData(normalizedData);
        const compactDataJson = JSON.stringify(compactData);

        if (!activeRecord) {
          const createResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: APP_RECORD_TYPE,
              data: compactData,
            }),
          });

          if (shouldIgnore || handleSessionProblem(createResponse)) return;

          if (!createResponse.ok) {
            throw new Error(await getResponseErrorMessage(createResponse, "노트를 만들지 못했습니다."));
          }

          activeRecord = await readResponseJson(createResponse);
        } else if (JSON.stringify(activeRecord?.data) !== compactDataJson) {
          const compactResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${activeRecord.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: compactData }),
          });

          if (shouldIgnore || handleSessionProblem(compactResponse)) return;

          if (!compactResponse.ok) {
            throw new Error(await getResponseErrorMessage(compactResponse, "노트를 압축 저장하지 못했습니다."));
          }

          activeRecord = await readResponseJson(compactResponse);
        }

        if (pendingGuestData) {
          clearPendingGuestSave();
        }

        lastSavedDataJsonRef.current = compactDataJson;

        if (shouldIgnore) return;

        setStorageRecord(activeRecord);
        setAppData(normalizedData);
        saveGuestAppData(normalizedData);
        setIsRemoteDataReady(true);
        setSyncState({
          status: "saved",
          message: shouldUploadGuestData ? "브라우저 노트를 ohmesh에 저장했습니다." : "ohmesh에 저장되어 있습니다.",
        });
      } catch (error) {
        if (shouldIgnore) return;

        setIsRemoteDataReady(false);
        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "노트를 불러오지 못했습니다.",
        });
      }
    }

    loadRemoteData();

    return () => {
      shouldIgnore = true;
    };
  }, [authState.status, handleSessionProblem, storageReloadKey]);

  useEffect(() => {
    if (authState.status !== "signed-in" || !isRemoteDataReady || !storageRecord?.id) {
      return undefined;
    }

    const compactData = serializeAppData(appData);
    const nextDataJson = JSON.stringify(compactData);

    if (nextDataJson === lastSavedDataJsonRef.current) {
      return undefined;
    }

    const abortController = new AbortController();
    const saveTimer = window.setTimeout(async () => {
      setSyncState({ status: "saving", message: "ohmesh에 저장하는 중입니다." });

      try {
        const response = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${storageRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: compactData }),
          signal: abortController.signal,
        });

        if (handleSessionProblem(response)) return;

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "노트를 저장하지 못했습니다."));
        }

        const updatedRecord = await readResponseJson(response);
        lastSavedDataJsonRef.current = nextDataJson;
        setStorageRecord(updatedRecord);
        saveGuestAppData(appData);
        setSyncState({ status: "saved", message: "ohmesh에 저장되어 있습니다." });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;

        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "노트를 저장하지 못했습니다.",
        });
      }
    }, 650);

    return () => {
      window.clearTimeout(saveTimer);
      abortController.abort();
    };
  }, [authState.status, appData, handleSessionProblem, isRemoteDataReady, storageRecord?.id]);

  const gameLibrary = createGameLibrary(appData.customGames);
  const selectedGameInfo = gameLibrary.find((game) => game.path === routePath);
  const selectedGameData = selectedGameInfo
    ? appData.notesByGameId[selectedGameInfo.id] || createDefaultGameNoteData(selectedGameInfo.id)
    : null;
  const isGuestMode = authState.status === "signed-out" || authState.status === "error";

  function navigateTo(path) {
    const routePath = normalizeRoutePath(path);
    window.history.pushState({}, "", routePath);
    setRoutePath(routePath);
  }

  function login() {
    window.location.assign(createOhmeshRedirectUrl("/login"));
  }

  function saveToOhmesh() {
    saveGuestAppData(appData);
    markPendingGuestSave();
    login();
  }

  function logout() {
    window.location.assign(createOhmeshRedirectUrl("/logout"));
  }

  function retryStorageLoad() {
    setStorageReloadKey((previousKey) => previousKey + 1);
  }

  function setSelectedGameData(updater) {
    if (!selectedGameInfo) return;

    const gameId = selectedGameInfo.id;

    setAppData((previousData) => {
      const previousNote = previousData.notesByGameId[gameId] || createDefaultGameNoteData(gameId);
      const nextNote = typeof updater === "function" ? updater(previousNote) : updater;

      return {
        ...previousData,
        notesByGameId: {
          ...previousData.notesByGameId,
          [gameId]: normalizeGameNoteData(nextNote, gameId),
        },
      };
    });
  }

  function createCustomGame({ title, description }) {
    const timestamp = new Date().toISOString();
    const game = {
      id: createGameId(title, getKnownGameIds(appData)),
      title: title.trim(),
      description: description.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAppData((previousData) => ({
      ...previousData,
      customGames: [...previousData.customGames, game],
      notesByGameId: {
        ...previousData.notesByGameId,
        [game.id]: createDefaultGameNoteData(game.id),
      },
    }));

    return game;
  }

  function updateCustomGame(gameId, { title, description }) {
    const timestamp = new Date().toISOString();

    setAppData((previousData) => ({
      ...previousData,
      customGames: previousData.customGames.map((game) =>
        game.id === gameId
          ? {
              ...game,
              title: title.trim(),
              description: description.trim(),
              updatedAt: timestamp,
            }
          : game
      ),
    }));
  }

  function deleteCustomGame(gameId) {
    setAppData((previousData) => {
      const remainingNotesByGameId = { ...previousData.notesByGameId };
      delete remainingNotesByGameId[gameId];

      return {
        ...previousData,
        customGames: previousData.customGames.filter((game) => game.id !== gameId),
        notesByGameId: remainingNotesByGameId,
      };
    });

    if (routePath === `/games/${gameId}`) {
      navigateTo(HOME_PATH);
    }
  }

  if (authState.status === "checking") {
    return <AuthStatePage title="로그인 확인 중" description={authState.message} />;
  }

  if (authState.status === "wrong-app") {
    return (
      <AuthStatePage
        title="앱 세션 확인 필요"
        description={authState.message}
        primaryAction="로그아웃"
        onPrimaryAction={logout}
        secondaryAction="다시 확인"
        onSecondaryAction={checkAuth}
      />
    );
  }

  if (authState.status === "signed-in" && !isRemoteDataReady) {
    return (
      <AuthStatePage
        title={syncState.status === "error" ? "노트를 불러오지 못했습니다" : "노트를 불러오는 중"}
        description={syncState.message || "ohmesh에서 내 문장 노트를 준비하고 있습니다."}
        primaryAction={syncState.status === "error" ? "다시 시도" : undefined}
        onPrimaryAction={syncState.status === "error" ? retryStorageLoad : undefined}
        secondaryAction="로그아웃"
        onSecondaryAction={logout}
      />
    );
  }

  if (selectedGameInfo) {
    return (
      <StudyBoardPage
        key={selectedGameInfo.id}
        game={selectedGameInfo}
        data={selectedGameData}
        setData={setSelectedGameData}
        syncState={syncState}
        user={authState.user}
        isGuestMode={isGuestMode}
        onGoHome={() => navigateTo(HOME_PATH)}
        onLogout={logout}
        onSaveToOhmesh={saveToOhmesh}
      />
    );
  }

  return (
    <HomePage
      games={gameLibrary}
      syncState={syncState}
      user={authState.user}
      isGuestMode={isGuestMode}
      onCreateGame={createCustomGame}
      onDeleteGame={deleteCustomGame}
      onUpdateGame={updateCustomGame}
      onLogout={logout}
      onSaveToOhmesh={saveToOhmesh}
      onSelectGame={(game) => navigateTo(game.path)}
    />
  );
}
