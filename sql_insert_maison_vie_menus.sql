-- Xoá các menu cũ (nếu muốn làm mới hoàn toàn)
-- DELETE FROM public.tour_menus;

INSERT INTO public.tour_menus (name, price, net_price, foc_policy, company_tags, status, included_drink, courses)
VALUES
(
  'STANDARD MENU 350K',
  350000,
  350000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà hoặc Cà Phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp khoai tây và tỏi tây", "nameEn": "POTAGE PARMENTIER"}]
    },
    {
      "title": "TWO | MAIN-COURSE",
      "options": [
        {"id": "m1", "nameVn": "Phi lê cá basa chiên bia, khoai môn chiên giòn, sốt đầu bếp", "nameEn": "BASA FISH FILLET"},
        {"id": "m2", "nameVn": "Đùi gà rút xương nhồi nấm và rau xốt tiêu tươi vang đỏ kèm khoai", "nameEn": "STUFFED CHICKEN"}
      ]
    },
    {
      "title": "THREE | DESSERT",
      "options": [{"id": "d1", "nameVn": "Bánh Tart nhân trái cây theo mùa kèm kem", "nameEn": "FRUIT TART"}]
    }
  ]'::jsonb
),
(
  'STANDARD MENU 430K',
  430000,
  430000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà mạn hoặc cà phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | STARTER",
      "options": [{"id": "st1", "nameVn": "Gà viên phomai chảy, sốt tương ớt Hà Nội", "nameEn": "CHEESE CROQUETTE"}]
    },
    {
      "title": "TWO | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp cà rốt nướng vị gừng dùng kèm bánh mỳ và gà nướng", "nameEn": "CARROT SOUP"}]
    },
    {
      "title": "THREE | MAIN-COURSE",
      "options": [
        {"id": "m1", "nameVn": "Thịt lợn hầm kiểu Geneva, kèm rau củ theo mùa", "nameEn": "PORK GENEVA"},
        {"id": "m2", "nameVn": "Gà cuộn nấu chậm nướng, dùng kèm sốt miso", "nameEn": "SLOW-COOKED CHICKEN"}
      ]
    },
    {
      "title": "FOUR | DESSERT",
      "options": [{"id": "d1", "nameVn": "Bánh tart chanh kèm kem", "nameEn": "LIME MERINGUE TART"}]
    }
  ]'::jsonb
),
(
  'STANDARD MENU 550K',
  550000,
  550000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà hoặc Cà Phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | STARTER",
      "options": [{"id": "st1", "nameVn": "Salad củ dền trộn cùng cá hồi và sốt húng quế Hà Nội", "nameEn": "SALMON BEET TARTAR"}]
    },
    {
      "title": "TWO | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp kem nấm cùng bánh mỳ giòn nướng tỏi", "nameEn": "MUSHROOM SOUP"}]
    },
    {
      "title": "THREE | MAIN-COURSE",
      "options": [
        {"id": "m1", "nameVn": "Ức vịt áp chảo dùng kèm rau củ và sốt gừng", "nameEn": "DUCK BREAST"},
        {"id": "m2", "nameVn": "Má bò hầm vang, rau củ Đà Lạt và bắp nghiền", "nameEn": "SLOW-COOKED BEEF"}
      ]
    },
    {
      "title": "FOUR | DESSERT",
      "options": [{"id": "d1", "nameVn": "Bánh tart xoài kèm kem", "nameEn": "MANGO TART"}]
    }
  ]'::jsonb
),
(
  'STANDARD MENU 720K',
  720000,
  720000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà hoặc Cà Phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | STARTER",
      "options": [{"id": "st1", "nameVn": "Salad khoai tây hoàng gia, cá hồi dùng kèm sốt mè", "nameEn": "POTATO AND SALMON SALAD"}]
    },
    {
      "title": "TWO | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp hành tây với pho mát và bánh mì nướng", "nameEn": "ONION SOUP"}]
    },
    {
      "title": "THREE | MAIN-COURSE",
      "options": [
        {"id": "m1", "nameVn": "Thăn nội bò New Zealand nướng dùng kèm rau củ xào và sốt rau thơm", "nameEn": "NEW ZEALAND RIBEYE STEAK (150 gram)"},
        {"id": "m2", "nameVn": "Cá vược áp chảo dùng kèm rau củ chua và sốt me", "nameEn": "PAN FRIED SEABASS (150 gram)"}
      ]
    },
    {
      "title": "FOUR | DESSERT",
      "options": [{"id": "d1", "nameVn": "Bánh tart táo với kem vani", "nameEn": "APPLE TART"}]
    }
  ]'::jsonb
),
(
  'DELUXE MENU 950K',
  950000,
  950000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà mạn hoặc cà phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | APPETIZER",
      "options": [{"id": "a1", "nameVn": "Cá ngừ cháy cạnh dùng kèm salad xoài cay", "nameEn": "SEARED AHI TUNA"}]
    },
    {
      "title": "TWO | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp hoa artichoke dùng kèm bánh mỳ giòn", "nameEn": "ARTICHOKE SOUP"}]
    },
    {
      "title": "THREE | FISH",
      "options": [{"id": "f1", "nameVn": "Cá hồi Nauy áp chảo, sốt húng quế Hà Nội", "nameEn": "NORWAY SALMON (100 gram)"}]
    },
    {
      "title": "FOUR | MEAT",
      "options": [{"id": "m1", "nameVn": "Thăn nội bò Úc nướng dùng kèm rau củ xào và sốt tiêu hồng", "nameEn": "AUSTRALIAN RIBEYE STEAK (120 gram)"}]
    },
    {
      "title": "FIVE | DESSERT",
      "options": [{"id": "d1", "nameVn": "Bánh phồng nhân kem vani phủ sô cô la", "nameEn": "PROFITEROLES"}]
    }
  ]'::jsonb
),
(
  'DELUXE MENU 1,200K',
  1200000,
  1200000,
  '', 
  ARRAY[]::TEXT[],
  'available',
  'Trà mạn hoặc cà phê Việt sau tráng miệng',
  '[
    {
      "title": "ONE | APPETIZER",
      "options": [{"id": "a1", "nameVn": "Salad hạt diêm mạch trái bơ và sốt cam vàng", "nameEn": "QUINOA SALAD"}]
    },
    {
      "title": "TWO | SOUP",
      "options": [{"id": "s1", "nameVn": "Súp bông artichoke dùng kèm sò điệp áp chảo", "nameEn": "ARTICHOKE SCALLOPS SOUP"}]
    },
    {
      "title": "THREE | SEAFOOD",
      "options": [{"id": "sf1", "nameVn": "Bạch tuộc hầm mềm, khoai tây Đà Lạt, sốt rau thơm", "nameEn": "SLOW-COOKED OCTOPUS (80 gram)"}]
    },
    {
      "title": "FOUR | MEAT",
      "options": [{"id": "m1", "nameVn": "Bò tender nướng than, rau củ Đà Lạt xào thảo mộc, sốt hương vanilla", "nameEn": "BEEF TENDERLOIN (120 gram)"}]
    },
    {
      "title": "FIVE | DESSERT",
      "options": [{"id": "d1", "nameVn": "Ravioli xoài với sữa dừa", "nameEn": "MANGO RAVIOLI"}]
    }
  ]'::jsonb
);
