import React, { createContext, useContext, useState, useCallback } from 'react';
import { Company, Employee, DoctorSchedule, arabicToEnglish } from '../types';

// API Base URL - will be configured in production
const API_BASE_URL = '/api';

// LocalStorage keys
const STORAGE_KEYS = {
  companies: 'clinic_companies',
  employees: 'clinic_employees',
  doctorSchedules: 'clinic_doctor_schedules',
};

// Load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

// Save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

// Initial mock data for development
const initialCompanies: Company[] = [
  { id: 1, nameAr: 'المؤسسة الوطنية للنفط', nameEn: 'National Oil Corporation', code: 'NOC' },
  { id: 2, nameAr: 'شركة سرت للنفط', nameEn: 'Sirte Oil Company', code: 'SOC' },
  { id: 3, nameAr: 'شركة الخليج العربي للنفط', nameEn: 'Arab Gulf Oil Company', code: 'AGOC' },
];

interface ClinicContextType {
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: number, company: Partial<Company>) => void;
  deleteCompany: (id: number) => void;

  // Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'employeeCode' | 'nameAr' | 'nameEn' | 'firstNameEn' | 'middleNameEn' | 'lastNameEn'>) => string;
  updateEmployee: (id: number, employee: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  getEmployeeByCode: (code: string) => Employee | undefined;

  // Doctor Schedules
  doctorSchedules: DoctorSchedule[];
  addDoctorSchedule: (schedule: Omit<DoctorSchedule, 'id'>) => void;
  updateDoctorSchedule: (id: number, schedule: Partial<DoctorSchedule>) => void;
  deleteDoctorSchedule: (id: number) => void;

  // Search and Filter
  searchEmployees: (query: string) => Employee[];
  getEmployeesByCompany: (companyId: number) => Employee[];

  // Loading state
  isLoading: boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(() => loadFromStorage(STORAGE_KEYS.companies, initialCompanies));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage(STORAGE_KEYS.employees, []));
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(() => loadFromStorage(STORAGE_KEYS.doctorSchedules, []));
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
  const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'employeeCode' | 'nameAr' | 'nameEn' | 'firstNameEn' | 'middleNameEn' | 'lastNameEn'>): string => {
    const company = companies.find(c => c.id === employee.companyId);
    if (!company) throw new Error('Company not found');

    // Compute full name in Arabic and English
    const nameAr = `${employee.firstNameAr} ${employee.middleNameAr} ${employee.lastNameAr}`.trim();
    // Auto-generate English name from Arabic
    const nameEn = nameAr.split('').map(char => arabicToEnglish(char)).join('');

    // Generate employee code
    const relationCodes: Record<string, string> = {
      employee: '01',
      spouse1: '02',
      spouse2: 'A2',
      spouse3: 'B2',
      spouse4: 'C2',
      father: '0M',
      mother: '0F',
      child: '03',
    };

    const relationCode = employee.relation === 'child'
      ? calculateChildCode(employee, employees, employee.companyId)
      : relationCodes[employee.relation];

    const employeeCode = `${company.code}${employee.employeeNumber.padStart(6, '0')}${relationCode}`;

    const newEmployee: Employee = {
      ...employee,
      nameAr,
      nameEn,
      id: Date.now(),
      employeeCode,
    };

    setEmployees(prev => {
      const updated = [...prev, newEmployee];
      saveToStorage(STORAGE_KEYS.employees, updated);
      return updated;
    });
    return employeeCode;
  }, [companies, employees]);

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

  const getEmployeeByCode = useCallback((code: string): Employee | undefined => {
    return employees.find(e => e.employeeCode === code);
  }, [employees]);

  // Doctor schedule operations
  const addDoctorSchedule = useCallback((schedule: Omit<DoctorSchedule, 'id'>) => {
    const maxPatients = calculateMaxPatients(schedule.workStartTime, schedule.workEndTime, schedule.examDuration);
    setDoctorSchedules(prev => {
      const updated = [...prev, { ...schedule, id: Date.now(), maxPatients }];
      saveToStorage(STORAGE_KEYS.doctorSchedules, updated);
      return updated;
    });
  }, []);

  const updateDoctorSchedule = useCallback((id: number, schedule: Partial<DoctorSchedule>) => {
    setDoctorSchedules(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const newSchedule = { ...s, ...schedule };
          newSchedule.maxPatients = calculateMaxPatients(newSchedule.workStartTime, newSchedule.workEndTime, newSchedule.examDuration);
          return newSchedule;
        }
        return s;
      });
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

  // Search and filter
  const searchEmployees = useCallback((query: string): Employee[] => {
    if (!query) return employees;
    const lowerQuery = query.toLowerCase();
    return employees.filter(e =>
      e.nameAr.toLowerCase().includes(lowerQuery) ||
      e.employeeCode.toLowerCase().includes(lowerQuery) ||
      e.employeeNumber.includes(query)
    );
  }, [employees]);

  const getEmployeesByCompany = useCallback((companyId: number): Employee[] => {
    return employees.filter(e => e.companyId === companyId);
  }, [employees]);

  return (
    <ClinicContext.Provider value={{
      companies,
      addCompany,
      updateCompany,
      deleteCompany,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      getEmployeeByCode,
      doctorSchedules,
      addDoctorSchedule,
      updateDoctorSchedule,
      deleteDoctorSchedule,
      searchEmployees,
      getEmployeesByCompany,
      isLoading,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}

// Helper functions
function calculateChildCode(employee: Omit<Employee, 'id' | 'employeeCode' | 'nameAr' | 'nameEn' | 'firstNameEn' | 'middleNameEn' | 'lastNameEn'>, existingEmployees: Employee[], companyId: number): string {
  const children = existingEmployees.filter(
    e => e.companyId === companyId &&
    e.relation === 'child'
  );

  // Filter by parent (same employee number means same family)
  const siblings = children.filter(e => e.employeeNumber === employee.employeeNumber);

  // Sort by birth date (oldest first)
  const sorted = [...siblings].sort((a, b) =>
    new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
  );

  // Find the position of the new child
  const position = sorted.findIndex(e => new Date(e.birthDate) > new Date(employee.birthDate));

  if (position === -1) {
    // New child is the youngest
    return String(3 + sorted.length).padStart(2, '0');
  } else {
    return String(3 + position).padStart(2, '0');
  }
}

function calculateMaxPatients(start: string, end: string, duration: number): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return Math.floor((endMinutes - startMinutes) / duration);
}