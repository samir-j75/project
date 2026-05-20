export interface Company {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: number;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
  relation: 'employee' | 'family';
  photo?: string;
}

export interface DoctorSchedule {
  id: number;
  doctorName: string;
  specialty: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  maxPatients: number;
  status: 'active' | 'inactive';
}

export const arabicToEnglish = (text: string): string => {
  const arabicMap: Record<string, string> = {
    'أ': 'a', 'ا': 'a', 'إ': 'i', 'آ': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'هـ': 'h', 'ه': 'h',
    'و': 'w', 'ي': 'y', 'ى': 'y',
    'ؤ': 'o', 'ئ': 'e', 'ء': 'a',
    'ة': 'a',
  };

  return text
    .split('')
    .map(char => arabicMap[char] || char)
    .join('')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};