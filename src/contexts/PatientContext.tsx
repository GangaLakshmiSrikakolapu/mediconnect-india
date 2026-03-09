import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PatientSession = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type PatientContextType = {
  patient: PatientSession | null;
  login: (data: PatientSession) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<PatientSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mediconnect_patient');
    if (stored) {
      try { setPatient(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const login = (data: PatientSession) => {
    setPatient(data);
    localStorage.setItem('mediconnect_patient', JSON.stringify(data));
  };

  const logout = () => {
    setPatient(null);
    localStorage.removeItem('mediconnect_patient');
  };

  return (
    <PatientContext.Provider value={{ patient, login, logout, isLoggedIn: !!patient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatient must be used within PatientProvider');
  return context;
};
