import type { Table, VipRoom, FloorZone } from '../types';

export const level1Tables: Table[] = [
    { id: 'T1', name: 'Bàn 1', type: 'square', status: 'occupied', pax: 4, floor: 1, customerName: 'Nguyễn Văn A', duration: '45p', notes: 'Khách quen', x: 200, y: 150 },
    { id: 'T2', name: 'Bàn 2', type: 'square', status: 'empty', pax: 4, floor: 1, x: 200, y: 250 },
    { id: 'T3', name: 'Bàn 3', type: 'square', status: 'reserved', pax: 6, floor: 1, customerName: 'Trần Thị B', time: '19:00', notes: 'Sinh nhật', x: 300, y: 150 },
    { id: 'T4', name: 'Bàn 4', type: 'square', status: 'empty', pax: 4, floor: 1, x: 400, y: 150 },
    { id: 'T5', name: 'Bàn 5', type: 'square', status: 'occupied', pax: 4, floor: 1, customerName: 'Lê Văn C', duration: '1h 10p', x: 400, y: 250 },
    { id: 'T6', name: 'Bàn 6', type: 'circle', status: 'empty', pax: 4, floor: 1, x: 500, y: 150 },
    { id: 'T7', name: 'Bàn 7', type: 'circle', status: 'reserved', pax: 6, floor: 1, customerName: 'Công ty XYZ', time: '18:30', notes: 'Cần ghế trẻ em', x: 500, y: 250 },
    { id: 'T8', name: 'Bàn 8', type: 'circle', status: 'empty', pax: 4, floor: 1, x: 600, y: 150 },
    { id: 'T9', name: 'Bàn 9', type: 'square', status: 'empty', pax: 4, floor: 1, x: 700, y: 150 },
    { id: 'T10', name: 'Bàn 10', type: 'square', status: 'occupied', pax: 4, floor: 1, customerName: 'Phạm Văn D', duration: '20p', x: 700, y: 250 },
    { id: 'T11', name: 'Bàn 11', type: 'circle', status: 'empty', pax: 6, floor: 1, x: 800, y: 150 },
    { id: 'T12', name: 'Bàn 12', type: 'square', status: 'empty', pax: 4, floor: 1, x: 800, y: 250 },
    { id: 'T13', name: 'Bàn 13', type: 'circle', status: 'empty', pax: 10, floor: 1, x: 900, y: 200 },
];

export const vipRooms: VipRoom[] = [
    { id: 'V1', name: 'Room 1', capacity: 22, status: 'empty' },
    { id: 'V2', name: 'Room 2', capacity: 11, status: 'in-use', customerName: 'Nguyễn Sếp', time: '18:00', notes: 'Rượu vang riêng' },
    { id: 'V3', name: 'Room 3', capacity: 11, status: 'empty' },
    { id: 'V4', name: 'Room 4', capacity: 4, status: 'in-use', customerName: 'Đoàn khách Nhật', time: '17:30' },
];

export const level3Tables: Table[] = Array.from({ length: 17 }, (_, i) => ({
    id: `L3-T${i + 1}`,
    name: `Table ${i + 1}`,
    type: 'circle',
    status: i % 4 === 0 ? 'occupied' : i % 5 === 0 ? 'reserved' : 'empty', // Random statuses for preview
    pax: i < 2 ? 9 : 8, // T1, T2 have 9 pax, rest have 8
    floor: 3,
    customerName: i % 4 === 0 ? `Khách sảnh ${i + 1}` : undefined,
    duration: i % 4 === 0 ? '1h 30p' : undefined,
    time: i % 5 === 0 ? '18:00' : undefined,
}));

export const floorZones: FloorZone[] = [
    { id: 'Z1', name: 'Wine Corner', floor: 1, type: 'wine', x: '15%', y: '10%' },
    { id: 'Z2', name: 'Balcony', floor: 1, type: 'waiting', x: '85%', y: '10%' },
    { id: 'Z3', name: 'Staff Station', floor: 1, type: 'staff', x: '15%', y: '90%' },
    { id: 'Z4', name: 'Main Door', floor: 1, type: 'door', x: '85%', y: '90%' },
    { id: 'Z5', name: 'Kitchen Area', floor: 2, type: 'kitchen', x: '15%', y: '20%' },
    { id: 'Z6', name: 'Bar Area', floor: 2, type: 'bar', x: '85%', y: '20%' },
    { id: 'Z7', name: 'Waiting Chair & Smoking', floor: 2, type: 'waiting', x: '50%', y: '80%' },
];

// Fallback for previous code
export const eventHall = [
    { id: 'E1', name: 'Sảnh A', capacity: 70, status: 'empty' as const },
    { id: 'E2', name: 'Sảnh B', capacity: 70, status: 'reserved' as const, customerName: 'Tiệc cưới', time: '11:00' },
];
