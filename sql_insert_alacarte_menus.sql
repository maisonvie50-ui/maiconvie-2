-- ==========================================
-- SCRIPT CẬP NHẬT THỰC ĐƠN A LA CARTE (MÓN LẺ)
-- ==========================================

-- 1. Tạo các danh mục (Categories) cho thực đơn A La Carte
-- Sử dụng DO block để chèn và lấy lại ID của các danh mục

DO $$
DECLARE
    cid_soups_starters UUID;
    cid_meat UUID;
    cid_seafood UUID;
    cid_pasta_veg UUID;
    cid_desserts UUID;
    cid_beverages UUID;
    cid_degustation UUID;
BEGIN
    -- Xoá dữ liệu cũ nếu cần (Cảnh báo: Sẽ xoá toàn bộ menu_categories và menu_items hiện tại)
    -- DELETE FROM public.menu_items;
    -- DELETE FROM public.menu_categories;

    -- Tạo danh mục: SOUPS AND STARTERS
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('SOUPS AND STARTERS | CÁC MÓN SÚP VÀ KHAI VỊ', 10) RETURNING id INTO cid_soups_starters;
    
    -- Tạo danh mục: MEAT
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('MEAT | CÁC MÓN THỊT', 20) RETURNING id INTO cid_meat;

    -- Tạo danh mục: SEAFOOD
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('SEAFOOD | CÁC MÓN HẢI SẢN', 30) RETURNING id INTO cid_seafood;

    -- Tạo danh mục: PASTA & VEGETARIAN
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('PASTA & VEGETARIAN | MÌ VÀ MÓN CHAY', 40) RETURNING id INTO cid_pasta_veg;

    -- Tạo danh mục: DESSERTS
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('DESSERTS | CÁC MÓN TRÁNG MIỆNG', 50) RETURNING id INTO cid_desserts;

    -- Tạo danh mục: BEVERAGES
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('BEVERAGES | ĐỒ UỐNG', 60) RETURNING id INTO cid_beverages;

    -- Tạo danh mục: DÉGUSTATION SET MENU (Thực đơn thử vị)
    INSERT INTO public.menu_categories (name, sort_order) VALUES ('DÉGUSTATION SET MENU | THỰC ĐƠN THỬ VỊ', 70) RETURNING id INTO cid_degustation;


    -- ==========================================
    -- 2. Thêm các món ăn vào từng danh mục
    -- ==========================================

    -- === SOUPS AND STARTERS ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_soups_starters, 'Soupe à l''Oignon', 'French onion soup with organic Emmental cheese and organic butter. (Súp hành kiểu Pháp với phô mai Emmental hữu cơ nướng). Ingredients: Onions, organic Emmental cheese, beef broth, bread, organic butter, salt, pepper.', 155000, true, ARRAY['Soup']),
    (cid_soups_starters, 'Velouté de Potiron', 'Creamy pumpkin soup with nutmeg and organic butter. (Súp kem bí ngô với nhục đậu khấu). Ingredients: Pumpkin, cream, ginger, nutmeg, onion, garlic, organic butter, vegetable broth, salt, pepper.', 90000, true, ARRAY['Soup', 'Vegetarian']),
    (cid_soups_starters, 'Velouté de Champignons', 'Wild mushroom cream soup with organic extra virgin olive oil. (Súp kem nấm rừng hữu cơ với dầu ô liu hữu cơ). Ingredients: Wild mushrooms, potato cream, organic extra virgin olive oil, garlic, onion, chicken broth, salt, pepper.', 135000, true, ARRAY['Soup']),
    (cid_soups_starters, 'Escargots de Bourgogne', 'Burgundy snails with garlic butter. (Ốc sên nướng bơ tỏi kiểu Burgundy). Ingredients: Snails, garlic, butter, parsley, salt, pepper.', 220000, true, ARRAY['Starter']),
    (cid_soups_starters, 'Carpaccio de Thon', 'Tuna carpaccio with quail egg, caviar, organic extra virgin olive oil. (Cá ngừ carpaccio với trứng cút, caviar và dầu ô liu hữu cơ). Ingredients: Tuna, quail egg, organic extra virgin olive oil, lemon juice, salt, pepper, microgreens, fennel, arugula.', 290000, true, ARRAY['Starter', 'Seafood']),
    (cid_soups_starters, 'Foie gras poêlé au Calvados', 'Pan-seared foie gras with Calvados, brioche. (Gan ngỗng áp chảo với rượu Calvados). Ingredients: Foie gras, Calvados, brioche, apple, butter, salt, pepper.', 435000, true, ARRAY['Starter']),
    (cid_soups_starters, 'Salade de Homard et Mangue', 'Lobster salad with mango, avocado, and passion fruit dressing. (Xa lát tôm hùm với xoài, bơ và sốt chanh dây). Ingredients: Lobster, mango, avocado, passion fruit, mixed greens, organic extra virgin olive oil, salt, pepper.', 595000, true, ARRAY['Starter', 'Seafood', 'Salad']);

    -- === MEAT ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_meat, 'Filet de Buffle Vietnamien 150gr (Signature)', 'Vietnamese buffalo fillet with pink peppercorn sauce. (Thăn trâu Việt Nam với sốt tiêu hồng). Ingredients: Buffalo fillet, pink peppercorn, cream, organic butter, garlic, salt, pepper, seasonal vegetables.', 455000, true, ARRAY['Signature', 'Beef']),
    (cid_meat, 'Ribeye Wagyu MBS6+ (150gr)', 'Wagyu ribeye with truffle mushrooms sauce and potatoes. (Ribeye Wagyu với sốt nấm truffle và khoai tây). Ingredients: Wagyu ribeye, truffle oil, mushrooms, potatoes, seasonal vegetables, cream, garlic, salt, pepper.', 1295000, true, ARRAY['Premium', 'Beef']),
    (cid_meat, 'Filet de Bœuf AUS (150gr)', 'AUS beef tenderloin with green peppercorn sauce and mashed potatoes. (Thăn bò Úc với sốt tiêu xanh và khoai tây nghiền). Ingredients: AUS beef tenderloin, green peppercorn, seasonal vegetables, cream, organic butter, garlic, salt, pepper, potatoes.', 535000, true, ARRAY['Beef']),
    (cid_meat, 'Ribeye Black Angus (150gr)', 'Black Angus ribeye with Béarnaise sauce and potatoes. (Thăn nội bò Black Angus với sốt trứng lá thơm và khoai tây). Ingredients: Black Angus ribeye, seasonal vegetables, egg yolks, organic butter, white wine vinegar, shallots, tarragon, potatoes, salt, pepper.', 535000, true, ARRAY['Beef']),
    (cid_meat, 'Bœuf Wellington', 'Beef Wellington with Madeira sauce. (Bò Wellington với sốt rượu Madeira). Ingredients: Beef tenderloin, mushrooms, seasonal vegetables, puff pastry, prosciutto, mustard, Madeira, salt, pepper.', 595000, true, ARRAY['Beef', 'Classic']),
    (cid_meat, 'Bœuf Bourguignon', 'Burgundy-style beef stew with red wine, with organic noodles and mushrooms. (Bò hầm rượu vang đỏ kiểu Burgundy với mỳ dẹt hữu cơ kèm nấm). Ingredients: Beef, red wine, mushrooms, pearl onions, bacon, garlic, organic tagliatelle, organic butter, salt, pepper, thyme, bay leaf.', 395000, true, ARRAY['Beef', 'Stew']),
    (cid_meat, 'Poulet Provençal', 'Chicken à la Provençale with mashed potatoes. (Gà nấu kiểu Provence với cà chua, ô liu, thảo mộc, phục vụ kèm khoai nghiền). Ingredients: Chicken thigh, seasonal vegetables, tomatoes, olives, herbs, potatoes, organic butter, garlic, salt, pepper.', 395000, true, ARRAY['Chicken']),
    (cid_meat, 'Magret de Canard aux Mûres', 'Seared French duck breast with blackberry sauce and vegetables. (Lườn vịt Pháp áp chảo với sốt mâm xôi và rau củ). Ingredients: French duck breast, blackberries, honey, carrots, sprouts, organic butter, garlic, salt, pepper.', 455000, true, ARRAY['Duck']),
    (cid_meat, 'Carré d’Agneau aux Herbes de Provence (3 chops)', 'Herb-crusted AUS lamb rack with organic extra virgin olive oil and asparagus. (Sườn cừu Úc nướng thảo mộc Provence và măng tây). Ingredients: Lamb rack, rosemary, thyme, garlic, asparagus, organic extra virgin olive oil, salt, pepper.', 595000, true, ARRAY['Lamb']),
    (cid_meat, 'Souris d''Agneau aux haricots blancs', 'Braised AUS lamb shank with white broad beans. (Cẳng cừu non Úc hầm với đậu cassoulet). Ingredients: AUS lamb shank, white beans, tomatoes, garlic, onions, olive oil, thyme, bay leaves, salt, pepper.', 495000, true, ARRAY['Lamb', 'Stew']),
    (cid_meat, 'Filet de Porc aux Pommes (Iberico 150gr)', 'Roast Iberico pork tenderloin with apple Calvados sauce and sweet potatoes. (Thăn heo Iberico nướng với sốt táo Calvados và khoai lang nghiền). Ingredients: Iberico pork tenderloin, apples, seasonal vegetables, Calvados, organic butter, sweet potatoes, garlic, cream, salt, pepper.', 495000, true, ARRAY['Pork', 'Iberico']);

    -- === SEAFOOD ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_seafood, 'Saint-Jacques au Beurre Blanc', 'Seared Japanese scallops with beurre blanc and caviar. (Sò điệp Nhật áp chảo với bơ trắng và trứng cá). Ingredients: Scallops, seasonal vegetables, butter, white wine, caviar, shallots, lemon, cream, salt, pepper.', 695000, true, ARRAY['Seafood', 'Scallop']),
    (cid_seafood, 'Saumon Poché au Vin Mousseux avec Caviar', 'Sparkling wine poached Norwegian salmon with caviar. (Cá hồi Nauy xông hơi trong rượu vang sủi với trứng cá caviar). Ingredients: Salmon fillet, fish broth, sparkling wine, seasonal vegetables, shallots, organic butter, caviar, lemon zest, herbs, olive oil, salt, pepper.', 435000, true, ARRAY['Seafood', 'Salmon']),
    (cid_seafood, 'Black Cod Miso', 'Miso-marinated black cod with asparagus and broccoli. (Cá tuyết đen ướp miso nướng với măng tây và bông cải xanh). Ingredients: Black cod, miso paste, mirin, sake, asparagus, broccoli, soy sauce, sesame oil, salt, pepper.', 695000, true, ARRAY['Seafood', 'Fish']);

    -- === PASTA & VEGETARIAN ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_pasta_veg, 'Pâtes aux Sauces au Choix', 'Organic spaghetti, tagliatelle, or penne with your choice of Bolognese, Carbonara, or Gorgonzola sauce. (Mì hữu cơ Spaghettis, Tagliatelles, hoặc Pennes với các loại sốt). Ingredients: Organic pasta, ground beef (Bolognese), bacon and eggs (Carbonara), Gorgonzola cheese, tomatoes, cream, garlic, olive oil, herbs, salt, pepper.', 210000, true, ARRAY['Pasta']),
    (cid_pasta_veg, 'Aubergine Farcie aux Lentilles (Vegetarian)', 'Oven-baked stuffed eggplant with lentils and ratatouille. (Cà tím nhồi đậu lăng và rau củ kiểu Ratatouille). Ingredients: Eggplant, lentils, tomatoes, zucchini, carrots, peppers, onions, garlic, organic extra virgin olive oil, salt, pepper.', 200000, true, ARRAY['Vegetarian']),
    (cid_pasta_veg, 'Napoléon de Légumes Grillés (Vegetarian)', 'Grilled vegetable Napoleon with red pepper coulis. (Rau củ nướng với sốt ớt đỏ). Ingredients: Zucchini, eggplant, bell peppers, tomatoes, red pepper coulis, organic extra virgin olive oil, salt, pepper.', 200000, true, ARRAY['Vegetarian']);

    -- === DESSERTS ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_desserts, 'Crème Brûlée à la Vanille', 'Madagascar vanilla crème brûlée with vanilla. (Bánh flan đốt đường đỏ)', 135000, true, ARRAY['Dessert']),
    (cid_desserts, 'Mousse au Chocolat', 'Chocolate mousse with organic dark cocoa. (Mousse sô-cô-la hữu cơ)', 125000, true, ARRAY['Dessert', 'Chocolate']),
    (cid_desserts, 'Soufflé au Grand Marnier', 'Grand Marnier soufflé with vanilla ice cream. (Bánh soufflé Grand Marnier với kem vani)', 235000, true, ARRAY['Dessert']),
    (cid_desserts, 'Tarte Tatin aux Pommes', 'Caramelized apple tart and vanilla ice cream. (Bánh táo úp ngược với táo và kem vani)', 155000, true, ARRAY['Dessert']),
    (cid_desserts, 'Profiteroles au Chocolat', 'Cream puffs with vanilla ice cream and chocolate sauce. (Bánh su kem nhân kem vani, phủ sốt sô-cô-la)', 155000, true, ARRAY['Dessert', 'Chocolate']),
    (cid_desserts, 'Assortiment de Fromages', 'Selection of French cheeses with cinnamon bread. (Tuyển chọn phô mai Pháp 3 loại với bánh mì quế)', 390000, true, ARRAY['Cheese']),
    (cid_desserts, 'Assiette de Fruits Frais', 'Plate of seasonal fresh fruits. (Đĩa trái cây tươi theo mùa)', 195000, true, ARRAY['Fruit', 'Dessert']);

    -- === BEVERAGES ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_beverages, 'Campari / Ricard / Porto / Martini Rosso, Bianco, Dry', 'APÉRITIF / LIQUEUR', 90000, true, ARRAY['Beverage', 'Aperitif']),
    (cid_beverages, 'Cointreau / Bailey’s / Grand Marnier', 'APÉRITIF / LIQUEUR', 100000, true, ARRAY['Beverage', 'Liqueur']),
    (cid_beverages, 'Gordon’s Gin / Russian Vodka / Bacardi white', 'SPIRITS', 90000, true, ARRAY['Beverage', 'Spirits']),
    (cid_beverages, 'Chivas Regal / Johnnie Walker red label', 'SPIRITS', 110000, true, ARRAY['Beverage', 'Spirits', 'Whisky']),
    (cid_beverages, 'Hennessy V.S.O.P / Remy Martin V.S.O.P', 'BRANDY – EAU DE VIE', 160000, true, ARRAY['Beverage', 'Brandy']),
    (cid_beverages, 'Hennessy X.O / Armagnac', 'BRANDY – EAU DE VIE', 220000, true, ARRAY['Beverage', 'Brandy']),
    (cid_beverages, 'Framboise / Poire William', 'BRANDY – EAU DE VIE', 220000, true, ARRAY['Beverage', 'Eau de Vie']),
    (cid_beverages, 'Sapporo draught (glass 33cl)', 'BEERS', 45000, true, ARRAY['Beverage', 'Beer']),
    (cid_beverages, 'Hanoi / Saigon / 333 (33cl)', 'BEERS', 30000, true, ARRAY['Beverage', 'Beer']),
    (cid_beverages, 'Tiger / Heineken (33cl)', 'BEERS', 45000, true, ARRAY['Beverage', 'Beer']),
    (cid_beverages, 'Leffe Blond | Belgium (33cl)', 'BEERS', 90000, true, ARRAY['Beverage', 'Beer']),
    (cid_beverages, 'Coke / Soda / Tonic / Sprite / Diet Coke', 'SOFT DRINK', 30000, true, ARRAY['Beverage', 'Soft Drink']),
    (cid_beverages, 'Maison Vie mineral water (0,5L)', 'SOFT DRINK', 20000, true, ARRAY['Beverage', 'Water']),
    (cid_beverages, 'La Vie, mineral water (1,5 L)', 'SOFT DRINK', 40000, true, ARRAY['Beverage', 'Water']),
    (cid_beverages, 'Perrier, Sparkling water (0.25L | France)', 'SOFT DRINK', 85000, true, ARRAY['Beverage', 'Water', 'Sparkling']),
    (cid_beverages, 'S.Pellegrino, Sparkling water (0.5L | Italy)', 'SOFT DRINK', 125000, true, ARRAY['Beverage', 'Water', 'Sparkling']),
    (cid_beverages, 'Orange / Mango / Pomelo / Pineapple Juice', 'FRESH FRUIT JUICE', 100000, true, ARRAY['Beverage', 'Juice']),
    (cid_beverages, 'Lemon / Water melon / Passion Juice', 'FRESH FRUIT JUICE', 60000, true, ARRAY['Beverage', 'Juice']),
    (cid_beverages, 'Kombucha Dragon fruit / Peach', 'FRESH FRUIT JUICE', 90000, true, ARRAY['Beverage', 'Kombucha']),
    (cid_beverages, 'Gin & Tonic / Whiskey & Soda or Coke', 'MIXED DRINK', 125000, true, ARRAY['Beverage', 'Mixed Drink']),
    (cid_beverages, 'Campari & Orange Juice / Campari & Soda', 'MIXED DRINK', 125000, true, ARRAY['Beverage', 'Mixed Drink']),
    (cid_beverages, 'Sangria / Pina Colada / Margarita / Whisky Sour', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_beverages, 'Long Island Iced Tea / Singapore Sling / Daiquiri', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_beverages, 'Black Russian / Tequila Sunrise / Tom Collins', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_beverages, 'Frontera, Concha Y Toro | Cabernet Sauvignon | Chile', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'Red Wine']),
    (cid_beverages, 'Chantecaille, Bordeaux | Merlot & Cabernet Sauvignon Blend | France', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'Red Wine']),
    (cid_beverages, 'Frontera, Concha Y Toro | Sauvignon Blanc | Chile', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'White Wine']),
    (cid_beverages, 'Chantecaille, Bordeaux | Sauvignon Blanc & Semillon Blend | France', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'White Wine']),
    (cid_beverages, 'Dufouleur Monopole | Maison Dufouleur Père et Fils - Rose | France', 'WINE BY GLASS', 150000, true, ARRAY['Beverage', 'Wine', 'Rose Wine']),
    (cid_beverages, 'Pierre Larousse | Chardonnay, Sparking | France', 'WINE BY GLASS', 255000, true, ARRAY['Beverage', 'Wine', 'Sparkling Wine']),
    (cid_beverages, 'Dalat Vietnam | Mixed Grape, Red - White', 'WINE BY GLASS', 80000, true, ARRAY['Beverage', 'Wine']),
    (cid_beverages, 'Oolong tea (Small Pot)', 'TEA – COFFEE', 40000, true, ARRAY['Beverage', 'Tea']),
    (cid_beverages, 'Earl grey tea', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Tea']),
    (cid_beverages, 'Vietnamese tea / Vietnamese ice tea', 'TEA – COFFEE', 25000, true, ARRAY['Beverage', 'Tea']),
    (cid_beverages, 'Lipton tea / Ice Lipton Tea', 'TEA – COFFEE', 35000, true, ARRAY['Beverage', 'Tea']),
    (cid_beverages, 'Espresso single / Latte', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Coffee']),
    (cid_beverages, 'Americano / Cappuccino', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Coffee']),
    (cid_beverages, 'Regular coffee / Ice coffee', 'TEA – COFFEE', 35000, true, ARRAY['Beverage', 'Coffee']);


    -- === DÉGUSTATION SET MENU ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_degustation, 'MENU DÉGUSTATION (2 À 4 PLATS)', '4 Plats | 4 Courses | 4 Món. Bao gồm 1 Khai vị, 1 Súp, 1 Món chính, 1 Tráng miệng chọn từ danh sách riêng.', 550000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'Entrée | Starter (Option)', 'Lựa chọn món khai vị trong Set 4 món', 165000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'Soupe | Soup (Option)', 'Lựa chọn món súp trong Set 4 món', 90000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'Plat Principal | Main course (Option)', 'Lựa chọn món chính trong Set 4 món', 200000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'Dessert (Option)', 'Lựa chọn món tráng miệng trong Set 4 món', 105000, true, ARRAY['Set Menu', 'Degustation']),
    
    (cid_degustation, 'MENU DÉGUSTATION (4 À 7 PLATS) - 7 Courses', '7 Plats | 7 Courses | 7 Món', 1199000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Appetizer, Soup, Fish, Meat, Dessert', '5 Courses', 1125000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Soup, Fish, Meat, Dessert', '4 Courses', 915000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Amuse-Bouche, Appetizer, Soup, Fish, Dessert', '5 Courses', 860000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Amuse-Bouche, Appetizer, Soup, Meat, Dessert', '5 Courses', 880000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Amuse-Bouche, Fish, Meat, Dessert', '4 Courses', 880000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Amuse-Bouche, Soup, Fish, Dessert', '4 Courses', 650000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_degustation, 'MENU DÉGUSTATION - Appetizer, Soup, Meat, Dessert', '4 Courses', 795000, true, ARRAY['Set Menu', 'Degustation']);

END $$;
