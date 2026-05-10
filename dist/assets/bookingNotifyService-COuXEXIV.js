import{s as y}from"./index-DnPpWoOK.js";import{s as w}from"./settingsService-C-aYDers.js";const q={async getTables(){const{data:t,error:e}=await y.from("tables").select("*").order("name");if(e)throw console.error("Error fetching tables:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,type:n.type,status:n.status,pax:n.pax,floor:n.floor,x:n.x||0,y:n.y||0,customerName:n.customer_name,time:n.time,duration:n.duration,notes:n.notes,bookingId:n.booking_id}))},async getFloorZones(){const{data:t,error:e}=await y.from("floor_zones").select("*");if(e)throw console.error("Error fetching floor zones:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,floor:n.floor,type:n.type,x:n.x||"0",y:n.y||"0"}))},async getEventHalls(){const{data:t,error:e}=await y.from("event_halls").select("*");if(e)throw console.error("Error fetching event halls:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,capacity:n.capacity,status:n.status,customerName:n.customer_name,time:n.time}))},async updateTableStatus(t,e){const n={};e.status&&(n.status=e.status),e.customerName!==void 0&&(n.customer_name=e.customerName),e.time!==void 0&&(n.time=e.time),e.duration!==void 0&&(n.duration=e.duration),e.notes!==void 0&&(n.notes=e.notes),e.bookingId!==void 0&&(n.booking_id=e.bookingId),n.updated_at=new Date().toISOString();const{error:a}=await y.from("tables").update(n).eq("id",t);if(a)throw console.error("Error updating table:",a),a},async createTable(t){const{data:e,error:n}=await y.from("tables").insert({name:t.name,type:t.type||"square",pax:t.pax||4,floor:t.floor||1,status:t.status||"empty",updated_at:new Date().toISOString()}).select().single();if(n)throw console.error("Error creating table:",n),n;return e},async updateTable(t,e){const n={updated_at:new Date().toISOString()};e.name!==void 0&&(n.name=e.name),e.type!==void 0&&(n.type=e.type),e.pax!==void 0&&(n.pax=e.pax),e.floor!==void 0&&(n.floor=e.floor),e.status!==void 0&&(n.status=e.status),e.customer_name!==void 0&&(n.customer_name=e.customer_name),e.customerName!==void 0&&(n.customer_name=e.customerName),e.time!==void 0&&(n.time=e.time),e.duration!==void 0&&(n.duration=e.duration),e.notes!==void 0&&(n.notes=e.notes);const{error:a}=await y.from("tables").update(n).eq("id",t);if(a)throw console.error("Error updating table:",a),a},async deleteTable(t){const{error:e}=await y.from("tables").delete().eq("id",t);if(e)throw console.error("Error deleting table:",e),e},_tablesChannelCounter:0,subscribeToTables(t){const e=`tables-rt-${++this._tablesChannelCounter}-${Date.now()}`,n=y.channel(e);return n.on("postgres_changes",{event:"*",schema:"public",table:"tables"},a=>{console.log(`[${e}] Tables realtime change received!`,a),t(a)}).on("postgres_changes",{event:"*",schema:"public",table:"event_halls"},a=>{console.log(`[${e}] Event Halls realtime change received!`,a),t(a)}).subscribe((a,i)=>{a==="SUBSCRIBED"&&console.log(`[${e}] Successfully subscribed to tables and halls realtime!`),i&&console.error(`[${e}] Subscription error:`,i)}),n}},v={vi:{new:"Mới",pending:"Chờ xác nhận",waiting_info:"Chờ thông tin",confirmed:"Đã xác nhận",arrived:"Đã đến",seated:"Đã ngồi",completed:"Hoàn thành",cancelled:"Đã hủy",no_show:"Không đến",change_requested:"Yêu cầu đổi"},en:{new:"New",pending:"Pending confirmation",waiting_info:"Waiting for information",confirmed:"Confirmed",arrived:"Arrived",seated:"Seated",completed:"Completed",cancelled:"Cancelled",no_show:"No show",change_requested:"Change requested"}},E={vi:{indoor:"Trong nhà",outdoor:"Ngoài trời",vip:"Phòng VIP",rooftop:"Sân thượng"},en:{indoor:"Indoor",outdoor:"Outdoor",vip:"VIP Room",rooftop:"Rooftop"}},T={vi:{guestName:"Tên khách",phone:"Số điện thoại",email:"Email",date:"Ngày",time:"Giờ",guests:"Số khách",area:"Khu vực",table:"Bàn",menu:"Thực đơn",notes:"Ghi chú",notSelected:"Chưa chọn",notAssigned:"Chưa xếp bàn",guestUnit:"khách",autoEmail:"Đây là email tự động từ Maison Vie. Vui lòng không trả lời email này.",newBookingLink:"Nếu bạn muốn đặt bàn mới, vui lòng truy cập:"},en:{guestName:"Guest name",phone:"Phone",email:"Email",date:"Date",time:"Time",guests:"Guests",area:"Area",table:"Table",menu:"Menu",notes:"Notes",notSelected:"Not selected",notAssigned:"Not assigned yet",guestUnit:"guests",autoEmail:"This is an automated email from Maison Vie. Please do not reply to this email.",newBookingLink:"If you would like to make a new reservation, please visit:"}};function V(t){return t.replace(/\\n/g,`
`)}function B(t){return t.lang==="en"?"en":"vi"}function x(t,e,n){if(!t)return"";const a=n||B(e),i=v[a]||v.en,o=E[a]||E.en;return V(t).replace(/{{customerName}}/g,e.customerName||(a==="vi"?"Quý Khách":"Guest")).replace(/{{pax}}/g,String(e.pax||0)).replace(/{{time}}/g,e.time||"").replace(/{{date}}/g,d(e.bookingDate)).replace(/{{phone}}/g,e.phone||"").replace(/{{table}}/g,g(e,a)).replace(/{{menus}}/g,f(e,a)).replace(/{{area}}/g,e.area?o[e.area]||e.area:"").replace(/{{status}}/g,e.status?i[e.status]||e.status:"")}function R(t,e,n,a,i){const o=i,r=v[o]||v.en,c=r[n]||n,s=r[a]||a;return x(t,e,o).replace(/{{oldStatus}}/g,c).replace(/{{newStatus}}/g,s)}function _(t,e,n){return x(t,e,n).replace(/\n/g,"<br/>")}function d(t){if(!t)return"—";const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t}function f(t,e="vi"){return!t.selectedMenus||t.selectedMenus.length===0?T[e].notSelected:t.selectedMenus.map(n=>{const a=(n==null?void 0:n.quantity)||(n==null?void 0:n.qty)||1,i=(n==null?void 0:n.name)||(n==null?void 0:n.title)||n;return`${a}x ${i}`}).join(", ")}function I(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function g(t,e="vi"){const n=t.tableName||"",a=E[e]||E.en,i=t.area?a[t.area]||t.area:"";return n?`${n}${i?` (${i})`:""}`:i||T[e].notAssigned}const m={teal:"#0d9488",green:"#16a34a",amber:"#f59e0b",red:"#dc2626",bg:"#f8fafc",card:"#ffffff",border:"#e2e8f0",textPrimary:"#0f172a",textSecondary:"#64748b",textMuted:"#94a3b8"};function S(t,e,n,a="vi"){return`
<!DOCTYPE html>
<html lang="${a}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${m.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:${m.card};border-radius:16px;overflow:hidden;border:1px solid ${m.border};box-shadow:0 12px 40px rgba(15,23,42,.07);">
    <div style="background:${e};color:#fff;padding:28px 32px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">Maison Vie Restaurant</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;">${I(t)}</h1>
    </div>
    <div style="padding:28px 32px;">
        ${n}
        <p style="margin:24px 0 0;color:${m.textMuted};font-size:11px;">${T[a].autoEmail}</p>
    </div>
</div>
</body>
</html>`.trim()}function p(t,e){return`
    <tr>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${m.textSecondary};font-size:13px;width:140px;">${I(t)}</td>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${m.textPrimary};font-size:14px;font-weight:600;">${I(e)}</td>
    </tr>`}function L(t,e="vi"){const n=T[e],a=E[e]||E.en,i=[p(n.guestName,t.customerName||"—"),p(n.phone,t.phone||"—"),p(n.email,t.email||"—"),p(n.date,d(t.bookingDate)),p(n.time,t.time||"—"),p(n.guests,`${t.pax||0} ${n.guestUnit}`),p(n.area,t.area?a[t.area]||t.area:"—"),p(n.table,g(t,e)),p(n.menu,f(t,e))];return t.notes&&t.notes.length>0&&i.push(p(n.notes,t.notes.join(", "))),`<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">${i.join("")}</table>`}const j={vi:t=>`[ĐÃ NHẬN YÊU CẦU ĐẶT BÀN]

Chào ${t.customerName||"Quý Khách"},

Chúng tôi đã nhận yêu cầu đặt bàn của bạn.
Đơn đặt bàn đang chờ xác nhận, đội ngũ của chúng tôi sẽ xác nhận trong thời gian sớm nhất.

Chi tiết đặt bàn:
- Ngày: ${d(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${g(t,"vi")}
- Thực đơn: ${f(t,"vi")}

Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ Maison Vie.`,en:t=>`[BOOKING REQUEST RECEIVED]

Dear ${t.customerName||"Guest"},

We have received your table reservation request.
Your booking is currently pending confirmation and our team will confirm it as soon as possible.

Booking details:
- Date: ${d(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${g(t,"en")}
- Menu: ${f(t,"en")}

If you need urgent assistance, please contact Maison Vie.`},G={vi:t=>`[XÁC NHẬN ĐẶT BÀN]

Chào ${t.customerName||"Quý Khách"},

Đặt bàn của bạn đã được xác nhận thành công.

Chi tiết đặt bàn:
- Ngày: ${d(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${g(t,"vi")}
- Thực đơn: ${f(t,"vi")}

Vui lòng đến trước 15 phút.
Cảm ơn bạn đã chọn Maison Vie.`,en:t=>`[RESERVATION CONFIRMED]

Dear ${t.customerName||"Guest"},

Your table reservation has been confirmed.

Booking details:
- Date: ${d(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${g(t,"en")}
- Menu: ${f(t,"en")}

Please arrive 15 minutes early.
Thank you for choosing Maison Vie.`},H={vi:t=>`Chào ${t.customerName||"Quý Khách"},

Chúng tôi xin thông báo đặt bàn của bạn đã bị hủy.

Chi tiết đặt bàn:
- Ngày: ${d(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${g(t,"vi")}
- Thực đơn: ${f(t,"vi")}`,en:t=>`Dear ${t.customerName||"Guest"},

We are sorry to inform you that your table reservation has been cancelled.

Booking details:
- Date: ${d(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${g(t,"en")}
- Menu: ${f(t,"en")}`},b={vi:{pending:"✨ Đã nhận yêu cầu đặt bàn — Maison Vie",confirmed:"✅ Xác nhận đặt bàn — Maison Vie",cancelled:"❌ Hủy đặt bàn — Maison Vie",pendingTitle:"✅ ĐÃ NHẬN YÊU CẦU ĐẶT BÀN",confirmedTitle:"✅ XÁC NHẬN ĐẶT BÀN",cancelledTitle:"❌ HỦY ĐẶT BÀN"},en:{pending:"✨ Reservation request received — Maison Vie",confirmed:"✅ Reservation confirmed — Maison Vie",cancelled:"❌ Reservation cancelled — Maison Vie",pendingTitle:"✅ RESERVATION REQUEST RECEIVED",confirmedTitle:"✅ RESERVATION CONFIRMED",cancelledTitle:"❌ RESERVATION CANCELLED"}},C={buildNewBookingInternal(t,e){const n=e!=null&&e.internalNewTitle?x(e.internalNewTitle,t,"vi"):"🔔 BOOKING MỚI",a=e!=null&&e.internalNewBody?x(e.internalNewBody,t,"vi"):[`Tên khách: ${t.customerName||"—"}`,`Số điện thoại: ${t.phone||"—"}`,`Email: ${t.email||"—"}`,`Ngày: ${d(t.bookingDate)}`,`Giờ: ${t.time||"—"}`,`Số khách: ${t.pax||0}`,`Bàn: ${g(t,"vi")}`,`Thực đơn: ${f(t,"vi")}`].join(`
`),i=`🔔 Booking mới: ${t.customerName||"Khách"} — ${t.pax||0} khách — ${t.time||""}`,o=S(n,m.teal,`<p style="margin:0;font-size:15px;line-height:1.7;color:${m.textPrimary};white-space:pre-line;">${_(a,t,"vi")}</p>`,"vi"),r=[n,"",a].join(`
`);return{subject:i,html:o,text:r}},buildCustomerPending(t,e){const n=B(t),a=e!=null&&e.customerPendingBody?x(e.customerPendingBody,t,n):j[n](t),i=b[n].pending,o=S(b[n].pendingTitle,m.teal,`<p style="margin:0;font-size:15px;line-height:1.7;color:${m.textPrimary};white-space:pre-line;">${_(a,t,n)}</p>`,n);return{subject:i,html:o,text:a}},buildCustomerConfirmation(t,e){const n=B(t),a=b[n].confirmed,i=e!=null&&e.customerConfirmBody?x(e.customerConfirmBody,t,n):G[n](t),o=S(b[n].confirmedTitle,m.green,`
            <p style="font-size:15px;color:${m.textPrimary};line-height:1.7;margin:0;white-space:pre-line;">${_(i,t,n)}</p>
        `,n);return{subject:a,html:o,text:i}},buildStatusChangeInternal(t,e,n,a){const i=v.vi,o=i[e]||e,r=i[n]||n,c=`📋 Cập nhật booking: ${t.customerName||"Khách"} — ${o} → ${r}`,s=`[CẬP NHẬT TRẠNG THÁI]

Tên khách: ${t.customerName||"—"}
Trạng thái cũ: ${o}
Trạng thái mới: ${r}

Chi tiết đặt bàn:
- Ngày: ${d(t.bookingDate)}
- Giờ: ${t.time||"—"}
- Số khách: ${t.pax||0}
- Bàn: ${g(t,"vi")}
- Thực đơn: ${f(t,"vi")}`,l=a!=null&&a.internalStatusChangeBody?R(a.internalStatusChangeBody,t,e,n,"vi"):s,u=S(`📋 CẬP NHẬT: ${o} → ${r}`,m.amber,`
            <p style="margin:0;font-size:15px;line-height:1.7;color:${m.textPrimary};white-space:pre-line;">${l.replace(/\n/g,"<br/>")}</p>
        `,"vi");return{subject:c,html:u,text:l}},buildCustomerCancellation(t,e){const n=B(t),a=b[n].cancelled,i=T[n],o=e!=null&&e.customerCancelBody?x(e.customerCancelBody,t,n):H[n](t),r=S(b[n].cancelledTitle,m.red,`
            <p style="font-size:15px;color:${m.textPrimary};line-height:1.7;margin:0 0 20px;white-space:pre-line;">${_(o,t,n)}</p>
            ${L(t,n)}
            <div style="margin-top:20px;padding:16px 18px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                    ${i.newBookingLink}<br/>
                    <a href="https://app.maisonvie.vn/dat-ban-online" style="color:#0d9488;font-weight:600;">app.maisonvie.vn/dat-ban-online</a>
                </p>
            </div>
        `,n),c=[b[n].cancelledTitle,"",o,"",`📅 ${i.date}: ${d(t.bookingDate)}`,`⏰ ${i.time}: ${t.time||""}`,`👥 ${i.guests}: ${t.pax||0}`,"",`${i.newBookingLink} https://app.maisonvie.vn/dat-ban-online`].join(`
`);return{subject:a,html:r,text:c}}},D={async notifyNewBookingInternal(t,e){try{const n=e||await w.getAppSettings();if(!(n!=null&&n.smtpEnabled))return;const a=(n==null?void 0:n.internalNotificationEmail)||(n==null?void 0:n.notificationEmail);if(!a)return;const i={internalNewTitle:n==null?void 0:n.emailTemplateInternalNewTitle,internalNewBody:n==null?void 0:n.emailTemplateInternalNewBody},o=C.buildNewBookingInternal(t,i);await this._sendViaApi({to:a,...o})}catch(n){console.warn("[EmailNotify] notifyNewBookingInternal failed:",n)}},async sendCustomerPending(t,e){try{const n=e||await w.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const a=t.email;if(!a){console.warn("[EmailNotify] No customer email, skipping pending notice");return}const i={customerPendingBody:n==null?void 0:n.emailTemplateCustomerPendingBody},o=C.buildCustomerPending(t,i);await this._sendViaApi({to:a,...o})}catch(n){console.warn("[EmailNotify] sendCustomerPending failed:",n)}},async sendCustomerConfirmation(t,e){try{const n=e||await w.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const a=t.email;if(!a){console.warn("[EmailNotify] No customer email, skipping confirmation");return}const i={customerConfirmBody:n==null?void 0:n.emailTemplateCustomerConfirmBody,customerConfirmGreeting:n==null?void 0:n.emailTemplateCustomerConfirmGreeting,customerConfirmFooter:n==null?void 0:n.emailTemplateCustomerConfirmFooter},o=C.buildCustomerConfirmation(t,i);await this._sendViaApi({to:a,...o})}catch(n){console.warn("[EmailNotify] sendCustomerConfirmation failed:",n)}},async sendCustomerCancellation(t,e){try{const n=e||await w.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const a=t.email;if(!a)return;const i={customerCancelBody:n==null?void 0:n.emailTemplateCustomerCancelBody},o=C.buildCustomerCancellation(t,i);await this._sendViaApi({to:a,...o})}catch(n){console.warn("[EmailNotify] sendCustomerCancellation failed:",n)}},async notifyStatusChangeInternal(t,e,n,a){try{const i=a||await w.getAppSettings();if(!(i!=null&&i.smtpEnabled))return;const o=(i==null?void 0:i.internalNotificationEmail)||(i==null?void 0:i.notificationEmail);if(!o)return;const r={internalStatusChangeBody:i==null?void 0:i.emailTemplateInternalStatusChangeBody},c=C.buildStatusChangeInternal(t,e,n,r);await this._sendViaApi({to:o,...c})}catch(i){console.warn("[EmailNotify] notifyStatusChangeInternal failed:",i)}},async handleBookingEvent(t,e,n,a){try{const i=await w.getAppSettings();console.log("[EmailNotify] handleBookingEvent",t,"smtpEnabled=",i==null?void 0:i.smtpEnabled,"sendCustomerEmail=",i==null?void 0:i.sendCustomerEmail,"email=",e.email),t==="new_booking"&&(await this.notifyNewBookingInternal(e,i),await this.sendCustomerPending(e,i)),t==="booking_confirmed"&&(await this.sendCustomerConfirmation(e,i),n&&a&&await this.notifyStatusChangeInternal(e,n,a,i)),t==="status_change"&&n&&a&&(await this.notifyStatusChangeInternal(e,n,a,i),a==="cancelled"&&await this.sendCustomerCancellation(e,i))}catch(i){console.warn("[EmailNotify] handleBookingEvent failed:",i)}},async testSmtp(){try{return await(await fetch("/api/email/test-smtp",{method:"POST",headers:{"Content-Type":"application/json"}})).json()}catch(t){return{success:!1,error:`Lỗi kết nối: ${t.message}`}}},async _sendViaApi(t){const e=await fetch("/api/email/send-booking-notification",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!e.ok){const n=await e.text().catch(()=>"Unknown error");throw new Error(`Email API ${e.status}: ${n}`)}return await e.json()}},$={new:"Mới",pending:"Cần xử lý",waiting_info:"Chờ thông tin",confirmed:"Đã xác nhận",arrived:"Đã đến",seated:"Đã ngồi",completed:"Hoàn thành",cancelled:"Đã hủy",no_show:"Không đến",change_requested:"Yêu cầu đổi"},k={indoor:"Trong nhà",outdoor:"Ngoài trời",vip:"Phòng VIP",rooftop:"Sân thượng"},z={async notifyNewBooking(t){try{const e=await w.getAppSettings(),n=e==null?void 0:e.webhookEnabled,a=e==null?void 0:e.webhookUrl,i=e==null?void 0:e.emailEnabled,o=e==null?void 0:e.notificationEmail,r=e==null?void 0:e.smtpEnabled;if(!n&&!i&&!r)return;const c={type:"new_booking",booking:t,timestamp:new Date().toISOString()};if(n&&a){const s=this._withEmailTemplates(c);this._sendWebhook(a,s).catch(l=>console.warn("[BookingNotify] Webhook failed:",l.message))}i&&o&&this._sendEmailNotification(o,c).catch(s=>console.warn("[BookingNotify] Email failed:",s.message)),D.handleBookingEvent("new_booking",t).catch(s=>console.warn("[BookingNotify] SMTP email failed:",s))}catch(e){console.warn("[BookingNotify] notifyNewBooking failed:",e)}},async notifyStatusChange(t,e,n){try{const a=await w.getAppSettings(),i=a==null?void 0:a.webhookEnabled,o=a==null?void 0:a.webhookUrl,r=a==null?void 0:a.emailEnabled,c=a==null?void 0:a.notificationEmail;if(!i&&!r)return;const s=n==="confirmed",l={type:s?"booking_confirmed":"status_change",booking:t,oldStatus:e,newStatus:n,timestamp:new Date().toISOString()};s&&(l.confirmationMessage=this._buildConfirmationMessage(t));const u=!!(a!=null&&a.smtpEnabled)&&!!(a!=null&&a.sendCustomerEmail),h=s&&u?{type:"status_change",booking:t,oldStatus:e,newStatus:n,timestamp:l.timestamp}:l;if(i&&o){const N=this._withEmailTemplates(h);this._sendWebhook(o,N).catch(M=>console.warn("[BookingNotify] Webhook failed:",M.message))}r&&c&&this._sendEmailNotification(c,h).catch(N=>console.warn("[BookingNotify] Email failed:",N.message)),D.handleBookingEvent(s?"booking_confirmed":"status_change",t,e,n).catch(N=>console.warn("[BookingNotify] SMTP email failed:",N))}catch(a){console.warn("[BookingNotify] notifyStatusChange failed:",a)}},_buildConfirmationMessage(t){const e=t.customerName||"Quý Khách";let n="";if(t.bookingDate){const h=t.bookingDate.split("-");n=h.length===3?`${h[2]}/${h[1]}/${h[0]}`:t.bookingDate}const a=t.time||"",i=t.pax||0,o=t.tableName||"",r=t.area?k[t.area]||t.area:"",c=o?`${o}${r?` (${r})`:""}`:r||"Chưa xếp bàn";let s="";t.selectedMenus&&t.selectedMenus.length>0&&(s=t.selectedMenus.map(h=>h.name||h.title||h).join(", "));const l=t.notes&&t.notes.length>0?t.notes.join(`
`):"",u=["✅ Đặt bàn đã được XÁC NHẬN — Maison Vie","",`Chào ${e},`,"","Đặt bàn của bạn đã được xác nhận thành công! 🎉","",`📅 Ngày: ${n}`,`⏰ Giờ: ${a}`,`👥 Số khách: ${i} người`,`🪑 Bàn: ${c}`];return s&&u.push(`🍽️ Menu: ${s}`),l&&u.push(`📌 Ghi chú: ${l}`),u.push("","Vui lòng đến trước 15 phút.","Nếu thay đổi, xin báo trước ít nhất 2 tiếng.","","Rất mong được phục vụ bạn! 🙏"),u.join(`
`)},async sendTestNotification(t){try{const e=t||await w.getAppSettings(),n=!!(e!=null&&e.webhookEnabled),a=(e==null?void 0:e.webhookUrl)||"",i=!!(e!=null&&e.emailEnabled),o=(e==null?void 0:e.notificationEmail)||"",r=[],c={id:"test-"+Date.now(),customerName:"Khách Test",phone:"0901234567",email:"test@example.com",pax:4,bookingDate:new Date().toISOString().split("T")[0],time:"18:00",status:"new",source:"web",customerType:"retail",notes:[],selectedMenus:[]};if(n&&a)try{const s=this._withEmailTemplates({type:"new_booking",booking:c,timestamp:new Date().toISOString()});await this._sendWebhook(a,s),r.push("✅ Webhook: Gửi thành công")}catch(s){r.push(`❌ Webhook: ${s.message}`)}else r.push("⏭️ Webhook: Đã tắt hoặc chưa cấu hình URL");if(i&&o)try{await this._sendEmailNotification(o,{type:"new_booking",booking:c,timestamp:new Date().toISOString()}),r.push("✅ Email: Gửi thành công")}catch(s){r.push(`❌ Email: ${s.message}`)}else r.push("⏭️ Email: Đã tắt hoặc chưa cấu hình");return{success:!0,message:r.join(`
`)}}catch(e){return{success:!1,message:`Lỗi: ${e.message}`}}},async _sendWebhook(t,e){var n;try{const a=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw new Error(`Webhook HTTP ${a.status}: ${a.statusText}`)}catch(a){if((n=a.message)!=null&&n.includes("Failed to fetch")||a.name==="TypeError"){await fetch(t,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});return}throw a}},_withEmailTemplates(t){try{return{...t,email_subject:this._buildEmailSubject(t),email_html:this._buildNotificationEmailHtml(t),email_text:this._buildNotificationEmailText(t)}}catch(e){return console.warn("[BookingNotify] Email template build failed:",e),t}},_formatBookingDate(t){if(!t)return"";const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t},_formatSelectedMenus(t){return!t.selectedMenus||t.selectedMenus.length===0?"Chưa chọn":t.selectedMenus.map(e=>{const n=(e==null?void 0:e.quantity)||(e==null?void 0:e.qty)||1,a=(e==null?void 0:e.name)||(e==null?void 0:e.title)||e;return`${n}x ${a}`}).join(", ")},_escapeHtml(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},_buildEmailSubject(t){const e=t.booking,n=e.customerName||"Khách",a=e.pax||0,i=e.time||"";if(t.type==="new_booking")return`🔔 Booking mới: ${n} — ${a} khách — ${i}`;if(t.type==="booking_confirmed")return`✅ Đã xác nhận: ${n} — ${a} khách — ${i}`;const o=t.oldStatus?$[t.oldStatus]||t.oldStatus:"",r=t.newStatus?$[t.newStatus]||t.newStatus:"";return`📋 ${n}: ${o} → ${r}`},_buildNotificationEmailText(t){const e=t.booking,n=t.type==="new_booking",a=t.type==="booking_confirmed",i=t.oldStatus?$[t.oldStatus]||t.oldStatus:"",o=t.newStatus?$[t.newStatus]||t.newStatus:"",r=this._formatBookingDate(e.bookingDate),c=this._formatSelectedMenus(e),s=e.area?k[e.area]||e.area:"—",l=[n?"🔔 BOOKING MỚI — Maison Vie":a?"✅ ĐÃ XÁC NHẬN — Maison Vie":`📋 CẬP NHẬT: ${i} → ${o}`,"",`Khách hàng: ${e.customerName||"—"}`,`Số điện thoại: ${e.phone||"—"}`,`Email: ${e.email||"—"}`,`Ngày: ${r||"—"}`,`Giờ: ${e.time||"—"}`,`Số khách: ${e.pax||0} khách`,`Khu vực: ${s}`,`Bàn: ${e.tableName||"—"}`,`Nguồn: ${e.source||"—"}`,`Menu: ${c}`];return e.notes&&e.notes.length>0&&l.push(`Ghi chú: ${e.notes.join(", ")}`),t.confirmationMessage&&l.push("","Tin nhắn xác nhận:",t.confirmationMessage),l.join(`
`)},_buildNotificationEmailHtml(t){const e=t.booking,n=t.type==="new_booking",a=t.type==="booking_confirmed",i=t.oldStatus?$[t.oldStatus]||t.oldStatus:"",o=t.newStatus?$[t.newStatus]||t.newStatus:"",r=n?"🔔 BOOKING MỚI":a?"✅ ĐÃ XÁC NHẬN":`📋 CẬP NHẬT: ${i} → ${o}`,c=a?"#16a34a":n?"#0d9488":"#f59e0b",s=this._formatBookingDate(e.bookingDate)||"—",l=this._formatSelectedMenus(e),u=e.area?k[e.area]||e.area:"—",h=e.notes&&e.notes.length>0?e.notes.join(", "):"—",M=[["Khách hàng",e.customerName||"—"],["Số điện thoại",e.phone||"—"],["Email",e.email||"—"],["Ngày",s],["Giờ",e.time||"—"],["Số khách",`${e.pax||0} khách`],["Khu vực",u],["Bàn",e.tableName||"—"],["Nguồn",e.source||"—"],["Menu",l],["Ghi chú",h]].map(([A,O])=>`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;width:150px;">${this._escapeHtml(A)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:700;">${this._escapeHtml(O)}</td>
            </tr>
        `).join(""),P=t.confirmationMessage?`
            <div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;white-space:pre-line;color:#334155;font-size:14px;line-height:1.65;">
                ${this._escapeHtml(t.confirmationMessage)}
            </div>
        `:"";return`
            <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
                <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,.08);">
                    <div style="background:${c};color:white;padding:24px 28px;">
                        <div style="font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;opacity:.86;">Maison Vie Restaurant</div>
                        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${this._escapeHtml(r)}</h1>
                    </div>
                    <div style="padding:24px 28px;">
                        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #edf2f7;border-radius:14px;overflow:hidden;">${M}</table>
                        ${P}
                        <p style="margin-top:18px;color:#94a3b8;font-size:12px;">Webhook tự động từ hệ thống Maison Vie.</p>
                    </div>
                </div>
            </div>
        `},async _sendEmailNotification(t,e){const n=e.type==="status_change"&&e.newStatus?$[e.newStatus]||e.newStatus:"",a=e.oldStatus?$[e.oldStatus]||e.oldStatus:"",i=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,type:e.type,booking:e.booking,statusLabel:n,oldStatusLabel:a})});if(!i.ok){const o=await i.text().catch(()=>"Unknown error");throw new Error(`Email API ${i.status}: ${o}`)}}};export{z as b,D as e,q as t};
