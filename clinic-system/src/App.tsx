import React, { useState } from 'react';
import { Building2, Users, Calendar, LayoutDashboard, Menu, X } from 'lucide-react';
import CompaniesPage from './pages/companies/CompaniesPage';
import SubscribersPage from './pages/subscribers/SubscribersPage';
import DoctorSchedulesPage from './pages/doctors/DoctorSchedulesPage';

type Page = 'dashboard' | 'companies' | 'subscribers' | 'doctors';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Page, label: 'الرئيسية', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'companies' as Page, label: 'الشركات', icon: Building2, color: 'from-blue-600 to-indigo-600' },
    { id: 'subscribers' as Page, label: 'المشتركين', icon: Users, color: 'from-purple-600 to-pink-600' },
    { id: 'doctors' as Page, label: 'جداول الأطباء', icon: Calendar, color: 'from-orange-600 to-amber-600' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-40
        w-64 bg-white border-l border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">مصحة النفط</h1>
                <p className="text-xs text-gray-500">نظام إدارة المصحة</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onToggle();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 font-medium text-right
                    ${isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700">مصحة النفط</p>
              <p className="text-xs text-gray-500 mt-1">طرابلس - ليبيا</p>
              <p className="text-xs text-gray-400 mt-1">النسخة 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'subscribers':
        return <SubscribersPage />;
      case 'doctors':
        return <DoctorSchedulesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

// Dashboard Page Component
import { useClinic } from './context/ClinicContext';

function DashboardPage() {
  const { companies, employees, doctorSchedules } = useClinic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-500 mt-1">نظرة عامة على نظام الأرشيف الطبي</p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">مرحباً بك في نظام مصحة النفط</h2>
            <p className="text-blue-100 text-lg">نظام إدارة شامل للمصحة الطبية</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{companies.length}</p>
              <p className="text-blue-200 text-sm">شركة</p>
            </div>
            <div className="w-px h-16 bg-blue-400"></div>
            <div className="text-center">
              <p className="text-4xl font-bold">{employees.length}</p>
              <p className="text-blue-200 text-sm">مشترك</p>
            </div>
            <div className="w-px h-16 bg-blue-400"></div>
            <div className="text-center">
              <p className="text-4xl font-bold">{doctorSchedules.length}</p>
              <p className="text-blue-200 text-sm">طبيب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">+2 هذا الشهر</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{companies.length}</h3>
          <p className="text-gray-500">الشركات المسجلة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">+15 هذا الأسبوع</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{employees.length}</h3>
          <p className="text-gray-500">الموظفين المسجلين</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full">أفراد الأسر</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{employees.filter((e: any) => e.relation !== 'employee').length}</h3>
          <p className="text-gray-500">فرد أسرة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">نشط</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{doctorSchedules.length}</h3>
          <p className="text-gray-500">جداول الأطباء</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-100">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">إضافة شركة جديدة</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all border border-emerald-100">
            <Users className="w-6 h-6 text-emerald-600" />
            <span className="font-medium text-gray-700">إضافة موظف</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-100">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">استيراد من Excel</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all border border-orange-100">
            <Calendar className="w-6 h-6 text-orange-600" />
            <span className="font-medium text-gray-700">جدول طبيب جديد</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">معلومات النظام</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">الإصدار</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">نوع قاعدة البيانات</span>
              <span className="font-medium">SQL Server</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">الواجهة</span>
              <span className="font-medium">React</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">آخر الإحصائيات</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">آخر تسجيل</span>
              <span className="font-medium">اليوم</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">إجمالي العمليات</span>
              <span className="font-medium">127</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">الأقسام الطبية</h4>
          <div className="flex flex-wrap gap-2">
            {['طوارئ', 'باطنة', 'عظام', 'عيون'].map(dept => (
              <span key={dept} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {dept}
              </span>
            ))}
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +14 قسم
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}