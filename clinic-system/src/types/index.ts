// Types for the Clinic System

export interface Company {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  employeeNumber: string; // 6 digits
  firstNameAr: string;
  middleNameAr: string;
  lastNameAr: string;
  nameAr: string; // Computed: firstNameAr + middleNameAr + lastNameAr
  firstNameEn?: string;
  middleNameEn?: string;
  lastNameEn?: string;
  nameEn?: string;
  nationalId: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  companyId: number;
  company?: Company;
  relation: EmployeeRelation;
  status: EmployeeStatus;
  photo?: string;
  employeeCode: string; // Generated: code + employeeNumber + relationCode
  createdAt?: string;
  updatedAt?: string;
}

export type EmployeeRelation =
  | 'employee'      // 01
  | 'spouse1'       // 02
  | 'spouse2'       // A2
  | 'spouse3'       // B2
  | 'spouse4'       // C2
  | 'father'        // 0M
  | 'mother'        // 0F
  | 'child';        // 03-99 (by birth date)

export type EmployeeStatus = 'active' | 'retired' | 'deceased' | '' | 'suspended';

export interface DoctorSchedule {
  id: number;
  doctorName: string;
  department: string;
  workStartTime: string; // HH:mm
  workEndTime: string;   // HH:mm
  examDuration: number;  // in minutes
  maxPatients: number;   // calculated
  vacationStart?: string;
  vacationEnd?: string;
  vacationReason?: VacationReason;
  days: string[]; // ['saturday', 'sunday', 'monday']
  createdAt?: string;
  updatedAt?: string;
}

export type VacationReason =
  | 'annual'        // سنوية
  | 'sick'          // مرضية
  | 'emergency'     // طارئة
  | 'training'      // تدريبية
  | 'other';        // أخرى

export interface FamilyMember extends Employee {
  parentEmployeeId: number;
}

// Relation codes mapping
export const RELATION_CODES: Record<EmployeeRelation, string> = {
  employee: '01',
  spouse1: '02',
  spouse2: 'A2',
  spouse3: 'B2',
  spouse4: 'C2',
  father: '0M',
  mother: '0F',
  child: '03-99', // Dynamic based on birth date
};

// Arabic labels
export const RELATION_LABELS: Record<EmployeeRelation, string> = {
  employee: 'موظف',
  spouse1: 'زوج/زوجة أولى',
  spouse2: 'زوجة ثانية',
  spouse3: 'زوجة ثالثة',
  spouse4: 'زوجة رابعة',
  father: 'أب',
  mother: 'أم',
  child: 'ابن/ابنة',
};

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'موظف',
  retired: 'متقاعد',
  deceased: 'متوفي',
  '': '',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى',
};

export const VACATION_REASON_LABELS: Record<VacationReason, string> = {
  annual: 'سنوية',
  sick: 'مرضية',
  emergency: 'طارئة',
  training: 'تدريبية',
  other: 'أخرى',
};

// Departments list
export const DEPARTMENTS = [
  'طوارئ',
  'باطنة',
  'عظام',
  'جراحة',
  'عيون',
  'طب مهني',
  'أنف وأذن وحنجرة',
  'مناظير',
  'أورام',
  'كلى',
  'تصوير مقطعي وإشعاعي',
  'الترا ساوند',
  'نساء وولادة',
  'حضانة مواليد',
  'عناية فائقة',
  'غسيل كلى',
  'عمليات',
  'جلدية',
  'أسنان',
  'علاج طبيعي',
  'قلب',
  'تغذية',
  'سكر',
  'أوعية دموية',
  'أعصاب',
];

// Days of week
export const DAYS_OF_WEEK = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الإثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
];

// Generate employee code
export function generateEmployeeCode(
  companyCode: string,
  employeeNumber: string,
  relation: EmployeeRelation
): string {
  const relationCode = RELATION_CODES[relation];

  // Pad employee number with zeros on the left
  const paddedNumber = employeeNumber.padStart(6, '0');

  return `${companyCode}${paddedNumber}${relationCode}`;
}

// Calculate max patients based on work hours and exam duration
export function calculateMaxPatients(
  workStart: string,
  workEnd: string,
  examDuration: number
): number {
  const [startHour, startMin] = workStart.split(':').map(Number);
  const [endHour, endMin] = workEnd.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const totalMinutes = endMinutes - startMinutes;
  return Math.floor(totalMinutes / examDuration);
}

// Arabic to English translation helper
export function arabicToEnglish(text: string): string {
  const arabicMap: Record<string, string> = {
    'أ': 'a', 'ا': 'a', 'إ': 'i', 'آ': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'هـ': 'h',
    'و': 'w', 'ي': 'y',
    'ؤ': 'o', 'ئ': 'e', 'ء': 'a',
    'ة': 'a',
  };

  return text
    .split('')
    .map(char => arabicMap[char] || char)
    .join('')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}