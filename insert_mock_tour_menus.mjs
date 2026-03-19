import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const envFile = fs.readFileSync('.env', 'utf-8');
const envObj = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envObj[key.trim()] = value.trim();
});

const supabaseUrl = envObj['VITE_SUPABASE_URL'];
const supabaseAnonKey = envObj['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addMockData() {
    const mockData = [
        {
            name: 'SET LỮ HÀNH TIÊU CHUẨN 1',
            price: 350000,
            net_price: 280000,
            foc_policy: '15 FOC 1 (Nội bộ)',
            company_tags: ['Vietravel', 'Saigontourist'],
            status: 'available',
            included_drink: 'Trà đá, Khăn lạnh',
            courses: [
                { "title": "Khai vị", "options": [{ "id": "opt1", "nameVn": "Nộm ngó sen tôm thịt", "nameEn": "Lotus stem salad with shrimp and pork" }] },
                { "title": "Món chính", "options": [{ "id": "opt2", "nameVn": "Gà nướng ngũ vị", "nameEn": "Five-spice roasted chicken" }, { "id": "opt3", "nameVn": "Cá diêu hồng kho tộ", "nameEn": "Braised red tilapia in clay pot" }] },
                { "title": "Rau & Canh", "options": [{ "id": "opt3", "nameVn": "Cải xanh xào tỏi", "nameEn": "Stir-fried mustard greens with garlic" }, { "id": "opt4", "nameVn": "Canh chua ngao", "nameEn": "Clam sour soup" }] },
                { "title": "Tráng miệng", "options": [{ "id": "opt5", "nameVn": "Trái cây theo mùa", "nameEn": "Seasonal fruits" }] }
            ]
        },
        {
            name: 'SET LỮ HÀNH CAO CẤP VIP',
            price: 750000,
            net_price: 550000,
            foc_policy: '10 FOC 1 (HDV + Lái xe)',
            company_tags: ['BenThanh Tourist', 'Fiditour', 'Hanoitourist'],
            status: 'available',
            included_drink: 'Rượu vang đỏ (1 ly/pax), Trái cây tươi',
            courses: [
                { "title": "Khai vị", "options": [{ "id": "opt1", "nameVn": "Súp bào ngư hải sản", "nameEn": "Abalone and seafood soup" }] },
                { "title": "Món chính", "options": [{ "id": "opt2", "nameVn": "Bò phi lê sốt tiêu đen", "nameEn": "Beef fillet with black pepper sauce" }, { "id": "opt3", "nameVn": "Tôm hùm nướng phô mai (nửa con)", "nameEn": "Grilled half lobster with cheese" }] },
                { "title": "Đồ ăn kèm", "options": [{ "id": "opt4", "nameVn": "Măng tây xào bơ tỏi", "nameEn": "Stir-fried asparagus with garlic butter" }, { "id": "opt5", "nameVn": "Cơm chiên hải sản trứng muối", "nameEn": "Seafood fried rice with salted egg" }] },
                { "title": "Tráng miệng", "options": [{ "id": "opt6", "nameVn": "Bánh Tiramisu", "nameEn": "Tiramisu cake" }] }
            ]
        }
    ];

    const { data, error } = await supabase
        .from('tour_menus')
        .insert(mockData);

    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Inserted successfully!');
    }
}

addMockData();
