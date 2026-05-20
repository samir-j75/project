import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, Clock, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { DoctorSchedule, DEPARTMENTS, DAYS_OF_WEEK, VACATION_REASON_LABELS } from '../../types';

interface ScheduleFormData {
  doctorName: string;
  department: string;
  workStartTime: string;
  workEndTime: string;
  examDuration: number;
  days: string[];
  vacationStart: string;
  vacationEnd: string;
  vacationReason: DoctorSchedule['vacationReason'];
}

const initialFormData: ScheduleFormData = {
  doctorName: '',
  department: '',
  workStartTime: '08:00',
  workEndTime: '14:00',
  examDuration: 15,
  days: [],
  vacationStart: '',
  vacationEnd: '',
  vacationReason: undefined,
};

export default function DoctorSchedulesPage() {
  const { doctorSchedules, addDoctorSchedule, updateDoctorSchedule, deleteDoctorSchedule } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleData = {
      ...formData,
      workStartTime: formData.workStartTime || '08:00',
      workEndTime: formData.workEndTime || '14:00',
      examDuration: formData.examDuration || 15,
      maxPatients: calculateMaxPatients(
        formData.workStartTime || '08:00',
        formData.workEndTime || '14:00',
        formData.examDuration || 15
      ),
    };

    if (editingSchedule) {
      updateDoctorSchedule(editingSchedule.id, scheduleData);
    } else {
      addDoctorSchedule(scheduleData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorName: schedule.doctorName,
      department: schedule.department,
      workStartTime: schedule.workStartTime,
      workEndTime: schedule.workEndTime,
      examDuration: schedule.examDuration,
      days: schedule.days || [],
      vacationStart: schedule.vacationStart || '',
      vacationEnd: schedule.vacationEnd || '',
      vacationReason: schedule.vacationReason,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
      deleteDoctorSchedule(id);
    }
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const isOnVacation = (schedule: DoctorSchedule): boolean => {
    if (!schedule.vacationStart || !schedule.vacationEnd) return false;
    const today = new Date();
    const start = new Date(schedule.vacationStart);
    const end = new Date(schedule.vacationEnd);
    return today >= start && today <= end;
  };

  // Filter schedules based on search
  const filteredSchedules = doctorSchedules.filter(schedule =>
    schedule.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">جداول عمل الأطباء</h1>
            <p className="text-gray-500 mt-1">إدارة جداول المواعيد وأوقات العمل والأجازات</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">إجمالي الأطباء</p>
              <p className="text-3xl font-bold text-orange-600">{doctorSchedules.length}</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-xl">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">في إجازة</p>
              <p className="text-3xl font-bold text-red-600">
                {doctorSchedules.filter(s => isOnVacation(s)).length}
              </p>
            </div>
            <div className="p-4 bg-red-100 rounded-xl">
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">أوقات العمل</p>
              <p className="text-lg font-bold text-green-600">08:00 - 14:00</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">متوسط الكشف</p>
              <p className="text-lg font-bold text-blue-600">
                {doctorSchedules.length > 0
                  ? Math.round(doctorSchedules.reduce((acc, s) => acc + s.examDuration, 0) / doctorSchedules.length)
                  : 0} دقيقة
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Clock className="w-8 h-8 text-blue-600" />
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
              placeholder="بحث عن طبيب..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">إضافة جدول جديد</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              <tr>
                <th className="px-4 py-4 text-right font-semibold">اسم الطبيب</th>
                <th className="px-4 py-4 text-right font-semibold">القسم</th>
                <th className="px-4 py-4 text-right font-semibold">ساعات العمل</th>
                <th className="px-4 py-4 text-right font-semibold">مدة الكشف</th>
                <th className="px-4 py-4 text-right font-semibold">عدد الحالات</th>
                <th className="px-4 py-4 text-right font-semibold">الأيام</th>
                <th className="px-4 py-4 text-right font-semibold">الحالة</th>
                <th className="px-4 py-4 text-center font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSchedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لا توجد جداول مضافة</p>
                    <p className="text-sm text-gray-400 mt-1">اضغط على "إضافة جدول جديد" للبدء</p>
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((schedule, index) => {
                  const onVacation = isOnVacation(schedule);
                  return (
                    <tr key={schedule.id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-4 font-semibold text-gray-800">{schedule.doctorName}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {schedule.department}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {schedule.workStartTime} - {schedule.workEndTime}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{schedule.examDuration} دقيقة</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          {schedule.maxPatients} حالة
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {schedule.days.map(day => {
                            const dayInfo = DAYS_OF_WEEK.find(d => d.key === day);
                            return (
                              <span key={day} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                {dayInfo?.label || day}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {onVacation ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            في إجازة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Check className="w-3 h-3" />
                            متاح
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredSchedules.length)} من {filteredSchedules.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    currentPage === page
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 hover:bg-orange-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 sticky top-0">
              <h2 className="text-2xl font-bold text-white">
                {editingSchedule ? 'تعديل جدول الطبيب' : 'إضافة جدول جديد'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الطبيب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="مثال: د. أحمد محمد"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  القسم/العيادة <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">اختر القسم</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ساعة البداية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.workStartTime}
                    onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ساعة النهاية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.workEndTime}
                    onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  فترة الكشف (بالدقائق) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={120}
                  value={formData.examDuration}
                  onChange={(e) => setFormData({ ...formData, examDuration: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="مثال: 15"
                />
                <p className="text-xs text-gray-400 mt-1">
                  عدد الحالات المحسوب: {calculateMaxPatients(
                    formData.workStartTime || '08:00',
                    formData.workEndTime || '14:00',
                    formData.examDuration || 15
                  )} حالة
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  أيام العمل <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        formData.days.includes(day.key)
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">الإجازة (اختياري)</h4>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      سبب الإجازة
                    </label>
                    <select
                      value={formData.vacationReason || ''}
                      onChange={(e) => setFormData({ ...formData, vacationReason: e.target.value as any || undefined })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">اختر السبب</option>
                      <option value="annual">سنوية</option>
                      <option value="sick">مرضية</option>
                      <option value="emergency">طارئة</option>
                      <option value="training">تدريبية</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      من تاريخ
                    </label>
                    <input
                      type="date"
                      value={formData.vacationStart}
                      onChange={(e) => setFormData({ ...formData, vacationStart: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      إلى تاريخ
                    </label>
                    <input
                      type="date"
                      value={formData.vacationEnd}
                      onChange={(e) => setFormData({ ...formData, vacationEnd: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg font-medium"
                >
                  {editingSchedule ? 'تعديل' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateMaxPatients(start: string, end: string, duration: number): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return Math.floor((endMinutes - startMinutes) / duration);
}