[33m2aa7590[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m chore: sync VPS changes - htaccess, serve.cjs, assets, package updates
A	.htaccess
A	assets/assets/index-CNr2fff1.js
A	assets/assets/index-CW6zZhII.css
A	assets/index-CW6zZhII.css
A	assets/index-Dla28FZ6.js
A	assets/index-drSZ6MzT.js
A	assets/logo-BVs7cM78.jpg
A	assets/logo-CG0f40Ss.jpg
M	dist/index.html
M	package-lock.json
M	package.json
A	serve.cjs
[33m8688a50[m fix: tach email va bookingCode ra cot rieng, cap nhat 15 cot moi cho Google Sheets sync
M	GoogleAppsScript.js
M	api/booking-sync.ts
[33m3622d72[m fix: add htaccess for apache/spanel routing
A	public/.htaccess
[33m987c03e[m fix: production crash white screen due to missing fallback
M	src/lib/supabase-admin.ts
[33md4e8b10[m update: Phase 1-3 - database integration, capacity warnings, staff performance
D	dist/assets/index-CW6zZhII.css
D	dist/assets/index-drSZ6MzT.js
M	dist/index.html
A	sql_phase12_zones_hall.sql
A	sql_phase3_staff_performance.sql
A	sql_phase3_step1.sql
A	sql_phase3_step2.sql
M	src/components/analytics/AdvancedAnalytics.tsx
M	src/components/booking/BookingKanban.tsx
M	src/components/booking/PublicBookingForm.tsx
M	src/components/mobile/MobileCaptainApp.tsx
M	src/components/restaurant-map/RestaurantMap.tsx
M	src/components/settings/Settings.tsx
M	src/components/training/TrainingPortal.tsx
M	src/services/orderService.ts
M	src/services/reportingService.ts
M	src/services/tableService.ts
M	src/services/trainingService.ts
A	tsc_output.txt
[33m309c390[m feat: add table overbooking prevention - block double-booking same table within 120min window
M	server.ts
M	src/components/booking/BookingKanban.tsx
M	src/components/settings/Settings.tsx
M	src/services/bookingService.ts
[33mec0e153[m chore: update Khach Tour to Khach Doan
M	src/assets/logo.jpg
M	src/components/booking/BookingKanban.tsx
M	src/components/booking/PublicBookingForm.tsx
[33mf4b9efe[m deploy: add pre-built dist with correct Supabase URL
A	dist/assets/index-CW6zZhII.css
A	dist/assets/index-drSZ6MzT.js
A	dist/assets/logo-BVs7cM78.jpg
A	dist/index.html
[33m84bb51d[m fix: hardcode Supabase URL fallback for server deployment
M	src/lib/supabase.ts
[33m2c77961[m feat: add real logo, webhook notification service, enrich booking webhook data
A	api/notify.ts
A	src/assets/logo.jpg
M	src/components/auth/Login.tsx
M	src/components/layout/Sidebar.tsx
A	src/components/settings/NotificationSettings.tsx
M	src/components/settings/Settings.tsx
A	src/services/bookingNotifyService.ts
M	src/services/bookingService.ts
[33mc71679c[m fix(booking): restore missing vietnamese translations
M	src/components/auth/Login.tsx
M	src/components/mobile/MobileCaptainApp.tsx
[33me8ade8d[m feat(booking): add language switcher (VN/EN) to online booking page
M	src/components/booking/PublicBookingForm.tsx
[33m31858eb[m fix: retrieve logged-in user name dynamically in Sidebar and Header
M	src/components/layout/Header.tsx
M	src/components/layout/Sidebar.tsx
[33m31e5509[m fix: allow all employee roles to access training page
M	src/App.tsx
[33mf3a8c74[m feat: restore evaluation approval UI with stats cards, direct evaluation, and timeline history
M	src/components/settings/Settings.tsx
M	src/components/training/TrainingPortal.tsx
M	src/services/trainingService.ts
[33ma32610a[m chore: sync package-lock.json after reinstalling dependencies
M	package-lock.json
[33m6dd48cd[m merge: resolve conflicts with remote, keep latest remote changes
[33m41cc0e5[m chore: sync latest changes - kitchen display, header, orderService
A	.agents/workflows/accessibility.md
A	.agents/workflows/audit.md
A	.agents/workflows/code-review.md
A	.agents/workflows/database.md
A	.agents/workflows/debug.md
A	.agents/workflows/deploy.md
A	.agents/workflows/docs.md
A	.agents/workflows/find-bugs.md
A	.agents/workflows/git-push.md
A	.agents/workflows/performance.md
A	.agents/workflows/plan.md
A	.agents/workflows/refactor.md
A	.agents/workflows/security.md
A	.agents/workflows/seo.md
A	.agents/workflows/test.md
A	.agents/workflows/ui-upgrade.md
M	src/components/kitchen/KitchenDisplay.tsx
M	src/components/layout/Header.tsx
M	src/components/restaurant-map/OrderPad.tsx
A	src/services/orderService.ts
[33m7aec0a1[m feat: remove mock login, authenticate via employees database
M	src/components/auth/Login.tsx
M	src/hooks/useAuth.tsx
[33mf870a04[m fix: video progress now persists to database correctly
M	src/components/training/TrainingPortal.tsx
M	src/services/trainingService.ts
