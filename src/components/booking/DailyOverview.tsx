import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  BarChart3, 
  AlertCircle,
  Sun,
  Moon,
  MapPin,
  Clock,
  SearchX
} from 'lucide-react';
import { Booking, Table } from '../../types';

interface DailyOverviewProps {
  bookings: Booking[];
  allBookings: Booking[];
  tables: Table[];
  selectedDate: string;
  appSettings: any;
  onEditBooking: (booking: Booking) => void;
  onRefresh: () => void;
}

export default function DailyOverview({ bookings, allBookings, tables, selectedDate, appSettings, onEditBooking, onRefresh }: DailyOverviewProps) {
  // Same logic extracted from minified code
  const formattedDate = format(new Date(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi });
  
  // Filtering logic
  const lunchBookings = bookings.filter(b => {
    const hour = parseInt(b.time.split(':')[0], 10);
    return hour >= 10 && hour <= 15;
  });
  
  const dinnerBookings = bookings.filter(b => {
    const hour = parseInt(b.time.split(':')[0], 10);
    return hour > 15 || hour < 10;
  });

  const totalPaxLunch = lunchBookings.reduce((sum, b) => sum + (b.pax || 0), 0);
  const totalPaxDinner = dinnerBookings.reduce((sum, b) => sum + (b.pax || 0), 0);
  const totalPax = bookings.reduce((sum, b) => sum + (b.pax || 0), 0);

  const actionNeededBookings = bookings.filter(b => ['new', 'waiting_info'].includes(b.status) || (!b.tableName && ['confirmed', 'arrived'].includes(b.status)));
  const unassignedBookings = bookings.filter(b => !b.tableName && ['new', 'waiting_info', 'pending', 'confirmed'].includes(b.status));

  const totalAssignedPax = bookings.filter(b => b.tableName).reduce((sum, b) => sum + (b.pax || 0), 0);

  const renderSection = (title: string, icon: React.ReactNode, list: Booking[], paxCount: number, bgClass: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center justify-between px-4 py-2 rounded-t-xl border-b border-gray-100 ${bgClass}`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            {icon}
            {title}
          </div>
          <div className="text-sm font-bold opacity-80">{list.length} đơn · {paxCount} khách</div>
        </div>
        <div className="bg-white border-l border-r border-b border-gray-200 rounded-b-xl max-h-[300px] overflow-y-auto">
          {list.sort((a,b) => a.time.localeCompare(b.time)).map(b => (
            <div key={b.id} onClick={() => onEditBooking(b)} className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors">
              <div>
                <div className="font-bold text-gray-900 text-sm">{b.customerName || 'Khách vãng lai'}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time}</span>
                  <span className="flex items-center gap-1 font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{b.pax} khách</span>
                  {b.tableName && <span className="flex items-center gap-1 font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded"><MapPin className="w-3 h-3" /> {b.tableName}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {['new', 'waiting_info'].includes(b.status) && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 font-bold text-[10px] rounded animate-pulse shadow-sm">Thiếu thông tin</span>
                )}
                {!b.tableName && ['confirmed', 'arrived'].includes(b.status) && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 font-bold text-[10px] rounded shadow-sm">Chưa xếp bàn</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tổng quan ngày</h2>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              {actionNeededBookings.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  {actionNeededBookings.length} cần xử lý
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-gray-900">{bookings.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">booking • <span className="font-bold text-gray-700">{totalPax}</span> khách</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">{lunchBookings.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">ca trưa • <span className="font-bold text-gray-700">{totalPaxLunch}</span> khách</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-indigo-600">{dinnerBookings.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">ca tối • <span className="font-bold text-gray-700">{totalPaxDinner}</span> khách</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              {unassignedBookings.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                  {unassignedBookings.length} chưa xếp
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-teal-600">
              {totalAssignedPax}
              <span className="text-lg text-gray-400 font-medium">/{totalPax}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">đã gán bàn</div>
          </div>
        </div>

        {actionNeededBookings.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 text-sm">Cần xử lý ngay</div>
              <div className="text-xs text-red-600 mt-0.5">
                {actionNeededBookings.map(b => b.customerName || 'Khách vãng lai').join(', ')} đang chờ xác nhận hoặc thiếu thông tin
              </div>
            </div>
            <button 
              onClick={() => onEditBooking(actionNeededBookings[0])}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex-shrink-0"
            >
              Xử lý
            </button>
          </div>
        )}

        {renderSection('Ca Trưa (10:00 - 15:00)', <Sun className="w-4 h-4 text-amber-700" />, lunchBookings, totalPaxLunch, 'bg-amber-50 text-amber-800')}
        
        {renderSection('Ca Tối (16:00 - 22:00)', <Moon className="w-4 h-4 text-indigo-700" />, dinnerBookings, totalPaxDinner, 'bg-indigo-50 text-indigo-800')}

        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <SearchX className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-bold text-gray-300 mb-1">Chưa có booking nào</p>
            <p className="text-sm">Ngày {formattedDate} hiện chưa có đơn đặt bàn</p>
          </div>
        )}
      </div>
    </div>
  );
}
