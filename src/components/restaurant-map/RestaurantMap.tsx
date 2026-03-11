import React, { useState, useRef } from 'react';
import { User, Clock, Info, Users, Split, LayoutTemplate, Edit, Save, Plus, Trash2, Move, X, Check, ArrowRightLeft } from 'lucide-react';
import OrderPad from './OrderPad';

type TableStatus = 'empty' | 'occupied' | 'reserved';

interface Table {
  id: string;
  name: string;
  type: 'circle' | 'square';
  status: TableStatus;
  pax: number;
  customerName?: string;
  time?: string; // Arrival time or Reservation time
  duration?: string; // For occupied tables
  notes?: string;
}

interface VipRoom {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'in-use';
  customerName?: string;
  time?: string;
  notes?: string;
}

interface EditingItem {
  id?: string;
  name?: string;
  type?: 'circle' | 'square'; // For tables
  status?: TableStatus | 'empty' | 'in-use';
  pax?: number; // For tables
  capacity?: number; // For VIP rooms and areas
  category: 'table' | 'vip' | 'area';
}

import { level1Tables as mockL1, vipRooms as mockVip, level3Tables as mockL3, floorZones as mockZones, eventHall as initialEventHall } from '../../data/mockTables';
import { tableService } from '../../services/tableService';
import { orderService } from '../../services/orderService';

export default function RestaurantMap() {
  const [activeFloor, setActiveFloor] = useState<1 | 2 | 3>(1);
  const [partitionConfig, setPartitionConfig] = useState<'full' | '70-70' | '60-80' | '40-100'>('full');

  const [tablesL1, setTablesL1] = useState<Table[]>([]);
  const [tablesL3, setTablesL3] = useState<Table[]>([]);
  const [vipRoomsList, setVipRoomsList] = useState<VipRoom[]>([]);
  const [zones, setZones] = useState(mockZones); // keeping zones static for now or can fetch
  const [eventHall, setEventHall] = useState(initialEventHall);

  const [isEditing, setIsEditing] = useState(false);
  const [isPartitionMenuOpen, setIsPartitionMenuOpen] = useState(false);

  const fetchTables = async () => {
    try {
      const allTables = await tableService.getTables();
      setTablesL1(allTables.filter(t => t.floor === 1));

      // Map floor 2 to vipRooms
      const vip = allTables.filter(t => t.floor === 2).map(t => ({
        id: t.id,
        name: t.name,
        capacity: t.pax,
        status: (t.status === 'occupied' || t.status === 'reserved') ? 'in-use' : 'empty', // mock mapper for now
        customerName: t.customerName,
        time: t.time || undefined,
        notes: t.notes || undefined
      } as VipRoom));
      setVipRoomsList(vip);

      setTablesL3(allTables.filter(t => t.floor === 3));

    } catch (e) {
      console.error('Failed to load tables, falling back to mock data', e);
      setTablesL1(mockL1);
      setVipRoomsList(mockVip);
      setTablesL3(mockL3);
    }
  };

  React.useEffect(() => {
    fetchTables();

    // Subscribe to realtime updates
    const subscription = tableService.subscribeToTables(() => {
      fetchTables();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem>({ category: 'table' });

  // Move Table State
  const [movingTableId, setMovingTableId] = useState<string | null>(null);

  // Order Pad State
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | VipRoom | null>(null);

  // Drag & Drop State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const dragType = useRef<'table' | 'vip' | null>(null);

  // Calculate Level 1 Occupancy
  const totalPaxL1 = 80;
  const currentPaxL1 = tablesL1.reduce((acc, t) => t.status === 'occupied' ? acc + t.pax : acc, 0);
  const occupancyRateL1 = Math.round((currentPaxL1 / totalPaxL1) * 100);

  // Calculate Level 3 Occupancy
  const totalPaxL3 = 140;
  const currentPaxL3 = tablesL3.reduce((acc, t) => t.status === 'occupied' ? acc + t.pax : acc, 0);
  const occupancyRateL3 = Math.round((currentPaxL3 / totalPaxL3) * 100);

  // Calculate Event Hall Capacities based on Config
  const getEventHallCapacities = () => {
    switch (partitionConfig) {
      case 'full': return { A: 140, B: 0, flexA: 1, flexB: 0 };
      case '70-70': return { A: 70, B: 70, flexA: 1, flexB: 1 };
      case '60-80': return { A: 60, B: 80, flexA: 3, flexB: 4 };
      case '40-100': return { A: 40, B: 100, flexA: 2, flexB: 5 };
      default: return { A: 70, B: 70, flexA: 1, flexB: 1 };
    }
  };

  const hallConfig = getEventHallCapacities();

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 border-green-500 text-green-700';
      case 'reserved': return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      default: return 'bg-white border-gray-200 text-gray-500 hover:border-gray-300';
    }
  };

  // Move Table Handler
  const handleMoveTable = async (sourceId: string, targetId: string) => {
    let sourceTable = tablesL1.find(t => t.id === sourceId) || tablesL3.find(t => t.id === sourceId);
    let targetTable = tablesL1.find(t => t.id === targetId) || tablesL3.find(t => t.id === targetId);

    if (!sourceTable || !targetTable) return;
    if (sourceTable.floor !== targetTable.floor) {
      alert("Chỉ hỗ trợ chuyển bàn trong cùng một tầng");
      return;
    }

    if (window.confirm(`Xác nhận chuyển khách từ ${sourceTable.name} sang ${targetTable.name}?`)) {
      // Optimistic updatre
      const updateTablesLocally = (tables: Table[]) => tables.map(t => {
        if (t.id === targetId) return { ...t, status: sourceTable.status, customerName: sourceTable.customerName, pax: sourceTable.pax, time: sourceTable.time, duration: sourceTable.duration, notes: sourceTable.notes };
        if (t.id === sourceId) return { ...t, status: 'empty', customerName: undefined, time: undefined, duration: undefined, notes: undefined };
        return t;
      });

      if (sourceTable.floor === 1) setTablesL1(updateTablesLocally(tablesL1));
      if (sourceTable.floor === 3) setTablesL3(updateTablesLocally(tablesL3));
      setMovingTableId(null);

      try {
        // Clear source table
        await tableService.updateTableStatus(sourceId, {
          status: 'empty',
          customerName: null as any,
          time: null as any,
          duration: null as any,
          notes: null as any
        });

        // Set target table
        await tableService.updateTableStatus(targetId, {
          status: sourceTable.status,
          customerName: sourceTable.customerName,
          time: sourceTable.time,
          duration: sourceTable.duration,
          notes: sourceTable.notes
        });
      } catch (error) {
        console.error('Failed to move table in DB', error);
        fetchTables(); // Re-sync if failed
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, position: number, type: 'table' | 'vip') => {
    dragItem.current = position;
    dragType.current = type;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();

    // Only Handle Reordering in Edit Mode
    if (isEditing && dragItem.current !== null && dragOverItem.current !== null && dragType.current) {
      if (dragType.current === 'table' && activeFloor === 1) {
        const newTables = [...tablesL1];
        const draggedItemContent = newTables[dragItem.current];
        newTables.splice(dragItem.current, 1);
        newTables.splice(dragOverItem.current, 0, draggedItemContent);
        setTablesL1(newTables);
      } else if (dragType.current === 'table' && activeFloor === 3) {
        const newTables = [...tablesL3];
        const draggedItemContent = newTables[dragItem.current];
        newTables.splice(dragItem.current, 1);
        newTables.splice(dragOverItem.current, 0, draggedItemContent);
        setTablesL3(newTables);
      } else if (dragType.current === 'vip') {
        const newRooms = [...vipRoomsList];
        const draggedItemContent = newRooms[dragItem.current];
        newRooms.splice(dragItem.current, 1);
        newRooms.splice(dragOverItem.current, 0, draggedItemContent);
        setVipRoomsList(newRooms);
      }

      // Note: Full position persistence to DB would require updating X, Y or Order index on all affected tables.
      // For Phase 2, we just maintain local reordering until a broader layout save is triggered.
    }

    dragItem.current = null;
    dragOverItem.current = null;
    dragType.current = null;
  };

  // CRUD Handlers
  const handleAddTable = () => {
    setEditingItem({ category: 'table', type: 'square', status: 'empty', pax: 4, floor: activeFloor === 2 ? 1 : activeFloor });
    setIsModalOpen(true);
  };

  const handleAddVipRoom = () => {
    setEditingItem({ category: 'vip', status: 'empty', capacity: 6 });
    setIsModalOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingItem({ ...table, category: 'table' });
    setIsModalOpen(true);
  };

  const handleEditVipRoom = (room: VipRoom) => {
    setEditingItem({ ...room, category: 'vip' });
    setIsModalOpen(true);
  };

  const handleEditArea = (area: { id: string, name: string, capacity: number }) => {
    setEditingItem({ ...area, category: 'area' });
    setIsModalOpen(true);
  };

  const handleDeleteTable = async (id: string, floor: 1 | 2 | 3) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      // Optimistic
      if (floor === 1) setTablesL1(tablesL1.filter(t => t.id !== id));
      if (floor === 3) setTablesL3(tablesL3.filter(t => t.id !== id));
      try {
        await tableService.deleteTable(id);
      } catch (error) {
        console.error('Failed to delete table from DB', error);
        fetchTables();
      }
    }
  };

  const handleDeleteVipRoom = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng VIP này?')) {
      setVipRoomsList(vipRoomsList.filter(r => r.id !== id));
      try {
        await tableService.deleteTable(id);
      } catch (error) {
        console.error('Failed to delete VIP room from DB', error);
        fetchTables();
      }
    }
  };

  const handleSaveModal = async () => {
    if (!editingItem.name) return;

    if (editingItem.category === 'table') {
      const flr = editingItem.floor || (activeFloor === 2 ? 1 : activeFloor);

      if (editingItem.id) {
        // UPDATE existing table
        try {
          await tableService.updateTable(editingItem.id, {
            name: editingItem.name,
            type: editingItem.type || 'square',
            pax: editingItem.pax || 4,
            floor: flr
          });
          // Sync table name to pending orders on the kitchen page
          if (editingItem.name) {
            await orderService.updateTableNameInOrders(editingItem.id, editingItem.name);
          }
        } catch (error) {
          console.error('Failed to update table', error);
        }
      } else {
        // CREATE new table
        try {
          await tableService.createTable({
            name: editingItem.name,
            type: editingItem.type || 'square',
            pax: editingItem.pax || 4,
            floor: flr,
            status: 'empty'
          });
        } catch (error) {
          console.error('Failed to create table', error);
        }
      }
    } else if (editingItem.category === 'vip') {
      if (editingItem.id) {
        try {
          await tableService.updateTable(editingItem.id, {
            name: editingItem.name,
            pax: editingItem.capacity || 6
          });
          // Sync VIP room name to pending orders on the kitchen page
          if (editingItem.name) {
            await orderService.updateTableNameInOrders(editingItem.id, editingItem.name);
          }
        } catch (error) {
          console.error('Failed to update VIP room', error);
        }
      } else {
        try {
          await tableService.createTable({
            name: editingItem.name || 'VIP Room',
            type: 'square',
            pax: editingItem.capacity || 6,
            floor: 2,
            status: 'empty'
          });
        } catch (error) {
          console.error('Failed to create VIP room', error);
        }
      }
    } else if (editingItem.category === 'area') {
      setEventHall(eventHall.map(a => a.id === editingItem.id ? { ...a, name: editingItem.name!, capacity: editingItem.capacity! } : a));
    }

    setIsModalOpen(false);
    // Re-fetch to get the latest from DB (the realtime subscription will also trigger this)
    fetchTables();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-y-auto p-6 space-y-8 relative">

      {/* Top Action Bar & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-40 bg-gray-50 pb-2">
        {/* Floor Tabs */}
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-full lg:w-auto overflow-x-auto">
          {[
            { id: 1, label: 'Tầng 1 (Sảnh)', pax: `${currentPaxL1}/${totalPaxL1}` },
            { id: 2, label: 'Tầng 2 (VIP)', pax: `${vipRoomsList.filter(r => r.status === 'in-use').length}/4` },
            { id: 3, label: 'Tầng 3 (Tiệc)', pax: `${currentPaxL3}/${totalPaxL3}` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFloor(tab.id as 1 | 2 | 3)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeFloor === tab.id ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFloor === tab.id ? 'bg-teal-200 text-teal-800' : 'bg-gray-100 text-gray-500'}`}>
                {tab.pax}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${isEditing
            ? 'bg-teal-600 text-white hover:bg-teal-700'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          {isEditing ? 'Lưu cấu hình' : 'Chỉnh sửa sơ đồ'}
        </button>
      </div>

      {/* Moving Mode Banner */}
      {movingTableId && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 animate-in slide-in-from-top-4 border-2 border-white/20">
          <ArrowRightLeft className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-bold text-sm">Đang chuyển: {(tablesL1.find(t => t.id === movingTableId) || tablesL3.find(t => t.id === movingTableId))?.name}</div>
            <div className="text-xs opacity-90">Chọn một bàn trống để chuyển đến</div>
          </div>
          <button
            onClick={() => setMovingTableId(null)}
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Level 1: Sảnh chung */}
      {activeFloor === 1 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">T1</span>
              Sảnh chung (Tầng 1 - 80 Pax)
            </h2>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm font-medium text-gray-600">Tiến độ lấp đầy:</div>
              <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRateL1}%` }}
                ></div>
              </div>
              <div className="text-sm font-bold text-blue-600">{currentPaxL1}/{totalPaxL1} Pax</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative pt-10">

            {/* Add Table Button (Only in Edit Mode) */}
            {isEditing && (
              <button
                onClick={handleAddTable}
                className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-teal-300 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:border-teal-400 transition-all gap-2 z-10 relative"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold">Thêm bàn</span>
              </button>
            )}

            {tablesL1.map((table, index) => (
              <div
                key={table.id}
                className={`relative group flex flex-col items-center z-10 ${isEditing ? 'cursor-move' : ''}`}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index, 'table')}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Table Shape */}
                <div
                  className={`
                  relative flex items-center justify-center border-2 shadow-sm transition-all cursor-pointer
                  ${table.type === 'circle' ? 'rounded-full w-24 h-24' : 'rounded-lg w-24 h-24'}
                  ${getStatusColor(table.status)}
                  ${isEditing ? 'animate-pulse border-dashed border-gray-400' : ''}
                  ${movingTableId === table.id ? 'ring-4 ring-blue-400 ring-offset-2 border-blue-500' : ''}
                  ${movingTableId && table.status === 'empty' ? 'hover:ring-4 hover:ring-green-400 hover:ring-offset-2 hover:border-green-500' : ''}
                `}
                  onClick={() => {
                    if (!isEditing && !movingTableId) {
                      setSelectedTableForOrder(table);
                    } else if (movingTableId && table.status === 'empty') {
                      handleMoveTable(movingTableId, table.id);
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold">{table.name}</div>
                    <div className="text-xs mt-1 font-medium">{table.pax} Pax</div>
                    {!isEditing && table.status === 'occupied' && (
                      <div className="text-[10px] mt-1 bg-white/50 px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {table.duration}
                      </div>
                    )}
                    {!isEditing && table.status === 'reserved' && (
                      <div className="text-[10px] mt-1 bg-white/50 px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {table.time}
                      </div>
                    )}
                  </div>

                  {/* Move Button (View Mode, Occupied/Reserved) */}
                  {!isEditing && !movingTableId && table.status !== 'empty' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovingTableId(table.id);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 hover:bg-blue-700"
                      title="Đổi bàn"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Target Selection Overlay (When moving) */}
                  {movingTableId && movingTableId !== table.id && table.status === 'empty' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                        Chọn
                      </span>
                    </div>
                  )}

                  {/* Edit Mode Controls */}
                  {isEditing && (
                    <div className="absolute -top-2 -right-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditTable(table); }}
                        className="p-1 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id, 1); }}
                        className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Tooltip (Only in View Mode) */}
                  {!isEditing && !movingTableId && (table.status === 'occupied' || table.status === 'reserved') && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      <div className="font-bold text-sm mb-1">{table.customerName}</div>
                      <div className="flex items-center gap-1.5 text-gray-300 mb-1">
                        <Clock className="w-3 h-3" />
                        {table.status === 'occupied' ? `Đã ngồi: ${table.duration}` : `Đến lúc: ${table.time}`}
                      </div>
                      {table.notes && (
                        <div className="flex items-start gap-1.5 text-yellow-400 mt-1 border-t border-gray-700 pt-1">
                          <Info className="w-3 h-3 mt-0.5" />
                          {table.notes}
                        </div>
                      )}
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>

                {/* Chairs simulation */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {Array.from({ length: table.pax }).map((_, i) => {
                    const isCircle = table.type === 'circle';
                    if (isCircle) {
                      const deg = (i * 360) / table.pax;
                      return (
                        <div
                          key={i}
                          className={`absolute w-4 h-1.5 rounded-full shadow-sm ${table.status !== 'empty' ? 'bg-blue-300' : 'bg-gray-300'}`}
                          style={{ transform: `rotate(${deg}deg) translateY(-3.5rem)` }}
                        />
                      );
                    } else {
                      const edge = i % 4;
                      const countOnEdge = Math.floor((table.pax - 1 - edge) / 4) + 1;
                      const offsetIndex = Math.floor(i / 4) - (countOnEdge - 1) / 2;
                      const shift = offsetIndex * 24; // 24px spacing
                      return (
                        <div
                          key={i}
                          className={`absolute w-4 h-1.5 rounded-full shadow-sm ${table.status !== 'empty' ? 'bg-blue-300' : 'bg-gray-300'}`}
                          style={{ transform: `rotate(${edge * 90}deg) translateY(-3.5rem) translateX(${shift}px)` }}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem.id ? 'Cập nhật thông tin' : 'Thêm mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên {editingItem.category === 'table' ? 'bàn' : editingItem.category === 'vip' ? 'phòng' : 'khu vực'}</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="VD: Bàn 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingItem.category === 'table' ? 'Số ghế (Pax)' : 'Sức chứa (Pax)'}
                  </label>
                  <input
                    type="number"
                    value={editingItem.category === 'table' ? editingItem.pax : editingItem.capacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (editingItem.category === 'table') {
                        setEditingItem({ ...editingItem, pax: val });
                      } else {
                        setEditingItem({ ...editingItem, capacity: val });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                {editingItem.category === 'table' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bàn</label>
                    <select
                      value={editingItem.type || 'square'}
                      onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'circle' | 'square' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="square">Vuông</option>
                      <option value="circle">Tròn</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level 2: VIP Rooms */}
      {activeFloor === 2 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm">T2</span>
            Khu vực VIP (Tầng 2)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 relative pt-4">
            {isEditing && (
              <button
                onClick={handleAddVipRoom}
                className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-400 transition-all gap-2"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold">Thêm phòng VIP</span>
              </button>
            )}

            {vipRoomsList.map((room, index) => (
              <div
                key={room.id}
                className={`
                relative group p-6 rounded-2xl border-2 shadow-sm transition-all flex flex-col justify-between h-40 z-10
                ${room.status === 'in-use' && !isEditing ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-200'}
                ${isEditing ? 'cursor-move animate-pulse border-dashed border-gray-400' : 'hover:border-purple-200 cursor-pointer'}
              `}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index, 'vip')}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                  if (!isEditing) {
                    setSelectedTableForOrder(room);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-lg ${room.status === 'in-use' && !isEditing ? 'text-purple-900' : 'text-gray-800'}`}>
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Users className="w-4 h-4" />
                      {room.capacity} Pax
                    </div>
                  </div>
                  {!isEditing && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${room.status === 'in-use' ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {room.status === 'in-use' ? 'Đang dùng' : 'Trống'}
                    </span>
                  )}
                </div>

                {/* Edit Mode Controls */}
                {isEditing && (
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditVipRoom(room); }}
                      className="p-1 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteVipRoom(room.id); }}
                      className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!isEditing && room.status === 'in-use' && (
                  <div className="mt-auto pt-3 border-t border-purple-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                      <User className="w-4 h-4" />
                      {room.customerName}
                    </div>
                  </div>
                )}

                {/* Tooltip for VIP */}
                {!isEditing && room.status === 'in-use' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    <div className="font-bold text-sm mb-1">{room.customerName}</div>
                    <div className="flex items-center gap-1.5 text-gray-300 mb-1">
                      <Clock className="w-3 h-3" />
                      Đến lúc: {room.time}
                    </div>
                    {room.notes && (
                      <div className="flex items-start gap-1.5 text-yellow-400 mt-1 border-t border-gray-700 pt-1">
                        <Info className="w-3 h-3 mt-0.5" />
                        {room.notes}
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Level 3: Event Hall */}
      {activeFloor === 3 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 relative z-10">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm">T3</span>
              Sảnh sự kiện (Tầng 3 - 140 Pax)
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm mr-2">
                <div className="text-sm font-medium text-gray-600">Tiến độ lấp đầy:</div>
                <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRateL3}%` }}
                  ></div>
                </div>
                <div className="text-sm font-bold text-orange-600">{currentPaxL3}/{totalPaxL3} Pax</div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsPartitionMenuOpen(!isPartitionMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-all font-medium text-sm ${partitionConfig !== 'full'
                    ? 'bg-orange-100 border-orange-300 text-orange-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Split className="w-4 h-4" />
                  {partitionConfig === 'full' ? 'Cấu hình vách ngăn' : `Đang chia: ${partitionConfig}`}
                </button>

                {/* Partition Dropdown */}
                {isPartitionMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-gray-50 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Chọn kiểu chia phòng
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { setPartitionConfig('full'); setIsPartitionMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${partitionConfig === 'full' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>Không chia (140 Pax)</span>
                        {partitionConfig === 'full' && <Check className="w-4 h-4" />}
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={() => { setPartitionConfig('70-70'); setIsPartitionMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${partitionConfig === '70-70' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>Chia đều (70 - 70)</span>
                        {partitionConfig === '70-70' && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setPartitionConfig('60-80'); setIsPartitionMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${partitionConfig === '60-80' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>Chia lệch (60 - 80)</span>
                        {partitionConfig === '60-80' && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setPartitionConfig('40-100'); setIsPartitionMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${partitionConfig === '40-100' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>Chia lệch (40 - 100)</span>
                        {partitionConfig === '40-100' && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Partition Visualizer Overview */}
          {partitionConfig !== 'full' && (
            <div className="relative h-12 bg-white rounded-lg border-2 border-orange-200 shadow-sm overflow-hidden flex mb-6">
              <div className="flex items-center justify-center text-orange-800 font-bold text-sm bg-orange-50/50" style={{ flex: hallConfig.flexA }}>Khu vực A ({hallConfig.A} Pax)</div>
              <div className="w-1.5 bg-orange-400"></div>
              <div className="flex items-center justify-center text-orange-800 font-bold text-sm bg-orange-50/50" style={{ flex: hallConfig.flexB }}>Khu vực B ({hallConfig.B} Pax)</div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative mt-6">
            {/* Add Table Button (Only in Edit Mode) */}
            {isEditing && (
              <button
                onClick={handleAddTable}
                className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-teal-300 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:border-teal-400 transition-all gap-2 z-10 relative"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold">Thêm bàn</span>
              </button>
            )}

            {tablesL3.map((table, index) => (
              <div
                key={table.id}
                className={`relative group flex flex-col items-center z-10 ${isEditing ? 'cursor-move' : ''}`}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index, 'table')}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Table Shape */}
                <div
                  className={`
                   relative flex items-center justify-center border-2 shadow-sm transition-all cursor-pointer rounded-full w-24 h-24
                   ${getStatusColor(table.status)}
                   ${isEditing ? 'animate-pulse border-dashed border-gray-400' : ''}
                   ${movingTableId === table.id ? 'ring-4 ring-blue-400 ring-offset-2 border-blue-500' : ''}
                   ${movingTableId && table.status === 'empty' ? 'hover:ring-4 hover:ring-green-400 hover:ring-offset-2 hover:border-green-500' : ''}
                 `}
                  onClick={() => {
                    if (!isEditing && !movingTableId) {
                      setSelectedTableForOrder(table);
                    } else if (movingTableId && table.status === 'empty') {
                      handleMoveTable(movingTableId, table.id);
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold">{table.name}</div>
                    <div className="text-xs mt-1 font-medium">{table.pax} Pax</div>
                    {!isEditing && table.status === 'occupied' && (
                      <div className="text-[10px] mt-1 bg-white/50 px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {table.duration}
                      </div>
                    )}
                    {!isEditing && table.status === 'reserved' && (
                      <div className="text-[10px] mt-1 bg-white/50 px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {table.time}
                      </div>
                    )}
                  </div>

                  {/* Move Button */}
                  {!isEditing && !movingTableId && table.status !== 'empty' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setMovingTableId(table.id); }}
                      className="absolute -top-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 hover:bg-blue-700"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit Mode Controls */}
                  {isEditing && (
                    <div className="absolute -top-2 -right-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditTable(table); }}
                        className="p-1 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id, 3); }}
                        className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Tooltip */}
                  {!isEditing && !movingTableId && (table.status === 'occupied' || table.status === 'reserved') && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      <div className="font-bold text-sm mb-1">{table.customerName}</div>
                      <div className="flex items-center gap-1.5 text-gray-300 mb-1">
                        <Clock className="w-3 h-3" />
                        {table.status === 'occupied' ? `Đã ngồi: ${table.duration}` : `Đến lúc: ${table.time}`}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>

                {/* Chairs */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {Array.from({ length: table.pax }).map((_, i) => {
                    const isCircle = table.type === 'circle';
                    if (isCircle) {
                      const deg = (i * 360) / table.pax;
                      return (
                        <div
                          key={i}
                          className={`absolute w-4 h-1.5 rounded-full shadow-sm ${table.status !== 'empty' ? 'bg-blue-300' : 'bg-gray-300'}`}
                          style={{ transform: `rotate(${deg}deg) translateY(-3.5rem)` }}
                        />
                      );
                    } else {
                      const edge = i % 4;
                      const countOnEdge = Math.floor((table.pax - 1 - edge) / 4) + 1;
                      const offsetIndex = Math.floor(i / 4) - (countOnEdge - 1) / 2;
                      const shift = offsetIndex * 24; // 24px spacing
                      return (
                        <div
                          key={i}
                          className={`absolute w-4 h-1.5 rounded-full shadow-sm ${table.status !== 'empty' ? 'bg-blue-300' : 'bg-gray-300'}`}
                          style={{ transform: `rotate(${edge * 90}deg) translateY(-3.5rem) translateX(${shift}px)` }}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Order Pad Modal */}
      {selectedTableForOrder && (
        <OrderPad
          table={selectedTableForOrder}
          onClose={() => setSelectedTableForOrder(null)}
        />
      )}

    </div>
  );
}
