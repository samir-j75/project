import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Company } from '../../types';

interface CompanyFormData {
  nameAr: string;
  nameEn: string;
  code: string;
}

const initialFormData: CompanyFormData = {
  nameAr: '',
  nameEn: '',
  code: '',
};

export default function CompaniesPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Auto-generate English name from Arabic
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

    return arabicName
      .split('')
      .map(char => arabicMap[char] || char)
      .join('')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let nameEn = formData.nameEn;
    if (!nameEn && formData.nameAr) {
      nameEn = generateEnglishName(formData.nameAr);
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, { ...formData, nameEn });
    } else {
      addCompany({ ...formData, nameEn });
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      nameAr: company.nameAr,
      nameEn: company.nameEn,
      code: company.code,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
      deleteCompany(id);
    }
  };

  const openAddModal = () => {
    setEditingCompany(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة الشركات</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل وحذف شركات القطاع النفطي</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">إجمالي الشركات</p>
              <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">الشركات النشطة</p>
              <p className="text-3xl font-bold text-green-600">{companies.length}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">المؤسسات الوطنية</p>
              <p className="text-3xl font-bold text-purple-600">{companies.filter(c => c.code === 'NOC').length}</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-xl">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن شركة..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">إضافة شركة جديدة</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-right font-semibold">رمز الشركة</th>
                <th className="px-6 py-4 text-right font-semibold">اسم الشركة (عربي)</th>
                <th className="px-6 py-4 text-right font-semibold">اسم الشركة (إنجليزي)</th>
                <th className="px-6 py-4 text-center font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لا توجد شركات مضافة</p>
                    <p className="text-sm text-gray-400 mt-1">اضغط على "إضافة شركة جديدة" للبدء</p>
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((company, index) => (
                  <tr key={company.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        {company.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{company.nameAr}</td>
                    <td className="px-6 py-4 text-gray-600">{company.nameEn}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} من {filteredCompanies.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">
                {editingCompany ? 'تعديل شركة' : 'إضافة شركة جديدة'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الشركة (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="مثال: شركة النفط الليبية"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الشركة (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="يتم الترجمة تلقائياً من الاسم العربي"
                />
                <p className="text-xs text-gray-400 mt-1">يمكن تعديل الترجمة الإنجليزية يدوياً</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رمز الشركة (3 أحرف إنجليزية) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                  placeholder="مثال: NOC"
                />
                <p className="text-xs text-gray-400 mt-1">3 أحرف إنجليزية فقط (مثل: NOC, SOC, AGOC)</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                >
                  {editingCompany ? 'تعديل' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}