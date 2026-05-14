import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, Loader2, Server, ShieldCheck, FileText, Plus, X } from 'lucide-react';
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
    const [newInternalEmail, setNewInternalEmail] = useState('');

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

    const internalEmailList = internalEmail
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);

    const addInternalEmail = () => {
        const email = newInternalEmail.trim().toLowerCase();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        if (internalEmailList.includes(email)) {
            setNewInternalEmail('');
            return;
        }
        setInternalEmail([...internalEmailList, email].join(', '));
        setNewInternalEmail('');
    };

    const removeInternalEmail = (emailToRemove: string) => {
        setInternalEmail(internalEmailList.filter(email => email !== emailToRemove).join(', '));
    };

    const handleInternalEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addInternalEmail();
        }
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
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />Thông báo Email
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Quản lý email gửi khách (song ngữ tự động) và thông báo nội bộ (tiếng Việt).
            </p>

            <div className="space-y-6">
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setSmtpEnabled(!smtpEnabled)}
                        className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all active:bg-gray-50 ${smtpEnabled ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-gray-50/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${smtpEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Server className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">Bật SMTP Email</div>
                                <div className="text-xs text-gray-500 mt-0.5">Gửi email tự động khi có booking</div>
                            </div>
                        </div>
                        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${smtpEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${smtpEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    {smtpEnabled && (
                        <>
                            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1">Email nhận thông báo nội bộ</label>
                                    <p className="text-xs text-gray-500">Thêm từng email lễ tân/quản lý để nhận thông báo booking.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        value={newInternalEmail}
                                        onChange={(e) => setNewInternalEmail(e.target.value)}
                                        onKeyDown={handleInternalEmailKeyDown}
                                        placeholder="Nhập email rồi bấm Thêm"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={addInternalEmail}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm shadow-teal-100"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm
                                    </button>
                                </div>

                                {internalEmailList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {internalEmailList.map(email => (
                                            <span key={email} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100 text-sm font-semibold">
                                                <Mail className="w-3.5 h-3.5 text-teal-500" />
                                                {email}
                                                <button
                                                    type="button"
                                                    onClick={() => removeInternalEmail(email)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-teal-100 text-teal-600 transition-colors"
                                                    title="Xóa email"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                                        Chưa có email nội bộ nào. Thêm ít nhất 1 email để nhận thông báo.
                                    </div>
                                )}

                                <p className="text-[11px] text-gray-400">Có thể bấm Enter sau khi nhập email. Hệ thống vẫn lưu theo định dạng tương thích SMTP.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSendCustomerEmail(!sendCustomerEmail)}
                                className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all active:bg-gray-50 ${sendCustomerEmail ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sendCustomerEmail ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">Gửi email cho khách</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Tự động chuyển VI/EN theo ngôn ngữ khách</div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${sendCustomerEmail ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${sendCustomerEmail ? 'translate-x-6' : ''}`} />
                                </div>
                            </button>

                            <div className="p-4 sm:p-5 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-white shadow-sm space-y-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Mẫu nội dung email</h4>
                                        <p className="text-xs text-gray-500 mt-1">Sửa nội dung, giữ nguyên biến trong ngoặc {'{{}}'}</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 mb-4">
                                    Nếu đang thấy mẫu tiếng Anh cũ, hãy bấm nút khôi phục bên dưới rồi lưu cấu hình.
                                </div>

                                <button
                                    type="button"
                                    onClick={resetAllTemplates}
                                    className="w-full sm:w-auto text-xs font-bold text-amber-700 bg-white border border-amber-200 px-4 py-2.5 rounded-lg active:bg-amber-50 transition-colors"
                                >
                                    Khôi phục tất cả mẫu tiếng Việt
                                </button>

                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mt-4 -mx-2 px-2 sm:mx-0 sm:px-0">
                                    {(Object.keys(DEFAULT_TEMPLATES) as TemplateKey[]).map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedTemplate(key)}
                                            className={`flex-shrink-0 w-[180px] text-left rounded-xl border p-3 transition-colors active:bg-gray-50 ${selectedTemplate === key ? 'border-teal-400 bg-white shadow-sm' : 'border-gray-200 bg-white/60 text-gray-500'}`}
                                        >
                                            <div className={`text-sm font-bold truncate ${selectedTemplate === key ? 'text-teal-700' : 'text-gray-700'}`}>{DEFAULT_TEMPLATES[key].label}</div>
                                            <div className="text-[10px] mt-1 line-clamp-2 opacity-80">{DEFAULT_TEMPLATES[key].desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{selectedMeta.label}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5 font-mono">Biến: {'{{customerName}}'}, {'{{phone}}'}, {'{{date}}'}...</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetSelectedTemplate}
                                            className="text-xs font-bold text-teal-600 bg-white border border-teal-100 px-3 py-2 rounded-md active:bg-teal-50"
                                        >
                                            Mặc định
                                        </button>
                                    </div>
                                    <textarea
                                        value={templateValues[selectedTemplate]}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        rows={12}
                                        className="w-full p-4 font-mono text-[13px] leading-relaxed text-gray-700 outline-none resize-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-3.5 rounded-xl font-bold shadow-md shadow-teal-100 transition-all active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                        {saving ? 'Đang lưu...' : saved ? 'Đã lưu cấu hình' : 'Lưu cấu hình Email'}
                    </button>

                    {smtpEnabled && (
                        <button
                            onClick={handleTestSmtp}
                            disabled={testing}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 text-gray-700 px-6 py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
                        >
                            {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {testing ? 'Đang gửi...' : 'Gửi test'}
                        </button>
                    )}
                </div>

                {testResult && (
                    <div className={`p-4 rounded-xl text-sm ${testResult.success ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                        <div className="font-bold">{testResult.message}</div>
                        {testResult.details && <div className="text-xs mt-1 opacity-80">{testResult.details}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
