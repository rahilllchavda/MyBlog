import { createContext, useState } from "react";
import toast from "react-hot-toast";

const AppContext = createContext();

function getInitialSearch() {
  const checkInDate = new Date();
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 1);

  return {
    checkIn: checkInDate.toISOString().split("T")[0],
    checkOut: checkOutDate.toISOString().split("T")[0],
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
