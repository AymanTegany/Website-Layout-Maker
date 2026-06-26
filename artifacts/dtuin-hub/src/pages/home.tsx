import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Map, Cuboid, ArrowRight, Activity, Users, Zap, GraduationCap, BookOpen, Cpu, Code2 } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative w-full bg-secondary text-white py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-medium mb-6">
                <Activity className="w-4 h-4" />
                <span>System Status: Online</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-mono font-bold leading-tight mb-6">
                GeoResTwin: <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">Spatial Intelligence</span>{" "}
                <span className="block mt-1">for FCAI</span>
              </h1>
              <p className="text-xl text-secondary-foreground/80 mb-10 max-w-2xl font-light leading-relaxed">
                The Definitive Digital Twin Platform for the Faculty of Computers and Artificial Intelligence, Zagazig University.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/digital-twin">
                  <Button size="lg" className="h-14 px-8 text-base font-medium bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_24px_rgba(52,211,153,0.4)] hover:shadow-[0_0_32px_rgba(52,211,153,0.6)] transition-all duration-300">
                    <Cuboid className="w-5 h-5 mr-2" />
                    Launch 3D Viewer
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium bg-transparent border-emerald-400/30 text-white hover:bg-emerald-400/10 hover:border-emerald-400/60 transition-all duration-300">
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl font-mono font-bold text-foreground mb-4">Core Platform Modules</h2>
              <p className="text-muted-foreground max-w-2xl">
                Integrated toolset for comprehensive campus oversight and facility management.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Cuboid className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Digital Twin Viewer</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Interactive 3D representation of faculty buildings with live sensor data overlays.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Multi-floor navigation</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Temperature & density layers</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Real-time room status</li>
                  </ul>
                  <Link href="/digital-twin">
                    <Button variant="ghost" className="w-full justify-between group">
                      Access Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Comprehensive metrics and trends for energy consumption and space utilization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Energy consumption tracking</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Occupancy heatmaps</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Anomaly detection alerts</li>
                  </ul>
                  <Link href="/analytics">
                    <Button variant="ghost" className="w-full justify-between group">
                      Access Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Map className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">GIS Mapping</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Macro-level campus view with building footprints and spatial intelligence.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Coordinate grid system</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Layer management</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Faculty block zoning</li>
                  </ul>
                  <Link href="/gis-map">
                    <Button variant="ghost" className="w-full justify-between group">
                      Access Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-muted/40 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
                <GraduationCap className="w-3.5 h-3.5" />
                Faculty of Computers & Artificial Intelligence — Zagazig University
              </div>
              <h2 className="text-3xl font-mono font-bold text-foreground mb-4">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl text-base">
                The specialized academic and engineering team behind the ZU-Twin Digital Transformation project.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  initials: "NM",
                  name: "Prof. Dr. Nabil Mostafa",
                  role: "Head of Department & Project Advisor",
                  tag: "Professor",
                  icon: GraduationCap,
                  gradient: "from-[#1E3A5F] to-[#2563EB]",
                  badge: "bg-blue-500/10 text-blue-600 border-blue-200",
                },
                {
                  initials: "SA",
                  name: "Dr. Safaa",
                  role: "Project Supervisor",
                  tag: "Doctor",
                  icon: BookOpen,
                  gradient: "from-[#4c1d95] to-[#7c3aed]",
                  badge: "bg-violet-500/10 text-violet-600 border-violet-200",
                },
                {
                  initials: "HF",
                  name: "Eng. Hassan El-Feki",
                  role: "Teaching Assistant & Project Mentor",
                  tag: "Engineer",
                  icon: Cpu,
                  gradient: "from-[#064e3b] to-[#059669]",
                  badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                },
                {
                  initials: "KT",
                  name: "Kareem El-Tigany",
                  role: "Team Leader & Full-Stack Developer",
                  tag: "Developer",
                  icon: Code2,
                  gradient: "from-[#7c2d12] to-[#ea580c]",
                  badge: "bg-orange-500/10 text-orange-600 border-orange-200",
                },
              ].map((member) => (
                <div
                  key={member.initials}
                  className="group flex flex-col items-center p-8 bg-card rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-center"
                >
                  {/* Avatar */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-5 shadow-lg ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-300`}>
                    <span className="text-2xl font-mono font-bold text-white tracking-wide">
                      {member.initials}
                    </span>
                  </div>

                  {/* Tag */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-3 ${member.badge}`}>
                    <member.icon className="w-3 h-3" />
                    {member.tag}
                  </span>

                  {/* Name */}
                  <h3 className="font-bold text-foreground text-base leading-tight mb-2">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
