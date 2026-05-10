import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Download, FileText, MapPin, Phone, Sparkles, Users, UtensilsCrossed } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import logoImg from '../../assets/logo.jpg';

interface MenuPdfFile {
  id: string;
  title: string;
  audience: string;
  url: string;
  originalUrl?: string;
  note?: string;
}

const toDirectDownloadUrl = (rawUrl: string) => {
  const url = rawUrl.trim();
  if (!url) return url;

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
  }

  const driveOpenMatch = url.match(/[?&]id=([^&]+)/);
  if (url.includes('drive.google.com') && driveOpenMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveOpenMatch[1]}`;
  }

  const dropboxMatch = url.match(/^https?:\/\/(www\.)?dropbox\.com\//);
  if (dropboxMatch) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
  }

  return url;
};

const normalizeAudience = (audience: string) => {
  const value = audience.toLowerCase();
  if (value.includes('lữ') || value.includes('tour') || value.includes('hãng')) return 'tour';
  if (value.includes('đối tác') || value.includes('partner')) return 'partner';
  if (value.includes('tiệc') || value.includes('sự kiện')) return 'event';
  return 'retail';
};

const audienceMeta = {
  retail: {
    label: 'Menu khách lẻ',
    description: 'Thực đơn dành cho khách gia đình, khách cá nhân và nhóm nhỏ.',
    icon: UtensilsCrossed,
    tone: 'teal'
  },
  tour: {
    label: 'Menu khách lữ hành',
    description: 'Menu set, báo giá và thực đơn phục vụ đoàn tour/hãng lữ hành.',
    icon: Users,
    tone: 'amber'
  },
  partner: {
    label: 'Menu đối tác',
    description: 'Tài liệu thực đơn dành cho đối tác, công ty và kênh hợp tác.',
    icon: Sparkles,
    tone: 'slate'
  },
  event: {
    label: 'Menu tiệc & sự kiện',
    description: 'Thực đơn cho tiệc riêng, sự kiện, hội nghị và đặt bàn nhóm lớn.',
    icon: FileText,
    tone: 'emerald'
  }
} as const;

export default function PublicMenuPdfPage() {
  const location = useLocation();
  const [files, setFiles] = useState<MenuPdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestedAudience = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const queryAudience = params.get('type') || params.get('audience');
    if (queryAudience) return queryAudience;
    if (location.pathname.includes('khach-le')) return 'retail';
    if (location.pathname.includes('lu-hanh') || location.pathname.includes('tour')) return 'tour';
    if (location.pathname.includes('doi-tac')) return 'partner';
    if (location.pathname.includes('su-kien') || location.pathname.includes('tiec')) return 'event';
    return 'all';
  }, [location.pathname, location.search]);
  const isScopedView = requestedAudience !== 'all';
  const [activeGroup, setActiveGroup] = useState<string>(requestedAudience);

  useEffect(() => {
    let mounted = true;
    const loadFiles = async () => {
      try {
        const settings = await settingsService.getAppSettings();
        if (mounted) setFiles(Array.isArray(settings?.menuPdfFiles) ? settings.menuPdfFiles : []);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadFiles();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setActiveGroup(requestedAudience);
  }, [requestedAudience]);

  const groupedFiles = useMemo(() => {
    return files.reduce<Record<string, MenuPdfFile[]>>((groups, file) => {
      const key = normalizeAudience(file.audience || 'Khách lẻ');
      if (!groups[key]) groups[key] = [];
      groups[key].push(file);
      return groups;
    }, {});
  }, [files]);

  const visibleGroups = Object.entries(groupedFiles).filter(([key]) => {
    if (isScopedView) return key === requestedAudience;
    return activeGroup === 'all' || activeGroup === key;
  }) as [string, MenuPdfFile[]][];
  const groupKeys = Object.keys(groupedFiles);
  const pageMeta = isScopedView
    ? audienceMeta[requestedAudience as keyof typeof audienceMeta] || audienceMeta.retail
    : null;

  const seoTitle = pageMeta
    ? `${pageMeta.label} – Maison Vie | Nhà hàng Pháp Hà Nội`
    : 'Thực đơn PDF – Maison Vie | Nhà hàng Pháp Hà Nội';
  const seoDescription = pageMeta
    ? `${pageMeta.description} Tải file PDF thực đơn Maison Vie miễn phí.`
    : 'Tải thực đơn PDF nhà hàng Pháp Maison Vie tại Hà Nội. Menu À La Carte, Set Menu và báo giá đoàn tour.';
  const seoUrl = `https://app.maisonvie.vn${location.pathname}`;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://app.maisonvie.vn/logo.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Menu",
          "name": pageMeta ? pageMeta.label : "Thực đơn Maison Vie",
          "description": seoDescription,
          "url": seoUrl,
          "mainEntityOfPage": {
            "@type": "Restaurant",
            "name": "Maison Vie",
            "servesCuisine": "French",
            "telephone": "+84-24-3823-9999",
            "address": { "@type": "PostalAddress", "addressLocality": "Hà Nội", "addressCountry": "VN" }
          }
        })}</script>
      </Helmet>
      {/* Header aligned with Booking Form */}
      <div className="bg-white shadow-sm py-4 px-4 md:px-12 flex items-center justify-between sticky top-0 z-10 w-full">
          <div className="w-16 md:w-24 shrink-0"></div>
          
          <div className="flex items-center justify-center flex-1">
              <div className="flex items-center gap-3">
                  <div className="w-24 md:w-32 h-10 md:h-12 shrink-0 flex items-center justify-center">
                      <img src={logoImg} alt="Maison Vie Logo" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="text-left hidden sm:block">
                      <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 leading-none">Maison Vie</h1>
                      <div className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest mt-1">French Restaurant</div>
                  </div>
              </div>
          </div>
          
          <div className="w-16 md:w-24 flex justify-end shrink-0">
              <a href="tel:+842438239999" className="px-2.5 py-1.5 rounded-full border border-gray-200 text-[11px] md:text-sm font-semibold hover:bg-gray-50 flex items-center shadow-sm bg-white text-teal-700 transition gap-1.5 whitespace-nowrap">
                 <Phone className="w-3.5 h-3.5" /> <span className="hidden md:inline">Liên hệ</span>
              </a>
          </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-3 py-4 md:p-8 w-full max-w-2xl mx-auto">
        
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2 md:mt-4">
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-5 py-6 text-white text-center">
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-800/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-50 border border-teal-500/30 mb-3">
                   <FileText className="w-3 h-3" /> Menu PDF Download
                </div>
                <h2 className="text-[22px] md:text-3xl font-black tracking-tight leading-tight mb-2">
                    {pageMeta ? pageMeta.label : 'Tải Thực Đơn PDF'}
                </h2>
                <p className="text-teal-50/90 text-[13px] md:text-sm leading-relaxed max-w-md mx-auto">
                    {pageMeta ? pageMeta.description : 'Chọn đúng nhóm thực đơn phù hợp. Bấm tải xuống để nhận file PDF đầy đủ.'}
                </p>
            </div>

            <div className="px-5 py-6 md:px-8 md:py-8 space-y-6">
                {!isScopedView && (
                    <div className="flex flex-wrap justify-center gap-2 mb-2 border-b border-gray-100 pb-6">
                         <button onClick={() => setActiveGroup('all')} className={`px-4 py-2 font-semibold text-[13px] rounded-xl border transition-all ${activeGroup === 'all' ? 'bg-teal-50 text-teal-700 border-teal-500 shadow-sm shadow-teal-500/10' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Tất cả</button>
                         {groupKeys.map(key => {
                             const meta = audienceMeta[key as keyof typeof audienceMeta];
                             return <button key={key} onClick={() => setActiveGroup(key)} className={`px-4 py-2 font-semibold text-[13px] rounded-xl border transition-all ${activeGroup === key ? 'bg-teal-50 text-teal-700 border-teal-500 shadow-sm shadow-teal-500/10' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{meta?.label || key}</button>;
                         })}
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-4">
                         {[1, 2, 3].map(i => (
                             <div key={i} className="flex justify-between items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm animate-pulse">
                                 <div className="flex items-center gap-3 w-full">
                                      <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0"></div>
                                      <div className="flex-1 space-y-2 py-1">
                                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                      </div>
                                      <div className="w-20 h-10 rounded-xl bg-gray-200 shrink-0"></div>
                                 </div>
                             </div>
                         ))}
                    </div>
                ) : files.length === 0 || visibleGroups.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <h2 className="text-[15px] font-bold text-gray-900">Chưa có menu PDF</h2>
                        <p className="text-[13px] text-gray-500 mt-1">Nhà hàng sẽ cập nhật file thực đơn sớm nhất.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {visibleGroups.map(([key, groupFiles]) => {
                             const meta = audienceMeta[key as keyof typeof audienceMeta] || audienceMeta.retail;
                             return (
                                 <div key={key} className="space-y-3">
                                     <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.16em] pb-2 border-b border-gray-100 flex items-center justify-between">
                                          <span>{meta.label}</span>
                                          <span className="text-gray-400">{groupFiles.length} file</span>
                                     </h3>
                                     
                                     <div className="grid grid-cols-1 gap-3">
                                          {groupFiles.map(file => (
                                              <div key={file.id} className="group bg-white border border-gray-100 p-3 rounded-2xl shadow-sm shadow-gray-100/70 hover:border-teal-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                   <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                             <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                             <h4 className="font-bold text-gray-900 text-[13px] leading-snug tracking-[-0.01em] truncate group-hover:text-teal-700 transition-colors">{file.title}</h4>
                                                             {file.note && <p className="text-[11px] text-gray-500 truncate mt-0.5">{file.note}</p>}
                                                        </div>
                                                   </div>
                                                   <a href={toDirectDownloadUrl(file.url)} target="_blank" rel="noreferrer" className="shrink-0 sm:w-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-[12px] font-bold hover:bg-teal-700 transition-all active:scale-95 shadow-sm">
                                                       <Download className="w-3.5 h-3.5" /> Tải về
                                                   </a>
                                              </div>
                                          ))}
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                )}
            </div>
        </div>
        
        <footer className="w-full text-center mt-6 text-[12px] text-gray-400 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5 text-teal-600/70" /> Maison Vie Restaurant</div>
            <div>PDF sẽ được tải xuống tự động.</div>
        </footer>
      </main>
    </div>
  );
}
