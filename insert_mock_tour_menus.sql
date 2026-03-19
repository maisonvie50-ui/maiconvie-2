-- Insert mock data for "Thực đơn lữ hành" (Tour Menus)
INSERT INTO public.tour_menus (name, price, net_price, foc_policy, company_tags, status, included_drink, courses)
VALUES
(
  'SET LỮ HÀNH TIÊU CHUẨN 1',
  350000,
  280000,
  '15 FOC 1 (Nội bộ)',
  ARRAY['Vietravel', 'Saigontourist'],
  'available',
  'Trà đá, Khăn lạnh',
  '[
    {"title": "Khai vị", "options": [{"id": "opt1", "nameVn": "Nộm ngó sen tôm thịt", "nameEn": "Lotus stem salad with shrimp and pork"}]},
    {"title": "Món chính", "options": [{"id": "opt2", "nameVn": "Gà nướng ngũ vị", "nameEn": "Five-spice roasted chicken"}, {"id": "opt3", "nameVn": "Cá diêu hồng kho tộ", "nameEn": "Braised red tilapia in clay pot"}]},
    {"title": "Rau & Canh", "options": [{"id": "opt3", "nameVn": "Cải xanh xào tỏi", "nameEn": "Stir-fried mustard greens with garlic"}, {"id": "opt4", "nameVn": "Canh chua ngao", "nameEn": "Clam sour soup"}]},
    {"title": "Tráng miệng", "options": [{"id": "opt5", "nameVn": "Trái cây theo mùa", "nameEn": "Seasonal fruits"}]}
  ]'::jsonb
),
(
  'SET LỮ HÀNH CAO CẤP VIP',
  750000,
  550000,
  '10 FOC 1 (HDV + Lái xe)',
  ARRAY['BenThanh Tourist', 'Fiditour', 'Hanoitourist'],
  'available',
  'Rượu vang đỏ (1 ly/pax), Trái cây tươi',
  '[
    {"title": "Khai vị", "options": [{"id": "opt1", "nameVn": "Súp bào ngư hải sản", "nameEn": "Abalone and seafood soup"}]},
    {"title": "Món chính", "options": [{"id": "opt2", "nameVn": "Bò phi lê sốt tiêu đen", "nameEn": "Beef fillet with black pepper sauce"}, {"id": "opt3", "nameVn": "Tôm hùm nướng phô mai (nửa con)", "nameEn": "Grilled half lobster with cheese"}]},
    {"title": "Đồ ăn kèm", "options": [{"id": "opt4", "nameVn": "Măng tây xào bơ tỏi", "nameEn": "Stir-fried asparagus with garlic butter"}, {"id": "opt5", "nameVn": "Cơm chiên hải sản trứng muối", "nameEn": "Seafood fried rice with salted egg"}]},
    {"title": "Tráng miệng", "options": [{"id": "opt6", "nameVn": "Bánh Tiramisu", "nameEn": "Tiramisu cake"}]}
  ]'::jsonb
);
