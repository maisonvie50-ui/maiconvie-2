import {
    c as ee,
    r as l,
    j as e,
    B as gt,
    X as w,
    b as E,
    S as ge,
    U as ut,
    m as Ae,
    g as Ht
} from "./index-BboNJZcl.js";
import {
    s as n,
    b as Ot,
    t as Ft
} from "./bookingNotifyService-U9IeDJVp.js";
import {
    L as Me
} from "./loader-circle-O0pOBUyc.js";
import {
    C as q
} from "./check-CgNF39Qb.js";
import {
    S as Vt
} from "./send-BD9P1YA3.js";
import {
    t as m,
    S as Qt,
    A as bt
} from "./trainingService-Dqu_7FRr.js";
import {
    A as Gt
} from "./activity-7yJpPpT1.js";
import {
    S as Pe
} from "./square-pen-Dv2raXIk.js";
import {
    T as De
} from "./triangle-alert-Di-mlJ2I.js";
import {
    T as Z
} from "./trash-2-UJczOIG_.js";
import {
    S as pt
} from "./search-DgPpWSye.js";
import {
    P as I
} from "./plus-MQ_AaWY8.js";
import {
    C as ft
} from "./chevron-right-CRKjTIxL.js";
import {
    C as J
} from "./clock-BsgIqHBG.js";
import {
    S as Rt
} from "./save-3CYdkInS.js";
import {
    S as Wt
} from "./star-fHbnI8Bg.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xt = [
        ["rect", {
            width: "14",
            height: "14",
            x: "8",
            y: "8",
            rx: "2",
            ry: "2",
            key: "17jyea"
        }],
        ["path", {
            d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
            key: "zix9uf"
        }]
    ],
    yt = ee("copy", Xt);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = [
        ["circle", {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }],
        ["path", {
            d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
            key: "13o1zl"
        }],
        ["path", {
            d: "M2 12h20",
            key: "9i4pu4"
        }]
    ],
    Zt = ee("globe", Yt);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jt = [
        ["rect", {
            width: "18",
            height: "7",
            x: "3",
            y: "3",
            rx: "1",
            key: "f1a2em"
        }],
        ["rect", {
            width: "9",
            height: "7",
            x: "3",
            y: "14",
            rx: "1",
            key: "jqznyg"
        }],
        ["rect", {
            width: "5",
            height: "7",
            x: "16",
            y: "14",
            rx: "1",
            key: "q5h2i8"
        }]
    ],
    es = ee("layout-template", Jt);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ts = [
        ["path", {
            d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
            key: "1cjeqo"
        }],
        ["path", {
            d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
            key: "19qd67"
        }]
    ],
    ue = ee("link", ts);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ss = [
        ["path", {
            d: "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
            key: "1q2vi4"
        }],
        ["path", {
            d: "m10 15 5-3-5-3z",
            key: "1jp15x"
        }]
    ],
    as = ee("youtube", ss);

function ls() {
    const [i, B] = l.useState(!1), [k, te] = l.useState(""), [u, se] = l.useState(!1), [y, U] = l.useState(!1), [j, ae] = l.useState(!1), [_, K] = l.useState(null), [qe, be] = l.useState(!1);
    l.useEffect(() => {
        (async () => {
            const c = await n.getAppSettings();
            c && (B(!!c.webhookEnabled), te(c.webhookUrl || "")), be(!0)
        })()
    }, []);
    const z = async () => {
        se(!0), U(!1), K(null);
        try {
            await n.updateAppSetting("webhookEnabled", i), await n.updateAppSetting("webhookUrl", k), U(!0), setTimeout(() => U(!1), 3e3)
        } catch (c) {
            console.error("Save notification settings failed:", c)
        } finally {
            se(!1)
        }
    }, H = async () => {
        ae(!0), K(null);
        try {
            await n.updateAppSetting("webhookEnabled", i), await n.updateAppSetting("webhookUrl", k)
        } catch (O) {
            console.error("Auto-save before test failed:", O)
        }
        const c = await Ot.sendTestNotification({
            webhookEnabled: i,
            webhookUrl: k
        });
        K(c), ae(!1)
    };
    return qe ? e.jsxs("div", {
        className: "bg-white rounded-xl border border-gray-200 shadow-sm p-8",
        children: [e.jsxs("h3", {
            className: "font-bold text-gray-800 mb-6 flex items-center gap-2",
            children: [e.jsx(gt, {
                className: "w-5 h-5 text-teal-600"
            }), "Cấu hình Thông báo Booking"]
        }), e.jsx("p", {
            className: "text-sm text-gray-500 mb-6",
            children: "Nhận thông báo tự động khi có đặt bàn mới hoặc thay đổi trạng thái booking."
        }), e.jsx("div", {
            className: "space-y-6",
            children: e.jsxs("div", {
                className: `rounded-xl border p-6 transition-colors ${i?"border-teal-200 bg-teal-50/30":"border-gray-200 bg-gray-50/50"}`,
                children: [e.jsxs("div", {
                    className: "flex items-start justify-between mb-4",
                    children: [e.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [e.jsx("div", {
                            className: `w-10 h-10 rounded-lg flex items-center justify-center ${i?"bg-teal-100 text-teal-600":"bg-gray-100 text-gray-400"}`,
                            children: e.jsx(Zt, {
                                className: "w-5 h-5"
                            })
                        }), e.jsxs("div", {
                            children: [e.jsx("h4", {
                                className: "font-bold text-gray-800",
                                children: "Webhook (HTTP POST)"
                            }), e.jsx("p", {
                                className: "text-xs text-gray-500",
                                children: "Gửi dữ liệu booking tới URL bên ngoài"
                            })]
                        })]
                    }), e.jsx("div", {
                        onClick: () => B(!i),
                        className: `w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${i?"bg-teal-500":"bg-gray-300"}`,
                        children: e.jsx("div", {
                            className: `bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${i?"translate-x-6":""}`
                        })
                    })]
                }), i && e.jsxs("div", {
                    className: "space-y-3 mt-4",
                    children: [e.jsx("label", {
                        className: "block text-sm font-medium text-gray-700",
                        children: "Webhook URL"
                    }), e.jsx("input", {
                        type: "url",
                        value: k,
                        onChange: c => te(c.target.value),
                        placeholder: "https://hooks.slack.com/... hoặc Make / Zapier webhook",
                        className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                    }), e.jsx("p", {
                        className: "text-xs text-gray-400",
                        children: "Hệ thống gửi POST với JSON body chứa thông tin booking."
                    })]
                })]
            })
        }), e.jsxs("div", {
            className: "mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4",
            children: [e.jsxs("button", {
                onClick: z,
                disabled: u,
                className: "flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors",
                children: [u ? e.jsx(Me, {
                    className: "w-4 h-4 animate-spin"
                }) : y ? e.jsx(q, {
                    className: "w-4 h-4"
                }) : e.jsx(gt, {
                    className: "w-4 h-4"
                }), u ? "Đang lưu..." : y ? "Đã lưu!" : "Lưu cấu hình thông báo"]
            }), e.jsxs("button", {
                onClick: H,
                disabled: j || !i,
                className: "flex items-center gap-2 bg-white border border-gray-300 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors",
                children: [j ? e.jsx(Me, {
                    className: "w-4 h-4 animate-spin"
                }) : e.jsx(Vt, {
                    className: "w-4 h-4"
                }), j ? "Đang gửi test..." : "Gửi thông báo test"]
            })]
        }), _ && e.jsx("div", {
            className: `mt-4 p-4 rounded-lg text-sm whitespace-pre-line ${_.success?"bg-green-50 text-green-800 border border-green-100":"bg-red-50 text-red-800 border border-red-100"}`,
            children: _.message
        })]
    }) : e.jsx("div", {
        className: "bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[200px]",
        children: e.jsx(Me, {
            className: "w-6 h-6 text-gray-400 animate-spin"
        })
    })
}

function Cs() {
    var mt;
    const [i, B] = l.useState("permissions"), [k, te] = l.useState(!1), [u, se] = l.useState([]), [y, U] = l.useState([]), [j, ae] = l.useState([]), [_, K] = l.useState([]), [qe, be] = l.useState({}), [z, H] = l.useState(120), [c, O] = l.useState(!1), [v, pe] = l.useState(11), [C, fe] = l.useState(14), [N, ye] = l.useState(17), [S, je] = l.useState(22), [T, ve] = l.useState([{
        id: "1",
        name: "Sảnh Tầng 1",
        capacity: 80
    }, {
        id: "2",
        name: "Sảnh Tầng 2",
        capacity: 50
    }, {
        id: "3",
        name: "Tầng 3",
        capacity: 20
    }]), [jt, F] = l.useState(!1), [o, V] = l.useState({
        name: "",
        email: "",
        password: "",
        role: "reception"
    }), [Ne, Be] = l.useState(""), [A, Ue] = l.useState("all"), [vt, Q] = l.useState(!1), [d, we] = l.useState(null), [_e, le] = l.useState(!1), [re, Ke] = l.useState(""), [L, ke] = l.useState(""), [Ce, ze] = l.useState("server"), [He, Oe] = l.useState(!1), [ne, G] = l.useState(""), [p, f] = l.useState([]), [Nt, M] = l.useState(!1), [Se, Fe] = l.useState(null), [wt, ie] = l.useState(!1), [Ve, kt] = l.useState([]), [Qe, Ge] = l.useState(""), [oe, Re] = l.useState(""), [We, Xe] = l.useState(1), [$, Te] = l.useState(null), [R, Ye] = l.useState(null), [de, Ze] = l.useState(""), [Je, et] = l.useState(1), [ce, tt] = l.useState(""), [Ct, W] = l.useState(!1), [St, Le] = l.useState([]), [Tt, Lt] = l.useState([]), [rs, ns] = l.useState(""), [is, os] = l.useState(2), [xe, st] = l.useState(""), [at, $t] = l.useState(2), [P, $e] = l.useState("courses"), [g, lt] = l.useState(""), [D, rt] = l.useState(!1), nt = () => {
        const t = window.location.origin + "/dat-ban-online" + (g ? `?source=${g}` : "");
        navigator.clipboard.writeText(t), rt(!0), setTimeout(() => rt(!1), 2e3)
    };
    l.useEffect(() => {
        const t = () => te(window.innerWidth < 768);
        return t(), window.addEventListener("resize", t), () => window.removeEventListener("resize", t)
    }, []);
    const x = async () => {
        const [t, s, r, a, h, b, Y, zt] = await Promise.all([n.getEmployees(), n.getStations(), m.getModulesForAdmin(), n.getAppSettings(), n.getActivityLogs(), Ft.getTables(), m.getLevelConfig(), m.getChecklist()]);
        se(t), U(s), ae(r), K(h), kt(b), Le(Y), Lt(zt), a && (be(a), a.defaultDuration && H(a.defaultDuration), a.strictMode !== void 0 && O(a.strictMode), a.lunchStart && pe(a.lunchStart), a.lunchEnd && fe(a.lunchEnd), a.dinnerStart && ye(a.dinnerStart), a.dinnerEnd && je(a.dinnerEnd), a.areas && ve(a.areas))
    };
    l.useEffect(() => {
        x()
    }, []);
    const it = async () => {
        await n.updateAppSetting("defaultDuration", z), await n.updateAppSetting("strictMode", c), await n.updateAppSetting("lunchStart", v), await n.updateAppSetting("lunchEnd", C), await n.updateAppSetting("dinnerStart", N), await n.updateAppSetting("dinnerEnd", S), await n.updateAppSetting("areas", T), alert("Đã lưu cấu hình thành công!")
    }, Ee = t => {
        const s = y.find(r => r.id === t);
        s && (Fe(t), f(s.tables || []), ie(!0))
    }, Et = async () => {
        Se && (await n.updateStation(Se, {
            tables: p
        }), await x(), ie(!1), Fe(null), f([]))
    }, It = async (t, s) => {
        await n.addStation({
            name: t,
            tables: s,
            staffIds: []
        }), await x(), M(!1), G(""), f([])
    }, ot = async t => {
        await n.deleteStation(t), await x()
    }, dt = async (t, s) => {
        const r = y.find(a => a.id === t);
        r && !r.staffIds.includes(s) && (await n.updateStation(t, {
            staffIds: [...r.staffIds, s]
        }), await x())
    }, ct = async (t, s) => {
        const r = y.find(a => a.id === t);
        r && (await n.updateStation(t, {
            staffIds: r.staffIds.filter(a => a !== s)
        }), await x())
    }, he = t => {
        const s = t.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        return s ? s[1] : null
    }, X = he(Qe), At = async () => {
        !X || !oe || (await m.addModule({
            title: oe,
            level: We,
            youtubeId: X
        }), await x(), Ge(""), Re(""), Xe(1))
    }, Mt = async t => {
        const s = j.find(r => r.id === t);
        s && (await m.updateModule(t, {
            is_active: !s.active
        }), await x())
    }, Pt = async t => {
        confirm("Bạn chắc chắn muốn xóa khóa học này?") && (await m.deleteModule(t), await x())
    }, Dt = t => {
        Ye(t), Ze(t.title), et(t.level), tt(t.youtubeId ? `https://youtube.com/watch?v=${t.youtubeId}` : ""), W(!0)
    }, qt = async () => {
        if (!R || !de) return;
        const t = he(ce),
            s = {
                title: de,
                level: Je
            };
        t && t !== R.youtubeId && (s.youtube_id = t, s.thumbnail_url = `https://img.youtube.com/vi/${t}/hqdefault.jpg`), await m.updateModule(R.id, s), await x(), W(!1), Ye(null)
    }, Bt = async () => {
        if (!(!o.name || !o.email || !o.password)) try {
            await n.addEmployee({
                name: o.name,
                email: o.email,
                password: o.password,
                roles: {
                    reception: o.role === "reception",
                    kitchen: o.role === "kitchen",
                    server: o.role === "server",
                    manager: o.role === "manager"
                }
            }), await x(), F(!1), V({
                name: "",
                email: "",
                password: "",
                role: "reception"
            }), alert("Tạo tài khoản thành công!")
        } catch (t) {
            alert(t.message || "Có lỗi xảy ra khi tạo tài khoản")
        }
    }, xt = async t => {
        const s = u.find(r => r.id === t);
        s && (await n.updateEmployee(t, {
            active: !s.active
        }), await x())
    }, me = u.filter(t => {
        const s = Ne.toLowerCase(),
            r = t.name.toLowerCase().includes(s) || t.email.toLowerCase().includes(s);
        let a = !0;
        return A === "manager" && (a = t.roles.manager), A === "reception" && (a = t.roles.reception), A === "kitchen" && (a = t.roles.kitchen), A === "server" && (a = t.roles.server), r && a
    }), Ie = t => {
        we(t), le(!1), Ke(t.name), ke("");
        let s = "server";
        t.roles.manager ? s = "manager" : t.roles.reception ? s = "receptionist" : t.roles.kitchen && (s = "kitchen"), ze(s), Q(!0)
    }, Ut = async () => {
        if (d) {
            Oe(!0);
            try {
                const t = {};
                L.length >= 6 && (t.newPassword = L), Ce && (t.newRole = Ce), re && re !== d.name && (t.name = re), await n.updateEmployeeCredentials(d.id, t), await x();
                const s = (await n.getEmployees()).find(r => r.id === d.id);
                s && we(s), le(!1), ke(""), alert("Cập nhật thành công!")
            } catch (t) {
                alert(t.message || "Có lỗi xảy ra khi cập nhật")
            } finally {
                Oe(!1)
            }
        }
    }, ht = () => e.jsxs("div", {
        className: "space-y-6",
        children: [e.jsxs("div", {
            className: "flex bg-gray-100/50 p-1.5 rounded-xl mb-4 overflow-x-auto hide-scrollbar border border-gray-200/60 snap-x",
            children: [e.jsxs("button", {
                onClick: () => $e("courses"),
                className: `flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${P==="courses"?"bg-white text-teal-600 shadow-sm border border-gray-200/50":"text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`,
                children: [e.jsx(Ht, {
                    className: "w-4 h-4"
                }), " Quản lý Khóa học"]
            }), e.jsxs("button", {
                onClick: () => $e("levels"),
                className: `flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${P==="levels"?"bg-white text-teal-600 shadow-sm border border-gray-200/50":"text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`,
                children: [e.jsx(Wt, {
                    className: "w-4 h-4"
                }), " Cấp độ & Đánh giá"]
            }), e.jsxs("button", {
                onClick: () => $e("advanced"),
                className: `flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${P==="advanced"?"bg-white text-teal-600 shadow-sm border border-gray-200/50":"text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`,
                children: [e.jsx(ge, {
                    className: "w-4 h-4"
                }), " Nâng cao"]
            })]
        }), P === "courses" && e.jsxs("div", {
            className: "animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 md:grid-cols-3 gap-6",
            children: [e.jsxs("div", {
                className: "md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-fit",
                children: [e.jsx("div", {
                    className: "absolute top-0 left-0 w-1 h-full bg-teal-500"
                }), e.jsxs("h3", {
                    className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                    children: [e.jsx(as, {
                        className: "w-5 h-5 text-red-500"
                    }), "Thêm khóa học mới"]
                }), e.jsxs("div", {
                    className: "space-y-4",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5",
                            children: "Tên khóa học"
                        }), e.jsx("input", {
                            type: "text",
                            value: oe,
                            onChange: t => Re(t.target.value),
                            placeholder: "VD: Quy trình phục vụ",
                            className: "w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5",
                            children: "Cấp độ"
                        }), e.jsxs("select", {
                            value: We,
                            onChange: t => Xe(Number(t.target.value)),
                            className: "w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors",
                            children: [e.jsx("option", {
                                value: 1,
                                children: "Level 1: Nhập môn"
                            }), e.jsx("option", {
                                value: 2,
                                children: "Level 2: Cơ bản"
                            }), e.jsx("option", {
                                value: 3,
                                children: "Level 3: Nâng cao"
                            }), e.jsx("option", {
                                value: 4,
                                children: "Level 4: Chuyên sâu"
                            }), e.jsx("option", {
                                value: 5,
                                children: "Level 5: Quản lý"
                            })]
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1",
                            children: [e.jsx(ue, {
                                className: "w-3.5 h-3.5"
                            }), "Link YouTube"]
                        }), e.jsx("input", {
                            type: "text",
                            value: Qe,
                            onChange: t => Ge(t.target.value),
                            placeholder: "https://youtube.com/watch?v=...",
                            className: "w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors"
                        })]
                    }), X && e.jsx("div", {
                        className: "w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm",
                        children: e.jsx("img", {
                            src: `https://img.youtube.com/vi/${X}/hqdefault.jpg`,
                            alt: "Preview",
                            className: "w-full h-full object-cover",
                            onError: t => {
                                t.currentTarget.style.display = "none"
                            }
                        })
                    }), e.jsxs("button", {
                        onClick: At,
                        disabled: !X || !oe,
                        className: "w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm",
                        children: [e.jsx(I, {
                            className: "w-5 h-5"
                        }), "Lưu Khóa Học"]
                    })]
                })]
            }), e.jsxs("div", {
                className: "md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full",
                children: [e.jsxs("div", {
                    className: "px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center",
                    children: [e.jsx("h3", {
                        className: "font-bold text-gray-800",
                        children: "Danh sách khóa học"
                    }), e.jsxs("span", {
                        className: "text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100",
                        children: [j.length, " khóa"]
                    })]
                }), e.jsxs("div", {
                    className: "divide-y divide-gray-50 overflow-y-auto max-h-[600px]",
                    children: [j.length === 0 && e.jsxs("div", {
                        className: "p-8 text-center text-gray-400 mt-10",
                        children: [e.jsx(Ae, {
                            className: "w-12 h-12 mx-auto mb-3 opacity-30 text-teal-600"
                        }), e.jsx("p", {
                            className: "text-sm",
                            children: "Chưa có khóa học nào. Hãy thêm khóa học đầu tiên!"
                        })]
                    }), j.map(t => e.jsxs("div", {
                        className: `p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors ${t.active?"":"opacity-50 grayscale-[0.5]"}`,
                        children: [e.jsxs("div", {
                            className: "relative w-24 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm group",
                            children: [e.jsx("img", {
                                src: `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`,
                                alt: t.title,
                                className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                                onError: s => {
                                    s.currentTarget.style.display = "none"
                                }
                            }), e.jsx("div", {
                                className: "absolute inset-0 bg-black/20 flex items-center justify-center",
                                children: e.jsx(Ae, {
                                    className: "w-5 h-5 text-white opacity-90 shadow-sm"
                                })
                            })]
                        }), e.jsxs("div", {
                            className: "flex-1 min-w-0 flex flex-col justify-between h-full py-0.5",
                            children: [e.jsx("div", {
                                className: "font-bold text-gray-800 text-sm leading-snug line-clamp-2",
                                children: t.title
                            }), e.jsxs("div", {
                                className: "flex items-center justify-between mt-2",
                                children: [e.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [e.jsxs("span", {
                                        className: "bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                        children: ["Lv ", t.level]
                                    }), e.jsx("div", {
                                        onClick: () => Mt(t.id),
                                        className: `w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shadow-inner ${t.active?"bg-teal-500":"bg-gray-300"}`,
                                        children: e.jsx("div", {
                                            className: `bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out flex items-center justify-center ${t.active?"translate-x-4":""}`,
                                            children: t.active && e.jsx(q, {
                                                className: "w-2.5 h-2.5 text-teal-500"
                                            })
                                        })
                                    })]
                                }), e.jsxs("div", {
                                    className: "flex items-center gap-1",
                                    children: [e.jsx("button", {
                                        onClick: () => Dt(t),
                                        className: "p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors",
                                        title: "Sửa khóa học",
                                        children: e.jsx(Pe, {
                                            className: "w-4 h-4"
                                        })
                                    }), e.jsx("button", {
                                        onClick: () => Pt(t.id),
                                        className: "p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                                        title: "Xóa khóa học",
                                        children: e.jsx(Z, {
                                            className: "w-4 h-4"
                                        })
                                    })]
                                })]
                            })]
                        })]
                    }, t.id))]
                })]
            })]
        }), P === "levels" && e.jsx("div", {
            className: "animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3 max-w-4xl mx-auto",
            children: St.map(t => {
                const s = Tt.filter(a => a.level === t.level),
                    r = [{
                        dot: "bg-emerald-500",
                        text: "text-emerald-700",
                        bg: "bg-emerald-50",
                        border: "border-emerald-200"
                    }, {
                        dot: "bg-blue-500",
                        text: "text-blue-700",
                        bg: "bg-blue-50",
                        border: "border-blue-200"
                    }, {
                        dot: "bg-violet-500",
                        text: "text-violet-700",
                        bg: "bg-violet-50",
                        border: "border-violet-200"
                    }, {
                        dot: "bg-amber-500",
                        text: "text-amber-700",
                        bg: "bg-amber-50",
                        border: "border-amber-200"
                    }, {
                        dot: "bg-rose-500",
                        text: "text-rose-700",
                        bg: "bg-rose-50",
                        border: "border-rose-200"
                    }][t.level - 1] || {
                        text: "text-gray-700",
                        bg: "bg-gray-50"
                    };
                return e.jsxs("div", {
                    className: "bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all",
                    children: [e.jsxs("div", {
                        className: "px-4 py-3 flex items-center gap-3 border-b border-gray-100",
                        children: [e.jsx("div", {
                            className: `w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center shrink-0`,
                            children: e.jsx("span", {
                                className: `text-xs font-black ${r.text}`,
                                children: t.level
                            })
                        }), e.jsx("div", {
                            className: "flex-1 min-w-0",
                            children: e.jsx("h4", {
                                className: "text-sm font-bold text-gray-800 truncate",
                                children: t.name
                            })
                        }), e.jsxs("div", {
                            className: "flex items-center gap-1.5 shrink-0",
                            children: [e.jsx(J, {
                                className: "w-3.5 h-3.5 text-gray-300"
                            }), e.jsx("input", {
                                type: "number",
                                value: t.minDaysFromPrev,
                                onChange: async a => {
                                    const h = parseInt(a.target.value) || 0;
                                    await m.updateLevelConfig(t.level, {
                                        min_days_from_prev: h
                                    }), Le(b => b.map(Y => Y.level === t.level ? {
                                        ...Y,
                                        minDaysFromPrev: h
                                    } : Y))
                                },
                                className: "w-12 px-1.5 py-1 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-md text-center focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                            }), e.jsx("span", {
                                className: "text-[11px] text-gray-400",
                                children: "ngày"
                            })]
                        }), t.level > 1 && e.jsxs("div", {
                            className: "flex items-center gap-2 shrink-0 pl-2 border-l border-gray-100",
                            children: [e.jsx("span", {
                                className: "text-[11px] text-gray-400 font-medium hidden sm:inline",
                                children: "Đánh giá"
                            }), e.jsx("div", {
                                onClick: async () => {
                                    const a = !t.requiresEvaluation;
                                    await m.updateLevelConfig(t.level, {
                                        requires_evaluation: a
                                    }), Le(h => h.map(b => b.level === t.level ? {
                                        ...b,
                                        requiresEvaluation: a
                                    } : b))
                                },
                                className: `w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${t.requiresEvaluation?"bg-teal-500":"bg-gray-200"}`,
                                children: e.jsx("div", {
                                    className: `bg-white w-4 h-4 rounded-full shadow-sm transform duration-200 ${t.requiresEvaluation?"translate-x-4":""}`
                                })
                            })]
                        })]
                    }), t.level > 1 && t.requiresEvaluation && e.jsxs("div", {
                        className: "px-4 py-3 bg-gray-50/50",
                        children: [e.jsxs("div", {
                            className: "flex items-center justify-between mb-2",
                            children: [e.jsx("span", {
                                className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider",
                                children: "Tiêu chí đánh giá"
                            }), e.jsxs("span", {
                                className: "text-[10px] text-gray-300 font-medium",
                                children: [s.length, " mục"]
                            })]
                        }), s.length > 0 ? e.jsx("div", {
                            className: "space-y-1.5 mb-3",
                            children: s.map((a, h) => e.jsxs("div", {
                                className: "flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors",
                                children: [e.jsx("span", {
                                    className: `text-[10px] font-bold ${r.text} w-4 text-center shrink-0`,
                                    children: h + 1
                                }), e.jsx("span", {
                                    className: "text-sm text-gray-700 flex-1 leading-snug",
                                    children: a.itemText
                                }), e.jsx("button", {
                                    onClick: async () => {
                                        await m.deleteChecklistItem(a.id), await x()
                                    },
                                    className: "text-gray-200 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all",
                                    title: "Xóa",
                                    children: e.jsx(Z, {
                                        className: "w-3.5 h-3.5"
                                    })
                                })]
                            }, a.id))
                        }) : e.jsx("div", {
                            className: "py-4 text-center text-xs text-gray-300 border border-dashed border-gray-200 rounded-lg bg-white mb-3",
                            children: "Chưa có tiêu chí"
                        }), e.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [e.jsx("input", {
                                type: "text",
                                id: `checklist-input-${t.level}`,
                                placeholder: "Thêm tiêu chí...",
                                onKeyDown: async a => {
                                    if (a.key === "Enter" && a.currentTarget.value.trim()) {
                                        const h = a.currentTarget.value.trim();
                                        a.currentTarget.value = "", await m.addChecklistItem(t.level, h, s.length + 1), await x()
                                    }
                                },
                                className: "flex-1 pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                            }), e.jsxs("button", {
                                onClick: async () => {
                                    const a = document.getElementById(`checklist-input-${t.level}`);
                                    if (a && a.value.trim()) {
                                        const h = a.value.trim();
                                        a.value = "", await m.addChecklistItem(t.level, h, s.length + 1), await x()
                                    }
                                },
                                className: "px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center gap-1",
                                children: [e.jsx(I, {
                                    className: "w-3.5 h-3.5"
                                }), "Thêm"]
                            })]
                        })]
                    })]
                }, t.level)
            })
        }), P === "advanced" && e.jsx("div", {
            className: "animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto mt-8",
            children: e.jsxs("div", {
                className: "bg-gradient-to-br from-white to-teal-50/30 p-8 rounded-3xl shadow-lg border border-teal-200/60 relative overflow-hidden",
                children: [e.jsx("div", {
                    className: "absolute -right-10 -top-10 text-teal-500 opacity-5 object-cover rotate-12 scale-150 pointer-events-none",
                    children: e.jsx(bt, {
                        className: "w-64 h-64"
                    })
                }), e.jsxs("div", {
                    className: "relative z-10",
                    children: [e.jsxs("div", {
                        className: "flex flex-col items-center text-center mb-8",
                        children: [e.jsx("div", {
                            className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4 text-white transform rotate-3",
                            children: e.jsx(bt, {
                                className: "w-8 h-8"
                            })
                        }), e.jsx("h4", {
                            className: "font-black text-gray-900 text-2xl tracking-tight",
                            children: "Thăng cấp thủ công"
                        }), e.jsx("p", {
                            className: "text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed",
                            children: "Ghi đè hệ thống - Cập nhật trực tiếp Level cho nhân viên bỏ qua điều kiện video và ngày chờ."
                        })]
                    }), e.jsxs("div", {
                        className: "space-y-5 bg-white/80 backdrop-blur p-6 rounded-2xl border border-teal-100 shadow-sm",
                        children: [e.jsxs("div", {
                            children: [e.jsx("label", {
                                className: "block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 ml-1",
                                children: "👤 Chọn Nhân viên"
                            }), e.jsxs("select", {
                                title: "Chọn nhân viên",
                                value: xe,
                                onChange: t => st(t.target.value),
                                className: "w-full px-4 py-3.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 shadow-sm transition-shadow",
                                children: [e.jsx("option", {
                                    value: "",
                                    className: "font-normal",
                                    children: "-- Danh sách nhân sự --"
                                }), u.filter(t => t.active).map(t => e.jsx("option", {
                                    value: t.id,
                                    children: t.name
                                }, t.id))]
                            })]
                        }), e.jsxs("div", {
                            children: [e.jsx("label", {
                                className: "block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 ml-1",
                                children: "⭐ Đích đến (Level mới)"
                            }), e.jsx("select", {
                                title: "Chọn level",
                                value: at,
                                onChange: t => $t(Number(t.target.value)),
                                className: "w-full px-4 py-3.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 shadow-sm transition-shadow",
                                children: [1, 2, 3, 4, 5].map(t => e.jsxs("option", {
                                    value: t,
                                    children: ["Level ", t]
                                }, t))
                            })]
                        }), e.jsxs("button", {
                            onClick: async () => {
                                xe && (await m.setEmployeeLevel(xe, at), alert("Đã thăng cấp thành công!"), st(""))
                            },
                            disabled: !xe,
                            className: "w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-teal-500/25 mt-4 flex items-center justify-center gap-2 uppercase tracking-wide",
                            children: [e.jsx(q, {
                                className: "w-5 h-5"
                            }), " Thực hiện Thăng cấp"]
                        })]
                    })]
                })]
            })
        })]
    });
    he(ce);
    const _t = () => e.jsxs("div", {
            className: "h-full bg-gray-50 flex flex-col",
            children: [e.jsx("div", {
                className: "bg-white border-b border-gray-200 sticky top-0 z-10",
                children: e.jsx("div", {
                    className: "flex overflow-x-auto no-scrollbar p-2 gap-2",
                    children: ["permissions", "hours", "training", "operations", "assignments"].map(t => e.jsx("button", {
                        onClick: () => B(t),
                        className: `flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${i===t?"bg-teal-600 text-white shadow-md":"bg-gray-100 text-gray-600"}`,
                        children: t === "permissions" ? "Phân quyền" : t === "hours" ? "Giờ hoạt động" : t === "training" ? "Đào tạo" : t === "operations" ? "Vận hành" : "Phân công"
                    }, t))
                })
            }), e.jsxs("div", {
                className: "flex-1 overflow-y-auto p-4 pb-24",
                children: [i === "permissions" && e.jsxs("div", {
                    className: "space-y-4",
                    children: [e.jsxs("div", {
                        className: "flex gap-2 mb-4",
                        children: [e.jsxs("div", {
                            className: "relative flex-1",
                            children: [e.jsx("input", {
                                type: "text",
                                placeholder: "Tìm nhân viên...",
                                value: Ne,
                                onChange: t => Be(t.target.value),
                                className: "w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            }), e.jsx(pt, {
                                className: "w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                            })]
                        }), e.jsxs("select", {
                            value: A,
                            onChange: t => Ue(t.target.value),
                            className: "bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-teal-500",
                            children: [e.jsx("option", {
                                value: "all",
                                children: "Tất cả"
                            }), e.jsx("option", {
                                value: "manager",
                                children: "Quản lý"
                            }), e.jsx("option", {
                                value: "reception",
                                children: "Lễ tân"
                            }), e.jsx("option", {
                                value: "kitchen",
                                children: "Bếp"
                            }), e.jsx("option", {
                                value: "server",
                                children: "Phục vụ"
                            })]
                        })]
                    }), e.jsxs("div", {
                        className: "flex justify-between items-center mb-2",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800",
                            children: ["Danh sách nhân viên (", me.length, ")"]
                        }), e.jsxs("button", {
                            onClick: () => F(!0),
                            className: "text-teal-600 text-sm font-bold flex items-center gap-1",
                            children: [e.jsx(I, {
                                className: "w-4 h-4"
                            }), " Thêm mới"]
                        })]
                    }), me.map(t => e.jsxs("div", {
                        onClick: () => Ie(t),
                        className: `bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 ${t.active?"":"opacity-60 grayscale-[0.5]"}`,
                        children: [e.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [e.jsxs("div", {
                                className: "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 relative",
                                children: [e.jsx(E, {
                                    className: "w-5 h-5"
                                }), !t.active && e.jsx("div", {
                                    className: "absolute -bottom-1 -right-1 bg-gray-500 text-white text-[8px] px-1 rounded-full border border-white",
                                    children: "OFF"
                                })]
                            }), e.jsxs("div", {
                                children: [e.jsx("div", {
                                    className: "font-bold text-gray-900",
                                    children: t.name
                                }), e.jsxs("div", {
                                    className: "text-xs text-gray-500 mt-0.5",
                                    children: ["TK: ", t.email, " | MK: ", t.password || "***"]
                                }), e.jsxs("div", {
                                    className: "text-xs text-gray-500 flex gap-1 mt-1",
                                    children: [t.roles.manager && e.jsx("span", {
                                        className: "bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        children: "Quản lý"
                                    }), t.roles.reception && e.jsx("span", {
                                        className: "bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        children: "Lễ tân"
                                    }), t.roles.kitchen && e.jsx("span", {
                                        className: "bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        children: "Bếp"
                                    }), t.roles.server && e.jsx("span", {
                                        className: "bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        children: "Phục vụ"
                                    })]
                                })]
                            })]
                        }), e.jsx(ft, {
                            className: "w-5 h-5 text-gray-400"
                        })]
                    }, t.id))]
                }), i === "hours" && e.jsxs("div", {
                    className: "space-y-6",
                    children: [e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                            children: [e.jsx("span", {
                                className: "w-2 h-2 rounded-full bg-orange-400"
                            }), "Ca Trưa"]
                        }), e.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "text-xs text-gray-500 mb-1 block",
                                    children: "Bắt đầu"
                                }), e.jsx("input", {
                                    type: "time",
                                    value: `${v.toString().padStart(2,"0")}:00`,
                                    onChange: t => pe(parseInt(t.target.value.split(":")[0])),
                                    className: "w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center"
                                })]
                            }), e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "text-xs text-gray-500 mb-1 block",
                                    children: "Kết thúc"
                                }), e.jsx("input", {
                                    type: "time",
                                    value: `${C.toString().padStart(2,"0")}:00`,
                                    onChange: t => fe(parseInt(t.target.value.split(":")[0])),
                                    className: "w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center"
                                })]
                            })]
                        })]
                    }), e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                            children: [e.jsx("span", {
                                className: "w-2 h-2 rounded-full bg-indigo-500"
                            }), "Ca Tối"]
                        }), e.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "text-xs text-gray-500 mb-1 block",
                                    children: "Bắt đầu"
                                }), e.jsx("input", {
                                    type: "time",
                                    value: `${N.toString().padStart(2,"0")}:00`,
                                    onChange: t => ye(parseInt(t.target.value.split(":")[0])),
                                    className: "w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center"
                                })]
                            }), e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "text-xs text-gray-500 mb-1 block",
                                    children: "Kết thúc"
                                }), e.jsx("input", {
                                    type: "time",
                                    value: `${S.toString().padStart(2,"0")}:00`,
                                    onChange: t => je(parseInt(t.target.value.split(":")[0])),
                                    className: "w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center"
                                })]
                            })]
                        })]
                    }), e.jsx("button", {
                        className: "w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200",
                        children: "Lưu cấu hình"
                    })]
                }), i === "training" && ht(), i === "operations" && e.jsxs("div", {
                    className: "space-y-6",
                    children: [e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                            children: [e.jsx(E, {
                                className: "w-5 h-5 text-teal-600"
                            }), "Sức chứa & Khu vực"]
                        }), e.jsxs("div", {
                            className: "space-y-4",
                            children: [T.map(t => e.jsxs("div", {
                                className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200",
                                children: [e.jsx("span", {
                                    className: "font-medium text-gray-700",
                                    children: t.name
                                }), e.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [e.jsx("input", {
                                        type: "number",
                                        value: t.capacity,
                                        onChange: s => {
                                            const r = parseInt(s.target.value) || 0;
                                            ve(T.map(a => a.id === t.id ? {
                                                ...a,
                                                capacity: r
                                            } : a))
                                        },
                                        className: "w-16 p-2 text-center font-bold border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    }), e.jsx("span", {
                                        className: "text-xs text-gray-500",
                                        children: "khách"
                                    })]
                                })]
                            }, t.id)), e.jsxs("div", {
                                className: "flex justify-between items-center p-3 bg-teal-50 rounded-lg border border-teal-100",
                                children: [e.jsx("span", {
                                    className: "font-bold text-teal-800",
                                    children: "Tổng sức chứa"
                                }), e.jsxs("span", {
                                    className: "text-xl font-bold text-teal-700",
                                    children: [T.reduce((t, s) => t + s.capacity, 0), " ", e.jsx("span", {
                                        className: "text-sm font-normal",
                                        children: "khách"
                                    })]
                                })]
                            })]
                        })]
                    }), e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                            children: [e.jsx(ge, {
                                className: "w-5 h-5 text-teal-600"
                            }), "Quy tắc vận hành"]
                        }), e.jsxs("div", {
                            className: "space-y-6",
                            children: [e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "Thời gian ăn tiêu chuẩn (phút)"
                                }), e.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [e.jsx(J, {
                                        className: "w-5 h-5 text-gray-400"
                                    }), e.jsx("input", {
                                        type: "number",
                                        value: z,
                                        onChange: t => H(parseInt(t.target.value) || 0),
                                        className: "flex-1 p-3 border border-gray-300 rounded-lg font-bold text-center focus:ring-teal-500 focus:border-teal-500"
                                    })]
                                }), e.jsx("p", {
                                    className: "text-xs text-gray-500 mt-2",
                                    children: "* Hệ thống sẽ tự động cộng thời gian này vào giờ đặt bàn để dự tính giờ khách về."
                                })]
                            }), e.jsxs("div", {
                                className: "pt-4 border-t border-gray-100",
                                children: [e.jsxs("div", {
                                    className: "flex justify-between items-start mb-2",
                                    children: [e.jsx("label", {
                                        className: "font-bold text-gray-800",
                                        children: "Kiểm soát chặt chẽ"
                                    }), e.jsx("div", {
                                        onClick: () => O(!c),
                                        className: `w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${c?"bg-teal-500":"bg-gray-300"}`,
                                        children: e.jsx("div", {
                                            className: `bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${c?"translate-x-6":""}`
                                        })
                                    })]
                                }), e.jsx("p", {
                                    className: "text-xs text-gray-500 mb-3",
                                    children: c ? "Đang BẬT: Hệ thống sẽ CHẶN không cho đặt bàn nếu quá sức chứa." : "Đang TẮT: Cho phép đặt bàn quá sức chứa (chỉ hiện cảnh báo)."
                                }), c && e.jsxs("div", {
                                    className: "flex items-start gap-2 p-3 bg-orange-50 text-orange-700 text-xs rounded-lg border border-orange-100",
                                    children: [e.jsx(De, {
                                        className: "w-4 h-4 flex-shrink-0 mt-0.5"
                                    }), e.jsx("span", {
                                        children: "Chế độ này giúp tránh Overbooking nhưng có thể làm chậm thao tác của lễ tân khi đông khách."
                                    })]
                                })]
                            })]
                        })]
                    }), e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                            children: [e.jsx(ue, {
                                className: "w-5 h-5 text-teal-600"
                            }), "Tạo Link Đặt Bàn"]
                        }), e.jsxs("div", {
                            className: "space-y-4",
                            children: [e.jsx("p", {
                                className: "text-sm text-gray-500",
                                children: "Tạo link gắn mã nguồn để biết khách đến từ đâu."
                            }), e.jsxs("div", {
                                children: [e.jsx("label", {
                                    className: "block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1",
                                    children: "1. Chọn Nguồn (Source)"
                                }), e.jsxs("select", {
                                    title: "Chọn nguồn",
                                    value: g,
                                    onChange: t => lt(t.target.value),
                                    className: "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500",
                                    children: [e.jsx("option", {
                                        value: "",
                                        children: "Tự nhiên (Không có nguồn)"
                                    }), e.jsx("option", {
                                        value: "fb",
                                        children: "Facebook (Fanpage)"
                                    }), e.jsx("option", {
                                        value: "zalo",
                                        children: "Zalo"
                                    }), e.jsx("option", {
                                        value: "whatsapp",
                                        children: "WhatsApp"
                                    }), e.jsx("option", {
                                        value: "hotline",
                                        children: "Hotline"
                                    }), e.jsx("option", {
                                        value: "web",
                                        children: "Website Khác"
                                    }), e.jsx("option", {
                                        value: "ota",
                                        children: "OTA / Google Maps"
                                    })]
                                })]
                            }), e.jsxs("div", {
                                className: "space-y-1.5",
                                children: [e.jsx("label", {
                                    className: "block text-xs font-medium text-gray-500 flex items-center gap-1",
                                    children: "2. Copy Link Gửi Khách"
                                }), e.jsxs("div", {
                                    className: "flex flex-col sm:flex-row gap-2",
                                    children: [e.jsx("input", {
                                        title: "Link đặt bàn",
                                        type: "text",
                                        readOnly: !0,
                                        value: `${window.location.origin}/dat-ban-online${g?`?source=${g}`:""}`,
                                        className: "flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono focus:outline-none truncate min-w-0"
                                    }), e.jsxs("div", {
                                        className: "flex gap-2",
                                        children: [e.jsxs("button", {
                                            onClick: nt,
                                            className: `flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all whitespace-nowrap ${D?"bg-green-100 text-green-700 border-green-200":"bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100"}`,
                                            children: [D ? e.jsx(q, {
                                                className: "w-4 h-4"
                                            }) : e.jsx(yt, {
                                                className: "w-4 h-4"
                                            }), D ? "Đã Copy" : "Copy"]
                                        }), e.jsx("button", {
                                            onClick: () => window.open(`/dat-ban-online${g?`?source=${g}`:""}`, "_blank"),
                                            className: "px-4 flex-shrink-0 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-all flex items-center justify-center whitespace-nowrap",
                                            children: "Mở"
                                        })]
                                    })]
                                })]
                            })]
                        })]
                    }), e.jsx("button", {
                        className: "w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200",
                        children: "Lưu cấu hình"
                    })]
                }), i === "assignments" && e.jsx("div", {
                    className: "space-y-6",
                    children: e.jsxs("div", {
                        className: "bg-white p-5 rounded-xl shadow-sm border border-gray-100",
                        children: [e.jsxs("div", {
                            className: "flex justify-between items-center mb-4",
                            children: [e.jsxs("h3", {
                                className: "font-bold text-gray-800 flex items-center gap-2",
                                children: [e.jsx(ut, {
                                    className: "w-5 h-5 text-teal-600"
                                }), "Khu vực & Phân công"]
                            }), e.jsx("button", {
                                onClick: () => {
                                    G(""), f([]), M(!0)
                                },
                                className: "text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold border border-teal-100",
                                children: "+ Thêm Station"
                            })]
                        }), e.jsx("div", {
                            className: "space-y-4",
                            children: y.map(t => e.jsxs("div", {
                                className: "border border-gray-200 rounded-lg overflow-hidden",
                                children: [e.jsxs("div", {
                                    className: "bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center",
                                    children: [e.jsx("span", {
                                        className: "font-bold text-gray-800",
                                        children: t.name
                                    }), e.jsx("button", {
                                        onClick: () => ot(t.id),
                                        className: "text-gray-400 hover:text-red-500",
                                        children: e.jsx(Z, {
                                            className: "w-4 h-4"
                                        })
                                    })]
                                }), e.jsxs("div", {
                                    className: "p-4 space-y-3",
                                    children: [e.jsxs("div", {
                                        children: [e.jsx("div", {
                                            className: "text-xs text-gray-500 mb-1 font-medium uppercase",
                                            children: "Bàn phụ trách"
                                        }), e.jsxs("div", {
                                            className: "flex flex-wrap gap-1",
                                            children: [t.tables.map(s => e.jsx("span", {
                                                className: "bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded",
                                                children: s
                                            }, s)), e.jsx("button", {
                                                onClick: () => Ee(t.id),
                                                className: "bg-gray-50 border border-dashed border-gray-300 text-gray-400 text-xs px-2 py-1 rounded hover:text-teal-600 hover:border-teal-300 transition-colors",
                                                children: "+ Sửa"
                                            })]
                                        })]
                                    }), e.jsxs("div", {
                                        children: [e.jsx("div", {
                                            className: "text-xs text-gray-500 mb-1 font-medium uppercase",
                                            children: "Nhân sự"
                                        }), e.jsxs("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: [t.staffIds.map(s => {
                                                const r = u.find(a => a.id === s);
                                                return r ? e.jsxs("div", {
                                                    className: "flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs border border-teal-100",
                                                    children: [e.jsx(E, {
                                                        className: "w-3 h-3"
                                                    }), r.name, e.jsx("button", {
                                                        onClick: () => ct(t.id, s),
                                                        className: "ml-1 hover:text-red-500",
                                                        children: e.jsx(w, {
                                                            className: "w-3 h-3"
                                                        })
                                                    })]
                                                }, s) : null
                                            }), e.jsxs("select", {
                                                className: "bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border-none focus:ring-0 cursor-pointer",
                                                onChange: s => {
                                                    s.target.value && (dt(t.id, s.target.value), s.target.value = "")
                                                },
                                                children: [e.jsx("option", {
                                                    value: "",
                                                    children: "+ Thêm"
                                                }), u.filter(s => !t.staffIds.includes(s.id)).map(s => e.jsx("option", {
                                                    value: s.id,
                                                    children: s.name
                                                }, s.id))]
                                            })]
                                        })]
                                    })]
                                })]
                            }, t.id))
                        })]
                    })
                })]
            }), $ && k && e.jsx("div", {
                className: "fixed inset-0 z-50 bg-black/50 flex items-end animate-in fade-in duration-200",
                onClick: () => Te(null),
                children: e.jsxs("div", {
                    className: "w-full bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300",
                    onClick: t => t.stopPropagation(),
                    children: [e.jsxs("div", {
                        className: "flex justify-between items-center mb-6",
                        children: [e.jsxs("h3", {
                            className: "text-lg font-bold text-gray-900",
                            children: ["Phân quyền: ", $.name]
                        }), e.jsx("button", {
                            onClick: () => Te(null),
                            className: "p-2 bg-gray-100 rounded-full",
                            children: e.jsx(w, {
                                className: "w-5 h-5"
                            })
                        })]
                    }), e.jsxs("div", {
                        className: "space-y-4 mb-6",
                        children: [e.jsxs("label", {
                            className: "flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200",
                            children: [e.jsx("span", {
                                className: "font-medium text-gray-700",
                                children: "Kích hoạt tài khoản"
                            }), e.jsx("div", {
                                onClick: () => xt($.id),
                                className: `w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${$.active?"bg-teal-500":"bg-gray-300"}`,
                                children: e.jsx("div", {
                                    className: `bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${$.active?"translate-x-6":""}`
                                })
                            })]
                        }), ["Lễ tân", "Bếp", "Phục vụ", "Quản lý"].map((t, s) => {
                            const r = ["reception", "kitchen", "server", "manager"][s];
                            return e.jsxs("label", {
                                className: `flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 ${$.active?"":"opacity-50 pointer-events-none"}`,
                                children: [e.jsx("span", {
                                    className: "font-medium text-gray-700",
                                    children: t
                                }), e.jsx("input", {
                                    type: "checkbox",
                                    defaultChecked: $.roles[r],
                                    className: "w-6 h-6 text-teal-600 rounded focus:ring-teal-500"
                                })]
                            }, r)
                        })]
                    }), e.jsx("button", {
                        onClick: () => Te(null),
                        className: "w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold text-lg",
                        children: "Xác nhận"
                    })]
                })
            })]
        }),
        Kt = () => e.jsxs("div", {
            className: "h-[calc(100vh-64px)] bg-gray-50 flex flex-col",
            children: [e.jsx("div", {
                className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-start flex-shrink-0",
                children: e.jsx("div", {
                    className: "flex bg-gray-100 p-1 rounded-lg",
                    children: [
                        ["permissions", "Shield", "Phân quyền"],
                        ["hours", "Clock", "Giờ hoạt động"],
                        ["training", "PlaySquare", "Đào tạo"],
                        ["operations", "SettingsIcon", "Vận hành"],
                        ["assignments", "Users", "Phân công"]
                    ].map(([t, , s]) => e.jsxs("button", {
                        onClick: () => B(t),
                        className: `px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${i===t?"bg-white shadow-sm text-teal-700":"text-gray-500 hover:text-gray-700"}`,
                        children: [t === "permissions" && e.jsx(Qt, {
                            className: "w-4 h-4"
                        }), t === "hours" && e.jsx(J, {
                            className: "w-4 h-4"
                        }), t === "training" && e.jsx(Ae, {
                            className: "w-4 h-4"
                        }), t === "operations" && e.jsx(ge, {
                            className: "w-4 h-4"
                        }), t === "assignments" && e.jsx(ut, {
                            className: "w-4 h-4"
                        }), s]
                    }, t))
                })
            }), e.jsx("div", {
                className: "flex-1 overflow-y-auto p-6",
                children: e.jsxs("div", {
                    className: "max-w-6xl mx-auto",
                    children: [i === "assignments" && e.jsxs("div", {
                        className: "space-y-6",
                        children: [e.jsxs("div", {
                            className: "flex justify-between items-center",
                            children: [e.jsxs("div", {
                                children: [e.jsx("h3", {
                                    className: "text-lg font-bold text-gray-800",
                                    children: "Phân công khu vực (Station)"
                                }), e.jsx("p", {
                                    className: "text-sm text-gray-500",
                                    children: "Tạo các trạm phục vụ và gán nhân viên chịu trách nhiệm."
                                })]
                            }), e.jsxs("button", {
                                onClick: () => {
                                    G(""), f([]), M(!0)
                                },
                                className: "flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-teal-700 transition-colors",
                                children: [e.jsx(I, {
                                    className: "w-4 h-4"
                                }), "Tạo Station mới"]
                            })]
                        }), e.jsxs("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                            children: [y.map(t => e.jsxs("div", {
                                className: "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col",
                                children: [e.jsxs("div", {
                                    className: "px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center",
                                    children: [e.jsx("h4", {
                                        className: "font-bold text-gray-800",
                                        children: t.name
                                    }), e.jsxs("div", {
                                        className: "flex gap-2",
                                        children: [e.jsx("button", {
                                            onClick: () => Ee(t.id),
                                            className: "text-gray-400 hover:text-teal-600",
                                            children: e.jsx(Pe, {
                                                className: "w-4 h-4"
                                            })
                                        }), e.jsx("button", {
                                            onClick: () => ot(t.id),
                                            className: "text-gray-400 hover:text-red-500",
                                            children: e.jsx(Z, {
                                                className: "w-4 h-4"
                                            })
                                        })]
                                    })]
                                }), e.jsxs("div", {
                                    className: "p-5 flex-1 flex flex-col gap-4",
                                    children: [e.jsxs("div", {
                                        children: [e.jsxs("div", {
                                            className: "text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1",
                                            children: [e.jsx(es, {
                                                className: "w-3 h-3"
                                            }), "Bàn phụ trách"]
                                        }), e.jsxs("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: [t.tables.map(s => e.jsx("span", {
                                                className: "px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 shadow-sm",
                                                children: s
                                            }, s)), e.jsx("button", {
                                                onClick: () => Ee(t.id),
                                                className: "px-2 py-1 bg-gray-50 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-teal-600 hover:border-teal-300 transition-colors",
                                                children: "+ Sửa"
                                            })]
                                        })]
                                    }), e.jsx("div", {
                                        className: "h-px bg-gray-100"
                                    }), e.jsxs("div", {
                                        className: "flex-1",
                                        children: [e.jsxs("div", {
                                            className: "text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1",
                                            children: [e.jsx(E, {
                                                className: "w-3 h-3"
                                            }), "Nhân sự phụ trách"]
                                        }), e.jsxs("div", {
                                            className: "space-y-2",
                                            children: [t.staffIds.map(s => {
                                                const r = u.find(a => a.id === s);
                                                return r ? e.jsxs("div", {
                                                    className: "flex items-center justify-between p-2 bg-teal-50 rounded-lg border border-teal-100 group",
                                                    children: [e.jsxs("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [e.jsx("div", {
                                                            className: "w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold",
                                                            children: r.name.charAt(0)
                                                        }), e.jsx("span", {
                                                            className: "text-sm font-medium text-teal-900",
                                                            children: r.name
                                                        })]
                                                    }), e.jsx("button", {
                                                        onClick: () => ct(t.id, s),
                                                        className: "text-teal-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all",
                                                        children: e.jsx(w, {
                                                            className: "w-4 h-4"
                                                        })
                                                    })]
                                                }, s) : null
                                            }), e.jsxs("div", {
                                                className: "relative group",
                                                children: [e.jsxs("select", {
                                                    className: "w-full p-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 cursor-pointer appearance-none focus:ring-0 focus:outline-none transition-colors",
                                                    onChange: s => {
                                                        s.target.value && (dt(t.id, s.target.value), s.target.value = "")
                                                    },
                                                    children: [e.jsx("option", {
                                                        value: "",
                                                        children: "+ Gán thêm nhân viên"
                                                    }), u.filter(s => !t.staffIds.includes(s.id)).map(s => e.jsx("option", {
                                                        value: s.id,
                                                        children: s.name
                                                    }, s.id))]
                                                }), e.jsx(I, {
                                                    className: "w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-teal-500"
                                                })]
                                            })]
                                        })]
                                    })]
                                })]
                            }, t.id)), e.jsxs("button", {
                                onClick: () => {
                                    G(""), f([]), M(!0)
                                },
                                className: "border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all group min-h-[300px]",
                                children: [e.jsx("div", {
                                    className: "w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors",
                                    children: e.jsx(I, {
                                        className: "w-6 h-6"
                                    })
                                }), e.jsx("span", {
                                    className: "font-bold",
                                    children: "Tạo Station mới"
                                })]
                            })]
                        })]
                    }), i === "permissions" && e.jsxs("div", {
                        className: "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
                        children: [e.jsxs("div", {
                            className: "px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center",
                            children: [e.jsxs("h3", {
                                className: "font-bold text-gray-800",
                                children: ["Danh sách nhân viên & Vai trò (", me.length, ")"]
                            }), e.jsxs("div", {
                                className: "flex gap-3",
                                children: [e.jsxs("div", {
                                    className: "relative",
                                    children: [e.jsx("input", {
                                        type: "text",
                                        placeholder: "Tìm kiếm...",
                                        value: Ne,
                                        onChange: t => Be(t.target.value),
                                        className: "pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 w-64"
                                    }), e.jsx(pt, {
                                        className: "w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                                    })]
                                }), e.jsxs("select", {
                                    value: A,
                                    onChange: t => Ue(t.target.value),
                                    className: "bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-teal-500",
                                    children: [e.jsx("option", {
                                        value: "all",
                                        children: "Tất cả vai trò"
                                    }), e.jsx("option", {
                                        value: "manager",
                                        children: "Quản lý"
                                    }), e.jsx("option", {
                                        value: "reception",
                                        children: "Lễ tân"
                                    }), e.jsx("option", {
                                        value: "kitchen",
                                        children: "Bếp"
                                    }), e.jsx("option", {
                                        value: "server",
                                        children: "Phục vụ"
                                    })]
                                }), e.jsxs("button", {
                                    onClick: () => F(!0),
                                    className: "flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    children: [e.jsx(I, {
                                        className: "w-4 h-4"
                                    }), "Thêm nhân viên"]
                                })]
                            })]
                        }), e.jsxs("table", {
                            className: "w-full text-left border-collapse",
                            children: [e.jsx("thead", {
                                children: e.jsxs("tr", {
                                    className: "border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold bg-gray-50/50",
                                    children: [e.jsx("th", {
                                        className: "px-6 py-4",
                                        children: "Nhân viên"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-32",
                                        children: "Kích hoạt"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-32",
                                        children: "Lễ tân"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-32",
                                        children: "Bếp"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-32",
                                        children: "Phục vụ"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-32",
                                        children: "Quản lý"
                                    }), e.jsx("th", {
                                        className: "px-6 py-4 text-center w-20"
                                    })]
                                })
                            }), e.jsx("tbody", {
                                className: "divide-y divide-gray-100",
                                children: me.map(t => e.jsxs("tr", {
                                    className: `hover:bg-gray-50 transition-colors ${t.active?"":"bg-gray-50/50"}`,
                                    children: [e.jsx("td", {
                                        className: "px-6 py-4 cursor-pointer",
                                        onClick: () => Ie(t),
                                        children: e.jsxs("div", {
                                            className: "flex items-center gap-3",
                                            children: [e.jsxs("div", {
                                                className: "w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 relative",
                                                children: [e.jsx(E, {
                                                    className: "w-5 h-5"
                                                }), !t.active && e.jsx("div", {
                                                    className: "absolute -bottom-1 -right-1 bg-gray-500 text-white text-[8px] px-1 rounded-full border border-white",
                                                    children: "OFF"
                                                })]
                                            }), e.jsxs("div", {
                                                children: [e.jsx("div", {
                                                    className: `font-medium ${t.active?"text-gray-900":"text-gray-500"}`,
                                                    children: t.name
                                                }), e.jsx("div", {
                                                    className: "text-xs text-gray-500",
                                                    children: t.email
                                                })]
                                            })]
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("div", {
                                            onClick: () => xt(t.id),
                                            className: `w-10 h-5 mx-auto flex items-center rounded-full p-1 cursor-pointer transition-colors ${t.active?"bg-teal-500":"bg-gray-300"}`,
                                            children: e.jsx("div", {
                                                className: `bg-white w-3.5 h-3.5 rounded-full shadow-sm transform duration-300 ease-in-out ${t.active?"translate-x-4.5":""}`
                                            })
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("input", {
                                            type: "checkbox",
                                            defaultChecked: t.roles.reception,
                                            disabled: !t.active,
                                            className: "w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("input", {
                                            type: "checkbox",
                                            defaultChecked: t.roles.kitchen,
                                            disabled: !t.active,
                                            className: "w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("input", {
                                            type: "checkbox",
                                            defaultChecked: t.roles.server,
                                            disabled: !t.active,
                                            className: "w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("input", {
                                            type: "checkbox",
                                            defaultChecked: t.roles.manager,
                                            disabled: !t.active,
                                            className: "w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                                        })
                                    }), e.jsx("td", {
                                        className: "px-6 py-4 text-center",
                                        children: e.jsx("button", {
                                            onClick: () => Ie(t),
                                            className: "text-gray-400 hover:text-teal-600",
                                            children: e.jsx(ft, {
                                                className: "w-5 h-5"
                                            })
                                        })
                                    })]
                                }, t.id))
                            })]
                        })]
                    }), i === "hours" && e.jsxs("div", {
                        className: "bg-white rounded-xl border border-gray-200 shadow-sm p-8",
                        children: [e.jsxs("h3", {
                            className: "font-bold text-gray-800 mb-8 flex items-center gap-2",
                            children: [e.jsx(J, {
                                className: "w-5 h-5 text-teal-600"
                            }), "Cấu hình khung giờ hoạt động"]
                        }), e.jsxs("div", {
                            className: "space-y-12",
                            children: [e.jsxs("div", {
                                children: [e.jsxs("div", {
                                    className: "flex justify-between items-center mb-4",
                                    children: [e.jsxs("label", {
                                        className: "font-medium text-gray-700 flex items-center gap-2",
                                        children: [e.jsx("span", {
                                            className: "w-2 h-2 rounded-full bg-orange-400"
                                        }), "Ca Trưa"]
                                    }), e.jsxs("span", {
                                        className: "text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg",
                                        children: [v, ":00 - ", C, ":00"]
                                    })]
                                }), e.jsxs("div", {
                                    className: "grid grid-cols-2 gap-6 mb-4",
                                    children: [e.jsxs("div", {
                                        children: [e.jsx("label", {
                                            className: "block text-xs font-medium text-gray-500 mb-2",
                                            children: "Giờ bắt đầu"
                                        }), e.jsx("select", {
                                            value: v,
                                            onChange: t => {
                                                const s = parseInt(t.target.value);
                                                s < C && pe(s)
                                            },
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white cursor-pointer appearance-none",
                                            children: Array.from({
                                                length: 19
                                            }, (t, s) => s + 6).filter(t => t < C).map(t => e.jsxs("option", {
                                                value: t,
                                                children: [t.toString().padStart(2, "0"), ":00"]
                                            }, t))
                                        })]
                                    }), e.jsxs("div", {
                                        children: [e.jsx("label", {
                                            className: "block text-xs font-medium text-gray-500 mb-2",
                                            children: "Giờ kết thúc"
                                        }), e.jsx("select", {
                                            value: C,
                                            onChange: t => {
                                                const s = parseInt(t.target.value);
                                                s > v && fe(s)
                                            },
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white cursor-pointer appearance-none",
                                            children: Array.from({
                                                length: 19
                                            }, (t, s) => s + 6).filter(t => t > v).map(t => e.jsxs("option", {
                                                value: t,
                                                children: [t.toString().padStart(2, "0"), ":00"]
                                            }, t))
                                        })]
                                    })]
                                }), e.jsxs("div", {
                                    className: "relative h-8 bg-gray-100 rounded-lg overflow-hidden",
                                    children: [e.jsx("div", {
                                        className: "absolute h-full bg-orange-200 rounded-lg transition-all duration-300",
                                        style: {
                                            left: `${(v-6)/18*100}%`,
                                            width: `${(C-v)/18*100}%`
                                        }
                                    }), e.jsxs("div", {
                                        className: "absolute inset-0 flex justify-between items-center px-3 text-[10px] text-gray-400 pointer-events-none",
                                        children: [e.jsx("span", {
                                            children: "06:00"
                                        }), e.jsx("span", {
                                            children: "12:00"
                                        }), e.jsx("span", {
                                            children: "18:00"
                                        }), e.jsx("span", {
                                            children: "24:00"
                                        })]
                                    })]
                                })]
                            }), e.jsxs("div", {
                                children: [e.jsxs("div", {
                                    className: "flex justify-between items-center mb-4",
                                    children: [e.jsxs("label", {
                                        className: "font-medium text-gray-700 flex items-center gap-2",
                                        children: [e.jsx("span", {
                                            className: "w-2 h-2 rounded-full bg-indigo-500"
                                        }), "Ca Tối"]
                                    }), e.jsxs("span", {
                                        className: "text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg",
                                        children: [N, ":00 - ", S, ":00"]
                                    })]
                                }), e.jsxs("div", {
                                    className: "grid grid-cols-2 gap-6 mb-4",
                                    children: [e.jsxs("div", {
                                        children: [e.jsx("label", {
                                            className: "block text-xs font-medium text-gray-500 mb-2",
                                            children: "Giờ bắt đầu"
                                        }), e.jsx("select", {
                                            value: N,
                                            onChange: t => {
                                                const s = parseInt(t.target.value);
                                                s < S && ye(s)
                                            },
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white cursor-pointer appearance-none",
                                            children: Array.from({
                                                length: 19
                                            }, (t, s) => s + 6).filter(t => t < S).map(t => e.jsxs("option", {
                                                value: t,
                                                children: [t.toString().padStart(2, "0"), ":00"]
                                            }, t))
                                        })]
                                    }), e.jsxs("div", {
                                        children: [e.jsx("label", {
                                            className: "block text-xs font-medium text-gray-500 mb-2",
                                            children: "Giờ kết thúc"
                                        }), e.jsx("select", {
                                            value: S,
                                            onChange: t => {
                                                const s = parseInt(t.target.value);
                                                s > N && je(s)
                                            },
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white cursor-pointer appearance-none",
                                            children: Array.from({
                                                length: 19
                                            }, (t, s) => s + 6).filter(t => t > N).map(t => e.jsxs("option", {
                                                value: t,
                                                children: [t.toString().padStart(2, "0"), ":00"]
                                            }, t))
                                        })]
                                    })]
                                }), e.jsxs("div", {
                                    className: "relative h-8 bg-gray-100 rounded-lg overflow-hidden",
                                    children: [e.jsx("div", {
                                        className: "absolute h-full bg-indigo-200 rounded-lg transition-all duration-300",
                                        style: {
                                            left: `${(N-6)/18*100}%`,
                                            width: `${(S-N)/18*100}%`
                                        }
                                    }), e.jsxs("div", {
                                        className: "absolute inset-0 flex justify-between items-center px-3 text-[10px] text-gray-400 pointer-events-none",
                                        children: [e.jsx("span", {
                                            children: "06:00"
                                        }), e.jsx("span", {
                                            children: "12:00"
                                        }), e.jsx("span", {
                                            children: "18:00"
                                        }), e.jsx("span", {
                                            children: "24:00"
                                        })]
                                    })]
                                })]
                            })]
                        }), e.jsx("div", {
                            className: "mt-10 pt-6 border-t border-gray-100 flex justify-end",
                            children: e.jsxs("button", {
                                onClick: it,
                                className: "flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors",
                                children: [e.jsx(q, {
                                    className: "w-4 h-4"
                                }), "Lưu cấu hình thời gian"]
                            })
                        })]
                    }), i === "training" && ht(), i === "operations" && e.jsxs("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                        children: [e.jsxs("div", {
                            className: "bg-white rounded-xl border border-gray-200 shadow-sm p-8",
                            children: [e.jsxs("h3", {
                                className: "font-bold text-gray-800 mb-6 flex items-center gap-2",
                                children: [e.jsx(E, {
                                    className: "w-5 h-5 text-teal-600"
                                }), "Cấu hình Sức chứa & Khu vực"]
                            }), e.jsxs("div", {
                                className: "space-y-4",
                                children: [T.map(t => e.jsxs("div", {
                                    className: "grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-200 transition-colors",
                                    children: [e.jsx("div", {
                                        className: "col-span-8 font-medium text-gray-700",
                                        children: t.name
                                    }), e.jsx("div", {
                                        className: "col-span-4 flex justify-center",
                                        children: e.jsx("input", {
                                            type: "number",
                                            value: t.capacity,
                                            onChange: s => {
                                                const r = parseInt(s.target.value) || 0;
                                                ve(T.map(a => a.id === t.id ? {
                                                    ...a,
                                                    capacity: r
                                                } : a))
                                            },
                                            className: "w-20 p-2 text-center font-bold border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        })
                                    })]
                                }, t.id)), e.jsxs("div", {
                                    className: "grid grid-cols-12 gap-4 items-center p-4 bg-teal-50 rounded-lg border border-teal-100 mt-6",
                                    children: [e.jsx("div", {
                                        className: "col-span-8 font-bold text-teal-800 text-lg",
                                        children: "Tổng sức chứa toàn nhà hàng"
                                    }), e.jsx("div", {
                                        className: "col-span-4 text-center text-2xl font-bold text-teal-700",
                                        children: T.reduce((t, s) => t + s.capacity, 0)
                                    })]
                                })]
                            })]
                        }), e.jsxs("div", {
                            className: "bg-white rounded-xl border border-gray-200 shadow-sm p-8 h-fit",
                            children: [e.jsxs("h3", {
                                className: "font-bold text-gray-800 mb-6 flex items-center gap-2",
                                children: [e.jsx(ge, {
                                    className: "w-5 h-5 text-teal-600"
                                }), "Quy tắc vận hành"]
                            }), e.jsxs("div", {
                                className: "space-y-8",
                                children: [e.jsxs("div", {
                                    children: [e.jsx("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-3",
                                        children: "Thời gian ăn tiêu chuẩn (Standard Duration)"
                                    }), e.jsxs("div", {
                                        className: "flex items-center gap-4",
                                        children: [e.jsxs("div", {
                                            className: "relative flex-1 max-w-[200px]",
                                            children: [e.jsx(J, {
                                                className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                            }), e.jsx("input", {
                                                type: "number",
                                                value: z,
                                                onChange: t => H(parseInt(t.target.value) || 0),
                                                className: "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-bold text-lg focus:ring-teal-500 focus:border-teal-500"
                                            })]
                                        }), e.jsx("span", {
                                            className: "text-gray-600 font-medium",
                                            children: "phút / lượt khách"
                                        })]
                                    }), e.jsx("p", {
                                        className: "text-sm text-gray-500 mt-2",
                                        children: "* Hệ thống sẽ tự động cộng thời gian này vào giờ đặt bàn để dự tính giờ khách về (ETD)."
                                    })]
                                }), e.jsxs("div", {
                                    className: "border-t border-gray-100 pt-6",
                                    children: [e.jsxs("div", {
                                        className: "flex items-start justify-between",
                                        children: [e.jsxs("div", {
                                            children: [e.jsx("h4", {
                                                className: "font-bold text-gray-800 mb-1",
                                                children: "Chế độ Kiểm soát chặt chẽ (Strict Mode)"
                                            }), e.jsxs("p", {
                                                className: "text-sm text-gray-500 max-w-sm",
                                                children: ["Khi bật, hệ thống sẽ ", e.jsx("strong", {
                                                    children: "CHẶN"
                                                }), " không cho phép đặt bàn nếu số lượng khách vượt quá sức chứa."]
                                            })]
                                        }), e.jsx("div", {
                                            onClick: () => O(!c),
                                            className: `w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${c?"bg-teal-500":"bg-gray-300"}`,
                                            children: e.jsx("div", {
                                                className: `bg-white w-5 h-5 rounded-full shadow-sm transform duration-300 ease-in-out ${c?"translate-x-7":""}`
                                            })
                                        })]
                                    }), c && e.jsxs("div", {
                                        className: "mt-4 flex items-start gap-3 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-100",
                                        children: [e.jsx(De, {
                                            className: "w-5 h-5 flex-shrink-0 mt-0.5"
                                        }), e.jsxs("div", {
                                            children: [e.jsx("strong", {
                                                children: "Lưu ý:"
                                            }), " Chế độ này yêu cầu tài khoản có quyền ", e.jsx("strong", {
                                                children: "Quản lý (Manager)"
                                            }), " xác nhận nếu muốn ghi đè (Force Booking) khi nhà hàng đã đầy."]
                                        })]
                                    })]
                                }), e.jsxs("div", {
                                    className: "pt-6 mt-4 border-t border-gray-100",
                                    children: [e.jsxs("div", {
                                        className: "space-y-4 mb-6",
                                        children: [e.jsxs("div", {
                                            children: [e.jsx("label", {
                                                className: "block text-sm font-bold text-gray-800 mb-1",
                                                children: "Tạo Link Đặt Bàn (Tracking Nguồn)"
                                            }), e.jsx("p", {
                                                className: "text-xs text-gray-500",
                                                children: "Gửi link này cho khách hàng để tự động phân loại đơn đặt bàn theo kênh."
                                            })]
                                        }), e.jsxs("div", {
                                            className: "space-y-3",
                                            children: [e.jsxs("select", {
                                                title: "Chọn nguồn",
                                                value: g,
                                                onChange: t => lt(t.target.value),
                                                className: "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer",
                                                children: [e.jsx("option", {
                                                    value: "",
                                                    children: "Tự nhiên (Không web)"
                                                }), e.jsx("option", {
                                                    value: "fb",
                                                    children: "Facebook (Fanpage)"
                                                }), e.jsx("option", {
                                                    value: "zalo",
                                                    children: "Zalo"
                                                }), e.jsx("option", {
                                                    value: "whatsapp",
                                                    children: "WhatsApp"
                                                }), e.jsx("option", {
                                                    value: "hotline",
                                                    children: "Hotline"
                                                }), e.jsx("option", {
                                                    value: "web",
                                                    children: "Website Khác"
                                                }), e.jsx("option", {
                                                    value: "ota",
                                                    children: "OTA / Google Maps"
                                                })]
                                            }), e.jsxs("div", {
                                                className: "flex items-center relative",
                                                children: [e.jsx("input", {
                                                    title: "Link đặt bàn",
                                                    type: "text",
                                                    readOnly: !0,
                                                    value: `${window.location.origin}/dat-ban-online${g?`?source=${g}`:""}`,
                                                    className: "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono focus:outline-none pr-[110px]"
                                                }), e.jsxs("div", {
                                                    className: "absolute right-1 flex items-center gap-1",
                                                    children: [e.jsxs("button", {
                                                        onClick: nt,
                                                        className: `flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${D?"bg-green-100 text-green-700":"bg-teal-50 text-teal-700 hover:bg-teal-100"}`,
                                                        children: [D ? e.jsx(q, {
                                                            className: "w-3.5 h-3.5"
                                                        }) : e.jsx(yt, {
                                                            className: "w-3.5 h-3.5"
                                                        }), D ? "Đã copy" : "Copy"]
                                                    }), e.jsx("button", {
                                                        onClick: () => window.open(`/dat-ban-online${g?`?source=${g}`:""}`, "_blank"),
                                                        className: "p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all",
                                                        title: "Mở trong thẻ mới",
                                                        children: e.jsx(ue, {
                                                            className: "w-3.5 h-3.5"
                                                        })
                                                    })]
                                                })]
                                            })]
                                        })]
                                    }), e.jsx("div", {
                                        className: "pt-5 border-t border-gray-100",
                                        children: e.jsxs("button", {
                                            onClick: it,
                                            className: "w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-base shadow-md shadow-teal-100 transition-all",
                                            children: [e.jsx(Rt, {
                                                className: "w-5 h-5"
                                            }), "Lưu cấu hình quy tắc"]
                                        })
                                    })]
                                })]
                            })]
                        }), e.jsx("div", {
                            className: "col-span-1 lg:col-span-2 mt-0",
                            children: e.jsx(ls, {})
                        })]
                    })]
                })
            })]
        });
    return e.jsxs(e.Fragment, {
        children: [k ? _t() : Kt(), jt && e.jsx("div", {
            className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200",
            onClick: () => F(!1),
            children: e.jsxs("div", {
                className: "w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200",
                onClick: t => t.stopPropagation(),
                children: [e.jsxs("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [e.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Thêm nhân viên mới"
                    }), e.jsx("button", {
                        onClick: () => F(!1),
                        className: "p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors",
                        children: e.jsx(w, {
                            className: "w-5 h-5"
                        })
                    })]
                }), e.jsxs("div", {
                    className: "space-y-4",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Họ và tên"
                        }), e.jsx("input", {
                            type: "text",
                            value: o.name,
                            onChange: t => V({
                                ...o,
                                name: t.target.value
                            }),
                            placeholder: "Nhập tên nhân viên",
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Tên đăng nhập"
                        }), e.jsx("input", {
                            type: "text",
                            value: o.email,
                            onChange: t => V({
                                ...o,
                                email: t.target.value
                            }),
                            placeholder: "VD: letan1 (Hệ thống sẽ dùng letan1@maison-vie.local)",
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Mật khẩu"
                        }), e.jsx("input", {
                            type: "password",
                            value: o.password,
                            onChange: t => V({
                                ...o,
                                password: t.target.value
                            }),
                            placeholder: "Tối thiểu 6 ký tự",
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Vai trò mặc định"
                        }), e.jsxs("select", {
                            value: o.role,
                            onChange: t => V({
                                ...o,
                                role: t.target.value
                            }),
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                            children: [e.jsx("option", {
                                value: "reception",
                                children: "Lễ tân"
                            }), e.jsx("option", {
                                value: "kitchen",
                                children: "Bếp"
                            }), e.jsx("option", {
                                value: "server",
                                children: "Phục vụ"
                            }), e.jsx("option", {
                                value: "manager",
                                children: "Quản lý"
                            })]
                        })]
                    }), e.jsx("div", {
                        className: "pt-2",
                        children: e.jsx("button", {
                            onClick: Bt,
                            disabled: !o.name || !o.email || !o.password || o.password.length < 6,
                            className: "w-full bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all",
                            children: "Tạo tài khoản"
                        })
                    })]
                })]
            })
        }), vt && d && e.jsx("div", {
            className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200",
            onClick: () => Q(!1),
            children: e.jsxs("div", {
                className: "w-full max-w-3xl bg-white rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
                onClick: t => t.stopPropagation(),
                children: [e.jsxs("div", {
                    className: "px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50",
                    children: [e.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Chi tiết nhân viên"
                    }), e.jsx("button", {
                        onClick: () => Q(!1),
                        className: "p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm",
                        children: e.jsx(w, {
                            className: "w-5 h-5 text-gray-500"
                        })
                    })]
                }), e.jsx("div", {
                    className: "flex-1 overflow-y-auto p-6",
                    children: _e ? e.jsxs("div", {
                        className: "max-w-md mx-auto space-y-5",
                        children: [e.jsxs("div", {
                            className: "text-center mb-2",
                            children: [e.jsx("div", {
                                className: "w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-2",
                                children: e.jsx(Pe, {
                                    className: "w-8 h-8 text-teal-600"
                                })
                            }), e.jsx("h4", {
                                className: "font-bold text-lg text-gray-900",
                                children: "Chỉnh sửa thông tin đăng nhập"
                            }), e.jsxs("p", {
                                className: "text-sm text-gray-500",
                                children: ["Tên đăng nhập: ", e.jsx("strong", {
                                    children: d.email
                                })]
                            })]
                        }), e.jsxs("div", {
                            children: [e.jsx("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1.5",
                                children: "Họ và tên"
                            }), e.jsx("input", {
                                type: "text",
                                value: re,
                                onChange: t => Ke(t.target.value),
                                className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            })]
                        }), e.jsxs("div", {
                            children: [e.jsxs("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1.5",
                                children: ["Mật khẩu mới ", e.jsx("span", {
                                    className: "text-gray-400 font-normal",
                                    children: "(để trống nếu không đổi)"
                                })]
                            }), e.jsx("input", {
                                type: "password",
                                value: L,
                                onChange: t => ke(t.target.value),
                                placeholder: "Nhập mật khẩu mới (tối thiểu 6 ký tự)",
                                className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            })]
                        }), e.jsxs("div", {
                            children: [e.jsx("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1.5",
                                children: "Vai trò"
                            }), e.jsxs("select", {
                                value: Ce,
                                onChange: t => ze(t.target.value),
                                className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                                children: [e.jsx("option", {
                                    value: "receptionist",
                                    children: "Lễ tân"
                                }), e.jsx("option", {
                                    value: "kitchen",
                                    children: "Bếp"
                                }), e.jsx("option", {
                                    value: "server",
                                    children: "Phục vụ"
                                }), e.jsx("option", {
                                    value: "manager",
                                    children: "Quản lý"
                                })]
                            })]
                        }), L.length > 0 && L.length < 6 && e.jsxs("p", {
                            className: "text-red-500 text-xs flex items-center gap-1",
                            children: [e.jsx(De, {
                                className: "w-3 h-3"
                            }), " Mật khẩu phải có tối thiểu 6 ký tự"]
                        })]
                    }) : e.jsxs("div", {
                        className: "flex flex-col md:flex-row gap-6",
                        children: [e.jsxs("div", {
                            className: "w-full md:w-1/3 space-y-4",
                            children: [e.jsxs("div", {
                                className: "flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm",
                                children: [e.jsxs("div", {
                                    className: "w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 relative",
                                    children: [e.jsx(E, {
                                        className: "w-12 h-12"
                                    }), e.jsx("div", {
                                        className: `absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${d.active?"bg-green-500":"bg-gray-400"}`
                                    })]
                                }), e.jsx("h4", {
                                    className: "font-bold text-lg text-gray-900 text-center mb-1",
                                    children: d.name
                                }), e.jsx("p", {
                                    className: "text-sm text-gray-500 text-center mb-4 break-all",
                                    children: d.email
                                }), e.jsxs("div", {
                                    className: "flex flex-wrap gap-1 justify-center",
                                    children: [d.roles.manager && e.jsx("span", {
                                        className: "bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold",
                                        children: "Quản lý"
                                    }), d.roles.reception && e.jsx("span", {
                                        className: "bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold",
                                        children: "Lễ tân"
                                    }), d.roles.kitchen && e.jsx("span", {
                                        className: "bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold",
                                        children: "Bếp"
                                    }), d.roles.server && e.jsx("span", {
                                        className: "bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-bold",
                                        children: "Phục vụ"
                                    })]
                                })]
                            }), e.jsxs("div", {
                                className: "bg-white p-4 rounded-xl border border-gray-200 shadow-sm",
                                children: [e.jsx("h5", {
                                    className: "font-bold text-gray-800 text-sm mb-3",
                                    children: "Thông tin đăng nhập"
                                }), e.jsxs("div", {
                                    className: "space-y-3 text-sm",
                                    children: [e.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [e.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Tên đăng nhập"
                                        }), e.jsx("span", {
                                            className: "font-medium text-gray-900 break-all",
                                            children: d.email
                                        })]
                                    }), e.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [e.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Mật khẩu"
                                        }), e.jsx("span", {
                                            className: "font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded",
                                            children: d.password || "***"
                                        })]
                                    })]
                                })]
                            }), e.jsxs("div", {
                                className: "bg-white p-4 rounded-xl border border-gray-200 shadow-sm",
                                children: [e.jsx("h5", {
                                    className: "font-bold text-gray-800 text-sm mb-3",
                                    children: "Thông tin trạng thái"
                                }), e.jsxs("div", {
                                    className: "space-y-3 text-sm",
                                    children: [e.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [e.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Trạng thái"
                                        }), e.jsx("span", {
                                            className: `font-bold ${d.active?"text-green-600":"text-gray-500"}`,
                                            children: d.active ? "Đang hoạt động" : "Vô hiệu hóa"
                                        })]
                                    }), e.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [e.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Hoạt động cuối"
                                        }), e.jsx("span", {
                                            className: "font-medium text-gray-900",
                                            children: d.lastActive || "Chưa có"
                                        })]
                                    }), e.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [e.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Ngày tham gia"
                                        }), e.jsx("span", {
                                            className: "font-medium text-gray-900",
                                            children: "20/02/2026"
                                        })]
                                    })]
                                })]
                            })]
                        }), e.jsxs("div", {
                            className: "w-full md:w-2/3",
                            children: [e.jsxs("h4", {
                                className: "font-bold text-gray-800 mb-4 flex items-center gap-2",
                                children: [e.jsx(Gt, {
                                    className: "w-5 h-5 text-teal-600"
                                }), "Lịch sử hoạt động"]
                            }), e.jsxs("div", {
                                className: "space-y-4",
                                children: [_.map(t => e.jsxs("div", {
                                    className: "flex gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow",
                                    children: [e.jsxs("div", {
                                        className: "flex-shrink-0 w-12 text-xs font-bold text-gray-400 text-center pt-1",
                                        children: [t.timestamp.split(" ")[0], e.jsx("div", {
                                            className: "font-normal text-[10px]",
                                            children: t.timestamp.split(" ")[1]
                                        })]
                                    }), e.jsxs("div", {
                                        className: "flex-1 border-l-2 border-gray-100 pl-4 relative",
                                        children: [e.jsx("div", {
                                            className: "absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-50 border-2 border-teal-500"
                                        }), e.jsx("h5", {
                                            className: "font-bold text-gray-800 text-sm",
                                            children: t.action
                                        }), e.jsx("p", {
                                            className: "text-xs text-gray-500 mt-0.5",
                                            children: t.details
                                        })]
                                    })]
                                }, t.id)), e.jsx("div", {
                                    className: "text-center pt-2",
                                    children: e.jsx("button", {
                                        className: "text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline",
                                        children: "Xem thêm lịch sử cũ hơn"
                                    })
                                })]
                            })]
                        })]
                    })
                }), e.jsx("div", {
                    className: "p-4 border-t border-gray-100 bg-gray-50 flex justify-between gap-3",
                    children: _e ? e.jsxs(e.Fragment, {
                        children: [e.jsx("div", {}), e.jsxs("div", {
                            className: "flex gap-3",
                            children: [e.jsx("button", {
                                onClick: () => le(!1),
                                className: "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50",
                                children: "Hủy"
                            }), e.jsx("button", {
                                onClick: Ut,
                                disabled: He || L.length > 0 && L.length < 6,
                                className: "px-5 py-2 bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold hover:bg-teal-700 shadow-sm",
                                children: He ? "Đang lưu..." : "Lưu thay đổi"
                            })]
                        })]
                    }) : e.jsxs(e.Fragment, {
                        children: [e.jsxs("button", {
                            onClick: async () => {
                                if (!(!d || !confirm(`Bạn chắc chắn muốn XÓA VĨNH VIỄN nhân viên "${d.name}"?

Hành động này KHÔNG THỂ hoàn tác.`))) try {
                                    await n.deleteEmployee(d.id), await x(), Q(!1), we(null), alert("Đã xóa nhân viên thành công!")
                                } catch (s) {
                                    alert(s.message || "Có lỗi xảy ra khi xóa nhân viên")
                                }
                            },
                            className: "px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center gap-1.5 text-sm",
                            children: [e.jsx(Z, {
                                className: "w-4 h-4"
                            }), " Xóa"]
                        }), e.jsxs("div", {
                            className: "flex gap-3",
                            children: [e.jsx("button", {
                                onClick: () => Q(!1),
                                className: "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50",
                                children: "Đóng"
                            }), e.jsx("button", {
                                onClick: () => le(!0),
                                className: "px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-sm",
                                children: "Chỉnh sửa thông tin"
                            })]
                        })]
                    })
                })]
            })
        }), Nt && e.jsx("div", {
            className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200",
            onClick: () => M(!1),
            children: e.jsxs("div", {
                className: "w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200",
                onClick: t => t.stopPropagation(),
                children: [e.jsxs("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [e.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Tạo Station Mới"
                    }), e.jsx("button", {
                        onClick: () => M(!1),
                        className: "p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors",
                        children: e.jsx(w, {
                            className: "w-5 h-5"
                        })
                    })]
                }), e.jsxs("div", {
                    className: "space-y-5",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Tên Station / Khu vực"
                        }), e.jsx("input", {
                            type: "text",
                            value: ne,
                            onChange: t => G(t.target.value),
                            placeholder: "VD: Station Cửa Sổ, Station VIP...",
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Chọn bàn phụ trách"
                        }), e.jsx("div", {
                            className: "border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3",
                            children: [1, 2, 3].map(t => {
                                const s = Ve.filter(a => a.floor === t);
                                if (s.length === 0) return null;
                                const r = {
                                    1: "Tầng 1 (Sảnh)",
                                    2: "Tầng 2 (VIP)",
                                    3: "Tầng 3 (Sự kiện)"
                                };
                                return e.jsxs("div", {
                                    children: [e.jsx("div", {
                                        className: "text-xs font-bold text-gray-400 uppercase mb-1.5",
                                        children: r[t] || `Tầng ${t}`
                                    }), e.jsx("div", {
                                        className: "grid grid-cols-3 gap-2",
                                        children: s.map(a => e.jsxs("label", {
                                            className: `flex items-center justify-center px-2 py-2 rounded border cursor-pointer text-sm transition-all ${p.includes(a.name)?"bg-teal-50 border-teal-500 text-teal-700 font-bold":"bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`,
                                            children: [e.jsx("input", {
                                                type: "checkbox",
                                                className: "hidden",
                                                checked: p.includes(a.name),
                                                onChange: h => {
                                                    h.target.checked ? f([...p, a.name]) : f(p.filter(b => b !== a.name))
                                                }
                                            }), a.name]
                                        }, a.name))
                                    })]
                                }, t)
                            })
                        })]
                    }), e.jsx("div", {
                        className: "pt-2",
                        children: e.jsx("button", {
                            onClick: () => {
                                ne && It(ne, p)
                            },
                            disabled: !ne,
                            className: "w-full bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all",
                            children: "Tạo Station"
                        })
                    })]
                })]
            })
        }), wt && e.jsx("div", {
            className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200",
            onClick: () => ie(!1),
            children: e.jsxs("div", {
                className: "w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200",
                onClick: t => t.stopPropagation(),
                children: [e.jsxs("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [e.jsxs("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: ["Cập nhật bàn cho ", (mt = y.find(t => t.id === Se)) == null ? void 0 : mt.name]
                    }), e.jsx("button", {
                        onClick: () => ie(!1),
                        className: "p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors",
                        children: e.jsx(w, {
                            className: "w-5 h-5"
                        })
                    })]
                }), e.jsxs("div", {
                    className: "space-y-5",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Chọn bàn phụ trách"
                        }), e.jsx("div", {
                            className: "border border-gray-200 rounded-lg p-3 max-h-72 overflow-y-auto space-y-3",
                            children: [1, 2, 3].map(t => {
                                const s = Ve.filter(a => a.floor === t);
                                if (s.length === 0) return null;
                                const r = {
                                    1: "Tầng 1 (Sảnh)",
                                    2: "Tầng 2 (VIP)",
                                    3: "Tầng 3 (Sự kiện)"
                                };
                                return e.jsxs("div", {
                                    children: [e.jsx("div", {
                                        className: "text-xs font-bold text-gray-400 uppercase mb-1.5",
                                        children: r[t] || `Tầng ${t}`
                                    }), e.jsx("div", {
                                        className: "grid grid-cols-3 gap-2",
                                        children: s.map(a => e.jsxs("label", {
                                            className: `flex items-center justify-center px-2 py-2 rounded border cursor-pointer text-sm transition-all ${p.includes(a.name)?"bg-teal-50 border-teal-500 text-teal-700 font-bold":"bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`,
                                            children: [e.jsx("input", {
                                                type: "checkbox",
                                                className: "hidden",
                                                checked: p.includes(a.name),
                                                onChange: h => {
                                                    h.target.checked ? f([...p, a.name]) : f(p.filter(b => b !== a.name))
                                                }
                                            }), a.name]
                                        }, a.name))
                                    })]
                                }, t)
                            })
                        })]
                    }), e.jsx("div", {
                        className: "pt-2",
                        children: e.jsx("button", {
                            onClick: Et,
                            className: "w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all",
                            children: "Lưu thay đổi"
                        })
                    })]
                })]
            })
        }), Ct && R && e.jsx("div", {
            className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200",
            onClick: () => W(!1),
            children: e.jsxs("div", {
                className: "w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200",
                onClick: t => t.stopPropagation(),
                children: [e.jsxs("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [e.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Chỉnh sửa khóa học"
                    }), e.jsx("button", {
                        onClick: () => W(!1),
                        className: "p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors",
                        children: e.jsx(w, {
                            className: "w-5 h-5"
                        })
                    })]
                }), e.jsxs("div", {
                    className: "space-y-5",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Tên khóa học"
                        }), e.jsx("input", {
                            type: "text",
                            value: de,
                            onChange: t => Ze(t.target.value),
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5",
                            children: "Cấp độ (Level)"
                        }), e.jsxs("select", {
                            value: Je,
                            onChange: t => et(Number(t.target.value)),
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                            children: [e.jsx("option", {
                                value: 1,
                                children: "Level 1: Nhập môn"
                            }), e.jsx("option", {
                                value: 2,
                                children: "Level 2: Cơ bản"
                            }), e.jsx("option", {
                                value: 3,
                                children: "Level 3: Nâng cao"
                            }), e.jsx("option", {
                                value: 4,
                                children: "Level 4: Chuyên sâu"
                            }), e.jsx("option", {
                                value: 5,
                                children: "Level 5: Quản lý"
                            })]
                        })]
                    }), R.youtubeId && e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: "block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1",
                            children: [e.jsx(ue, {
                                className: "w-3.5 h-3.5"
                            }), " Link YouTube"]
                        }), e.jsx("input", {
                            type: "text",
                            value: ce,
                            onChange: t => tt(t.target.value),
                            placeholder: "https://youtube.com/watch?v=...",
                            className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        }), (() => {
                            const t = he(ce);
                            return t ? e.jsx("div", {
                                className: "mt-2 w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200",
                                children: e.jsx("img", {
                                    src: `https://img.youtube.com/vi/${t}/hqdefault.jpg`,
                                    alt: "Preview",
                                    className: "w-full h-full object-cover"
                                })
                            }) : null
                        })()]
                    }), e.jsxs("div", {
                        className: "flex gap-3 pt-2",
                        children: [e.jsx("button", {
                            onClick: () => W(!1),
                            className: "flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors",
                            children: "Hủy"
                        }), e.jsx("button", {
                            onClick: qt,
                            disabled: !de,
                            className: "flex-1 bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all",
                            children: "Lưu thay đổi"
                        })]
                    })]
                })]
            })
        })]
    })
}
export {
    Cs as
    default
};