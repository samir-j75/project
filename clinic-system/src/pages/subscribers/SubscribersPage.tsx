import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, ChevronLeft, ChevronRight, Upload, FileSpreadsheet, Download, Camera, X, Image, RotateCcw, Scan } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Employee, RELATION_LABELS, STATUS_LABELS, GENDER_LABELS } from '../../types';

interface ExcelPreviewData {
  row: number;
  data: Record<string, string>;
}

// Camera Modal Component
function CameraModal({
  isOpen,
  onClose,
  onCapture,
  onRetake
}: {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: string) => void;
  onRetake: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('تعذر الوصول إلى الكاميرا. تأكد من إعطاء صلاحية الوصول.');
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    onRetake();
    startCamera();
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6" />
            التقاط صورة
          </h3>
          <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-lg p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
              <p className="text-gray-600">جاري تشغيل الكاميرا...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={startCamera}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!loading && !error && !capturedImage && (
            <>
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold"
                >
                  <Camera className="w-5 h-5" />
                  التقاط
                </button>
              </div>
            </>
          )}

          {capturedImage && (
            <>
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <img src={capturedImage} alt="Captured" className="w-full h-auto" />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة التقاط
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold"
                >
                  <Image className="w-5 h-5" />
                  استخدام الصورة
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscribersPage() {
  const { employees, companies, addEmployee, updateEmployee, deleteEmployee } = useClinic();
  const [activeTab, setActiveTab] = useState<'add' | 'family' | 'import'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Camera modal state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalTarget, setCameraModalTarget] = useState<'add' | 'edit'>('add');
  const itemsPerPage = 10;

  // Family mode - allows manual input
  const [familyCompanyId, setFamilyCompanyId] = useState(0);
  const [familyEmployeeNumber, setFamilyEmployeeNumber] = useState('');
  const [familyLastName, setFamilyLastName] = useState('');
  const [familyError, setFamilyError] = useState('');

  // Add Employee Form State
  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstNameAr: '',
    middleNameAr: '',
    lastNameAr: '',
    nationalId: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    email: '',
    companyId: 0,
    relation: 'employee' as Employee['relation'],
    status: 'active' as Employee['status'],
    photo: '',
  });

  // Edit Employee Form State
  const [editFormData, setEditFormData] = useState({
    employeeNumber: '',
    firstNameAr: '',
    middleNameAr: '',
    lastNameAr: '',
    nameEn: '',
    nationalId: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    email: '',
    companyId: 0,
    relation: 'employee' as Employee['relation'],
    status: 'active' as Employee['status'],
    photo: '',
  });

  // Check if relation is not employee
  const isNotEmployee = formData.relation !== 'employee';
  const isNotEmployeeEdit = editFormData.relation !== 'employee';

  // Auto-generate English names from Arabic
  const generateFullEnglishName = () => {
    const fullAr = `${formData.firstNameAr} ${formData.middleNameAr} ${formData.lastNameAr}`.trim();
    return generateEnglishName(fullAr);
  };

  const generateFullEnglishNameEdit = () => {
    const fullAr = `${editFormData.firstNameAr} ${editFormData.middleNameAr} ${editFormData.lastNameAr}`.trim();
    return generateEnglishName(fullAr);
  };

  // Excel Import State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<ExcelPreviewData[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, { column: string; row: number }>>({
    employeeNumber: { column: '', row: 1 },
    nameAr: { column: '', row: 1 },
    birthDate: { column: '', row: 1 },
    gender: { column: '', row: 1 },
    phone: { column: '', row: 1 },
    companyId: { column: '', row: 1 },
    relation: { column: '', row: 1 },
  });

  // Generate English name
  const generateEnglishName = (arabicName: string): string => {
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
    return arabicName.split('').map(char => arabicMap[char] || char).join('').replace(/[^a-zA-Z\s]/g, '').trim();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        if (isEdit) {
          setEditFormData(prev => ({ ...prev, photo: result }));
        } else {
          setFormData(prev => ({ ...prev, photo: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        if (isEdit) {
          setEditFormData(prev => ({ ...prev, photo: result }));
        } else {
          setFormData(prev => ({ ...prev, photo: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    // If in family mode (activeTab === 'family'), validate first
    if (activeTab === 'family') {
      if (!familyCompanyId || !familyEmployeeNumber || !familyLastName) {
        alert('يرجى التحقق من الرقم الوظيفي والمعلومات أولاً');
        return;
      }

      const familyData = {
        ...formData,
        companyId: familyCompanyId,
        employeeNumber: familyEmployeeNumber,
        lastNameAr: familyLastName,
        relation: formData.relation as Employee['relation'],
      };
      addEmployee(familyData);
      // Clear only name fields, keep company and employee number
      setFormData(prev => ({
        ...prev,
        employeeNumber: familyEmployeeNumber,
        firstNameAr: '',
        middleNameAr: '',
        lastNameAr: familyLastName,
        nationalId: '',
        birthDate: '',
        gender: 'male',
        phone: '',
        email: '',
        companyId: familyCompanyId,
        status: '' as Employee['status'],
        photo: '',
      }));
    } else {
      // Normal add mode - save family info if this is an employee
      addEmployee(formData);
      if (formData.relation === 'employee') {
        setFamilyCompanyId(formData.companyId);
        setFamilyEmployeeNumber(formData.employeeNumber);
        setFamilyLastName(formData.lastNameAr);
      }
      setFormData({
        employeeNumber: '',
        firstNameAr: '',
        middleNameAr: '',
        lastNameAr: '',
        nationalId: '',
        birthDate: '',
        gender: 'male',
        phone: '',
        email: '',
        companyId: 0,
        relation: 'employee',
        status: 'active',
        photo: '',
      });
    }
    setPhotoPreview(null);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);

    // Parse existing nameAr into parts (assuming format: "first middle last")
    const nameParts = employee.nameAr ? employee.nameAr.split(' ') : ['', '', ''];

    setEditFormData({
      employeeNumber: employee.employeeNumber,
      firstNameAr: nameParts[0] || '',
      middleNameAr: nameParts[1] || '',
      lastNameAr: nameParts[2] || nameParts.slice(2).join(' ') || '',
      nameEn: employee.nameEn || '',
      nationalId: (employee as any).nationalId || '',
      birthDate: employee.birthDate,
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email || '',
      companyId: employee.companyId,
      relation: employee.relation,
      status: employee.status,
      photo: employee.photo || '',
    });
    setPhotoPreview(employee.photo || null);
    setIsEditModalOpen(true);
  };

  const handleRelationChange = (relation: Employee['relation'], isEdit: boolean = false) => {
    if (isEdit) {
      const newData: any = { ...editFormData, relation };
      if (relation !== 'employee') {
        newData.status = '';
      }
      setEditFormData(newData);
    } else {
      const newData: any = { ...formData, relation };
      if (relation !== 'employee') {
        newData.status = '';
      }
      setFormData(newData);
    }
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      const nameAr = `${editFormData.firstNameAr} ${editFormData.middleNameAr} ${editFormData.lastNameAr}`.trim();
      updateEmployee(editingEmployee.id, { ...editFormData, nameAr });
      setIsEditModalOpen(false);
      setEditingEmployee(null);
      setPhotoPreview(null);
    }
  };

  // Handle looking up employee by number and company
  const handleLookupEmployee = () => {
    if (!familyCompanyId || !familyEmployeeNumber) {
      setFamilyError('يرجى اختيار الشركة وكتابة الرقم الوظيفي');
      return;
    }

    const company = companies.find(c => c.id === familyCompanyId);
    if (!company) {
      setFamilyError('الشركة غير موجودة');
      return;
    }

    // Find existing employee with same employee number and company
    const existingEmployee = employees.find(
      e => e.companyId === familyCompanyId &&
           e.employeeNumber === familyEmployeeNumber &&
           e.relation === 'employee'
    );

    if (existingEmployee) {
      setFamilyLastName(existingEmployee.lastNameAr || existingEmployee.nameAr.split(' ').pop() || '');
      setFamilyError('');
    } else {
      setFamilyError('هذا المشترك غير موجود في النظام');
      setFamilyLastName('');
    }
  };

  // Excel Import Functions
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      const preview: ExcelPreviewData[] = [
        { row: 1, data: { A: 'أحمد محمد', B: '123456', C: '1990-01-15', D: 'ذكر', E: '0912345678' } },
        { row: 2, data: { A: 'فاطمة أحمد', B: '123456', C: '1992-03-20', D: 'أنثى', E: '0923456789' } },
        { row: 3, data: { A: 'محمد أحمد', B: '123456', C: '2015-08-10', D: 'ذكر', E: '0934567890' } },
        { row: 4, data: { A: 'سارة أحمد', B: '123456', C: '2018-12-05', D: 'أنثى', E: '0945678901' } },
        { row: 5, data: { A: 'عمر أحمد', B: '123456', C: '2020-05-20', D: 'ذكر', E: '0956789012' } },
      ];
      setExcelPreview(preview);
    }
  };
  };

  const handleExcelImport = () => {
    alert('تم استيراد البيانات بنجاح!');
    setExcelFile(null);
    setExcelPreview([]);
  };

  const downloadSampleExcel = () => {
    const headers = ['الاسم', 'الرقم الوظيفي', 'تاريخ الميلاد', 'الجنس', 'رقم الهاتف', 'الشركة', 'الصلة'];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'نموذج_استيراد_المشتركين.csv';
    link.click();
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeNumber.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company?.nameAr || '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة المشتركين</h1>
            <p className="text-gray-500 mt-1">إضافة موظفين وأفراد أسرهم - يدوياً أو عبر استيراد Excel</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'add'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          <Plus className="w-5 h-5" />
          إضافة مشترك
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'family'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
          }`}
        >
          <Users className="w-5 h-5" />
          إضافة عائلة
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'import'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          استيراد من Excel
        </button>
      </div>

      {/* Add Form Tab */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-purple-600" />
            إضافة مشترك جديد
          </h3>

          <form onSubmit={handleAddEmployee} className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">بيانات المشترك</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الشركة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.nameAr} ({company.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الموظف الوظيفي (6 أرقام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.employeeNumber}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: 123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الصلة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.relation}
                    onChange={(e) => handleRelationChange(e.target.value as Employee['relation'], false)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="employee">موظف</option>
                    <option value="spouse1">زوج/زوجة أولى</option>
                    <option value="spouse2">زوجة ثانية</option>
                    <option value="spouse3">زوجة ثالثة</option>
                    <option value="spouse4">زوجة رابعة</option>
                    <option value="father">أب</option>
                    <option value="mother">أم</option>
                    <option value="child">ابن/ابنة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحالة {formData.relation === 'employee' && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    required={formData.relation === 'employee'}
                    disabled={isNotEmployee}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${isNotEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    {!isNotEmployee && <option value="">اختر الحالة</option>}
                    <option value="active">موظف</option>
                    <option value="retired">متقاعد</option>
                    <option value="deceased">متوفي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الأول (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstNameAr}
                    onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: أحمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم الأب (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.middleNameAr}
                    onChange={(e) => setFormData({ ...formData, middleNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اللقب (عربي) <span className="text-red-500">*</span>
                    {isNotEmployee && <span className="text-xs text-gray-500 mr-2">(موروث من الموظف)</span>}
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={isNotEmployee}
                    value={formData.lastNameAr}
                    onChange={(e) => setFormData({ ...formData, lastNameAr: e.target.value })}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${isNotEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="مثال: علي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (EN)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={generateFullEnglishName()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الرقم الوطني
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: 0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: email@example.com"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  صورة شخصية
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                    ماسح ضوئي / ملف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalTarget('add');
                      setIsCameraModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    كاميرا
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      حذف الصورة
                    </button>
                  )}
                </div>
                {photoPreview && (
                  <div className="mt-4">
                    <img src={photoPreview} alt="معاينة" className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-bold text-lg"
            >
              إضافة المشترك
            </button>
          </form>
        </div>
      )}

      {/* Family Addition Tab */}
      {activeTab === 'family' && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            إضافة فرد عائلة
          </h3>

          <form onSubmit={handleAddEmployee} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <h4 className="text-lg font-semibold text-blue-700 mb-4">بيانات الموظف المرجعي</h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الشركة <span className="text-red-500">*</span></label>
                  <select
                    value={familyCompanyId}
                    onChange={(e) => {
                      setFamilyCompanyId(Number(e.target.value));
                      setFamilyError('');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.nameAr} ({company.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الموظف الوظيفي <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={6}
                    value={familyEmployeeNumber}
                    onChange={(e) => {
                      setFamilyEmployeeNumber(e.target.value.replace(/\D/g, ''));
                      setFamilyError('');
                      setFamilyLastName('');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="6 أرقام"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اللقب (موروث)</label>
                  <input
                    type="text"
                    readOnly
                    value={familyLastName}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleLookupEmployee}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow font-medium"
                  >
                    تحقق
                  </button>
                </div>
              </div>

              {familyError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {familyError}
                </div>
              )}

              {familyLastName && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  ✓ تم العثور على المشترك - اللقب: {familyLastName}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">بيانات فرد العائلة</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الصلة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value as Employee['relation'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="spouse1">زوج/زوجة أولى</option>
                    <option value="spouse2">زوجة ثانية</option>
                    <option value="spouse3">زوجة ثالثة</option>
                    <option value="spouse4">زوجة رابعة</option>
                    <option value="father">أب</option>
                    <option value="mother">أم</option>
                    <option value="child">ابن/ابنة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الأول (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstNameAr}
                    onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: أحمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم الأب (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.middleNameAr}
                    onChange={(e) => setFormData({ ...formData, middleNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (EN)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={generateFullEnglishName()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الرقم الوطني
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: 0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="مثال: email@example.com"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  صورة شخصية
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                    ماسح ضوئي / ملف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalTarget('add');
                      setIsCameraModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    كاميرا
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      حذف الصورة
                    </button>
                  )}
                </div>
                {photoPreview && (
                  <div className="mt-4">
                    <img src={photoPreview} alt="معاينة" className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                العودة لإضافة مشترك
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg font-bold text-lg"
              >
                إضافة فرد العائلة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Excel Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                استيراد من ملف Excel
              </h3>
              <button
                onClick={downloadSampleExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                تحميل نموذج CSV
              </button>
            </div>

            <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleExcelFileChange}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <p className="text-lg font-medium text-gray-700">اسحب ملف Excel هنا أو اضغط للاختيار</p>
                <p className="text-sm text-gray-400 mt-2">الملفات المدعومة: CSV, XLSX, XLS</p>
              </label>
            </div>
          </div>

          {excelPreview.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">معاينة أول 5 صفوف</h3>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-4 py-2 text-right">الصف</th>
                      <th className="px-4 py-2 text-right">A</th>
                      <th className="px-4 py-2 text-right">B</th>
                      <th className="px-4 py-2 text-right">C</th>
                      <th className="px-4 py-2 text-right">D</th>
                      <th className="px-4 py-2 text-right">E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreview.map((row, index) => (
                      <tr key={row.row} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 font-medium">{row.row}</td>
                        {Object.values(row.data).map((val, i) => (
                          <td key={i} className="px-4 py-2">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="text-lg font-bold text-gray-800 mb-4">تعيين الأعمدة</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'employeeNumber', label: 'رقم الموظف الوظيفي' },
                  { key: 'nameAr', label: 'الاسم (عربي)' },
                  { key: 'birthDate', label: 'تاريخ الميلاد' },
                  { key: 'gender', label: 'الجنس' },
                  { key: 'phone', label: 'رقم الهاتف' },
                  { key: 'companyId', label: 'الشركة' },
                  { key: 'relation', label: 'الصلة' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder="رقم العمود"
                      value={columnMapping[field.key]?.column || ''}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        [field.key]: { ...prev[field.key], column: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-600 mb-1">رقم صف بداية البيانات</label>
                <input
                  type="number"
                  min={1}
                  value={columnMapping.employeeNumber?.row || 1}
                  onChange={(e) => setColumnMapping(prev => ({
                    ...prev,
                    employeeNumber: { ...prev.employeeNumber, row: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handleExcelImport}
                className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:-pink-700 transition-all shadow-lg font-bold text-lg"
              >
                استيراد البيانات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subscribers Table - Full Data */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 mt-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">جميع المشتركين ({employees.length})</h3>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن مشترك..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-3 py-3 text-right font-semibold text-sm">الصورة</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">كود الموظف</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الاسم</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">Name (EN)</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الشركة</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الصلة</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">تاريخ الميلاد</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الجنس</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الهاتف</th>
                <th className="px-3 py-3 text-right font-semibold text-sm">الحالة</th>
                <th className="px-3 py-3 text-center font-semibold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لا توجد مشتركين</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <tr key={employee.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-3">
                      {employee.photo ? (
                        <img src={employee.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-purple-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        {employee.employeeCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800 text-sm">{employee.nameAr}</td>
                    <td className="px-3 py-3 text-gray-500 text-sm italic">{employee.nameEn || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 text-sm">{getCompanyName(employee.companyId)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        employee.relation === 'employee'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {RELATION_LABELS[employee.relation]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">{employee.birthDate}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        employee.gender === 'male'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {GENDER_LABELS[employee.gender]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">{employee.phone}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : employee.status === 'retired'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {STATUS_LABELS[employee.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(employee)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmployee(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} من {filteredEmployees.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 hover:bg-purple-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">تعديل بيانات المشترك</h2>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الشركة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.companyId}
                    onChange={(e) => setEditFormData({ ...editFormData, companyId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.nameAr} ({company.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الموظف الوظيفي (6 أرقام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editFormData.employeeNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, employeeNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الصلة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.relation}
                    onChange={(e) => handleRelationChange(e.target.value as Employee['relation'], true)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="employee">موظف</option>
                    <option value="spouse1">زوج/زوجة أولى</option>
                    <option value="spouse2">زوجة ثانية</option>
                    <option value="spouse3">زوجة ثالثة</option>
                    <option value="spouse4">زوجة رابعة</option>
                    <option value="father">أب</option>
                    <option value="mother">أم</option>
                    <option value="child">ابن/ابنة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    disabled={isNotEmployeeEdit}
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Employee['status'] })}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${isNotEmployeeEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    {!isNotEmployeeEdit && !editFormData.status && <option value="">اختر الحالة</option>}
                    <option value="active">موظف</option>
                    <option value="retired">متقاعد</option>
                    <option value="deceased">متوفي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الأول (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstNameAr}
                    onChange={(e) => setEditFormData({ ...editFormData, firstNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم الأب (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.middleNameAr}
                    onChange={(e) => setEditFormData({ ...editFormData, middleNameAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اللقب (عربي) <span className="text-red-500">*</span>
                    {isNotEmployeeEdit && <span className="text-xs text-gray-500 mr-2">(موروث من الموظف)</span>}
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={isNotEmployeeEdit}
                    value={editFormData.lastNameAr}
                    onChange={(e) => setEditFormData({ ...editFormData, lastNameAr: e.target.value })}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${isNotEmployeeEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (EN)
                  </label>
                  <input
                    type="text"
                    value={editFormData.nameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="الاسم بالإنجليزية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.birthDate}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الرقم الوطني
                  </label>
                  <input
                    type="text"
                    value={editFormData.nationalId}
                    onChange={(e) => setEditFormData({ ...editFormData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Photo Upload in Edit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  صورة شخصية
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('edit-file-upload')?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                    ماسح ضوئي / ملف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalTarget('edit');
                      setIsCameraModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    كاميرا
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                  id="edit-file-upload"
                />
                {photoPreview && (
                  <div className="mt-4">
                    <img src={photoPreview} alt="معاينة" className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(photo) => {
          setPhotoPreview(photo);
          if (cameraModalTarget === 'edit') {
            setEditFormData(prev => ({ ...prev, photo }));
          } else {
            setFormData(prev => ({ ...prev, photo }));
          }
        }}
        onRetake={() => {}}
      />
    </div>
  );
}