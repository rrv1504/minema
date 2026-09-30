import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const ACCESS_TOKEN_KEY = "minema.accessToken";
const REFRESH_TOKEN_KEY = "minema.refreshToken";
const USER_KEY = "minema.user";

export interface Movie { id: string; title: string; duration: string; durationMinutes: number; pricePerPerson: number; imageUrl: string; genre: string; rating: string; description?: string; isActive: boolean; totalBookings?: number; }
export interface Hall { id: string; name: string; capacity: number; isActive: boolean; imageUrl: string; description?: string; }
export interface Snack { id: string; name: string; price: number; isActive: boolean; imageUrl: string; }
export interface TimeSlot { id: string; time: string; available: boolean; }
export interface DailyOperatingHours { date: string; startTime: string; endTime: string; }
export interface Booking {
  id: string; movieId: string; movieName: string; movieImageUrl?: string; movieDurationMinutes?: number;
  hallId: string; hallName: string; hallCapacity: number; selectedDate: string; timeSlot: string; groupSize: number;
  hallPrice: number; snacks: Array<{ name: string; price: number; imageUrl?: string }>; snacksTotal: number;
  grandTotal: number; userName: string; bookingDate: string; status: "confirmed" | "cancelled"; cancellationReason?: string;
}
export interface User { id: string; name: string; email: string; phone: string; role: "user" | "admin"; }

type ApiAuth = { user: User; accessToken: string; refreshToken: string };
type ApiBooking = Record<string, any>;
interface AppContextType {
  currentUser: User | null; setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  movies: Movie[]; addMovie: (movie: Omit<Movie, "id">) => Promise<void>; updateMovie: (id: string, movie: Partial<Movie>) => Promise<void>; deleteMovie: (id: string) => Promise<void>;
  halls: Hall[]; addHall: (hall: Omit<Hall, "id">) => Promise<void>; updateHall: (id: string, hall: Partial<Hall>) => Promise<void>; deleteHall: (id: string) => Promise<void>;
  snacks: Snack[]; addSnack: (snack: Omit<Snack, "id">) => Promise<void>; updateSnack: (id: string, snack: Partial<Snack>) => Promise<void>; deleteSnack: (id: string) => Promise<void>;
  bookings: Booking[]; addBooking: (booking: Omit<Booking, "id" | "bookingDate" | "status" | "grandTotal" | "userName">) => Promise<string>;
  isHallAvailable: (hallId: string, date: Date, timeSlot: string) => boolean; timeSlots: TimeSlot[];
  operatingHours: DailyOperatingHours[]; getOperatingHoursForDate: (date: string) => DailyOperatingHours | undefined;
  updateOperatingHours: (date: string, startTime: string, endTime: string) => Promise<void>; initializeWeeklySchedule: () => Promise<void>;
  refreshData: () => Promise<void>; getRecommendations: (groupSize: number, moodDistribution: Record<string, number>) => Promise<any>; isLoading: boolean; authError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const timeSlots = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM", "12:00 AM"].map((time, index) => ({ id: String(index + 1), time, available: true }));
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

function normalizeBooking(booking: ApiBooking): Booking {
  const movie = typeof booking.movieId === "object" ? booking.movieId : null;
  const hall = typeof booking.hallId === "object" ? booking.hallId : null;
  const user = typeof booking.userId === "object" ? booking.userId : null;
  return {
    id: booking.id, movieId: movie?.id || String(booking.movieId), movieName: movie?.title || "Movie",
    movieImageUrl: movie?.imageUrl, movieDurationMinutes: movie?.durationMinutes, hallId: hall?.id || String(booking.hallId),
    hallName: hall?.name || "Hall", hallCapacity: hall?.capacity || 0, selectedDate: booking.selectedDate,
    timeSlot: booking.timeSlot, groupSize: booking.groupSize, hallPrice: booking.hallPrice, snacks: booking.snacks || [],
    snacksTotal: booking.snacksTotal, grandTotal: booking.grandTotal, userName: user?.name || "",
    bookingDate: booking.bookingDate, status: booking.status, cancellationReason: booking.cancellationReason
  };
}
function saveAuth(auth: ApiAuth) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken); localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken); localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}
function clearAuth() { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); localStorage.removeItem(USER_KEY); }

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; } });
  const [movies, setMovies] = useState<Movie[]>([]); const [halls, setHalls] = useState<Hall[]>([]); const [snacks, setSnacks] = useState<Snack[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]); const [operatingHours, setOperatingHours] = useState<DailyOperatingHours[]>([]); const [isLoading, setIsLoading] = useState(true); const [authError, setAuthError] = useState<string | null>(null);

  const request = useCallback(async (path: string, options: RequestInit = {}, retry = true): Promise<any> => {
    const headers = new Headers(options.headers); headers.set("Content-Type", "application/json");
    const token = localStorage.getItem(ACCESS_TOKEN_KEY); if (token) headers.set("Authorization", "Bearer " + token);
    const response = await fetch(API_URL + path, { ...options, headers });
    if (response.status === 401 && retry && localStorage.getItem(REFRESH_TOKEN_KEY)) {
      const refresh = await fetch(API_URL + "/auth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) }) });
      if (refresh.ok) {
        const tokens = await refresh.json(); localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken); localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        return request(path, options, false);
      }
      clearAuth(); setCurrentUserState(null);
    }
    if (response.status === 204) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Request failed");
    return payload;
  }, []);

  const refreshData = useCallback(async () => {
    const to = new Date(); to.setDate(to.getDate() + 7);
    const [movieData, hallData, snackData, hoursData] = await Promise.all([
      request("/movies"), request("/halls"), request("/snacks"), request("/operating-hours?from=" + formatDate(new Date()) + "&to=" + formatDate(to))
    ]);
    setMovies(movieData); setHalls(hallData); setSnacks(snackData); setOperatingHours(hoursData);
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      try {
        const bookingData = await request(currentUser?.role === "admin" ? "/bookings" : "/bookings/my");
        setBookings(bookingData.map(normalizeBooking));
      } catch { setBookings([]); }
    } else setBookings([]);
  }, [currentUser?.role, request]);

  useEffect(() => { refreshData().catch((error) => console.error("Could not load Minema API data", error)).finally(() => setIsLoading(false)); }, [refreshData]);
  const setCurrentUser = (user: User | null) => { setCurrentUserState(user); if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else clearAuth(); };
  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      setAuthError(null);
      const auth = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false) as ApiAuth;
      if ((isAdmin && auth.user.role !== "admin") || (!isAdmin && auth.user.role !== "user")) {
        setAuthError(isAdmin ? "This account is not an administrator." : "Please use the administrator login for this account.");
        return false;
      }
      saveAuth(auth); setCurrentUserState(auth.user); return true;
    } catch (error) { setAuthError(error instanceof Error ? error.message : "Unable to sign in."); return false; }
  };
  const signup = async (name: string, email: string, phone: string, password: string) => {
    try { setAuthError(null); const auth = await request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, phone, password }) }, false) as ApiAuth; saveAuth(auth); setCurrentUserState(auth.user); return true; }
    catch (error) { setAuthError(error instanceof Error ? error.message : "Unable to create your account."); return false; }
  };
  const logout = async () => { try { await request("/auth/logout", { method: "POST" }, false); } catch {} clearAuth(); setCurrentUserState(null); setBookings([]); };
  const addMovie = async (movie: Omit<Movie, "id">) => { await request("/movies", { method: "POST", body: JSON.stringify(movie) }); await refreshData(); };
  const updateMovie = async (id: string, movie: Partial<Movie>) => { await request("/movies/" + id, { method: "PUT", body: JSON.stringify(movie) }); await refreshData(); };
  const deleteMovie = async (id: string) => { await request("/movies/" + id, { method: "DELETE" }); await refreshData(); };
  const addHall = async (hall: Omit<Hall, "id">) => { await request("/halls", { method: "POST", body: JSON.stringify(hall) }); await refreshData(); };
  const updateHall = async (id: string, hall: Partial<Hall>) => { await request("/halls/" + id, { method: "PUT", body: JSON.stringify(hall) }); await refreshData(); };
  const deleteHall = async (id: string) => { await request("/halls/" + id, { method: "DELETE" }); await refreshData(); };
  const addSnack = async (snack: Omit<Snack, "id">) => { await request("/snacks", { method: "POST", body: JSON.stringify(snack) }); await refreshData(); };
  const updateSnack = async (id: string, snack: Partial<Snack>) => { await request("/snacks/" + id, { method: "PUT", body: JSON.stringify(snack) }); await refreshData(); };
  const deleteSnack = async (id: string) => { await request("/snacks/" + id, { method: "DELETE" }); await refreshData(); };
  const addBooking = async (booking: Omit<Booking, "id" | "bookingDate" | "status" | "grandTotal" | "userName">) => {
    const result = await request("/bookings", { method: "POST", body: JSON.stringify({ movieId: booking.movieId, hallId: booking.hallId, selectedDate: booking.selectedDate.slice(0, 10), timeSlot: booking.timeSlot, groupSize: booking.groupSize, snacks: booking.snacks }) });
    await refreshData(); return result.id;
  };
  const isHallAvailable = (hallId: string, date: Date, timeSlot: string) => !bookings.some((booking) => booking.hallId === hallId && booking.selectedDate.slice(0, 10) === formatDate(date) && booking.timeSlot === timeSlot && booking.status === "confirmed");
  const updateOperatingHours = async (date: string, startTime: string, endTime: string) => { await request("/operating-hours/" + date, { method: "PUT", body: JSON.stringify({ startTime, endTime }) }); await refreshData(); };
  const initializeWeeklySchedule = async () => { await refreshData(); };
  const getOperatingHoursForDate = (date: string) => operatingHours.find((hours) => hours.date === date);
  const getRecommendations = useCallback(async (groupSize: number, moodDistribution: Record<string, number>) =>
    request("/recommendations", { method: "POST", body: JSON.stringify({ groupSize, moodDistribution }) }), [request]);

  return <AppContext.Provider value={{ currentUser, setCurrentUser, login, signup, logout, movies, addMovie, updateMovie, deleteMovie, halls, addHall, updateHall, deleteHall, snacks, addSnack, updateSnack, deleteSnack, bookings, addBooking, isHallAvailable, timeSlots, operatingHours, getOperatingHoursForDate, updateOperatingHours, initializeWeeklySchedule, refreshData, getRecommendations, isLoading, authError }}>{children}</AppContext.Provider>;
};
export const useApp = () => { const context = useContext(AppContext); if (!context) throw new Error("useApp must be used within an AppProvider"); return context; };
