import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Minus,
  X,
  Trash2,
  Share2,
  Copy,
  Download,
  Send,
  Check,
  Save,
  Archive,
  FolderOpen,
  RefreshCw,
  UserCircle,
  LogOut,
  FilePlus,
  Globe,
  Database,
  Info,
} from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// Инициализация базы данных
const firebaseConfig = {
  apiKey: "AIzaSyAbXG4HrWn-C2ZCSWCalRZk_Is0APL2yq8",
  authDomain: "list-calculator-cbf36.firebaseapp.com",
  projectId: "list-calculator-cbf36",
  storageBucket: "list-calculator-cbf36.firebasestorage.app",
  messagingSenderId: "298742786786",
  appId: "1:298742786786:web:bca0e09f25684547304cbb",
  measurementId: "G-22KKLSPCKP",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "list-calculator";

const translations = {
  ru: {
    total: "Итог",
    itemsCount: "Позиций",
    newList: "Новый",
    archive: "Архив",
    plusMode: "СЛОЖЕНИЕ",
    minusMode: "ВЫЧИТАНИЕ",
    operation: "Операция",
    textPlaceholder: "Текст...",
    valuePlaceholder: "0",
    noData: "Список пуст",
    confirmClearTitle: "Очистить список?",
    confirmClearDesc: "Все данные будут удалены.",
    saveTitle: "Сохранить список",
    savePlaceholder: "Название...",
    unsavedTitle: "Сохранить изменения?",
    unsavedDescNew: "Данные будут потеряны.",
    unsavedDescClose: "Данные будут потеряны.",
    btnSaveContinue: "Сохранить",
    btnDontSave: "Не сохранять",
    btnCancel: "Отмена",
    btnSave: "Сохранить",
    btnDelete: "Удалить",
    btnClear: "Очистить",
    btnOpen: "Открыть",
    share: "Поделиться",
    shareSend: "Отправить",
    shareCopy: "Копировать",
    shareCSV: "CSV (Excel)",
    account: "Аккаунт",
    loginGoogle: "Google Вход",
    logout: "Выйти",
    sync: "Синхронизировано",
    authDesc: "Войдите для синхронизации.",
    toastSaved: "Сохранено",
    toastCopied: "Скопировано",
    toastSumCopied: "Сумма скопирована",
    toastSynced: "Облако обновлено",
    toastLoaded: "Открыто",
    toastAuthError: "Ошибка входа",
    confirmLoadTitle: "Заменить список?",
    confirmLoadDesc: "Активные данные будут удалены.",
    langSelect: "Язык",
    dbSync: "Синхронизация с облаком",
    csvNum: "Номер",
    csvDesc: "Описание",
    csvSum: "Сумма",
    syncInfoTitle: "О синхронизации",
    syncInfoDesc:
      "Эта функция объединяет списки на вашем устройстве с сохраненными в облаке. Используйте её, чтобы восстановить свои данные на новом телефоне или после очистки браузера.",
    gotIt: "Понятно",
  },
  en: {
    total: "Total",
    itemsCount: "Items",
    newList: "New",
    archive: "Archive",
    plusMode: "ADDITION",
    minusMode: "SUBTRACTION",
    operation: "Operation",
    textPlaceholder: "Text...",
    valuePlaceholder: "0",
    noData: "No data",
    confirmClearTitle: "Clear list?",
    confirmClearDesc: "All data will be removed.",
    saveTitle: "Save list",
    savePlaceholder: "Title...",
    unsavedTitle: "Save changes?",
    unsavedDescNew: "Changes will be lost.",
    unsavedDescClose: "Changes will be lost.",
    btnSaveContinue: "Save",
    btnDontSave: "Discard",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnDelete: "Delete",
    btnClear: "Clear",
    btnOpen: "Open",
    share: "Share",
    shareSend: "Send",
    shareCopy: "Copy",
    shareCSV: "CSV",
    account: "Account",
    loginGoogle: "Google Login",
    logout: "Logout",
    sync: "Synced",
    authDesc: "Sign in to sync.",
    toastSaved: "Saved",
    toastCopied: "Copied",
    toastSumCopied: "Sum copied",
    toastSynced: "Synced",
    toastLoaded: "Opened",
    toastAuthError: "Error",
    confirmLoadTitle: "Replace?",
    confirmLoadDesc: "Data will be lost.",
    langSelect: "Lang",
    dbSync: "Cloud Sync",
    csvNum: "No.",
    csvDesc: "Desc",
    csvSum: "Sum",
    syncInfoTitle: "About Sync",
    syncInfoDesc:
      "This merges lists on your device with cloud data. Use it to load your lists on a new device or save current ones to your account.",
    gotIt: "Got it",
  },
};

const App = () => {
  const [lang, setLang] = useState(
    () => localStorage.getItem("calc_lang") || "ru",
  );
  const t = translations[lang] || translations.en;

  const [mode, setMode] = useState("plus");
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [archivedLists, setArchivedLists] = useState([]);
  const [showArchiveView, setShowArchiveView] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [listToLoad, setListToLoad] = useState(null);
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  const [loadedArchiveId, setLoadedArchiveId] = useState(null);
  const [loadedArchiveName, setLoadedArchiveName] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const valInputRef = useRef(null);
  const lastAddedTimeout = useRef(null);

  const [items, setItems] = useState([]);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    const savedItems = localStorage.getItem("calc_current_items");
    const savedMode = localStorage.getItem("calc_current_mode");
    const savedArchiveId = localStorage.getItem("calc_current_archive_id");
    const savedArchiveName = localStorage.getItem("calc_current_archive_name");
    const savedIsModified = localStorage.getItem("calc_current_is_modified");

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedMode) setMode(savedMode);
    if (savedArchiveId && savedArchiveId !== "null")
      setLoadedArchiveId(JSON.parse(savedArchiveId));
    if (savedArchiveName) setLoadedArchiveName(savedArchiveName);
    if (savedIsModified) setIsModified(JSON.parse(savedIsModified));
  }, []);

  useEffect(() => {
    localStorage.setItem("calc_current_items", JSON.stringify(items));
    localStorage.setItem("calc_current_mode", mode);
    localStorage.setItem(
      "calc_current_archive_id",
      JSON.stringify(loadedArchiveId),
    );
    localStorage.setItem("calc_current_archive_name", loadedArchiveName || "");
    localStorage.setItem(
      "calc_current_is_modified",
      JSON.stringify(isModified),
    );
    localStorage.setItem("calc_lang", lang);
  }, [items, mode, loadedArchiveId, loadedArchiveName, isModified, lang]);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error(e);
      }
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const loadInitial = async () => {
      try {
        const archivesRef = collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "archives",
        );
        const snapshot = await getDocs(archivesRef);
        const loaded = [];
        snapshot.forEach((d) => loaded.push(d.data()));
        loaded.sort((a, b) => b.id - a.id);
        setArchivedLists(loaded);
      } catch (e) {
        console.error(e);
      }
    };
    loadInitial();
  }, [user]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
      showToast(t.toastLoaded);
    } catch (error) {
      showToast(t.toastAuthError);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setArchivedLists([]);
      await signInAnonymously(auth);
      setShowAuthModal(false);
      showToast(t.logout);
    } catch (error) {}
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const numericVal = parseFloat(val.replace(",", "."));
    if (isNaN(numericVal) || numericVal === 0) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        desc: desc.trim() || (lang === "ru" ? "Без названия" : "No title"),
        val: numericVal,
      },
    ]);
    setIsModified(true);

    setLastAdded({
      text:
        items.length === 0
          ? formatNum(numericVal)
          : mode === "plus"
            ? `+ ${formatNum(numericVal)}`
            : `- ${formatNum(numericVal)}`,
      id: Date.now(),
      isPlus: items.length === 0 || mode === "plus",
    });

    if (lastAddedTimeout.current) clearTimeout(lastAddedTimeout.current);
    lastAddedTimeout.current = setTimeout(() => setLastAdded(null), 2500);

    setDesc("");
    setVal("");
    if (valInputRef.current) valInputRef.current.focus();
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setIsModified(true);
  };

  const confirmClear = () => {
    setItems([]);
    setLoadedArchiveName(null);
    setLoadedArchiveId(null);
    setIsModified(false);
    setShowConfirmClear(false);
  };

  const total = items.reduce((acc, item, index) => {
    if (index === 0) return item.val;
    return mode === "plus" ? acc + item.val : acc - item.val;
  }, 0);

  const formatNum = (num) => {
    const str = num.toLocaleString(
      lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "ru-RU",
      { maximumFractionDigits: 2 },
    );
    return str.replace(/\s/g, "\u200A");
  };

  const totalStr = formatNum(total);
  let totalFontSizeClass = "text-3xl";
  if (totalStr.length > 15) totalFontSizeClass = "text-base";
  else if (totalStr.length > 12) totalFontSizeClass = "text-lg";
  else if (totalStr.length > 9) totalFontSizeClass = "text-xl";
  else if (totalStr.length > 7) totalFontSizeClass = "text-2xl";

  const handleActionClick = (action) => {
    if (isModified) {
      setPendingAction(action);
    } else {
      if (action === "new") confirmClear();
      if (action === "close") {
        setLoadedArchiveName(null);
        setLoadedArchiveId(null);
        setItems([]);
        setIsModified(false);
      }
    }
  };

  const openSaveModal = () => {
    if (loadedArchiveId) {
      performSave(loadedArchiveName, loadedArchiveId);
    } else {
      const dateStr = new Date().toLocaleDateString(
        lang === "ru" ? "ru-RU" : "en-US",
        {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
      setSaveTitle(`${t.archive} ${dateStr}`);
      setShowSaveModal(true);
    }
  };

  const performSave = async (title, id) => {
    const targetId = id || Date.now();
    const newList = {
      id: targetId,
      title: title.trim(),
      date: new Date().toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: [...items],
      mode: mode,
      total: total,
    };

    setArchivedLists((prev) => {
      if (id) return prev.map((l) => (l.id === id ? newList : l));
      return [newList, ...prev];
    });

    setLoadedArchiveId(targetId);
    setLoadedArchiveName(title.trim());
    setIsModified(false);
    setShowSaveModal(false);
    showToast(t.toastSaved);

    if (user && db) {
      try {
        const archivesRef = collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "archives",
        );
        await setDoc(doc(archivesRef, String(targetId)), newList);
      } catch (e) {}
    }

    if (pendingAction === "new" || pendingAction === "close") {
      confirmClear();
      setPendingAction(null);
    }
  };

  const handleUnsavedAction = (choice) => {
    if (choice === "save") {
      openSaveModal();
    } else if (choice === "discard") {
      const action = pendingAction;
      setPendingAction(null);
      if (action === "new" || action === "close") confirmClear();
    } else {
      setPendingAction(null);
    }
  };

  const deleteFromArchive = async (id) => {
    setArchivedLists((prev) => prev.filter((list) => list.id !== id));
    if (loadedArchiveId === id) {
      setLoadedArchiveId(null);
      setLoadedArchiveName(null);
      setIsModified(false);
    }
    if (user && db) {
      try {
        const archivesRef = collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "archives",
        );
        await deleteDoc(doc(archivesRef, String(id)));
      } catch (e) {}
    }
  };

  const handleSync = async () => {
    if (!user || !db) {
      showToast(t.toastAuthError);
      return;
    }
    setIsSyncing(true);
    try {
      const archivesRef = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "archives",
      );
      const snapshot = await getDocs(archivesRef);
      const remoteLists = [];
      snapshot.forEach((d) => remoteLists.push(d.data()));
      const mergedMap = new Map();
      remoteLists.forEach((item) => mergedMap.set(item.id, item));
      archivedLists.forEach((item) => mergedMap.set(item.id, item));
      const merged = Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
      setArchivedLists(merged);
      for (const item of merged) {
        await setDoc(doc(archivesRef, String(item.id)), item);
      }
      showToast(t.toastSynced);
    } catch (e) {
      showToast(t.toastAuthError);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromArchive = (list) => {
    setItems([...list.items]);
    setMode(list.mode || "plus");
    setLoadedArchiveId(list.id);
    setLoadedArchiveName(list.title);
    setIsModified(false);
    setListToLoad(null);
    setShowArchiveView(false);
    showToast(t.toastLoaded);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const copyTotal = () => {
    const textArea = document.createElement("textarea");
    textArea.value = total;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    showToast(t.toastSumCopied);
    document.body.removeChild(textArea);
  };

  const getListText = (list) => {
    let txt = `${t.total}: ${formatNum(list.total)}\n${t.itemsCount}: ${list.items.length}\n${t.operation}: ${list.mode === "plus" ? t.plusMode : t.minusMode}\n\n`;
    list.items.forEach((item, index) => {
      txt += `${index + 1}. ${item.desc}: ${formatNum(item.val)}\n`;
    });
    return txt;
  };

  const getListCSV = (list) => {
    let csv = "\uFEFF" + `${t.csvNum},${t.csvDesc},${t.csvSum}\n`;
    list.items.forEach((item, index) => {
      const sign = index === 0 ? 1 : list.mode === "plus" ? 1 : -1;
      csv += `${index + 1},"${item.desc.replace(/"/g, '""')}",${item.val * sign}\n`;
    });
    csv += `,,${t.total}: ${list.total}\n`;
    return csv;
  };

  const doCopy = (list) => {
    const txt = getListText(list);
    const textArea = document.createElement("textarea");
    textArea.value = txt;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    showToast(t.toastCopied);
    document.body.removeChild(textArea);
    setShowShareMenu(false);
  };

  const doCSV = (list) => {
    const csv = getListCSV(list);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${list.title || "calc"}.csv`);
    link.click();
    setShowShareMenu(false);
  };

  const doShare = async (list) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.title || t.total,
          text: getListText(list),
        });
        setShowShareMenu(false);
      } catch (err) {}
    } else {
      doCopy(list);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex justify-center font-sans">
      <div className="w-full max-w-[400px] bg-white flex flex-col h-screen sm:h-[95vh] sm:mt-[2.5vh] sm:rounded-2xl shadow-lg overflow-hidden relative border-x border-neutral-300">
        {/* HEADER */}
        <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200 shrink-0">
          <div className="h-4 mb-2 flex items-center justify-between">
            {loadedArchiveName ? (
              <div className="text-[9px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 truncate">
                <Archive size={10} />{" "}
                <span className="truncate">
                  {loadedArchiveName} {isModified && "*"}
                </span>
                <button
                  onClick={() => handleActionClick("close")}
                  className="p-0.5 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div />
            )}
            {(loadedArchiveId || items.length > 0) && (
              <button
                onClick={() => handleActionClick("new")}
                className="text-neutral-400 hover:text-blue-500 flex items-center gap-1"
              >
                <span className="text-[9px] font-bold uppercase">
                  {t.newList}
                </span>
                <FilePlus size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col items-start shrink-0">
              <div className="flex items-center gap-1.5 mb-0 min-h-[14px]">
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">
                  {t.total}
                </span>
                {lastAdded && (
                  <div
                    key={`total-${lastAdded.id}`}
                    className="animate-in fade-in slide-in-from-bottom-1 duration-200 text-[10px] font-mono font-bold text-neutral-400"
                  >
                    <span
                      className={
                        lastAdded.isPlus ? "text-emerald-500" : "text-red-500"
                      }
                    >
                      {lastAdded.text}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={copyTotal}
                className={`${totalFontSizeClass} font-mono font-bold tracking-tight pr-1 hover:opacity-60 transition-opacity outline-none ${total < 0 ? "text-red-500" : "text-neutral-900"}`}
              >
                {totalStr}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowArchiveView(true)}
                className="p-1.5 text-neutral-400 hover:text-indigo-500 transition-colors"
              >
                <Archive size={20} />
              </button>
              {items.length > 0 && (
                <>
                  <button
                    onClick={openSaveModal}
                    className={`p-1.5 transition-colors ${isModified ? "text-emerald-500" : "text-neutral-300"} hover:text-emerald-500`}
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => setShowShareMenu(true)}
                    className="p-1.5 text-neutral-400 hover:text-blue-500 transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowAuthModal(true)}
                className={`p-1.5 transition-colors ${user && !user.isAnonymous ? "text-blue-500" : "text-neutral-400"}`}
              >
                <UserCircle size={20} />
              </button>
            </div>
          </div>
          <div className="flex bg-neutral-200/60 rounded-lg p-0.5 mb-2">
            <button
              onClick={() => setMode("plus")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${mode === "plus" ? "bg-white shadow-sm text-blue-600" : "text-neutral-500"}`}
            >
              {t.plusMode}
            </button>
            <button
              onClick={() => setMode("minus")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${mode === "minus" ? "bg-white shadow-sm text-red-600" : "text-neutral-500"}`}
            >
              {t.minusMode}
            </button>
          </div>
          <form onSubmit={handleAdd} className="flex gap-1">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.textPlaceholder}
              className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[16px] outline-none focus:border-blue-500"
            />
            <input
              ref={valInputRef}
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/[^0-9.,]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              className="w-24 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[16px] outline-none focus:border-blue-500 font-mono text-right"
              required
            />
            <button
              type="submit"
              disabled={!val}
              className="w-24 bg-neutral-800 text-white rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto bg-white p-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-300 opacity-40 uppercase tracking-widest text-[10px] font-bold">
              {t.noData}
            </div>
          ) : (
            <div className="flex flex-col pb-6">
              <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1 px-1 flex items-center justify-between min-h-[16px]">
                <div className="flex items-center gap-2">
                  <span>
                    {t.itemsCount}: {items.length}
                  </span>
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {lastAdded && (
                  <div
                    key={lastAdded.id}
                    className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200"
                  >
                    <Check size={10} className="text-emerald-500" />
                    <span
                      className={
                        lastAdded.isPlus ? "text-emerald-500" : "text-red-400"
                      }
                    >
                      {lastAdded.text}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 py-0.5 px-2 bg-neutral-50 rounded-md border border-neutral-100 group"
                  >
                    <div className="text-[10px] font-mono text-neutral-300 shrink-0 w-4 text-right italic">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-neutral-700 font-medium truncate">
                      {item.desc}
                    </div>
                    <div
                      className={`w-24 shrink-0 text-right font-mono text-xs font-bold ${index === 0 ? "text-neutral-800" : mode === "plus" ? "text-blue-600" : "text-red-600"}`}
                    >
                      {index === 0 ? "" : mode === "plus" ? "+" : "-"}{" "}
                      {formatNum(item.val)}
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-1 text-neutral-300 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ARCHIVE VIEW */}
        {showArchiveView && (
          <div className="absolute inset-0 bg-neutral-100 z-[45] flex flex-col animate-in slide-in-from-bottom-3 duration-200">
            <div className="bg-white px-3 py-2.5 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 uppercase tracking-wider">
                <Archive size={14} className="text-indigo-500" /> {t.archive}
              </div>
              <button
                onClick={() => setShowArchiveView(false)}
                className="p-1 bg-neutral-100 rounded-full text-neutral-400"
              >
                <X size={14} />
              </button>
            </div>
            {/* Кнопка синхронизации + Инфо */}
            <div className="px-3 py-1.5 border-b bg-white flex items-center gap-1.5">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-[10px] active:scale-95 uppercase tracking-wide"
              >
                <RefreshCw
                  size={12}
                  className={isSyncing ? "animate-spin" : ""}
                />{" "}
                {t.dbSync}
              </button>
              <button
                onClick={() => setShowSyncInfo(true)}
                className="p-1.5 text-indigo-400 hover:text-indigo-600 bg-indigo-50 rounded-lg active:scale-95"
              >
                <Info size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {archivedLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-300 opacity-60 text-[9px] font-bold uppercase tracking-widest">
                  <Archive size={24} className="mb-1" />
                  {t.noData}
                </div>
              ) : (
                archivedLists.map((list) => (
                  <div
                    key={list.id}
                    className="bg-white p-2.5 rounded-lg shadow-sm border border-neutral-100"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[11px] text-neutral-900 truncate pr-2">
                          {list.title}
                        </h4>
                        <p className="text-[8px] text-neutral-400 uppercase font-semibold">
                          {list.date} • {list.items.length} поз.
                        </p>
                      </div>
                      <div
                        className={`text-xs font-mono font-bold ${list.total < 0 ? "text-red-500" : "text-emerald-500"}`}
                      >
                        {formatNum(list.total)}
                      </div>
                    </div>
                    <div className="flex gap-1.5 border-t border-neutral-50 pt-2 flex-wrap items-center">
                      <button
                        onClick={() => loadFromArchive(list)}
                        className="flex-1 h-9 bg-indigo-50 text-indigo-700 rounded-md text-[9px] font-bold flex justify-center items-center gap-1 active:scale-95 uppercase tracking-tighter"
                      >
                        <FolderOpen size={14} /> {t.btnOpen}
                      </button>
                      <button
                        onClick={() => doShare(list)}
                        className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md active:scale-95"
                        title={t.share}
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={() => doCopy(list)}
                        className="w-9 h-9 flex items-center justify-center bg-neutral-100 text-neutral-600 rounded-md active:scale-95"
                        title={t.shareCopy}
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => doCSV(list)}
                        className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md active:scale-95"
                        title={t.shareCSV}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => deleteFromArchive(list.id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-md active:scale-95"
                        title={t.btnDelete}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODALS */}
        {showSyncInfo && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-[90] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl p-4 w-full max-w-[260px] shadow-2xl text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info size={24} />
              </div>
              <h3 className="font-bold text-sm mb-2">{t.syncInfoTitle}</h3>
              <p className="text-neutral-500 text-[11px] leading-relaxed mb-4">
                {t.syncInfoDesc}
              </p>
              <button
                onClick={() => setShowSyncInfo(false)}
                className="w-full py-2 bg-indigo-500 text-white rounded-lg text-[11px] font-bold active:scale-95"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        )}

        {showConfirmClear && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl p-3 w-full max-w-[240px] shadow-2xl text-center">
              <h3 className="font-bold text-sm mb-1">{t.confirmClearTitle}</h3>
              <p className="text-neutral-400 text-[10px] mb-3">
                {t.confirmClearDesc}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-1.5 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-bold"
                >
                  {t.btnCancel}
                </button>
                <button
                  onClick={confirmClear}
                  className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold"
                >
                  {t.btnClear}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl p-3 w-full max-w-[240px] shadow-2xl">
              <h3 className="font-bold text-sm mb-2 text-center">
                {t.saveTitle}
              </h3>
              <input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-[15px] outline-none focus:border-emerald-500 mb-3 font-medium"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-1.5 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-bold"
                >
                  {t.btnCancel}
                </button>
                <button
                  onClick={() => performSave(saveTitle)}
                  disabled={!saveTitle.trim()}
                  className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold disabled:opacity-30"
                >
                  {t.btnSave}
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingAction && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-[80] flex items-center justify-center p-4 text-center animate-in fade-in">
            <div className="bg-white rounded-xl p-3 w-full max-w-[240px] shadow-2xl">
              <h3 className="font-bold text-sm mb-1">{t.unsavedTitle}</h3>
              <p className="text-neutral-400 text-[10px] mb-3">
                {pendingAction === "new"
                  ? t.unsavedDescNew
                  : t.unsavedDescClose}
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleUnsavedAction("save")}
                  className="w-full py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                >
                  {t.btnSaveContinue}
                </button>
                <button
                  onClick={() => handleUnsavedAction("discard")}
                  className="w-full py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold"
                >
                  {t.btnDontSave}
                </button>
                <button
                  onClick={() => handleUnsavedAction("cancel")}
                  className="w-full py-1.5 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-bold"
                >
                  {t.btnCancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAuthModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-[70] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl p-4 w-full max-w-[240px] shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  {t.account}
                </h3>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-neutral-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1.5 text-neutral-300 uppercase text-[8px] font-bold tracking-[0.2em]">
                  <Globe size={10} /> {t.langSelect}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setLang("ru")}
                    className={`py-1.5 rounded-lg border text-[9px] font-bold transition-all ${lang === "ru" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-neutral-50 border-transparent text-neutral-500"}`}
                  >
                    РУС
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`py-1.5 rounded-lg border text-[9px] font-bold transition-all ${lang === "en" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-neutral-50 border-transparent text-neutral-500"}`}
                  >
                    ENG
                  </button>
                  <button
                    onClick={() => setLang("es")}
                    className={`py-1.5 rounded-lg border text-[9px] font-bold transition-all ${lang === "es" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-neutral-50 border-transparent text-neutral-500"}`}
                  >
                    ESP
                  </button>
                  <button
                    onClick={() => setLang("zh")}
                    className={`py-1.5 rounded-lg border text-[9px] font-bold transition-all ${lang === "zh" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-neutral-50 border-transparent text-neutral-500"}`}
                  >
                    中文
                  </button>
                </div>
              </div>
              <div className="border-t pt-3 text-center">
                {user && !user.isAnonymous ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-[10px] truncate">
                        {user.email || "Cloud User"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold active:scale-95 uppercase tracking-wide"
                    >
                      <LogOut size={13} /> {t.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 font-medium px-2 leading-tight">
                      {t.authDesc}
                    </p>
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg text-[9px] font-bold shadow-md active:scale-95 uppercase tracking-wide"
                    >
                      {t.loginGoogle}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showShareMenu && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl p-3 w-full max-w-[240px] shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs uppercase">{t.share}</h3>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-neutral-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() =>
                    doShare({ items, mode, total, title: loadedArchiveName })
                  }
                  className="flex items-center gap-2 w-full p-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold active:scale-95"
                >
                  <Share2 size={14} /> {t.shareSend}
                </button>
                <button
                  onClick={() => doCopy({ items, mode, total })}
                  className="flex items-center gap-2 w-full p-2 bg-neutral-100 text-neutral-700 rounded-lg text-[10px] font-bold active:scale-95"
                >
                  <Copy size={14} /> {t.shareCopy}
                </button>
                <button
                  onClick={() =>
                    doCSV({ items, mode, total, title: loadedArchiveName })
                  }
                  className="flex items-center gap-2 w-full p-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold active:scale-95"
                >
                  <Download size={14} /> {t.shareCSV}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold shadow-2xl flex items-center gap-1.5 z-[100] animate-in slide-in-from-top-1 duration-300 border border-white/10">
            <Check size={12} className="text-emerald-400" />{" "}
            {toastMsg.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
