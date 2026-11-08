import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DistrictContext = createContext(null);

const HOME_DISTRICT_KEY = 'floodwatch_home_district';

export function DistrictProvider({ children }) {
  const { user } = useAuth();
  
  const [homeDistrictId, setHomeDistrictState] = useState(() => {
    const saved = localStorage.getItem(HOME_DISTRICT_KEY);
    return saved ? Number(saved) : (user?.district_id || 1);
  });

  const [selectedDistrictId, setSelectedDistrictId] = useState(homeDistrictId || 1);
  const [whatIfRainfall, setWhatIfRainfall] = useState(0);

  // Sync with user's configured district if newly logged in
  useEffect(() => {
    if (user?.district_id) {
      setHomeDistrictState(user.district_id);
      localStorage.setItem(HOME_DISTRICT_KEY, String(user.district_id));
    }
  }, [user]);

  const setHomeDistrictId = (id) => {
    const num = Number(id);
    setHomeDistrictState(num);
    localStorage.setItem(HOME_DISTRICT_KEY, String(num));
  };

  const value = {
    selectedDistrictId,
    setSelectedDistrictId,
    homeDistrictId,
    setHomeDistrictId,
    whatIfRainfall,
    setWhatIfRainfall,
  };

  return <DistrictContext.Provider value={value}>{children}</DistrictContext.Provider>;
}

export function useDistrictContext() {
  const ctx = useContext(DistrictContext);
  if (!ctx) {
    throw new Error('useDistrictContext must be used within a DistrictProvider');
  }
  return ctx;
}
