import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { DoctorSchedule } from '../../types';

interface ScheduleFormData {
  doctorName: string;
  specialty: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  maxPatients: number;
  status: 'active' | 'inactive';
}

const initialFormData: ScheduleFormData = {
  doctorName: '',
  specialty: '',
  dayOfWeek: '',
  startTime: '09:00',
  endTime: '12:00',
  location: '',
  maxPatients: 20,
  status: 'active',
};

const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const specialties = ['طب عام', 'طب الأسنان', 'العيون', 'الجلدية', 'الباطنة', 'الجراحة', 'طب الأطفال', 'الأنف والأذن والحنجرة'];

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

    if (editingSchedule) {
      updateDoctorSchedule(editingSchedule.id, formData);
    } else {
      addDoctorSchedule(formData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorName: schedule.doctorName,
      specialty: schedule.specialty,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      maxPatients: schedule.maxPatients,
      status: schedule.status,
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

  const filteredSchedules = doctorSchedules.filter(schedule =>
    schedule.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">جداول الأطباء</h1>
            <p className="text-gray-500 mt-1">إدارة جداول العيادات والمتخصصين</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">إجمالي الجداول</p>
              <p className="text-3xl font-bold text-orange-600">{doctorSchedules.length}</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-xl">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">الجداول النشطة</p>
              <p className="text-3xl font-bold text-green-600">{doctorSchedules.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">عدد التخصصات</p>
              <p className="text-3xl font-bold text-blue-600">{new Set(doctorSchedules.map(s => s.specialty)).size}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن طبيب أو تخصص..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">إضافة جدول جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              <tr>
                <th className="px-6 py-4 text-right font-semibold">اسم الطبيب</th>
                <th className="px-6 py-4 text-right font-semibold">التخصص</th>
                <th className="px-6 py-4 text-right font-semibold">اليوم</th>
                <th className="px-6 py-4 text-right font-semibold">الوقت</th>
                <th className="px-6 py-4 text-right font-semibold">المكان</th>
                <th className="px-6 py-4 text-center font-semibold">الحالة</th>
                <th className="px-6 py-4 text-center font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لا توجد جداول مضافة</p>
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((schedule, idx) => (
                  <tr key={schedule.id} className={`hover:bg-orange-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-semibold text-gray-800">{schedule.doctorName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {schedule.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{schedule.dayOfWeek}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.startTime} - {schedule.endTime}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.location}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        schedule.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {schedule.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">
                {editingSchedule ? 'تعديل الجدول' : 'إضافة جدول جديد'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الطبيب *</label>
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="د. أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التخصص *</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">اختر التخصص</option>
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اليوم *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">اختر اليوم</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المكان *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="العيادة الرئيسية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">وقت البداية *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">وقت النهاية *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">عدد المرضى *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxPatients}
                    onChange={(e) => setFormData({ ...formData, maxPatients: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg font-medium"
                >
                  {editingSchedule ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}