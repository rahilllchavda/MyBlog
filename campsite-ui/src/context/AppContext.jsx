import { createContext, useState } from "react";
import toast from "react-hot-toast";

const AppContext = createContext();

function toLocalDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getInitialSearch() {
  const checkInDate = new Date();
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 1);

  return {
    checkIn: toLocalDateStr(checkInDate),
    checkOut: toLocalDateStr(checkOutDate),
    capacity: "",
    page: 1,
    pageSize: 6,
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("campsite_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [search, setSearch] = useState(getInitialSearch);

  const [selectedCamp, setSelectedCamp] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [ratingsRefreshTick, setRatingsRefreshTick] = useState(0);

  const triggerRatingsRefresh = () => {
    setRatingsRefreshTick((tick) => tick + 1);
  };

  const loginUser = (userData, token) => {
    localStorage.setItem("campsite_token", token);
    localStorage.setItem("campsite_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("campsite_token");
    localStorage.removeItem("campsite_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        search,
        setSearch,
        selectedCamp,
        setSelectedCamp,
        confirmedBooking,
        setConfirmedBooking,
        ratingsRefreshTick,
        triggerRatingsRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
