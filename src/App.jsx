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
    message: "Checking sign-in status.",
  });
  const [appData, setAppData] = useState(loadGuestAppData);
  const [storageRecord, setStorageRecord] = useState(null);
  const [syncState, setSyncState] = useState({
    status: "local",
    message: "Saved in this browser until you sign in.",
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
          message: "Please sign in again.",
        });
        setSyncState({
          status: "local",
          message: "Saved in this browser until you sign in.",
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
          message: "This session does not belong to Gamelingo.",
        });
        return true;
      }

      return false;
    },
    [clearRemoteData]
  );

  const loadAuthState = useCallback(async () => {
    try {
      const response = await ohmeshFetch(`/auth/me?app=${OHMESH_APP_SLUG}&optional=1`);

      if (response.status === 401 || response.status === 204) {
        clearRemoteData();
        setAuthState({
          status: "signed-out",
          user: null,
          app: null,
          session: null,
          message: "Sign in to save your study notes with ohmesh.",
        });
        setSyncState({
          status: "local",
          message: "Saved in this browser until you sign in.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response, "Could not check sign-in status."));
      }

      const sessionInfo = await readResponseJson(response);

      if (sessionInfo?.app?.slug && sessionInfo.app.slug !== OHMESH_APP_SLUG) {
        clearRemoteData();
        setAuthState({
          status: "wrong-app",
          user: sessionInfo.user || null,
          app: sessionInfo.app || null,
          session: sessionInfo.session || null,
          message: "This session does not belong to Gamelingo.",
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
        message: "Could not reach ohmesh, so notes are saved in this browser.",
      });
      setAuthState({
        status: "error",
        user: null,
        app: null,
        session: null,
        message: error instanceof Error ? error.message : "Could not check sign-in status.",
      });
    }
  }, [clearRemoteData]);

  const checkAuth = useCallback(() => {
    setAuthState((previousState) => ({
      ...previousState,
      status: "checking",
      message: "Checking sign-in status.",
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
      setSyncState({ status: "loading", message: "Loading notes from ohmesh." });
      lastSavedDataJsonRef.current = "";

      try {
        async function loadLatestRecord(recordType) {
          const listResponse = await ohmeshFetch(
            `/api/apps/${OHMESH_APP_SLUG}/records?type=${encodeURIComponent(recordType)}&limit=100&offset=0`
          );

          if (shouldIgnore || handleSessionProblem(listResponse)) return undefined;

          if (!listResponse.ok) {
            throw new Error(await getResponseErrorMessage(listResponse, "Could not load notes."));
          }

          const recordList = await readResponseJson(listResponse);
          const recordSummary = selectLatestRecord(Array.isArray(recordList?.records) ? recordList.records : []);

          if (!recordSummary) return null;

          const recordResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${recordSummary.id}`);

          if (shouldIgnore || handleSessionProblem(recordResponse)) return undefined;

          if (!recordResponse.ok) {
            throw new Error(await getResponseErrorMessage(recordResponse, "Could not read notes."));
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
            throw new Error(await getResponseErrorMessage(createResponse, "Could not create notes."));
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
            throw new Error(await getResponseErrorMessage(compactResponse, "Could not compact and save notes."));
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
          message: shouldUploadGuestData ? "Saved browser notes to ohmesh." : "Saved to ohmesh.",
        });
      } catch (error) {
        if (shouldIgnore) return;

        setIsRemoteDataReady(false);
        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not load notes.",
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
      setSyncState({ status: "saving", message: "Saving to ohmesh." });

      try {
        const response = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${storageRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: compactData }),
          signal: abortController.signal,
        });

        if (handleSessionProblem(response)) return;

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "Could not save notes."));
        }

        const updatedRecord = await readResponseJson(response);
        lastSavedDataJsonRef.current = nextDataJson;
        setStorageRecord(updatedRecord);
        saveGuestAppData(appData);
        setSyncState({ status: "saved", message: "Saved to ohmesh." });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;

        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not save notes.",
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
    return <AuthStatePage title="Checking Sign-In" description={authState.message} />;
  }

  if (authState.status === "wrong-app") {
    return (
      <AuthStatePage
        title="App Session Check Needed"
        description={authState.message}
        primaryAction="Log out"
        onPrimaryAction={logout}
        secondaryAction="Check again"
        onSecondaryAction={checkAuth}
      />
    );
  }

  if (authState.status === "signed-in" && !isRemoteDataReady) {
    return (
      <AuthStatePage
        title={syncState.status === "error" ? "Could Not Load Notes" : "Loading Notes"}
        description={syncState.message || "Preparing your study notes from ohmesh."}
        primaryAction={syncState.status === "error" ? "Try again" : undefined}
        onPrimaryAction={syncState.status === "error" ? retryStorageLoad : undefined}
        secondaryAction="Log out"
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
