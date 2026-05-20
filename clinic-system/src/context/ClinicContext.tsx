import React, { createContext, useContext, useState, useCallback } from 'react';
import { Company, Employee, DoctorSchedule } from '../types';

const API_BASE_URL = '/api';

const STORAGE_KEYS = {
  companies: 'clinic_companies',
  employees: 'clinic_employees',
  doctorSchedules: 'clinic_doctor_schedules',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

const initialCompanies: Company[] = [
  { id: 1, nameAr: 'المؤسسة الوطنية للنفط', nameEn: 'National Oil Corporation', code: 'NOC' },
  { id: 2, nameAr: 'شركة سرت للنفط', nameEn: 'Sirte Oil Company', code: 'SOC' },
  { id: 3, nameAr: 'شركة الخليج للنفط', nameEn: 'Gulf Oil Company', code: 'GOC' },
  { id: 4, nameAr: 'شركة الأغسطيني للنفط', nameEn: 'Agustini Oil Company', code: 'AGOC' },
];

const initialEmployees: Employee[] = [
  {
    id: 1,
    firstName: 'محمد',
    lastName: 'علي',
    email: 'mohammad@noc.ly',
    phone: '+218912345678',
    companyId: 1,
    position: 'مدير التشغيل',
    joinDate: '2023-01-15',
    status: 'active',
    relation: 'employee',
  },
  {
    id: 2,
    firstName: 'فاطمة',
    lastName: 'حسن',
    email: 'fatima@soc.ly',
    phone: '+218923456789',
    companyId: 2,
    position: 'محاسبة',
    joinDate: '2023-03-20',
    status: 'active',
    relation: 'employee',
  },
];

const initialDoctorSchedules: DoctorSchedule[] = [
  {
    id: 1,
    doctorName: 'د. أحمد محمود',
    specialty: 'طب عام',
    dayOfWeek: 'السبت',
    startTime: '09:00',
    endTime: '12:00',
    location: 'العيادة الرئيسية',
    maxPatients: 20,
    status: 'active',
  },
  {
    id: 2,
    doctorName: 'د. سارة إبراهيم',
    specialty: 'طب الأسنان',
    dayOfWeek: 'الأحد',
    startTime: '10:00',
    endTime: '13:00',
    location: 'عيادة الأسنان',
    maxPatients: 15,
    status: 'active',
  },
];

interface ClinicContextType {
  companies: Company[];
  employees: Employee[];
  doctorSchedules: DoctorSchedule[];
  isLoading: boolean;
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: number, company: Partial<Company>) => void;
  deleteCompany: (id: number) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: number, employee: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  addDoctorSchedule: (schedule: Omit<DoctorSchedule, 'id'>) => void;
  updateDoctorSchedule: (id: number, schedule: Partial<DoctorSchedule>) => void;
  deleteDoctorSchedule: (id: number) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() =>
    loadFromStorage(STORAGE_KEYS.companies, initialCompanies)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage(STORAGE_KEYS.employees, initialEmployees)
  );
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(() =>
    loadFromStorage(STORAGE_KEYS.doctorSchedules, initialDoctorSchedules)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Company operations
  const addCompany = useCallback((company: Omit<Company, 'id'>) => {
    setCompanies(prev => {
      const updated = [...prev, { ...company, id: Date.now() }];
      saveToStorage(STORAGE_KEYS.companies, updated);
      return updated;
    });
  }, []);

  const updateCompany = useCallback((id: number, company: Partial<Company>) => {
    setCompanies(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...company } : c);
      saveToStorage(STORAGE_KEYS.companies, updated);
      return updated;
    });
  }, []);

  const deleteCompany = useCallback((id: number) => {
    setCompanies(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.companies, updated);
      return updated;
    });
  }, []);

  // Employee operations
  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    setEmployees(prev => {
      const updated = [...prev, { ...employee, id: Date.now() }];
      saveToStorage(STORAGE_KEYS.employees, updated);
      return updated;
    });
  }, []);

  const updateEmployee = useCallback((id: number, employee: Partial<Employee>) => {
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...employee } : e);
      saveToStorage(STORAGE_KEYS.employees, updated);
      return updated;
    });
  }, []);

  const deleteEmployee = useCallback((id: number) => {
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveToStorage(STORAGE_KEYS.employees, updated);
      return updated;
    });
  }, []);

  // Doctor Schedule operations
  const addDoctorSchedule = useCallback((schedule: Omit<DoctorSchedule, 'id'>) => {
    setDoctorSchedules(prev => {
      const updated = [...prev, { ...schedule, id: Date.now() }];
      saveToStorage(STORAGE_KEYS.doctorSchedules, updated);
      return updated;
    });
  }, []);

  const updateDoctorSchedule = useCallback((id: number, schedule: Partial<DoctorSchedule>) => {
    setDoctorSchedules(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...schedule } : s);
      saveToStorage(STORAGE_KEYS.doctorSchedules, updated);
      return updated;
    });
  }, []);

  const deleteDoctorSchedule = useCallback((id: number) => {
    setDoctorSchedules(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToStorage(STORAGE_KEYS.doctorSchedules, updated);
      return updated;
    });
  }, []);

  const value: ClinicContextType = {
    companies,
    employees,
    doctorSchedules,
    isLoading,
    addCompany,
    updateCompany,
    deleteCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDoctorSchedule,
    updateDoctorSchedule,
    deleteDoctorSchedule,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};