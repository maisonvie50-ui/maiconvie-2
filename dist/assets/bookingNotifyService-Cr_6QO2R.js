import{s as b}from"./index-CQCUE30k.js";import{s as x}from"./settingsService-DOpqmmUb.js";const Y={async getTables(){const{data:t,error:e}=await b.from("tables").select("*").order("name");if(e)throw console.error("Error fetching tables:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,type:n.type,status:n.status,pax:n.pax,floor:n.floor,x:n.x||0,y:n.y||0,customerName:n.customer_name,time:n.time,duration:n.duration,notes:n.notes,bookingId:n.booking_id}))},async getFloorZones(){const{data:t,error:e}=await b.from("floor_zones").select("*");if(e)throw console.error("Error fetching floor zones:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,floor:n.floor,type:n.type,x:n.x||"0",y:n.y||"0"}))},async getEventHalls(){const{data:t,error:e}=await b.from("event_halls").select("*");if(e)throw console.error("Error fetching event halls:",e),e;return(t||[]).map(n=>({id:n.id,name:n.name,capacity:n.capacity,status:n.status,customerName:n.customer_name,time:n.time}))},async updateTableStatus(t,e){const n={};e.status&&(n.status=e.status),e.customerName!==void 0&&(n.customer_name=e.customerName),e.time!==void 0&&(n.time=e.time),e.duration!==void 0&&(n.duration=e.duration),e.notes!==void 0&&(n.notes=e.notes),e.bookingId!==void 0&&(n.booking_id=e.bookingId),n.updated_at=new Date().toISOString();const{error:o}=await b.from("tables").update(n).eq("id",t);if(o)throw console.error("Error updating table:",o),o},async createTable(t){const{data:e,error:n}=await b.from("tables").insert({name:t.name,type:t.type||"square",pax:t.pax||4,floor:t.floor||1,status:t.status||"empty",updated_at:new Date().toISOString()}).select().single();if(n)throw console.error("Error creating table:",n),n;return e},async updateTable(t,e){const n={updated_at:new Date().toISOString()};e.name!==void 0&&(n.name=e.name),e.type!==void 0&&(n.type=e.type),e.pax!==void 0&&(n.pax=e.pax),e.floor!==void 0&&(n.floor=e.floor),e.status!==void 0&&(n.status=e.status),e.customer_name!==void 0&&(n.customer_name=e.customer_name),e.customerName!==void 0&&(n.customer_name=e.customerName),e.time!==void 0&&(n.time=e.time),e.duration!==void 0&&(n.duration=e.duration),e.notes!==void 0&&(n.notes=e.notes);const{error:o}=await b.from("tables").update(n).eq("id",t);if(o)throw console.error("Error updating table:",o),o},async deleteTable(t){const{error:e}=await b.from("tables").delete().eq("id",t);if(e)throw console.error("Error deleting table:",e),e},_tablesChannelCounter:0,subscribeToTables(t){const e=`tables-rt-${++this._tablesChannelCounter}-${Date.now()}`,n=b.channel(e);return n.on("postgres_changes",{event:"*",schema:"public",table:"tables"},o=>{console.log(`[${e}] Tables realtime change received!`,o),t(o)}).on("postgres_changes",{event:"*",schema:"public",table:"event_halls"},o=>{console.log(`[${e}] Event Halls realtime change received!`,o),t(o)}).subscribe((o,i)=>{o==="SUBSCRIBED"&&console.log(`[${e}] Successfully subscribed to tables and halls realtime!`),i&&console.error(`[${e}] Subscription error:`,i)}),n}},k={vi:{new:"Mới",pending:"Chờ xác nhận",waiting_info:"Chờ thông tin",confirmed:"Đã xác nhận",arrived:"Đã đến",seated:"Đã ngồi",completed:"Hoàn thành",cancelled:"Đã hủy",no_show:"Không đến",change_requested:"Yêu cầu đổi"},en:{new:"New",pending:"Pending confirmation",waiting_info:"Waiting for information",confirmed:"Confirmed",arrived:"Arrived",seated:"Seated",completed:"Completed",cancelled:"Cancelled",no_show:"No show",change_requested:"Change requested"}},B={vi:{indoor:"Trong nhà",outdoor:"Ngoài trời",vip:"Phòng VIP",rooftop:"Sân thượng"},en:{indoor:"Indoor",outdoor:"Outdoor",vip:"VIP Room",rooftop:"Rooftop"}},P={vi:{guestName:"Tên khách",phone:"Số điện thoại",email:"Email",date:"Ngày",time:"Giờ",guests:"Số khách",area:"Khu vực",table:"Bàn",menu:"Thực đơn",notes:"Ghi chú",notSelected:"Chưa chọn",notAssigned:"Chưa xếp bàn",guestUnit:"khách",autoEmail:"Đây là email tự động từ Maison Vie. Vui lòng không trả lời email này.",newBookingLink:"Nếu bạn muốn đặt bàn mới, vui lòng truy cập:"},en:{guestName:"Guest name",phone:"Phone",email:"Email",date:"Date",time:"Time",guests:"Guests",area:"Area",table:"Table",menu:"Menu",notes:"Notes",notSelected:"Not selected",notAssigned:"Not assigned yet",guestUnit:"guests",autoEmail:"This is an automated email from Maison Vie. Please do not reply to this email.",newBookingLink:"If you would like to make a new reservation, please visit:"}};function j(t){return t.replace(/\\n/g,`
`)}function I(t){return t.lang==="en"?"en":"vi"}function C(t,e,n){if(!t)return"";const o=n||I(e),i=k[o]||k.en,a=B[o]||B.en;return j(t).replace(/{{customerName}}/g,e.customerName||(o==="vi"?"Quý Khách":"Guest")).replace(/{{pax}}/g,String(e.pax||0)).replace(/{{time}}/g,e.time||"").replace(/{{date}}/g,f(e.bookingDate)).replace(/{{phone}}/g,e.phone||"").replace(/{{table}}/g,y(e,o)).replace(/{{menus}}/g,g(e,o)).replace(/{{area}}/g,e.area?a[e.area]||e.area:"").replace(/{{status}}/g,e.status?i[e.status]||e.status:"")}function z(t,e,n,o,i){const a=i,r=k[a]||k.en,c=r[n]||n,l=r[o]||o;return C(t,e,a).replace(/{{oldStatus}}/g,c).replace(/{{newStatus}}/g,l)}function D(t,e,n){return C(t,e,n).replace(/\n/g,"<br/>")}function f(t){if(!t)return"—";const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t}function g(t,e="vi"){return!t.selectedMenus||t.selectedMenus.length===0?P[e].notSelected:t.selectedMenus.map(n=>{const o=(n==null?void 0:n.quantity)||(n==null?void 0:n.qty)||1,i=(n==null?void 0:n.name)||(n==null?void 0:n.title)||n;return`${o}x ${i}`}).join(", ")}function w(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function y(t,e="vi"){const n=t.tableName||"",o=B[e]||B.en,i=t.area?o[t.area]||t.area:"";return n?`${n}${i?` (${i})`:""}`:i||P[e].notAssigned}const s={teal:"#0d9488",green:"#16a34a",amber:"#f59e0b",red:"#dc2626",bg:"#f8fafc",card:"#ffffff",border:"#e2e8f0",textPrimary:"#0f172a",textSecondary:"#64748b",textMuted:"#94a3b8"};function v(t,e,n,o="vi"){return`
<!DOCTYPE html>
<html lang="${o}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${s.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:${s.card};border-radius:16px;overflow:hidden;border:1px solid ${s.border};box-shadow:0 12px 40px rgba(15,23,42,.07);">
    <div style="background:${e};color:#fff;padding:28px 32px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">Maison Vie Restaurant</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;">${w(t)}</h1>
    </div>
    <div style="padding:28px 32px;">
        ${n}
        <p style="margin:24px 0 0;color:${s.textMuted};font-size:11px;">${P[o].autoEmail}</p>
    </div>
</div>
</body>
</html>`.trim()}function $(t,e){return`
    <tr>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${s.textSecondary};font-size:13px;width:140px;">${w(t)}</td>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${s.textPrimary};font-size:14px;font-weight:600;">${w(e)}</td>
    </tr>`}function G(t,e="vi"){const n=P[e],o=B[e]||B.en,i=[$(n.guestName,t.customerName||"—"),$(n.phone,t.phone||"—"),$(n.email,t.email||"—"),$(n.date,f(t.bookingDate)),$(n.time,t.time||"—"),$(n.guests,`${t.pax||0} ${n.guestUnit}`),$(n.area,t.area?o[t.area]||t.area:"—"),$(n.table,y(t,e)),$(n.menu,g(t,e))];return t.notes&&t.notes.length>0&&i.push($(n.notes,t.notes.join(", "))),`<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">${i.join("")}</table>`}const H={vi:t=>`[ĐÃ NHẬN YÊU CẦU ĐẶT BÀN]

Chào ${t.customerName||"Quý Khách"},

Chúng tôi đã nhận yêu cầu đặt bàn của bạn.
Đơn đặt bàn đang chờ xác nhận, đội ngũ của chúng tôi sẽ xác nhận trong thời gian sớm nhất.

Chi tiết đặt bàn:
- Ngày: ${f(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${y(t,"vi")}
- Thực đơn: ${g(t,"vi")}

Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ Maison Vie.`,en:t=>`[BOOKING REQUEST RECEIVED]

Dear ${t.customerName||"Guest"},

We have received your table reservation request.
Your booking is currently pending confirmation and our team will confirm it as soon as possible.

Booking details:
- Date: ${f(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${y(t,"en")}
- Menu: ${g(t,"en")}

If you need urgent assistance, please contact Maison Vie.`},U={vi:t=>`[XÁC NHẬN ĐẶT BÀN]

Chào ${t.customerName||"Quý Khách"},

Đặt bàn của bạn đã được xác nhận thành công.

Chi tiết đặt bàn:
- Ngày: ${f(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${y(t,"vi")}
- Thực đơn: ${g(t,"vi")}

Vui lòng đến trước 15 phút.
Cảm ơn bạn đã chọn Maison Vie.`,en:t=>`[RESERVATION CONFIRMED]

Dear ${t.customerName||"Guest"},

Your table reservation has been confirmed.

Booking details:
- Date: ${f(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${y(t,"en")}
- Menu: ${g(t,"en")}

Please arrive 15 minutes early.
Thank you for choosing Maison Vie.`},K={vi:t=>`Chào ${t.customerName||"Quý Khách"},

Chúng tôi xin thông báo đặt bàn của bạn đã bị hủy.

Chi tiết đặt bàn:
- Ngày: ${f(t.bookingDate)}
- Giờ: ${t.time||""}
- Số khách: ${t.pax||0}
- Bàn: ${y(t,"vi")}
- Thực đơn: ${g(t,"vi")}`,en:t=>`Dear ${t.customerName||"Guest"},

We are sorry to inform you that your table reservation has been cancelled.

Booking details:
- Date: ${f(t.bookingDate)}
- Time: ${t.time||""}
- Number of guests: ${t.pax||0}
- Table: ${y(t,"en")}
- Menu: ${g(t,"en")}`},S={vi:{pending:"✨ Đã nhận yêu cầu đặt bàn — Maison Vie",confirmed:"✅ Xác nhận đặt bàn — Maison Vie",cancelled:"❌ Hủy đặt bàn — Maison Vie",pendingTitle:"✅ ĐÃ NHẬN YÊU CẦU ĐẶT BÀN",confirmedTitle:"✅ XÁC NHẬN ĐẶT BÀN",cancelledTitle:"❌ HỦY ĐẶT BÀN"},en:{pending:"✨ Reservation request received — Maison Vie",confirmed:"✅ Reservation confirmed — Maison Vie",cancelled:"❌ Reservation cancelled — Maison Vie",pendingTitle:"✅ RESERVATION REQUEST RECEIVED",confirmedTitle:"✅ RESERVATION CONFIRMED",cancelledTitle:"❌ RESERVATION CANCELLED"}},T={buildNewBookingInternal(t,e){const n=e!=null&&e.internalNewTitle?C(e.internalNewTitle,t,"vi"):"🔔 BOOKING MỚI",o=e!=null&&e.internalNewBody?C(e.internalNewBody,t,"vi"):[`Tên khách: ${t.customerName||"—"}`,`Số điện thoại: ${t.phone||"—"}`,`Email: ${t.email||"—"}`,`Ngày: ${f(t.bookingDate)}`,`Giờ: ${t.time||"—"}`,`Số khách: ${t.pax||0}`,`Bàn: ${y(t,"vi")}`,`Thực đơn: ${g(t,"vi")}`].join(`
`),i=`🔔 Booking mới: ${t.customerName||"Khách"} — ${t.pax||0} khách — ${t.time||""}`,a=v(n,s.teal,`<p style="margin:0;font-size:15px;line-height:1.7;color:${s.textPrimary};white-space:pre-line;">${D(o,t,"vi")}</p>`,"vi"),r=[n,"",o].join(`
`);return{subject:i,html:a,text:r}},buildCustomerPending(t,e){const n=I(t),o=e!=null&&e.customerPendingBody?C(e.customerPendingBody,t,n):H[n](t),i=S[n].pending,a=v(S[n].pendingTitle,s.teal,`<p style="margin:0;font-size:15px;line-height:1.7;color:${s.textPrimary};white-space:pre-line;">${D(o,t,n)}</p>`,n);return{subject:i,html:a,text:o}},buildCustomerConfirmation(t,e){const n=I(t),o=S[n].confirmed,i=e!=null&&e.customerConfirmBody?C(e.customerConfirmBody,t,n):U[n](t),a=v(S[n].confirmedTitle,s.green,`
            <p style="font-size:15px;color:${s.textPrimary};line-height:1.7;margin:0;white-space:pre-line;">${D(i,t,n)}</p>
        `,n);return{subject:o,html:a,text:i}},buildStatusChangeInternal(t,e,n,o){const i=k.vi,a=i[e]||e,r=i[n]||n,c=`📋 Cập nhật booking: ${t.customerName||"Khách"} — ${a} → ${r}`,l=`[CẬP NHẬT TRẠNG THÁI]

Tên khách: ${t.customerName||"—"}
Trạng thái cũ: ${a}
Trạng thái mới: ${r}

Chi tiết đặt bàn:
- Ngày: ${f(t.bookingDate)}
- Giờ: ${t.time||"—"}
- Số khách: ${t.pax||0}
- Bàn: ${y(t,"vi")}
- Thực đơn: ${g(t,"vi")}`,m=o!=null&&o.internalStatusChangeBody?z(o.internalStatusChangeBody,t,e,n,"vi"):l,u=v(`📋 CẬP NHẬT: ${a} → ${r}`,s.amber,`
            <p style="margin:0;font-size:15px;line-height:1.7;color:${s.textPrimary};white-space:pre-line;">${m.replace(/\n/g,"<br/>")}</p>
        `,"vi");return{subject:c,html:u,text:m}},buildCustomerCancellation(t,e){const n=I(t),o=S[n].cancelled,i=P[n],a=e!=null&&e.customerCancelBody?C(e.customerCancelBody,t,n):K[n](t),r=v(S[n].cancelledTitle,s.red,`
            <p style="font-size:15px;color:${s.textPrimary};line-height:1.7;margin:0 0 20px;white-space:pre-line;">${D(a,t,n)}</p>
            ${G(t,n)}
            <div style="margin-top:20px;padding:16px 18px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                    ${i.newBookingLink}<br/>
                    <a href="https://app.maisonvie.vn/dat-ban-online" style="color:#0d9488;font-weight:600;">app.maisonvie.vn/dat-ban-online</a>
                </p>
            </div>
        `,n),c=[S[n].cancelledTitle,"",a,"",`📅 ${i.date}: ${f(t.bookingDate)}`,`⏰ ${i.time}: ${t.time||""}`,`👥 ${i.guests}: ${t.pax||0}`,"",`${i.newBookingLink} https://app.maisonvie.vn/dat-ban-online`].join(`
`);return{subject:o,html:r,text:c}},buildBatchConfirmation(t){const e=t[0],n=e?I(e):"vi",o=n==="vi",i=[...t].sort((d,p)=>{const E=(d.bookingDate||"").localeCompare(p.bookingDate||"");return E!==0?E:(d.time||"").localeCompare(p.time||"")}),a=o?`✅ Xác nhận ${i.length} đặt bàn — Maison Vie`:`✅ ${i.length} reservations confirmed — Maison Vie`,r=o?`✅ XÁC NHẬN ${i.length} ĐẶT BÀN`:`✅ ${i.length} RESERVATIONS CONFIRMED`,c=i.map((d,p)=>`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textSecondary};font-size:13px;">${p+1}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;font-weight:700;">${w(d.bookingCode||d.customerName||"—")}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;">${w(f(d.bookingDate))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;font-weight:700;">${w(d.time||"—")}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;">${w(String(d.pax||0))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;">${w(y(d,n))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${s.textPrimary};font-size:13px;">${w(g(d,n))}</td>
            </tr>
        `).join(""),l=o?`Chào ${(e==null?void 0:e.customerName)||"Quý đối tác"},<br/><br/>Maison Vie xác nhận các đặt bàn dưới đây đã được ghi nhận thành công.`:`Dear ${(e==null?void 0:e.customerName)||"Partner"},<br/><br/>Maison Vie confirms that the reservations below have been successfully confirmed.`,m=v(r,s.green,`
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${s.textPrimary};">${l}</p>
            <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid ${s.border};border-radius:12px;overflow:hidden;">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">#</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">Code</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">${o?"Ngày":"Date"}</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">${o?"Giờ":"Time"}</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">Pax</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">${o?"Bàn":"Table"}</th>
                        <th style="padding:10px 12px;text-align:left;color:${s.textSecondary};font-size:12px;">Menu</th>
                    </tr>
                </thead>
                <tbody>${c}</tbody>
            </table>
            <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:${s.textSecondary};">
                ${o?"Vui lòng kiểm tra lại danh sách đoàn. Nếu có thay đổi/hủy đoàn, vui lòng phản hồi để Maison Vie cập nhật.":"Please review the list above. If there are any changes or cancellations, kindly reply so Maison Vie can update accordingly."}
            </p>
        `,n),u=i.map((d,p)=>`${p+1}. ${d.bookingCode||d.customerName||"—"} | ${f(d.bookingDate)} ${d.time||"—"} | ${d.pax||0} pax | ${y(d,n)} | ${g(d,n)}`),h=[r,"",o?"Maison Vie xác nhận các đặt bàn dưới đây:":"Maison Vie confirms the reservations below:","",...u,"",o?"Nếu có thay đổi/hủy đoàn, vui lòng phản hồi email này.":"If there are any changes or cancellations, please reply to this email."].join(`
`);return{subject:a,html:m,text:h}}};function A(t){return String(t||"").trim().toLowerCase()}const _={async notifyNewBookingInternal(t,e){try{const n=e||await x.getAppSettings();if(!(n!=null&&n.smtpEnabled))return;const o=(n==null?void 0:n.internalNotificationEmail)||(n==null?void 0:n.notificationEmail);if(!o)return;const i={internalNewTitle:n==null?void 0:n.emailTemplateInternalNewTitle,internalNewBody:n==null?void 0:n.emailTemplateInternalNewBody},a=T.buildNewBookingInternal(t,i);await this._sendViaApi({to:o,...a})}catch(n){console.warn("[EmailNotify] notifyNewBookingInternal failed:",n)}},async sendCustomerPending(t,e){try{const n=e||await x.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const o=t.email;if(!o){console.warn("[EmailNotify] No customer email, skipping pending notice");return}const i={customerPendingBody:n==null?void 0:n.emailTemplateCustomerPendingBody},a=T.buildCustomerPending(t,i);await this._sendViaApi({to:o,...a})}catch(n){console.warn("[EmailNotify] sendCustomerPending failed:",n)}},async sendCustomerConfirmation(t,e){try{const n=e||await x.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const o=t.email;if(!o){console.warn("[EmailNotify] No customer email, skipping confirmation");return}const i={customerConfirmBody:n==null?void 0:n.emailTemplateCustomerConfirmBody,customerConfirmGreeting:n==null?void 0:n.emailTemplateCustomerConfirmGreeting,customerConfirmFooter:n==null?void 0:n.emailTemplateCustomerConfirmFooter},a=T.buildCustomerConfirmation(t,i);await this._sendViaApi({to:o,...a})}catch(n){console.warn("[EmailNotify] sendCustomerConfirmation failed:",n)}},async sendBatchConfirmation(t,e){try{const n=e||await x.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const o=t.filter(c=>A(c.email));if(o.length===0)return;const i=A(o[0].email),a=o.filter(c=>A(c.email)===i);if(!i||a.length===0)return;const r=T.buildBatchConfirmation(a);await this._sendViaApi({to:i,...r})}catch(n){console.warn("[EmailNotify] sendBatchConfirmation failed:",n)}},async sendCustomerCancellation(t,e){try{const n=e||await x.getAppSettings();if(!(n!=null&&n.smtpEnabled)||!(n!=null&&n.sendCustomerEmail))return;const o=t.email;if(!o)return;const i={customerCancelBody:n==null?void 0:n.emailTemplateCustomerCancelBody},a=T.buildCustomerCancellation(t,i);await this._sendViaApi({to:o,...a})}catch(n){console.warn("[EmailNotify] sendCustomerCancellation failed:",n)}},async notifyStatusChangeInternal(t,e,n,o){try{const i=o||await x.getAppSettings();if(!(i!=null&&i.smtpEnabled))return;const a=(i==null?void 0:i.internalNotificationEmail)||(i==null?void 0:i.notificationEmail);if(!a)return;const r={internalStatusChangeBody:i==null?void 0:i.emailTemplateInternalStatusChangeBody},c=T.buildStatusChangeInternal(t,e,n,r);await this._sendViaApi({to:a,...c})}catch(i){console.warn("[EmailNotify] notifyStatusChangeInternal failed:",i)}},async handleBookingEvent(t,e,n,o){try{const i=await x.getAppSettings();console.log("[EmailNotify] handleBookingEvent",t,"smtpEnabled=",i==null?void 0:i.smtpEnabled,"sendCustomerEmail=",i==null?void 0:i.sendCustomerEmail,"email=",e.email),t==="new_booking"&&(await this.notifyNewBookingInternal(e,i),await this.sendCustomerPending(e,i)),t==="booking_confirmed"&&(await this.sendCustomerConfirmation(e,i),n&&o&&await this.notifyStatusChangeInternal(e,n,o,i)),t==="status_change"&&n&&o&&(await this.notifyStatusChangeInternal(e,n,o,i),o==="cancelled"&&await this.sendCustomerCancellation(e,i))}catch(i){console.warn("[EmailNotify] handleBookingEvent failed:",i)}},async testSmtp(){try{return await(await fetch("/api/email/test-smtp",{method:"POST",headers:{"Content-Type":"application/json"}})).json()}catch(t){return{success:!1,error:`Lỗi kết nối: ${t.message}`}}},async _sendViaApi(t){const e=await fetch("/api/email/send-booking-notification",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!e.ok){const n=await e.text().catch(()=>"Unknown error");throw new Error(`Email API ${e.status}: ${n}`)}return await e.json()}},O=1e4,M=new Map;function q(t){return String(t||"").trim().toLowerCase()}function W(t){const e=q(t.email),n=String(t.confirmationSeriesKey||"").trim().toLowerCase();return e&&n?`${e}__series:${n}`:e||`booking:${t.id}`}const N={new:"Mới",pending:"Cần xử lý",waiting_info:"Chờ thông tin",confirmed:"Đã xác nhận",arrived:"Đã đến",seated:"Đã ngồi",completed:"Hoàn thành",cancelled:"Đã hủy",no_show:"Không đến",change_requested:"Yêu cầu đổi"},V={indoor:"Trong nhà",outdoor:"Ngoài trời",vip:"Phòng VIP",rooftop:"Sân thượng"},X={async notifyNewBooking(t){try{const e=await x.getAppSettings(),n=e==null?void 0:e.webhookEnabled,o=e==null?void 0:e.webhookUrl,i=e==null?void 0:e.emailEnabled,a=e==null?void 0:e.notificationEmail,r=e==null?void 0:e.smtpEnabled;if(!n&&!i&&!r)return;const c={type:"new_booking",booking:t,timestamp:new Date().toISOString()};if(n&&o){const l=this._withEmailTemplates(c);this._sendWebhook(o,l).catch(m=>console.warn("[BookingNotify] Webhook failed:",m.message))}i&&a&&this._sendEmailNotification(a,c).catch(l=>console.warn("[BookingNotify] Email failed:",l.message)),_.handleBookingEvent("new_booking",t).catch(l=>console.warn("[BookingNotify] SMTP email failed:",l))}catch(e){console.warn("[BookingNotify] notifyNewBooking failed:",e)}},async notifyStatusChange(t,e,n){try{const o=await x.getAppSettings(),i=o==null?void 0:o.webhookEnabled,a=o==null?void 0:o.webhookUrl,r=o==null?void 0:o.emailEnabled,c=o==null?void 0:o.notificationEmail,l=o==null?void 0:o.smtpEnabled;if(!i&&!r&&!l)return;const m=n==="confirmed",u={type:m?"booking_confirmed":"status_change",booking:t,oldStatus:e,newStatus:n,timestamp:new Date().toISOString()};m&&(u.confirmationMessage=this._buildConfirmationMessage(t));const h=!!(o!=null&&o.smtpEnabled)&&!!(o!=null&&o.sendCustomerEmail),d=m&&h?{type:"status_change",booking:t,oldStatus:e,newStatus:n,timestamp:u.timestamp}:u;if(i&&a){const p=this._withEmailTemplates(d);this._sendWebhook(a,p).catch(E=>console.warn("[BookingNotify] Webhook failed:",E.message))}r&&c&&this._sendEmailNotification(c,d).catch(p=>console.warn("[BookingNotify] Email failed:",p.message)),m?this._queueCustomerConfirmation(t,e,n):_.handleBookingEvent("status_change",t,e,n).catch(p=>console.warn("[BookingNotify] SMTP email failed:",p))}catch(o){console.warn("[BookingNotify] notifyStatusChange failed:",o)}},_queueCustomerConfirmation(t,e,n){const o=W(t),i=M.get(o);if(i){clearTimeout(i.timer);const c=i.bookings.some(m=>m.id===t.id)?i.bookings.map(m=>m.id===t.id?t:m):[...i.bookings,t],l=setTimeout(()=>{this._flushCustomerConfirmationBatch(o).catch(m=>console.warn("[BookingNotify] Batch confirmation flush failed:",m))},O);M.set(o,{bookings:c,timer:l,oldStatus:e,newStatus:n});return}const a=setTimeout(()=>{this._flushCustomerConfirmationBatch(o).catch(r=>console.warn("[BookingNotify] Batch confirmation flush failed:",r))},O);M.set(o,{bookings:[t],timer:a,oldStatus:e,newStatus:n})},async _flushCustomerConfirmationBatch(t){const e=M.get(t);if(!e)return;M.delete(t);const n=await x.getAppSettings(),o=Array.from(new Map(e.bookings.map(a=>[a.id,a])).values());if(o.length>1){await _.sendBatchConfirmation(o,n),e.oldStatus&&e.newStatus&&await Promise.all(o.map(a=>_.notifyStatusChangeInternal(a,e.oldStatus,e.newStatus,n)));return}const i=o[0];i&&await _.handleBookingEvent("booking_confirmed",i,e.oldStatus,e.newStatus)},_buildConfirmationMessage(t){const e=t.customerName||"Quý Khách";let n="";if(t.bookingDate){const h=t.bookingDate.split("-");n=h.length===3?`${h[2]}/${h[1]}/${h[0]}`:t.bookingDate}const o=t.time||"",i=t.pax||0,a=t.tableName||"",r=t.area?V[t.area]||t.area:"",c=a?`${a}${r?` (${r})`:""}`:r||"Chưa xếp bàn";let l="";t.selectedMenus&&t.selectedMenus.length>0&&(l=t.selectedMenus.map(h=>h.name||h.title||h).join(", "));const m=t.notes&&t.notes.length>0?t.notes.join(`
`):"",u=["✅ Đặt bàn đã được XÁC NHẬN — Maison Vie","",`Chào ${e},`,"","Đặt bàn của bạn đã được xác nhận thành công! 🎉","",`📅 Ngày: ${n}`,`⏰ Giờ: ${o}`,`👥 Số khách: ${i} người`,`🪑 Bàn: ${c}`];return l&&u.push(`🍽️ Menu: ${l}`),m&&u.push(`📌 Ghi chú: ${m}`),u.push("","Vui lòng đến trước 15 phút.","Nếu thay đổi, xin báo trước ít nhất 2 tiếng.","","Rất mong được phục vụ bạn! 🙏"),u.join(`
`)},async sendTestNotification(t){try{const e=t||await x.getAppSettings(),n=!!(e!=null&&e.webhookEnabled),o=(e==null?void 0:e.webhookUrl)||"",i=!!(e!=null&&e.emailEnabled),a=(e==null?void 0:e.notificationEmail)||"",r=[],c={id:"test-"+Date.now(),customerName:"Khách Test",phone:"0901234567",email:"test@example.com",pax:4,bookingDate:new Date().toISOString().split("T")[0],time:"18:00",status:"new",source:"web",customerType:"retail",notes:[],selectedMenus:[]};if(n&&o)try{const l=this._withEmailTemplates({type:"new_booking",booking:c,timestamp:new Date().toISOString()});await this._sendWebhook(o,l),r.push("✅ Webhook: Gửi thành công")}catch(l){r.push(`❌ Webhook: ${l.message}`)}else r.push("⏭️ Webhook: Đã tắt hoặc chưa cấu hình URL");if(i&&a)try{await this._sendEmailNotification(a,{type:"new_booking",booking:c,timestamp:new Date().toISOString()}),r.push("✅ Email: Gửi thành công")}catch(l){r.push(`❌ Email: ${l.message}`)}else r.push("⏭️ Email: Đã tắt hoặc chưa cấu hình");return{success:!0,message:r.join(`
`)}}catch(e){return{success:!1,message:`Lỗi: ${e.message}`}}},async _sendWebhook(t,e){var n;try{const o=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!o.ok)throw new Error(`Webhook HTTP ${o.status}: ${o.statusText}`)}catch(o){if((n=o.message)!=null&&n.includes("Failed to fetch")||o.name==="TypeError"){await fetch(t,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});return}throw o}},_withEmailTemplates(t){try{return{...t,email_subject:this._buildEmailSubject(t),email_html:this._buildNotificationEmailHtml(t),email_text:this._buildNotificationEmailText(t)}}catch(e){return console.warn("[BookingNotify] Email template build failed:",e),t}},_formatBookingDate(t){if(!t)return"";const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t},_formatSelectedMenus(t){return!t.selectedMenus||t.selectedMenus.length===0?"Chưa chọn":t.selectedMenus.map(e=>{const n=(e==null?void 0:e.quantity)||(e==null?void 0:e.qty)||1,o=(e==null?void 0:e.name)||(e==null?void 0:e.title)||e;return`${n}x ${o}`}).join(", ")},_escapeHtml(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},_buildEmailSubject(t){const e=t.booking,n=e.customerName||"Khách",o=e.pax||0,i=e.time||"";if(t.type==="new_booking")return`🔔 Booking mới: ${n} — ${o} khách — ${i}`;if(t.type==="booking_confirmed")return`✅ Đã xác nhận: ${n} — ${o} khách — ${i}`;const a=t.oldStatus?N[t.oldStatus]||t.oldStatus:"",r=t.newStatus?N[t.newStatus]||t.newStatus:"";return`📋 ${n}: ${a} → ${r}`},_buildNotificationEmailText(t){const e=t.booking,n=t.type==="new_booking",o=t.type==="booking_confirmed",i=t.oldStatus?N[t.oldStatus]||t.oldStatus:"",a=t.newStatus?N[t.newStatus]||t.newStatus:"",r=this._formatBookingDate(e.bookingDate),c=this._formatSelectedMenus(e),l=e.area?V[e.area]||e.area:"—",m=[n?"🔔 BOOKING MỚI — Maison Vie":o?"✅ ĐÃ XÁC NHẬN — Maison Vie":`📋 CẬP NHẬT: ${i} → ${a}`,"",`Khách hàng: ${e.customerName||"—"}`,`Số điện thoại: ${e.phone||"—"}`,`Email: ${e.email||"—"}`,`Ngày: ${r||"—"}`,`Giờ: ${e.time||"—"}`,`Số khách: ${e.pax||0} khách`,`Khu vực: ${l}`,`Bàn: ${e.tableName||"—"}`,`Nguồn: ${e.source||"—"}`,`Menu: ${c}`];return e.notes&&e.notes.length>0&&m.push(`Ghi chú: ${e.notes.join(", ")}`),t.confirmationMessage&&m.push("","Tin nhắn xác nhận:",t.confirmationMessage),m.join(`
`)},_buildNotificationEmailHtml(t){const e=t.booking,n=t.type==="new_booking",o=t.type==="booking_confirmed",i=t.oldStatus?N[t.oldStatus]||t.oldStatus:"",a=t.newStatus?N[t.newStatus]||t.newStatus:"",r=n?"🔔 BOOKING MỚI":o?"✅ ĐÃ XÁC NHẬN":`📋 CẬP NHẬT: ${i} → ${a}`,c=o?"#16a34a":n?"#0d9488":"#f59e0b",l=this._formatBookingDate(e.bookingDate)||"—",m=this._formatSelectedMenus(e),u=e.area?V[e.area]||e.area:"—",h=e.notes&&e.notes.length>0?e.notes.join(", "):"—",p=[["Khách hàng",e.customerName||"—"],["Số điện thoại",e.phone||"—"],["Email",e.email||"—"],["Ngày",l],["Giờ",e.time||"—"],["Số khách",`${e.pax||0} khách`],["Khu vực",u],["Bàn",e.tableName||"—"],["Nguồn",e.source||"—"],["Menu",m],["Ghi chú",h]].map(([R,L])=>`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;width:150px;">${this._escapeHtml(R)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:700;">${this._escapeHtml(L)}</td>
            </tr>
        `).join(""),E=t.confirmationMessage?`
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
                        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #edf2f7;border-radius:14px;overflow:hidden;">${p}</table>
                        ${E}
                        <p style="margin-top:18px;color:#94a3b8;font-size:12px;">Webhook tự động từ hệ thống Maison Vie.</p>
                    </div>
                </div>
            </div>
        `},async _sendEmailNotification(t,e){const n=e.type==="status_change"&&e.newStatus?N[e.newStatus]||e.newStatus:"",o=e.oldStatus?N[e.oldStatus]||e.oldStatus:"",i=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,type:e.type,booking:e.booking,statusLabel:n,oldStatusLabel:o})});if(!i.ok){const a=await i.text().catch(()=>"Unknown error");throw new Error(`Email API ${i.status}: ${a}`)}}};export{X as b,_ as e,Y as t};
