import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis
} from "recharts";
import { AlertCircle, Thermometer, Zap, Users, Building, Activity, Brain, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/api";

interface Summary {
  totalRooms: number;
  totalStudents: number;
  energyUsage: number;
  occupancyRate: number;
  avgTemperature: number;
  activeAlerts: number;
}
interface OccupancyData { room: string; occupancy: number; }
interface EnergyTrend { month: string; energy: number; }
interface TemperatureData { room: number; floor: number; temperature: number; }
interface Room { id: number; name: string; students: number; capacity: number; temperature: number; status: string; }
interface AiAlert {
  id: number;
  roomName: string;
  type: string;
  message: string;
  severity: "red" | "yellow" | "green";
  timestamp: string;
}

export default function Analytics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyData[]>([]);
  const [energy, setEnergy] = useState<EnergyTrend[]>([]);
  const [temperature, setTemperature] = useState<TemperatureData[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AiAlert[]>([]);

  const [loading, setLoading] = useState({
    summary: true, occupancy: true, energy: true,
    temperature: true, rooms: true, alerts: true,
  });

  useEffect(() => {
    analyticsApi.getSummary()
      .then(setSummary)
      .finally(() => setLoading(p => ({ ...p, summary: false })));

    analyticsApi.getOccupancy()
      .then(setOccupancy)
      .finally(() => setLoading(p => ({ ...p, occupancy: false })));

    analyticsApi.getEnergyTrend()
      .then(setEnergy)
      .finally(() => setLoading(p => ({ ...p, energy: false })));

    analyticsApi.getTemperature()
      .then(setTemperature)
      .finally(() => setLoading(p => ({ ...p, temperature: false })));

    import("@/lib/api").then(({ roomsApi }) =>
      roomsApi.getAll()
        .then(setRooms)
        .finally(() => setLoading(p => ({ ...p, rooms: false })))
    );

    analyticsApi.getAlerts()
      .then(setAlerts)
      .finally(() => setLoading(p => ({ ...p, alerts: false })));
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">FCAI-ZU Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time telemetry and AI Alerts for GeoResTwin</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">Live Data</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Rooms" value={summary?.totalRooms} icon={Building} loading={loading.summary} />
          <StatCard title="Total Students" value={summary?.totalStudents} icon={Users} loading={loading.summary} />
          <StatCard title="Energy (kWh)" value={summary?.energyUsage} icon={Zap} loading={loading.summary} />
          <StatCard title="Occupancy" value={summary ? `${summary.occupancyRate}%` : null} icon={Activity} loading={loading.summary} />
          <StatCard title="Avg Temp" value={summary ? `${summary.avgTemperature}°C` : null} icon={Thermometer} loading={loading.summary} />
          <StatCard
            title="Active Alerts"
            value={summary?.activeAlerts}
            icon={AlertCircle}
            loading={loading.summary}
            highlight={!!(summary && summary.activeAlerts > 0)}
          />
        </div>

        {/* AI Insights Section */}
        <Card className="mb-8 border-primary/20 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              AI Insights — Smart Alerts
              <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Active Monitoring
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.alerts ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No alerts from AI system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
                      alert.severity === "red"
                        ? "bg-destructive/5 border-destructive/20 hover:border-destructive/40"
                        : alert.severity === "yellow"
                        ? "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40"
                        : "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                    }`}
                  >
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                      alert.severity === "red" ? "bg-destructive animate-pulse" :
                      alert.severity === "yellow" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-sm">{alert.roomName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          alert.severity === "red" ? "bg-destructive/15 text-destructive" :
                          alert.severity === "yellow" ? "bg-yellow-500/15 text-yellow-600" :
                          "bg-green-500/15 text-green-600"
                        }`}>
                          {alert.type}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                          alert.severity === "red" ? "text-destructive" :
                          alert.severity === "yellow" ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/60 backdrop-blur-xl shadow-lg border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Occupancy by Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.occupancy ? <Skeleton className="w-full h-[300px]" /> : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancy} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="room" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                      <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl shadow-lg border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                Energy Consumption Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.energy ? <Skeleton className="w-full h-[300px]" /> : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energy} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                      <Line type="monotone" dataKey="energy" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 bg-card/60 backdrop-blur-xl shadow-lg border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Thermometer className="w-5 h-5 text-primary" />
                </div>
                Temperature Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.temperature ? <Skeleton className="w-full h-[300px]" /> : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="room" type="number" name="Room ID" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis dataKey="temperature" type="number" name="Temperature (°C)" domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ZAxis dataKey="floor" type="number" range={[50, 400]} name="Floor" />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Temp" data={temperature} fill="hsl(var(--chart-5))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Room Table */}
        <Card className="bg-card/60 backdrop-blur-xl shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Building className="w-5 h-5 text-primary" />
              </div>
              Room Status Roster
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.rooms ? (
              <div className="space-y-3">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-mono">Room Code</th>
                      <th className="px-4 py-3 font-mono">Students</th>
                      <th className="px-4 py-3 font-mono">Capacity</th>
                      <th className="px-4 py-3 font-mono">Temperature</th>
                      <th className="px-4 py-3 font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium font-mono">{room.name}</td>
                        <td className="px-4 py-4">{room.students}</td>
                        <td className="px-4 py-4">{room.capacity}</td>
                        <td className="px-4 py-4">{room.temperature}°C</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            room.status === "Alert" ? "bg-destructive/10 text-destructive" :
                            room.status === "Warning" ? "bg-yellow-500/10 text-yellow-600" :
                            "bg-green-500/10 text-green-600"
                          }`}>
                            {room.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, loading, highlight = false }: any) {
  return (
    <Card className={`border-border/50 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group ${highlight ? "border-destructive/50 bg-destructive/10" : "bg-card/60"}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br pointer-events-none ${highlight ? "from-destructive/10" : "from-primary/5"} to-transparent`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${highlight ? "bg-destructive/20" : "bg-muted"}`}>
            <Icon className={`w-5 h-5 ${highlight ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
        </div>
        <div>
          <p className={`text-sm font-medium ${highlight ? "text-destructive/80" : "text-muted-foreground"}`}>{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <h3 className={`text-2xl font-mono font-bold mt-1 ${highlight ? "text-destructive" : "text-foreground"}`}>
              {value !== undefined && value !== null ? value : "-"}
            </h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
