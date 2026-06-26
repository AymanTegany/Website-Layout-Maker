// import React from "react";
// import { Link, useLocation } from "wouter";
// import { Activity, LayoutDashboard, Map, Cuboid, Building2 } from "lucide-react";

// export function Layout({ children }: { children: React.ReactNode }) {
//   const [location] = useLocation();

//   const navItems = [
//     { name: "Home", href: "/", icon: Activity },
//     { name: "Digital Twin Viewer", href: "/digital-twin", icon: Cuboid },
//     { name: "Analytics Dashboard", href: "/analytics", icon: LayoutDashboard },
//     { name: "GIS Map", href: "/gis-map", icon: Map },
//   ];

//   return (
//     <div className="min-h-screen flex flex-col w-full bg-background">
//       <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-secondary text-secondary-foreground shadow-md">
//         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//           <Link href="/" className="flex items-center gap-2.5 group">
//             <div className="relative flex items-center justify-center">
//               <div className="absolute inset-0 rounded-lg bg-emerald-400/30 blur-md group-hover:bg-emerald-400/50 transition-all duration-300" />
//               <Building2 className="relative w-6 h-6 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
//             </div>
//             <span className="text-lg font-mono font-bold text-white tracking-tight">
//               GeoResTwin
//               <span className="text-emerald-400 font-light"> | </span>
//               <span className="text-emerald-400/90">FCAI-ZU</span>
//             </span>
//           </Link>

//           <nav className="flex items-center gap-1">
//             {navItems.map((item) => {
//               const isActive = location === item.href;
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                     isActive
//                       ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)]"
//                       : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-white"
//                   }`}
//                 >
//                   <item.icon className="w-4 h-4" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>
//       </header>

//       <main className="flex-1 w-full flex flex-col">
//         {children}
//       </main>
//     </div>
//   );
// }





// *****************************



import React from "react";
import { Link, useLocation } from "wouter";
import { Activity, LayoutDashboard, Map, Cuboid, Building2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { name: "Home", href: "/", icon: Activity },
    { name: "Digital Twin Viewer", href: "/digital-twin", icon: Cuboid },
    { name: "Analytics Dashboard", href: "/analytics", icon: LayoutDashboard },
    { name: "GIS Map", href: "/gis-map", icon: Map },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background select-none">
      {/* الهيدر العلوي الذكي للمشروع */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-secondary text-secondary-foreground shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-base font-bold tracking-wider text-slate-200">
                GeoResTwin <span className="text-emerald-400">| FCAI-ZU</span>
              </span>
            </div>
          </Link>

          {/* القائمة العلوية للتنقل */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-sans cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2" dir="rtl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 font-sans tracking-wide">
              نظام إدارة السلامة والإخلاء الذكي
            </span>
          </div>
        </div>
      </header>

      {/* محتوى الصفحة الرئيسي */}
      <main className="flex-1 w-full flex flex-col pt-0">
        {children}
      </main>
    </div>
  );
}

// تصدير افتراضي لضمان عدم حدوث إيرور named export
export default Layout;