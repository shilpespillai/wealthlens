import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ReportContext = createContext({
  exportFunction: null,
  setExportFunction: () => {},
  isPremium: false,
  setIsPremium: () => {}
});

export const ReportProvider = ({ children }) => {
  const [exportFunction, setExportFunction] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  return (
    <ReportContext.Provider value={{ exportFunction, setExportFunction, isPremium, setIsPremium }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);

export const useReportExport = (fn, isPremiumValue = false) => {
  const { setExportFunction, setIsPremium } = useReport();

  useEffect(() => {
    if (fn) {
      setExportFunction(() => fn);
      setIsPremium(isPremiumValue);
    }
    
    return () => {
      setExportFunction(null);
    };
  }, [fn, isPremiumValue, setExportFunction, setIsPremium]);
};
