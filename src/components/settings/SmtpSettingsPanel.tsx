import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, Loader2, Server, ShieldCheck, FileText } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { emailNotificationService } from '../../services/emailNotificationService';

type TemplateKey = 'internalNew' | 'customerPending' | 'customerConfirm' | 'internalStatus' | 'customerCancel';

const DEFAULT_TEMPLATES: Record<TemplateKey, { label: string; desc: string; settingKey: string; defaultValue: string }> = {
    internalNew: {
        label: '📩 Booking mới — Gửi nội bộ',
        desc: 'Gửi cho quản lý/lễ tân khi có booking mới. (Luôn tiếng Việt)',
        settingKey: 'emailTemplateInternalNewBody',
        defaultValue: `[BOOKING MỚI]\n\nTên khách: {{customerName}}\nSố điện thoại: {{phone}}\nNgày: {{date}}\nGiờ: {{time}}\nSố khách: {{pax}}\nBàn: {{table}}\nThực đơn: {{menus}}\n\nVui lòng kiểm tra và xác nhận booking này.`,
    },
    customerPending: {
        label: '✨ Khách vừa đặt — Gửi khách',
        desc: 'Gửi khi khách vừa đặt bàn. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerPendingBody',
        defaultValue: `[ĐÃ NHẬN YÊU CẦU ĐẶT BÀN]\n\nChào {{customerName}},\n\nChúng tôi đã nhận yêu cầu đặt bàn của bạn.\nĐơn đặt bàn đang chờ xác nhận, đội ngũ của chúng tôi sẽ xác nhận trong thời gian sớm nhất.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nNếu bạn cần hỗ trợ gấp, vui lòng liên hệ Maison Vie.`,
    },
    customerConfirm: {
        label: '✅ Nhân viên chốt — Gửi khách',
        desc: 'Gửi cho khách khi nhân viên xác nhận booking. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerConfirmBody',
        defaultValue: `[XÁC NHẬN ĐẶT BÀN]\n\nChào {{customerName}},\n\nĐặt bàn của bạn đã được xác nhận thành công.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nVui lòng đến trước 15 phút.\nCảm ơn bạn đã chọn Maison Vie.`,
    },
    internalStatus: {
        label: '📋 Đổi trạng thái — Gửi nội bộ',
        desc: 'Gửi cho quản lý/lễ tân khi trạng thái booking thay đổi. (Luôn tiếng Việt)',
        settingKey: 'emailTemplateInternalStatusChangeBody',
        defaultValue: `[CẬP NHẬT TRẠNG THÁI]\n\nTên khách: {{customerName}}\nTrạng thái cũ: {{oldStatus}}\nTrạng thái mới: {{newStatus}}\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}`,
    },
    customerCancel: {
        label: '❌ Đã hủy — Gửi khách',
        desc: 'Gửi cho khách khi booking bị hủy. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerCancelBody',
        defaultValue: `Chào {{customerName}},\n\nChúng tôi xin thông báo đặt bàn của bạn đã bị hủy.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nNếu bạn muốn đặt bàn mới, vui lòng liên hệ chúng tôi.`,
    },
};

/**
 * SmtpSettingsPanel — cấu hình SMTP email trong admin.
 * Settings lưu trong Supabase: smtpEnabled, sendCustomerEmail, internalNotificationEmail.
 * Thông tin nhạy cảm (host, password) lưu trên Vercel env, không hiện ở đây.
 */
export default function SmtpSettingsPanel() {
    const [smtpEnabled, setSmtpEnabled] = useState(false);
    const [sendCustomerEmail, setSendCustomerEmail] = useState(false);
    const [internalEmail, setInternalEmail] = useState('');

    const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('internalNew');
    const [templateValues, setTemplateValues] = useState<Record<TemplateKey, string>>({
        internalNew: DEFAULT_TEMPLATES.internalNew.defaultValue,
        customerPending: DEFAULT_TEMPLATES.customerPending.defaultValue,
        customerConfirm: DEFAULT_TEMPLATES.customerConfirm.defaultValue,
        internalStatus: DEFAULT_TEMPLATES.internalStatus.defaultValue,
        customerCancel: DEFAULT_TEMPLATES.customerCancel.defaultValue,
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const s = await settingsService.getAppSettings();
            if (s) {
                setSmtpEnabled(!!s.smtpEnabled);
                setSendCustomerEmail(!!s.sendCustomerEmail);
                setInternalEmail(s.internalNotificationEmail || '');
                setTemplateValues({
                    internalNew: s.emailTemplateInternalNewBody || DEFAULT_TEMPLATES.internalNew.defaultValue,
                    customerPending: s.emailTemplateCustomerPendingBody || DEFAULT_TEMPLATES.customerPending.defaultValue,
                    customerConfirm: s.emailTemplateCustomerConfirmBody || DEFAULT_TEMPLATES.customerConfirm.defaultValue,
                    internalStatus: s.emailTemplateInternalStatusChangeBody || DEFAULT_TEMPLATES.internalStatus.defaultValue,
                    customerCancel: s.emailTemplateCustomerCancelBody || DEFAULT_TEMPLATES.customerCancel.defaultValue,
                });
            }
            setLoaded(true);
        })();
    }, []);

    const saveTemplateSettings = async () => {
        await settingsService.updateAppSetting('emailTemplateInternalNewBody', templateValues.internalNew);
        await settingsService.updateAppSetting('emailTemplateCustomerPendingBody', templateValues.customerPending);
        await settingsService.updateAppSetting('emailTemplateCustomerConfirmBody', templateValues.customerConfirm);
        await settingsService.updateAppSetting('emailTemplateInternalStatusChangeBody', templateValues.internalStatus);
        await settingsService.updateAppSetting('emailTemplateCustomerCancelBody', templateValues.customerCancel);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setTestResult(null);
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
            await saveTemplateSettings();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save SMTP settings failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTestSmtp = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
            await saveTemplateSettings();
        } catch { /* ignore */ }

        const result = await emailNotificationService.testSmtp();
        setTestResult({
            success: result.success,
            message: result.success ? '✅ SMTP hoạt động!' : '❌ SMTP test thất bại',
            details: result.error || (result as any).message || undefined,
        });
        setTesting(false);
    };

    const handleTemplateChange = (value: string) => {
        setTemplateValues(prev => ({ ...prev, [selectedTemplate]: value }));
    };

    const resetSelectedTemplate = () => {
        setTemplateValues(prev => ({ ...prev, [selectedTemplate]: DEFAULT_TEMPLATES[selectedTemplate].defaultValue }));
    };

    const resetAllTemplates = () => {
        setTemplateValues({
            internalNew: DEFAULT_TEMPLATES.internalNew.defaultValue,
            customerPending: DEFAULT_TEMPLATES.customerPending.defaultValue,
            customerConfirm: DEFAULT_TEMPLATES.customerConfirm.defaultValue,
            internalStatus: DEFAULT_TEMPLATES.internalStatus.defaultValue,
            customerCancel: DEFAULT_TEMPLATES.customerCancel.defaultValue,
        });
    };

    if (!loaded) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    const selectedMeta = DEFAULT_TEMPLATES[selectedTemplate];

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-4 sm:p-8 shadow-2xl shadow-teal-950/20">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />

            <div className="relative space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-white shadow-xl backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/30">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                                Email Automation Center
                            </div>
                            <h3 className="text-2xl font-black leading-tight tracking-tight">Thông báo Email</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Quản lý email booking, email khách hàng song ngữ VI/EN và thông báo nội bộ tiếng Việt.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className={`rounded-2xl border p-3 ${smtpEnabled ? 'border-emerald-300/30 bg-emerald-300/10' : 'border-white/10 bg-white/5'}`}>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SMTP</div>
                            <div className={`mt-1 text-sm font-black ${smtpEnabled ? 'text-emerald-200' : 'text-slate-300'}`}>{smtpEnabled ? 'Đang bật' : 'Đang tắt'}</div>
                        </div>
                        <div className={`rounded-2xl border p-3 ${sendCustomerEmail ? 'border-sky-300/30 bg-sky-300/10' : 'border-white/10 bg-white/5'}`}>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email khách</div>
                            <div className={`mt-1 text-sm font-black ${sendCustomerEmail ? 'text-sky-200' : 'text-slate-300'}`}>{sendCustomerEmail ? 'VI/EN tự động' : 'Đang tắt'}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setSmtpEnabled(!smtpEnabled)}
                        className={`group flex min-h-[72px] w-full items-center justify-between gap-4 rounded-3xl border p-4 text-left transition-all active:scale-[0.98] ${smtpEnabled ? 'border-emerald-300/40 bg-emerald-50 text-emerald-950 shadow-lg shadow-emerald-950/10' : 'border-white/10 bg-white text-slate-800 shadow-lg shadow-slate-950/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${smtpEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Server className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-base font-black">Bật SMTP Email</div>
                                <div className="text-sm leading-5 opacity-70">Gửi email tự động khi có booking</div>
                            </div>
                        </div>
                        <div className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${smtpEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform ${smtpEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    {smtpEnabled && (
                        <>
                            <div className="rounded-3xl border border-white/70 bg-white p-4 shadow-xl shadow-slate-950/10">
                                <label className="mb-2 block text-sm font-black text-slate-800">Email nhận thông báo nội bộ</label>
                                <input
                                    type="email"
                                    value={internalEmail}
                                    onChange={(e) => setInternalEmail(e.target.value)}
                                    placeholder="info@maisonvie.vn"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                                />
                                <p className="mt-2 text-sm leading-5 text-slate-500">Email nội bộ luôn dùng tiếng Việt để lễ tân/quản lý dễ xử lý.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSendCustomerEmail(!sendCustomerEmail)}
                                className={`flex min-h-[72px] w-full items-center justify-between gap-4 rounded-3xl border p-4 text-left transition-all active:scale-[0.98] ${sendCustomerEmail ? 'border-sky-300/60 bg-sky-50 text-sky-950 shadow-lg shadow-sky-950/10' : 'border-white/70 bg-white text-slate-800 shadow-lg shadow-slate-950/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${sendCustomerEmail ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-base font-black">Gửi email cho khách</div>
                                        <div className="text-sm leading-5 opacity-70">Tự động theo ngôn ngữ khách chọn</div>
                                    </div>
                                </div>
                                <div className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${sendCustomerEmail ? 'bg-sky-500' : 'bg-slate-300'}`}>
                                    <div className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform ${sendCustomerEmail ? 'translate-x-6' : ''}`} />
                                </div>
                            </button>

                            <div className="rounded-3xl border border-teal-100 bg-white p-4 shadow-xl shadow-slate-950/10">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-lg font-black leading-tight text-slate-900">Mẫu nội dung email</h4>
                                        <p className="mt-1 text-sm leading-5 text-slate-500">Chọn mẫu, chỉnh nội dung và giữ nguyên các biến trong dấu ngoặc.</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                                    Nếu còn mẫu cũ, bấm nút dưới rồi bấm lưu. Email khách vẫn tự động chuyển VI/EN theo booking.
                                </div>

                                <button
                                    type="button"
                                    onClick={resetAllTemplates}
                                    className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 px-4 py-3 text-sm font-black text-amber-900 transition active:scale-[0.98]"
                                >
                                    Khôi phục tất cả mẫu tiếng Việt
                                </button>

                                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {(Object.keys(DEFAULT_TEMPLATES) as TemplateKey[]).map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedTemplate(key)}
                                            className={`min-h-[48px] min-w-[190px] rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.98] ${selectedTemplate === key ? 'border-teal-400 bg-teal-50 shadow-md shadow-teal-100' : 'border-slate-200 bg-slate-50'}`}
                                        >
                                            <div className="text-sm font-black text-slate-900">{DEFAULT_TEMPLATES[key].label}</div>
                                            <div className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">{DEFAULT_TEMPLATES[key].desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-black text-slate-900">Đang sửa: {selectedMeta.label}</label>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">Biến giữ nguyên: {'{{customerName}}'}, {'{{phone}}'}, {'{{date}}'}, {'{{time}}'}, {'{{pax}}'}, {'{{table}}'}, {'{{menus}}'}</p>
                                    </div>
                                    <textarea
                                        value={templateValues[selectedTemplate]}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        rows={10}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base leading-7 text-slate-800 outline-none shadow-inner transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={resetSelectedTemplate}
                                        className="min-h-[44px] w-full rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800 transition active:scale-[0.98]"
                                    >
                                        Khôi phục riêng mẫu đang sửa
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-sm leading-6 text-slate-300 backdrop-blur-xl">
                                <strong className="text-amber-200">Bảo mật:</strong> SMTP host, port và mật khẩu được giữ trong Vercel Environment Variables, không hiển thị trên điện thoại.
                            </div>
                        </>
                    )}
                </div>

                <div className="sticky bottom-3 z-20 rounded-3xl border border-white/20 bg-slate-950/85 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:static sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
                    <div className="grid grid-cols-1 gap-3 sm:flex">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 px-6 py-3 text-base font-black text-slate-950 shadow-lg shadow-teal-500/25 transition active:scale-[0.98] disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            {saving ? 'Đang lưu...' : saved ? 'Đã lưu cấu hình' : 'Lưu cấu hình Email'}
                        </button>

                        {smtpEnabled && (
                            <button
                                onClick={handleTestSmtp}
                                disabled={testing}
                                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-6 py-3 text-base font-black text-slate-800 shadow-lg shadow-slate-950/10 transition active:scale-[0.98] disabled:opacity-60"
                            >
                                {testing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                {testing ? 'Đang gửi test...' : 'Gửi email test'}
                            </button>
                        )}
                    </div>
                </div>

                {testResult && (
                    <div className={`rounded-2xl p-4 text-sm leading-6 shadow-lg ${testResult.success ? 'border border-emerald-200 bg-emerald-50 text-emerald-900' : 'border border-red-200 bg-red-50 text-red-900'}`}>
                        <div className="font-black">{testResult.message}</div>
                        {testResult.details && <div className="mt-1 text-xs opacity-80">{testResult.details}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
