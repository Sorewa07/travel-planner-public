import { useState, useEffect } from "react";
import "./App.css";

// --- 実行環境に応じてAPIの接続先を自動で切り替える ---
// ローカル環境（localhost / 127.0.0.1）で開いている場合はローカルのAPIサーバーへ、
// それ以外（本番環境など）では本番のAPIサーバーへ接続する
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://travel-planner-fgll.onrender.com";

// --- 依存パッケージを増やさないための、軽量なインラインSVGアイコン ---
const IconClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconCoin = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8h6M12 8v8M9.5 12h5" />
  </svg>
);

const IconBackpack = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 8a5 5 0 0 1 10 0v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <path d="M9 13h6M9 17h6" />
  </svg>
);

const IconUser = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
);

const IconPlus = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconX = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

const IconCompass = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 11l18-7-7 18-2-8-8-3z" />
  </svg>
);

const IconLock = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const IconSuitcase = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function App() {
  // --- 画面遷移を管理する状態 ---
  // リロード時、保存済みのログイン情報があれば旅行先一覧画面から、
  // なければログイン画面から始める
  const [screen, setScreen] = useState(() => {
    const savedUser = localStorage.getItem("travel_app_user");
    return savedUser ? "travel-list" : "login";
  });

  // --- ログインしているユーザーの情報を保存する状態 ---
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = localStorage.getItem("travel_app_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- 入力フォームの状態 ---
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [travelDestination, setTravelDestination] = useState("");

  // --- タイムスケジュール登録・編集用の入力状態 ---
  const [scheduleDate, setScheduleDate] = useState("");
  const [startHour, setStartHour] = useState("8");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("8");
  const [endMinute, setEndMinute] = useState("15");
  const [schedulePlan, setSchedulePlan] = useState("");

  // --- 予算設定モーダル用の入力状態 ---
  const [budgetAmount, setBudgetAmount] = useState("0");

  // --- 持ち物確認モーダル専用の入力・表示状態 ---
  const [itemsSchedule, setItemsSchedule] = useState(null);
  const [itemsText, setItemsText] = useState("");

  // --- ユーザー登録・編集画面専用の入力フォーム状態 ---
  const [newUserId, setNewUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  // --- 選択・編集中のデータを管理する状態 ---
  const [editingTravel, setEditingTravel] = useState(null);
  const [deletingTravel, setDeletingTravel] = useState(null);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [budgetSchedule, setBudgetSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);

  // --- 一覧データを管理する状態 ---
  const [travelList, setTravelList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [userList, setUserList] = useState([]);

  // --- タイムスケジュール一覧画面：日付切り替え（プルダウン）用の状態 ---
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(0);

  // --- ドラッグ＆ドロップ用の一時状態 ---
  const [draggedIndex, setDraggedIndex] = useState(null);

  // --- エラー・メッセージの状態 ---
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  // --- 🗓️ 日付を「〇〇年〇月〇日（水）」のフォーマットに変換する便利関数 ---
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

    return `${year}年${month}月${day}日（${dayOfWeek}）`;
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!userId || !password) {
      setErrorMessage(
        <>
          IDもしくはパスワードを入力してください。
          <br />
          ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setErrorMessage(
        <>
          IDもしくはパスワードに誤りがあります。
          <br />
          ご確認のうえ、今一度ログインボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        },
      );
      const data = await response.json();
      if (response.ok && data.status === "success") {
        const user = { userId: data.userId, userName: data.userName };
        setLoggedInUser(user);
        localStorage.setItem("travel_app_user", JSON.stringify(user));
        setScreen("travel-list");
        fetchTravelList();
      } else {
        setErrorMessage(
          <>
            IDもしくはパスワードに誤りがあります。
            <br />
            ご確認のうえ、今一度ログインボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(
        <>
          サーバーとの通信に失敗しました。Spring
          Bootが起動しているか確認してください。
        </>,
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchTravelList = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/travel`,
      );
      const travelData = await response.json();
      const enrichedTravelList = await Promise.all(
        travelData.map(async (travel) => {
          try {
            const scheduleResponse = await fetch(
              `${API_BASE_URL}/api/schedule?travelId=${travel.travelId}`,
            );
            const scheduleData = await scheduleResponse.json();
            if (scheduleData && scheduleData.length > 0) {
              const dates = scheduleData.map((s) => new Date(s.date));
              const fmt = (d) =>
                `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
              return {
                ...travel,
                period: `${fmt(new Date(Math.min(...dates)))}～${fmt(new Date(Math.max(...dates)))}`,
              };
            }
          } catch (error) {
            console.error("スケジュールの期間計算に失敗しました:", error);
          }
          return { ...travel, period: "タイムスケジュール一覧画面へ" };
        }),
      );
      setTravelList(enrichedTravelList);
    } catch {
      console.error("旅行先一覧の取得に失敗しました。");
    }
  };

  // --- リロード時、保存済みのログイン情報が復元された場合は、
  //     手動ログイン時と同様に旅行先一覧を取得する ---
  useEffect(() => {
    if (loggedInUser) {
      fetchTravelList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScheduleList = async (travelId, targetDate = null) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/schedule?travelId=${travelId}`,
      );
      const data = await response.json();
      setScheduleList(data);
      // --- 指定された日付があればその日を、なければ1日目を選択状態にする ---
      if (targetDate) {
        const sortedDates = [...new Set(data.map((s) => s.date))].sort((a, b) =>
          a.localeCompare(b),
        );
        const dayIndex = sortedDates.indexOf(targetDate);
        setSelectedScheduleDay(dayIndex >= 0 ? dayIndex : 0);
      } else {
        setSelectedScheduleDay(0);
      }
    } catch {
      console.error("スケジュールの取得に失敗しました。");
    }
  };
  const handleCreateTravel = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      !travelDestination ||
      travelDestination.trim() === "" ||
      travelDestination.length > 40
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/travel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: loggedInUser.userId,
            travelDestination,
            travelIdSub: Number(
              travelList && travelList.length > 0 ? travelList.length + 1 : 1,
            ),
          }),
        },
      );
      if (response.ok) {
        setTravelDestination("");
        setScreen("travel-list");
        fetchTravelList();
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTravel = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      !travelDestination ||
      travelDestination.trim() === "" ||
      travelDestination.length > 40
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/travel/${editingTravel.travelId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            travelDestination,
            travelIdSub: editingTravel.travelIdSub,
          }),
        },
      );
      if (response.ok) {
        setTravelDestination("");
        setEditingTravel(null);
        setScreen("travel-list");
        fetchTravelList();
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteTravel = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/travel/${deletingTravel.travelId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setDeletingTravel(null);
        fetchTravelList();
      }
    } catch {
      alert("削除に失敗しました。");
    }
  };

  const saveNewOrder = async (list) => {
    try {
      await Promise.all(
        list.map((t, i) =>
          fetch(
            `${API_BASE_URL}/api/travel/${t.travelId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                travelDestination: t.travelDestination,
                travelIdSub: i + 1,
              }),
            },
          ),
        ),
      );
    } catch (error) {
      console.error("旅行先の並び替え順序の保存に失敗しました:", error);
    }
  };
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      !scheduleDate ||
      !schedulePlan ||
      schedulePlan.trim() === "" ||
      schedulePlan.length > 1000
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    const startTotalMinutes = Number(startHour) * 60 + Number(startMinute);
    const endTotalMinutes = Number(endHour) * 60 + Number(endMinute);
    if (endTotalMinutes <= startTotalMinutes) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const pad = (num) => num.toString().padStart(2, "0");
      const res = await fetch(
        `${API_BASE_URL}/api/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            travelId: selectedTravel.travelId,
            userId: loggedInUser.userId,
            date: scheduleDate,
            startTime: `${pad(startHour)}:${pad(startMinute)}:00`,
            endTime: `${pad(endHour)}:${pad(endMinute)}:00`,
            plan: schedulePlan,
          }),
        },
      );
      if (res.ok) {
        setScheduleDate("");
        setStartHour("8");
        setStartMinute("00");
        setEndHour("8");
        setEndMinute("15");
        setSchedulePlan("");
        setScreen("schedule-list");
        fetchScheduleList(selectedTravel.travelId, scheduleDate);
        fetchTravelList();
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      !scheduleDate ||
      !schedulePlan ||
      schedulePlan.trim() === "" ||
      schedulePlan.length > 1000
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    const startTotalMinutes = Number(startHour) * 60 + Number(startMinute);
    const endTotalMinutes = Number(endHour) * 60 + Number(endMinute);

    if (endTotalMinutes <= startTotalMinutes) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const pad = (num) => num.toString().padStart(2, "0");
      const res = await fetch(
        `${API_BASE_URL}/api/schedule/${editingSchedule.scheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            travelId: selectedTravel.travelId,
            userId: loggedInUser.userId,
            date: scheduleDate,
            startTime: `${pad(startHour)}:${pad(startMinute)}:00`,
            endTime: `${pad(endHour)}:${pad(endMinute)}:00`,
            plan: schedulePlan,
          }),
        },
      );
      if (res.ok) {
        setScheduleDate("");
        setStartHour("8");
        setStartMinute("00");
        setEndHour("8");
        setEndMinute("15");
        setSchedulePlan("");
        setEditingSchedule(null);
        setScreen("schedule-list");
        fetchScheduleList(selectedTravel.travelId, scheduleDate);
        fetchTravelList();
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  // --- 編集画面の入力内容を、元の予定は変更せずに新しい予定として複製登録する ---
  const handleDuplicateSchedule = async () => {
    setErrorMessage(null);
    if (
      !scheduleDate ||
      !schedulePlan ||
      schedulePlan.trim() === "" ||
      schedulePlan.length > 1000
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度ボタンを押してください。
        </>,
      );
      return;
    }
    const startTotalMinutes = Number(startHour) * 60 + Number(startMinute);
    const endTotalMinutes = Number(endHour) * 60 + Number(endMinute);
    if (endTotalMinutes <= startTotalMinutes) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const pad = (num) => num.toString().padStart(2, "0");
      const res = await fetch(
        `${API_BASE_URL}/api/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            travelId: selectedTravel.travelId,
            userId: loggedInUser.userId,
            date: scheduleDate,
            startTime: `${pad(startHour)}:${pad(startMinute)}:00`,
            endTime: `${pad(endHour)}:${pad(endMinute)}:00`,
            plan: schedulePlan,
          }),
        },
      );
      if (res.ok) {
        setScheduleDate("");
        setStartHour("8");
        setStartMinute("00");
        setEndHour("8");
        setEndMinute("15");
        setSchedulePlan("");
        setEditingSchedule(null);
        setScreen("schedule-list");
        fetchScheduleList(selectedTravel.travelId, scheduleDate);
        fetchTravelList();
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      !budgetAmount ||
      budgetAmount.trim() === "" ||
      !/^\d+$/.test(budgetAmount)
    ) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/schedule/${budgetSchedule.scheduleId}/budget`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: loggedInUser.userId,
            budget: parseInt(budgetAmount, 10),
          }),
        },
      );
      if (res.ok) {
        setBudgetAmount("0");
        setBudgetSchedule(null);
        fetchScheduleList(selectedTravel.travelId, budgetSchedule.date);
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItems = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/schedule/${itemsSchedule.scheduleId}/items`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: loggedInUser.userId,
            items: itemsText,
          }),
        },
      );
      if (res.ok) {
        setItemsText("");
        setItemsSchedule(null);
        fetchScheduleList(selectedTravel.travelId, itemsSchedule.date);
      } else {
        alert("持ち物の保存に失敗しました。");
      }
    } catch {
      alert("サーバーとの通信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/schedule/${deletingSchedule.scheduleId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setDeletingSchedule(null);
        fetchScheduleList(selectedTravel.travelId, deletingSchedule.date);
      } else {
        alert("スケジュールの削除に失敗しました。");
      }
    } catch {
      alert("サーバーとの通信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/user`,
      );
      if (response.ok) {
        setUserList(await response.json());
      }
    } catch {
      console.error("ユーザー一覧の取得に失敗しました。");
    }
  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!newUserId || !newUserName || !newPassword) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword)) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: newUserId,
            userName: newUserName,
            password: newPassword,
          }),
        },
      );
      if (res.ok) {
        setNewUserId("");
        setNewUserName("");
        setNewPassword("");
        fetchAllUsers();
        setScreen("user-list");
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!newUserName) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    if (newPassword && (newPassword.length < 8 || !/[A-Z]/.test(newPassword))) {
      setErrorMessage(
        <>
          入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
        </>,
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/user/${editingUser.userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: newUserName,
            password: newPassword || null,
          }),
        },
      );
      if (res.ok) {
        setNewUserName("");
        setNewPassword("");
        setEditingUser(null);
        fetchAllUsers();
        setScreen("user-list");
      } else {
        setErrorMessage(
          <>
            入力内容に不備があります。ご確認のうえ、今一度確定ボタンを押してください。
          </>,
        );
      }
    } catch {
      setErrorMessage(<>サーバーとの通信に失敗しました。</>);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("travel_app_user");
    setUserId("");
    setPassword("");
    setTravelDestination("");
    setScheduleDate("");
    setSchedulePlan("");
    setBudgetAmount("0");
    setItemsText("");
    setNewUserId("");
    setNewUserName("");
    setNewPassword("");
    setEditingTravel(null);
    setDeletingTravel(null);
    setSelectedTravel(null);
    setEditingSchedule(null);
    setBudgetSchedule(null);
    setDeletingSchedule(null);
    setItemsSchedule(null);
    setEditingUser(null);
    setTravelList([]);
    setScheduleList([]);
    setUserList([]);
    setScreen("login");
  };

  return (
    <div className="app-div">
      <div className="app-div-2">
        {screen !== "schedule-list" && (
          <div className="app-div-3">
            <div className="app-title-badge">
              <div className="app-title-icon">
                <IconCompass />
              </div>
              <h1 className="app-h1">どこ行くん？ 何するん？</h1>
            </div>
            <div className="app-title-sub">旅のしおりアプリ</div>
          </div>
        )}

        {screen === "login" && (
          <div className="login-div">
            <h2 className="login-h2">ログイン画面</h2>
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-div-2">
                <div className="login-input-wrap">
                  <IconUser />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    maxLength={8}
                    placeholder="IDをご入力ください。"
                    aria-label="ID"
                    className="login-input"
                  />
                </div>
              </div>
              <div className="login-div-3">
                <div className="login-input-wrap">
                  <IconLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードをご入力ください。"
                    aria-label="パスワード"
                    className="login-input-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-button"
                  >
                    {showPassword ? "非表示" : "表示"}
                  </button>
                </div>
              </div>
              {errorMessage && (
                <div className="login-div-4">{errorMessage}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="login-button-2"
              >
                {loading ? "認証中..." : "ログイン"}
              </button>
            </form>
          </div>
        )}
        {screen === "travel-list" && (
          <div className="login-div">
            <h2 className="travel-list-h2">旅行先一覧画面</h2>
            <div className="travel-list-div">
              <button
                onClick={() => {
                  setTravelDestination("");
                  setErrorMessage(null);
                  setScreen("travel-create");
                }}
                className="travel-list-button"
              >
                旅行先登録画面へ
              </button>
              {loggedInUser?.userId === "admin001" && (
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    fetchAllUsers();
                    setScreen("user-list");
                  }}
                  className="travel-list-button"
                >
                  ユーザー一覧表示画面へ
                </button>
              )}
            </div>
            <div className="travel-list-div-2">
              <table className="travel-list-table">
                <thead>
                  <tr className="travel-list-tr">
                    <th className="travel-list-th">No.</th>
                    <th className="travel-list-th-2">旅行先</th>
                    <th className="travel-list-th-3">期間</th>
                    <th className="travel-list-th-4" aria-label="削除"></th>
                  </tr>
                </thead>
                <tbody>
                  {travelList.length > 0 ? (
                    travelList.map((travel, index) => (
                      <tr
                        key={travel.travelId}
                        draggable="true"
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedIndex === null || draggedIndex === index)
                            return;
                          const updatedList = [...travelList];
                          const [draggedItem] = updatedList.splice(
                            draggedIndex,
                            1,
                          );
                          updatedList.splice(index, 0, draggedItem);
                          setTravelList(updatedList);
                          setDraggedIndex(null);
                          saveNewOrder(updatedList);
                        }}
                        className={`travel-row ${draggedIndex === index ? "travel-row--dragging" : ""}`}
                      >
                        <td
                          className="travel-list-td"
                          style={{
                            cursor: "grab",
                            textCombineUpright: "digits",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                          title="ここを掴んで上下に並び替え"
                        >
                          {index + 1}
                        </td>
                        <td
                          onClick={() => {
                            setEditingTravel(travel);
                            setTravelDestination(travel.travelDestination);
                            setErrorMessage(null);
                            setScreen("travel-edit");
                          }}
                          className="travel-list-el"
                        >
                          <IconSuitcase />
                          {travel.travelDestination}
                        </td>
                        <td
                          onClick={() => {
                            setSelectedTravel(travel);
                            fetchScheduleList(travel.travelId);
                            setScreen("schedule-list");
                          }}
                          className="travel-list-td-2"
                        >
                          {travel.period}
                        </td>
                        <td className="travel-list-td">
                          <button
                            onClick={() => setDeletingTravel(travel)}
                            className="travel-list-button-2"
                            aria-label="削除"
                          >
                            <IconX />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="travel-list-td-3">
                        旅行先がまだ登録されていません。
                        <br />
                        上のボタンから最初の計画を追加しましょう！
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="travel-list-div-3">
              <div className="travel-list-div-4">
                <span className="travel-list-span">
                  {loggedInUser?.userName}（{loggedInUser?.userId}）
                </span>
                <br />
                <span className="travel-list-span-2">
                  がログインしています。
                </span>
              </div>
              <button onClick={handleLogout} className="travel-list-button-3">
                ログアウト
              </button>
            </div>
          </div>
        )}

        {screen === "travel-create" && (
          <div className="login-div">
            <h2 className="login-h2">旅行先登録画面</h2>
            <form onSubmit={handleCreateTravel} className="travel-create-form">
              <div className="login-div-2">
                <label className="travel-create-label">旅行先</label>
                <input
                  type="text"
                  value={travelDestination}
                  onChange={(e) => setTravelDestination(e.target.value)}
                  maxLength={40}
                  placeholder="全角40字以内"
                  className="login-input"
                />
              </div>
              {errorMessage && (
                <div className="travel-create-div">{errorMessage}</div>
              )}
              <button type="submit" className="travel-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={() => {
                  setTravelDestination("");
                  setErrorMessage(null);
                  setScreen("travel-list");
                }}
                className="travel-create-button-2"
              >
                旅行先一覧画面へ戻る
              </button>
            </form>
          </div>
        )}

        {screen === "travel-edit" && (
          <div className="login-div">
            <h2 className="login-h2">旅行先編集画面</h2>
            <form onSubmit={handleUpdateTravel} className="travel-create-form">
              <div className="login-div-2">
                <label className="travel-create-label">旅行先</label>
                <input
                  type="text"
                  value={travelDestination}
                  onChange={(e) => setTravelDestination(e.target.value)}
                  maxLength={40}
                  placeholder="全角40字以内"
                  className="login-input"
                />
              </div>
              {errorMessage && (
                <div className="travel-edit-div">{errorMessage}</div>
              )}
              <button type="submit" className="travel-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={() => {
                  setTravelDestination("");
                  setEditingTravel(null);
                  setErrorMessage(null);
                  setScreen("travel-list");
                }}
                className="travel-create-button-2"
              >
                旅行先一覧画面へ戻る
              </button>
            </form>
          </div>
        )}
        {screen === "user-list" && (
          <div className="login-div">
            <h2 className="travel-list-h2">ユーザー一覧表示画面</h2>
            <div className="user-list-div">
              <button
                onClick={() => {
                  setNewUserId("");
                  setNewUserName("");
                  setNewPassword("");
                  setErrorMessage(null);
                  setScreen("user-create");
                }}
                className="user-list-button"
              >
                新規ユーザー登録画面へ
              </button>
            </div>
            <div className="user-list-div-2">
              <table className="travel-list-table">
                <thead>
                  <tr className="travel-list-tr">
                    <th className="user-list-th">ID</th>
                    <th className="user-list-th">ユーザー名</th>
                    <th className="user-list-th">登録日時</th>
                  </tr>
                </thead>
                <tbody>
                  {userList && userList.length > 0 ? (
                    userList.map((user) => (
                      <tr key={user.userId} className="user-list-tr">
                        <td
                          onClick={() => {
                            if (user.userId === "admin001") {
                              alert("特権管理者は編集できません。");
                              return;
                            }
                            setEditingUser(user);
                            setNewUserName(user.userName);
                            setNewPassword("");
                            setErrorMessage(null);
                            setScreen("user-edit");
                          }}
                          className={
                            user.userId === "admin001"
                              ? "user-list-el user-list-el--admin"
                              : "user-list-el"
                          }
                        >
                          <IconUser />
                          {user.userId}
                        </td>
                        <td className="travel-list-td">{user.userName}</td>
                        <td className="user-list-td">
                          {user.createdAt
                            ? user.createdAt.replace("T", " ").substring(0, 16)
                            : "----/--/-- --:--"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="user-list-td-2">
                        ユーザーデータが読み込めません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="travel-list-div-3">
              <button
                onClick={() => {
                  setScreen("travel-list");
                  fetchTravelList();
                }}
                className="user-list-button-2"
              >
                旅行先一覧画面へ戻る
              </button>
            </div>
          </div>
        )}

        {screen === "user-create" && (
          <div className="login-div">
            <h2 className="login-h2">新規ユーザー登録画面</h2>
            <form onSubmit={handleCreateUser} className="login-form">
              <div className="login-div-2">
                <label className="login-label">ID</label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  maxLength={8}
                  placeholder="半角英数8字以内"
                  className="login-input"
                />
              </div>
              <div className="login-div-2">
                <label className="login-label">ユーザー名</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  maxLength={20}
                  placeholder="全角20字以内"
                  className="login-input"
                />
              </div>
              <div className="login-div-3">
                <label className="login-label">パスワード</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8文字以上かつ大文字必須"
                  className="login-input-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-button"
                >
                  {showPassword ? "非表示" : "表示"}
                </button>
              </div>
              {errorMessage && (
                <div className="travel-create-div">{errorMessage}</div>
              )}
              <button type="submit" className="user-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={() => {
                  setScreen("user-list");
                  fetchAllUsers();
                }}
                className="user-create-button-2"
              >
                ユーザー一覧表示画面へ戻る
              </button>
            </form>
          </div>
        )}

        {screen === "user-edit" && (
          <div className="login-div">
            <h2 className="login-h2">ユーザー編集画面</h2>
            <div className="user-edit-div">
              編集対象ID：
              <span className="user-edit-span">{editingUser?.userId}</span>
            </div>
            <form onSubmit={handleUpdateUser} className="user-edit-form">
              <div className="login-div-2">
                <label className="login-label">ユーザー名</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  maxLength={20}
                  placeholder="全角20字以内"
                  className="login-input"
                />
              </div>
              <div className="login-div-3">
                <label className="login-label">パスワード</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="変更時のみ入力（大文字含む8字〜）"
                  className="login-input-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-button"
                >
                  {showPassword ? "非表示" : "表示"}
                </button>
              </div>
              {errorMessage && (
                <div className="travel-create-div">{errorMessage}</div>
              )}
              <button type="submit" className="user-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={() => {
                  setScreen("user-list");
                  fetchAllUsers();
                }}
                className="user-create-button-2"
              >
                キャンセルして戻る
              </button>
            </form>
          </div>
        )}
        {screen === "schedule-list" && (
          <div className="login-div">
            <div className="schedule-list-div-4">
              {/* ★この画面のみ、看板を固定せずスクロールで流れるようにする */}
              <div className="app-div-3 app-div-3--inline">
                <div className="app-title-badge">
                  <div className="app-title-icon">
                    <IconCompass />
                  </div>
                  <h1 className="app-h1">どこ行くん？ 何するん？</h1>
                </div>
                <div className="app-title-sub">旅のしおりアプリ</div>
              </div>
              <div className="schedule-list-div">
                <h2 className="travel-list-h2">タイムスケジュール一覧画面</h2>
              </div>
              <div className="schedule-list-div-3">
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setScreen("schedule-create");
                  }}
                  className="travel-list-button"
                >
                  タイムスケジュール登録画面へ
                </button>
                <button
                  onClick={() => {
                    setSelectedTravel(null);
                    setScheduleList([]);
                    setScreen("travel-list");
                  }}
                  className="schedule-list-button"
                >
                  戻る
                </button>
              </div>
              {scheduleList && scheduleList.length > 0 ? (
                (() => {
                  // --- 日付ごとにグルーピングし、日付順（1日目, 2日目...）に並べる ---
                  const groupedDays = Object.entries(
                    scheduleList.reduce((g, i) => {
                      const gr = g[i.date] || [];
                      gr.push(i);
                      g[i.date] = gr;
                      return g;
                    }, {}),
                  ).sort((a, b) => a[0].localeCompare(b[0]));

                  // --- 日数が減った場合（削除など）に選択位置が範囲外にならないよう補正 ---
                  const currentDayIndex = Math.min(
                    selectedScheduleDay,
                    groupedDays.length - 1,
                  );
                  const [date, items] = groupedDays[currentDayIndex];

                  return (
                    <>
                      <div className="schedule-list-sticky-header">
                        <div className="schedule-list-div-2">
                          <span>旅行先：</span>
                          <span className="schedule-list-span">
                            {selectedTravel?.travelDestination}
                          </span>
                        </div>
                        {/* ★プルダウンで表示する日を切り替え */}
                        <div className="schedule-list-div-14">
                          <label
                            htmlFor="schedule-day-select"
                            className="schedule-list-label"
                          >
                            表示する日：
                          </label>
                          <select
                            id="schedule-day-select"
                            value={currentDayIndex}
                            onChange={(e) =>
                              setSelectedScheduleDay(Number(e.target.value))
                            }
                            className="schedule-list-select"
                          >
                            {groupedDays.map(([d], idx) => (
                              <option key={d} value={idx}>
                                {idx + 1}日目 ： {formatDateWithDay(d)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div key={date} className="schedule-list-div-5">
                        {items.map((schedule) => {
                          const openEdit = () => {
                            setEditingSchedule(schedule);
                            setScheduleDate(schedule.date);
                            setStartHour(
                              String(
                                parseInt(
                                  schedule.startTime.substring(0, 2),
                                  10,
                                ),
                              ),
                            );
                            setStartMinute(schedule.startTime.substring(3, 5));
                            setEndHour(
                              String(
                                parseInt(schedule.endTime.substring(0, 2), 10),
                              ),
                            );
                            setEndMinute(schedule.endTime.substring(3, 5));
                            setSchedulePlan(schedule.plan);
                            setErrorMessage(null);
                            setScreen("schedule-edit");
                          };
                          return (
                            <div
                              key={schedule.scheduleId}
                              className="schedule-list-div-7"
                            >
                              <button
                                onClick={() => setDeletingSchedule(schedule)}
                                className="schedule-list-button-2"
                                aria-label="削除"
                              >
                                <IconX />
                              </button>
                              <div
                                onClick={openEdit}
                                className="schedule-list-el"
                              >
                                <span className="schedule-list-span-2">
                                  <IconClock />
                                  {schedule.startTime.substring(0, 5)} 〜{" "}
                                  {schedule.endTime.substring(0, 5)}
                                </span>
                              </div>
                              <div className="schedule-list-div-8">
                                {schedule.plan}
                              </div>
                              <div className="schedule-list-div-tags">
                                {schedule.budget !== null &&
                                schedule.budget !== undefined ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBudgetSchedule(schedule);
                                      setBudgetAmount(String(schedule.budget));
                                      setErrorMessage(null);
                                    }}
                                    className="schedule-tag schedule-tag-gold"
                                  >
                                    <IconCoin />
                                    {schedule.budget.toLocaleString()}円
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBudgetSchedule(schedule);
                                      setBudgetAmount("0");
                                      setErrorMessage(null);
                                    }}
                                    className="schedule-tag schedule-tag-empty"
                                  >
                                    <IconPlus />
                                    予算を設定
                                  </button>
                                )}
                                {schedule.items ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemsSchedule(schedule);
                                      setItemsText(schedule.items || "");
                                    }}
                                    className="schedule-tag schedule-tag-teal"
                                  >
                                    <IconBackpack />
                                    持ち物あり
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemsSchedule(schedule);
                                      setItemsText("");
                                    }}
                                    className="schedule-tag schedule-tag-empty"
                                  >
                                    <IconPlus />
                                    持ち物を追加
                                  </button>
                                )}
                              </div>
                              <div className="schedule-list-div-12">
                                <span className="schedule-list-editor">
                                  <IconUser />
                                  {schedule.user?.userName ||
                                    schedule.userName ||
                                    "管理者"}
                                </span>
                                <button
                                  type="button"
                                  onClick={openEdit}
                                  className="schedule-list-edit-link"
                                >
                                  編集
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="schedule-list-div-13">
                  タイムスケジュールがまだ登録されていません。
                </div>
              )}
            </div>
            <div className="travel-list-div-3">
              <button
                onClick={() => {
                  setSelectedTravel(null);
                  setScreen("travel-list");
                  fetchTravelList();
                }}
                className="user-list-button-2"
              >
                旅行先一覧画面へ戻る
              </button>
            </div>
          </div>
        )}
        {screen === "schedule-create" && (
          <div className="login-div">
            <h2 className="schedule-create-h2">タイムスケジュール登録画面</h2>
            <div className="user-edit-div">
              旅行先：
              <span className="schedule-create-span">
                {selectedTravel?.travelDestination}
              </span>
            </div>
            <form
              onSubmit={handleCreateSchedule}
              className="schedule-create-form"
            >
              <div className="login-div-2">
                <label className="travel-create-label">日付</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="schedule-create-input"
                />
              </div>
              <div className="login-div-2">
                <label className="travel-create-label">開始時刻</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="schedule-create-select"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                ：
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="schedule-create-select"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="login-div-2">
                <label className="travel-create-label">終了時刻</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="schedule-create-select"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                ：
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="schedule-create-select"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="schedule-create-div">
                <div className="login-div-2">
                  <label className="travel-create-label">予定</label>
                  <textarea
                    value={schedulePlan}
                    onChange={(e) => setSchedulePlan(e.target.value)}
                    maxLength={1000}
                    placeholder="起床、朝食など"
                    className="schedule-create-textarea"
                  />
                </div>
                <div className="schedule-create-div-2">
                  {schedulePlan.length} / 1000
                </div>
              </div>
              {errorMessage && (
                <div className="schedule-create-div-3">{errorMessage}</div>
              )}
              <button type="submit" className="travel-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={() => setScreen("schedule-list")}
                className="schedule-create-button"
              >
                タイムスケジュール一覧画面へ戻る
              </button>
            </form>
          </div>
        )}

        {screen === "schedule-edit" && (
          <div className="login-div">
            <h2 className="schedule-create-h2">タイムスケジュール編集画面</h2>
            <div className="user-edit-div">
              旅行先：
              <span className="schedule-create-span">
                {selectedTravel?.travelDestination}
              </span>
            </div>
            <form
              onSubmit={handleUpdateSchedule}
              className="schedule-create-form"
            >
              <div className="login-div-2">
                <label className="travel-create-label">日付</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="schedule-create-input"
                />
              </div>
              <div className="login-div-2">
                <label className="travel-create-label">開始時刻</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="schedule-create-select"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                ：
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="schedule-create-select"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="login-div-2">
                <label className="travel-create-label">終了時刻</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="schedule-create-select"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                ：
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="schedule-create-select"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="schedule-create-div">
                <div className="login-div-2">
                  <label className="travel-create-label">予定</label>
                  <textarea
                    value={schedulePlan}
                    onChange={(e) => setSchedulePlan(e.target.value)}
                    maxLength={1000}
                    placeholder="起床、朝食など"
                    className="schedule-create-textarea"
                  />
                </div>
                <div className="schedule-create-div-2">
                  {schedulePlan.length} / 1000
                </div>
              </div>
              {errorMessage && (
                <div className="schedule-create-div-3">{errorMessage}</div>
              )}
              <button type="submit" className="travel-create-button">
                確定
              </button>
              <button
                type="button"
                onClick={handleDuplicateSchedule}
                className="schedule-create-button-alt"
              >
                別の予定として追加
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleDate("");
                  setSchedulePlan("");
                  setEditingSchedule(null);
                  setScreen("schedule-list");
                }}
                className="schedule-create-button"
              >
                キャンセルして戻る
              </button>
            </form>
          </div>
        )}
        {deletingTravel && (
          <div className="travel-delete-modal-div">
            <div className="travel-delete-modal-div-2">
              <div className="travel-delete-modal-div-3">
                旅行先を削除します。
                <br />
                よろしいですか？
              </div>
              <div className="travel-delete-modal-div-4">
                <button
                  onClick={handleDeleteTravel}
                  className="modal-button-danger"
                >
                  はい
                </button>
                <button
                  onClick={() => setDeletingTravel(null)}
                  className="travel-delete-modal-button"
                >
                  いいえ
                </button>
              </div>
            </div>
          </div>
        )}

        {budgetSchedule && (
          <div className="budget-modal-div">
            <div className="budget-modal-div-2">
              <div className="budget-modal-div-3">💰 予算を設定</div>
              <p className="budget-modal-p">
                ※半角数字のみ入力可能です（休憩等は0円）
              </p>
              <form onSubmit={handleUpdateBudget} className="budget-modal-form">
                <div className="budget-modal-div-4">
                  <input
                    type="text"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="budget-modal-input"
                  />
                  <span className="budget-modal-span">円</span>
                </div>
                {errorMessage && (
                  <div className="budget-modal-div-5">{errorMessage}</div>
                )}
                <div className="budget-modal-div-6">
                  <button type="submit" className="budget-modal-button">
                    確定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetAmount("0");
                      setBudgetSchedule(null);
                      setErrorMessage(null);
                    }}
                    className="budget-modal-button-2"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingSchedule && (
          <div className="budget-modal-div">
            <div className="schedule-delete-modal-div">
              <div className="travel-delete-modal-div-3">
                スケジュールを削除します。
                <br />
                よろしいですか？
              </div>
              <div className="travel-delete-modal-div-4">
                <button
                  onClick={handleDeleteSchedule}
                  className="modal-button-danger"
                >
                  はい
                </button>
                <button
                  onClick={() => setDeletingSchedule(null)}
                  className="schedule-delete-modal-button"
                >
                  いいえ
                </button>
              </div>
            </div>
          </div>
        )}

        {itemsSchedule && (
          <div className="budget-modal-div">
            <div className="items-modal-div">
              <div className="budget-modal-div-3">🎒 持ち物を確認</div>
              <p className="items-modal-p">
                この予定に必要な持ち物を自由に入力・編集できます
              </p>
              <form onSubmit={handleUpdateItems} className="items-modal-form">
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  placeholder="例: スマホ、財布、チケット、着替え など"
                  className="items-modal-textarea"
                />
                <div className="budget-modal-div-6">
                  <button type="submit" className="budget-modal-button">
                    確定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemsText("");
                      setItemsSchedule(null);
                    }}
                    className="budget-modal-button-2"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
