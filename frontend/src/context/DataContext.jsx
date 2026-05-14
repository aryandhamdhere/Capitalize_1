import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [uploadedFile, setUploadedFile] = useState(
    localStorage.getItem("capitalize_uploaded_file") || null
  );
  const [dashboardData, setDashboardData] = useState(null);

  return (
    <DataContext.Provider value={{ uploadedFile, setUploadedFile, dashboardData, setDashboardData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
