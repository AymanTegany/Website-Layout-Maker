import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { MapContainer, TileLayer, Circle, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { hallsApi } from "@/lib/api";
import {
  AlertTriangle, ShieldAlert, Users, Thermometer, CheckCircle2,
  Cpu, Map as MapIcon, Radio, ChevronRight, Activity,
} from "lucide-react";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Hall {
  id: string;
  nameAr: string;
  nameEn: string;
  capacity: number;
  students: number;
  temperature: number;
  status: "alert" | "warning" | "normal";
  floor: number;
  occupancyRate: number;
  exitCoords: [number, number];
  assemblyPoint: [number, number];
}

// ─── GIS Map constants ────────────────────────────────────────────────────────
const BUILDING_COORDS: [number, number] = [30.58681, 31.52667];
const ASSEMBLY_POINT:  [number, number] = [30.58731, 31.52637];

const buildingIcon = L.divIcon({
  className: "",
  html: `<div style="background:#ef4444;border:2.5px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 0 10px #ef4444cc;"></div>`,
  iconSize:   [16, 16],
  iconAnchor: [8, 8],
});

const assemblyIcon = L.divIcon({
  className: "",
  html: `<div style="background:#22c55e;border:2px solid white;border-radius:50%;width:12px;height:12px;box-shadow:0 0 8px #22c55e;"></div>`,
  iconSize:   [12, 12],
  iconAnchor: [6, 6],
});

// ─── GIS Map — fixed to FCAI-ZU building ─────────────────────────────────────
function MiniGISMap({ activeHall }: { activeHall: Hall | null }) {
  const start = activeHall?.exitCoords || BUILDING_COORDS;
  const end = activeHall?.assemblyPoint || ASSEMBLY_POINT;

  return (
    <MapContainer
      key={activeHall?.id || 'default'}
      center={start}
      zoom={18}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        maxNativeZoom={19}
      />
      <Marker position={start} icon={buildingIcon} />
      <Circle
        center={start}
        radius={20}
        pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15, weight: 2, dashArray: "6 4" }}
      />
      
      {/* The practical path / evacuation route */}
      <Polyline
        positions={[start, end]}
        pathOptions={{ 
          color: activeHall ? "#3b82f6" : "#22c55e", 
          weight: activeHall ? 4 : 3,
          dashArray: activeHall ? "8, 8" : undefined,
          lineCap: "round" 
        }}
      />
      <Marker position={end} icon={assemblyIcon} />
    </MapContainer>
  );
}

// ─── Status / DSS helpers ─────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === "alert")   return { bg: "bg-red-500/15",    text: "text-red-400",    border: "border-red-500/40",    dot: "bg-red-500"    };
  if (s === "warning") return { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40", dot: "bg-orange-400" };
  return                      { bg: "bg-emerald-500/15",text: "text-emerald-400",border: "border-emerald-500/40",dot: "bg-emerald-400" };
}

function statusLabel(s: string) {
  if (s === "alert")   return "تحذير - اكتظاظ";
  if (s === "warning") return "تنبيه - ضغط عالٍ";
  return "مستقر";
}

function evacuationGuidance(hall: Hall): string {
  if (hall.status === "alert")
    return `⚠️ حالة طوارئ — ${hall.nameAr} مكتظة بنسبة ${hall.occupancyRate}٪.\n\n• إخلاء فوري عبر المخرج الأمامي.\n• إبلاغ فريق الإدارة والسلامة.\n• توجيه الطلاب إلى نقطة التجمع الآمنة.\n• تفعيل بروتوكول الطوارئ DSS-02.`;
  if (hall.status === "warning")
    return `⚠️ تنبيه — نسبة الإشغال مرتفعة في ${hall.nameAr} (${hall.occupancyRate}٪).\n\n• تنظيم الدخول والخروج.\n• تهوية القاعة وخفض الحرارة.\n• مراقبة الأعداد بصفة مستمرة.\n• الاستعداد لتفعيل بروتوكول الإخلاء عند الضرورة.`;
  return `✅ الأوضاع مستقرة في ${hall.nameAr} (${hall.occupancyRate}٪).\n\nلا توجد إجراءات طارئة مطلوبة حالياً.\nمتابعة المراقبة الدورية والتوثيق التلقائي.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function DigitalTwin() {
  const [halls,      setHalls]      = useState<Hall[]>([]);
  const [activeHall, setActiveHall] = useState<Hall | null>(null);
  const [imgError,   setImgError]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [lastTick,   setLastTick]   = useState<Date | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlertsEnabled(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-select the first alerted hall when alerts become enabled
  useEffect(() => {
    if (alertsEnabled && !activeHall) {
      const firstAlert = halls.find((h) => h.status === "alert");
      if (firstAlert) {
        setActiveHall(firstAlert);
      }
    }
  }, [alertsEnabled, halls, activeHall]);


  useEffect(() => {
    const mockHalls: Hall[] = [
      { id: "modraj_1", nameAr: "مدرج 1", nameEn: "Lecture Theatre 1", capacity: 200, students: 180, temperature: 24.5, status: "normal", floor: 1, occupancyRate: 90, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "modraj_2", nameAr: "مدرج 2", nameEn: "Lecture Theatre 2", capacity: 200, students: 150, temperature: 25.1, status: "warning", floor: 1, occupancyRate: 75, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "modraj_3", nameAr: "مدرج 3", nameEn: "Lecture Theatre 3", capacity: 150, students: 64, temperature: 23.8, status: "normal", floor: 2, occupancyRate: 43, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "modraj_4", nameAr: "مدرج 4", nameEn: "Lecture Theatre 4", capacity: 150, students: 42, temperature: 23.5, status: "normal", floor: 2, occupancyRate: 28, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "medical_1", nameAr: "قاعة 1", nameEn: "Medical Hall 1", capacity: 100, students: 100, temperature: 26.2, status: "alert", floor: 1, occupancyRate: 100, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "medical_2", nameAr: "قاعة 2", nameEn: "Medical Hall 2", capacity: 100, students: 42, temperature: 22.9, status: "normal", floor: 1, occupancyRate: 42, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "medical_3", nameAr: "قاعة 3", nameEn: "Medical Hall 3", capacity: 80, students: 67, temperature: 24.8, status: "warning", floor: 2, occupancyRate: 84, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
      { id: "medical_4", nameAr: "قاعة 4", nameEn: "Medical Hall 4", capacity: 80, students: 29, temperature: 23.1, status: "normal", floor: 2, occupancyRate: 36, exitCoords: [30.58918, 31.50148], assemblyPoint: [30.58911, 31.5015] },
    ];
    setHalls(mockHalls);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (halls.length === 0) return;
    const id = setInterval(() => {
      let newlyAlertedHall: Hall | null = null;
      const nextHalls = halls.map((h) => {
        const delta      = Math.floor(Math.random() * 7) - 3;          
        const students   = Math.max(0, Math.min(h.capacity, h.students + delta));
        const occupancyRate = Math.round((students / h.capacity) * 100);
        const tempDelta  = parseFloat(((Math.random() - 0.5) * 0.4).toFixed(1));
        const temperature = parseFloat((h.temperature + tempDelta).toFixed(1));
        const status: Hall["status"] =
          occupancyRate >= 90 ? "alert" :
          occupancyRate >= 72 ? "warning" : "normal";
        const updated = { ...h, students, occupancyRate, temperature, status };
        
        if (status === "alert" && h.status !== "alert" && !newlyAlertedHall) {
          newlyAlertedHall = updated;
        }
        return updated;
      });

      setHalls(nextHalls);
      setLastTick(new Date());

      if (newlyAlertedHall) {
        setActiveHall(newlyAlertedHall);
      } else {
        setActiveHall((prev) => {
          if (!prev) return null;
          const updatedActive = nextHalls.find((h) => h.id === prev.id);
          return updatedActive || prev;
        });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [halls]);

  const handleSelectHall = useCallback((h: Hall) => {
    setActiveHall(h);
    setImgError(false);
  }, []);

  const alertCount   = halls.filter((h) => h.status === "alert").length;
  const warningCount = halls.filter((h) => h.status === "warning").length;
  const totalStudents = halls.reduce((s, h) => s + h.students, 0);

  return (
    <Layout>
      <div className="fixed inset-0 top-16 bg-[#0f172a] flex overflow-hidden font-mono">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside className="w-60 bg-[#111827] border-r border-slate-700/60 flex flex-col shrink-0">
          <div className="px-4 py-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2 mb-0.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 tracking-widest">GEORESTWIN</span>
            </div>
            <p className="text-[10px] text-slate-500">Emergency Safety & Crowd Management</p>
            <p className="text-[9px] text-slate-700 mt-0.5">FCAI-ZU · Midan El-Zeraa</p>
          </div>

          <div className="px-4 py-3 border-b border-slate-700/60 space-y-1.5">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-2">System Status</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Alerts</span>
              <span className="text-sm font-bold text-red-400">{alertCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-400 flex items-center gap-1.5"><Radio className="w-3 h-3" /> Warnings</span>
              <span className="text-sm font-bold text-orange-400">{warningCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3 h-3" /> Total Students</span>
              <span className="text-sm font-bold text-slate-200">{totalStudents}</span>
            </div>
          </div>

          <div className="px-3 py-2 text-[9px] text-slate-600 uppercase tracking-widest">
            Halls — Click to Select
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {halls.map((hall) => {
              const sc       = statusColor(hall.status);
              const isActive = activeHall?.id === hall.id;
              return (
                <button
                  key={hall.id}
                  onClick={() => handleSelectHall(hall)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border text-left transition-all duration-150
                    ${isActive
                      ? `${sc.bg} ${sc.border} ${sc.text}`
                      : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/70"}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot} ${isActive ? "shadow-[0_0_6px_1px_currentColor]" : ""}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{hall.nameEn}</p>
                    <p className="text-[10px] text-slate-500">{hall.students}/{hall.capacity} · {hall.occupancyRate}%</p>
                  </div>
                  <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`} />
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-slate-700/60">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">Simulated LIVE · 5s Refresh</span>
            </div>
            {lastTick && (
              <p className="text-[9px] text-slate-600 font-mono pl-4">
                آخر تحديث: {lastTick.toLocaleTimeString("ar-EG")}
              </p>
            )}
          </div>
        </aside>

        {/* ── CENTER — 3-D CANVAS ──────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 z-10 bg-[#0f172a]/80 backdrop-blur-sm border-b border-slate-700/40 px-4 py-2 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-bold">Speckle 3D Model</span>
            </div>
          </div>

          {alertsEnabled && halls.filter(h => h.status === "alert").length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto max-w-sm bg-red-950/80 border border-red-500/50 backdrop-blur-md rounded-lg p-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] pointer-events-none flex flex-col items-center justify-center animate-pulse" dir="rtl">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
                <h2 className="text-sm font-bold text-red-400">حالة طوارئ!</h2>
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              </div>
              <p className="text-[10px] text-red-200 mb-2 text-center">القاعات المكتظة:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {halls.filter(h => h.status === "alert").map(h => (
                  <span key={h.id} className="bg-red-500/30 border border-red-500 text-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                    {h.nameAr} ({h.occupancyRate}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ width: "100%", height: "100%", position: "relative" }}>
             <iframe 
                src="https://app.speckle.systems/projects/66b23fc631/models/94ef86058e?embedToken=80e11e52ba4d9ed2d2fc14915f937fe13f7ec15a1d&transparent=true"
                width="100%" 
                height="100%" 
                frameBorder="0"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
             />
          </div>

          <div className="absolute bottom-4 right-4 z-20 w-72 h-52 rounded-xl overflow-hidden border border-slate-600/70 shadow-2xl ring-1 ring-slate-500/20 pointer-events-auto">
            <div className="absolute top-0 left-0 right-0 z-30 bg-[#0f172a]/90 backdrop-blur-sm flex items-center gap-2 px-3 py-1.5 border-b border-slate-700/60">
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-300 font-bold">GIS Evacuation Layer</span>
              {activeHall && (
                <span className={`ml-auto text-[9px] font-bold ${statusColor(activeHall.status).text}`}>
                  {activeHall.nameAr} — {statusLabel(activeHall.status)}
                </span>
              )}
            </div>
            <div className="pt-7 h-full relative z-20 pointer-events-auto">
              <MiniGISMap activeHall={activeHall} />
            </div>
          </div>

          {!activeHall && !loading && (
             <div className="absolute bottom-56 right-4 z-10 text-[10px] text-slate-600 text-right pointer-events-none">
              ↑ Select a hall to see evacuation route
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR — Arabic DSS ───────────────────────────── */}
        <aside
          className="w-80 bg-[#111827] border-l border-slate-700/60 flex flex-col shrink-0 overflow-y-auto"
          dir="rtl"
        >
          <div className="px-4 py-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">نظام إدارة السلامة والإخلاء الذكي</span>
            </div>
            <p className="text-[10px] text-slate-500">FCAI-ZU · Zagazig University · Real-time DSS</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {activeHall
              ? (() => {
                  const sc = statusColor(activeHall.status);
                  return (
                    <div className="space-y-4">
                      <div className={`rounded-lg border ${sc.border} ${sc.bg} p-3`}>
                        <p className="text-base font-bold text-white mb-0.5">{activeHall.nameAr}</p>
                        <p className="text-[10px] text-slate-400">{activeHall.nameEn} · الدور {activeHall.floor}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.border} ${sc.text}`}>
                          {statusLabel(activeHall.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/70 rounded-lg p-2.5 border border-slate-700/50">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                            <Users className="w-3 h-3" />
                            عدد الطلاب الحالي
                          </div>
                          <p className={`text-xl font-bold ${sc.text}`}>{activeHall.students}</p>
                          <p className="text-[10px] text-slate-600">/ {activeHall.capacity} مقعد</p>
                        </div>
                        <div className="bg-slate-800/70 rounded-lg p-2.5 border border-slate-700/50">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                            <Thermometer className="w-3 h-3" />
                            درجة الحرارة
                          </div>
                          <p className={`text-xl font-bold ${activeHall.temperature > 28 ? "text-red-400" : "text-sky-400"}`}>
                            {activeHall.temperature.toFixed(1)}°C
                          </p>
                          <p className="text-[10px] text-slate-600">{activeHall.temperature > 28 ? "مرتفعة" : "مقبولة"}</p>
                        </div>
                        <div className="col-span-2 bg-slate-800/70 rounded-lg p-2.5 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-slate-500">حالة الإشغال</span>
                            <span className={`text-xs font-bold ${sc.text}`}>{activeHall.occupancyRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                activeHall.status === "alert"   ? "bg-red-500" :
                                activeHall.status === "warning" ? "bg-orange-400" : "bg-emerald-500"
                              }`}
                              style={{ width: `${activeHall.occupancyRate}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                        {imgError ? (
                          <div className="w-full h-40 bg-slate-800 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700 rounded-xl">
                            <span className="text-2xl mb-1">🏛</span>
                            <span className="text-[10px]">{activeHall.nameAr} — لا توجد صورة</span>
                          </div>
                        ) : (
                          <img
                            src={`/images/${activeHall.id}.png`}
                            onError={() => setImgError(true)}
                            className="w-full h-40 object-cover"
                            alt={activeHall.nameAr}
                          />
                        )}
                      </div>

                      <div className={`rounded-lg border ${sc.border} bg-slate-900/60 p-3`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className={`w-3.5 h-3.5 ${sc.text}`} />
                          <span className="text-[10px] font-bold text-slate-300">نظام دعم اتخاذ القرار لإخلاء الحشود</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed whitespace-pre-line">
                          {evacuationGuidance(activeHall)}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/40 text-[10px] text-slate-500 space-y-0.5" dir="ltr">
                        <div className="flex justify-between">
                          <span>Exit Coords</span>
                          <span className="font-mono text-emerald-500">{activeHall.exitCoords[0]}°N, {activeHall.exitCoords[1]}°E</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assembly Point</span>
                          <span className="font-mono text-emerald-500">{activeHall.assemblyPoint[0]}°N, {activeHall.assemblyPoint[1]}°E</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              : (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 min-h-[300px]">
                  <CheckCircle2 className="w-10 h-10 text-slate-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">لم يتم تحديد قاعة</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      اضغط على قاعة في القائمة لعرض بيانات السلامة وإرشادات الإخلاء
                    </p>
                  </div>
                  {halls.filter((h) => h.status !== "normal").map((h) => {
                    const sc = statusColor(h.status);
                    return (
                      <button
                        key={h.id}
                        onClick={() => handleSelectHall(h)}
                        className={`w-full text-right flex items-center gap-2 px-3 py-2 rounded-md border ${sc.border} ${sc.bg} ${sc.text} hover:opacity-80 transition-opacity`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                        <span className="text-xs font-bold">{h.nameAr}</span>
                        <span className="text-[10px] opacity-70 mr-auto">{statusLabel(h.status)}</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )
            }
          </div>
        </aside>
      </div>
    </Layout>
  );
}
