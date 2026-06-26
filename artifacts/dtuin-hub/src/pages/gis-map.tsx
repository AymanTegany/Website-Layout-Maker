import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Map as MapIcon, Layers, Target, Navigation, Shield, MapPin, Compass } from "lucide-react";
import { roomsApi } from "@/lib/api";

import { MapContainer, TileLayer, GeoJSON, Marker, Circle, useMap } from "react-leaflet";
import L, { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

// Fix Leaflet default icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom emerald marker icon for the Digital Twin Node
const digitalTwinIcon = L.divIcon({
  className: "custom-twin-marker",
  html: `
    <div style="position: relative; width: 36px; height: 36px;">
      <div style="position: absolute; inset: 0; background: rgba(16,185,129,0.35); border-radius: 50%; animation: pulse-ring 2s ease-out infinite;"></div>
      <div style="position: absolute; inset: 6px; background: linear-gradient(135deg, #10b981, #059669); border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 14px rgba(16,185,129,0.7); display: flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

interface RoomData {
  id: number;
  name: string;
  floor: number;
  occupancyRate: number;
  students: number;
  capacity: number;
  status: string;
}

interface BuildingFeature {
  id: string;
  name: string;
  coordinates: number[][];
  lat: number;
  lng: number;
}

// Faculty of Computers and Artificial Intelligence — Zagazig University
const FCAI_CENTER: [number, number] = [30.58681, 31.52667];
const FCAI_ZOOM = 18.5;

const BUILDINGS: BuildingFeature[] = [
  {
    id: "block-a",
    name: "Block A — FCAI",
    coordinates: [
      [30.58666, 31.52655], [30.58696, 31.52655],
      [30.58696, 31.52679], [30.58666, 31.52679], [30.58666, 31.52655]
    ],
    lat: 30.58681,
    lng: 31.52667,
  },
  {
    id: "block-b",
    name: "Block B — FCAI",
    coordinates: [
      [30.58696, 31.52667], [30.58726, 31.52667],
      [30.58726, 31.52691], [30.58696, 31.52691], [30.58696, 31.52667]
    ],
    lat: 30.58711,
    lng: 31.52679,
  },
  {
    id: "main-hub",
    name: "Main Hub",
    coordinates: [
      [30.58699, 31.52691], [30.58729, 31.52691],
      [30.58729, 31.52707], [30.58699, 31.52707], [30.58699, 31.52691]
    ],
    lat: 30.58714,
    lng: 31.52699,
  },
];

function getOccupancyColor(rate: number): string {
  if (rate >= 95) return "#EF4444";
  if (rate >= 80) return "#F59E0B";
  return "#10B981";
}

function MapCenterControl() {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: "10px", marginLeft: "10px", zIndex: 1000 }}>
      <div className="leaflet-control flex flex-col gap-1">
        <button
          onClick={() => map.setView(FCAI_CENTER, FCAI_ZOOM)}
          className="w-9 h-9 bg-white border border-gray-300 rounded shadow-md flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors"
          title="Recenter on FCAI-ZU · Midan El-Zeraa"
        >
          <Navigation className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => map.setView(FCAI_CENTER, 19)}
          className="w-9 h-9 bg-white border border-gray-300 rounded shadow-md flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors"
          title="Zoom to faculty"
        >
          <Target className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

function LayerToggle({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon?: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        {label}
      </span>
      <button
        onClick={onClick}
        className={`w-10 h-5 rounded-full relative transition-colors ${active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
      >
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${active ? "left-5" : "left-1"}`} />
      </button>
    </div>
  );
}

export default function GisMap() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingFeature | null>(null);
  const [bufferRadius, setBufferRadius] = useState<number>(150); // meters
  const [layers, setLayers] = useState({
    facultyBlock: true,
    roads: true,
    heatmap: false,
    sensors: true,
    safetyBuffer: true,
  });

  useEffect(() => {
    roomsApi.getAll()
      .then((data) => setRooms(data))
      .catch((err) => console.error("Failed to load rooms for GIS:", err));
  }, []);

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Compute the Turf.js buffer polygon around the FCAI center
  const bufferGeoJSON = useMemo(() => {
    const center = turf.point([FCAI_CENTER[1], FCAI_CENTER[0]]);
    const buffered = turf.buffer(center, bufferRadius, { units: "meters" });
    return buffered;
  }, [bufferRadius]);

  // Compute area in m² using Turf
  const bufferArea = useMemo(() => {
    if (!bufferGeoJSON) return 0;
    return Math.round(turf.area(bufferGeoJSON));
  }, [bufferGeoJSON]);

  const getBuildingOccupancy = (buildingId: string): number => {
    const prefix = buildingId === "block-a" ? "A" : "B";
    const buildingRooms = rooms.filter((r) => r.name.startsWith(prefix));
    if (!buildingRooms.length) return 0;
    return buildingRooms.reduce((sum, r) => sum + r.occupancyRate, 0) / buildingRooms.length;
  };

  const getBuildingGeoJSON = () => ({
    type: "FeatureCollection" as const,
    features: BUILDINGS.map((b) => ({
      type: "Feature" as const,
      properties: { id: b.id, name: b.name, occupancy: getBuildingOccupancy(b.id) },
      geometry: {
        type: "Polygon" as const,
        coordinates: [b.coordinates.map(([lat, lng]) => [lng, lat])], // GeoJSON uses [lng, lat]
      },
    })),
  });

  const geoJSONStyle = (feature: any): PathOptions => {
    const occupancy = feature?.properties?.occupancy ?? 0;
    return {
      fillColor: getOccupancyColor(occupancy),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: layers.heatmap ? 0.8 : 0.55,
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    if (feature.properties) {
      const building = BUILDINGS.find((b) => b.id === feature.properties.id);
      const occ = Math.round(feature.properties.occupancy);
      layer.bindTooltip(
        `<div style="font-family: monospace; font-size: 12px;">
          <strong>${feature.properties.name}</strong><br/>
          Avg Occupancy: ${occ}%<br/>
          <span style="color: ${getOccupancyColor(occ)}">${occ >= 95 ? "HIGH" : occ >= 80 ? "MEDIUM" : "LOW"}</span>
        </div>`,
        { permanent: false, direction: "top" }
      );
      layer.on("click", () => {
        if (building) setSelectedBuilding(building);
      });
    }
  };

  const selectedBuildingRooms = selectedBuilding
    ? rooms.filter((r) =>
        selectedBuilding.id === "block-a" ? r.name.startsWith("A") : r.name.startsWith("B")
      )
    : [];
  const avgOccupancy = selectedBuildingRooms.length
    ? selectedBuildingRooms.reduce((s, r) => s + r.occupancyRate, 0) / selectedBuildingRooms.length
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold text-foreground">GIS Campus Map</h1>
            <p className="text-muted-foreground mt-1">Spatial intelligence — React-Leaflet · Turf.js Buffer Analysis</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-mono font-medium">
            <Compass className="w-3.5 h-3.5" />
            FCAI-ZU · Midan El-Zeraa Shared Campus · {FCAI_CENTER[0]}° N, {FCAI_CENTER[1]}° E
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* Leaflet Map */}
          <Card className="col-span-1 lg:col-span-3 h-full overflow-hidden border-2 border-emerald-500/20 relative">
            <MapContainer
              center={FCAI_CENTER}
              zoom={FCAI_ZOOM}
              maxZoom={19}
              zoomSnap={0.5}
              zoomDelta={0.5}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                maxNativeZoom={19}
              />

              {/* Turf.js Buffer Zone */}
              {layers.safetyBuffer && bufferGeoJSON && (
                <GeoJSON
                  key={`buffer-${bufferRadius}`}
                  data={bufferGeoJSON as any}
                  style={{
                    fillColor: "#10b981",
                    fillOpacity: 0.18,
                    color: "#059669",
                    weight: 2,
                    dashArray: "6 4",
                  }}
                />
              )}

              {/* Faculty Building Polygons */}
              {layers.facultyBlock && (
                <GeoJSON
                  key={`buildings-${JSON.stringify(layers.heatmap)}-${rooms.length}`}
                  data={getBuildingGeoJSON() as any}
                  style={geoJSONStyle}
                  onEachFeature={onEachFeature}
                />
              )}

              {/* Digital Twin Node Marker (no popup — let OSM labels show through) */}
              <Marker position={FCAI_CENTER} icon={digitalTwinIcon} />

              {/* Sensor markers (small dots) */}
              {layers.sensors && BUILDINGS.map((b) => (
                <Circle
                  key={`sensor-${b.id}`}
                  center={[b.lat, b.lng]}
                  radius={3}
                  pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.9, weight: 1 }}
                />
              ))}

              <MapCenterControl />
            </MapContainer>

            {/* Occupancy Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md px-3 py-2 shadow-md">
              <p className="text-xs font-mono font-bold text-gray-700 mb-1">Spatial Legend</p>
              {[
                { color: "#10B981", label: "Low Occupancy" },
                { color: "#F59E0B", label: "Medium Occupancy" },
                { color: "#EF4444", label: "High Occupancy" },
                { color: "#14b8a6", label: "Safety Buffer", dashed: true },
              ].map(({ color, label, dashed }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="w-3 h-3 rounded inline-block"
                    style={{ backgroundColor: color, opacity: dashed ? 0.4 : 1, border: dashed ? `1.5px dashed ${color}` : "none" }}
                  />
                  {label}
                </div>
              ))}
            </div>

            {/* Coordinates readout */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 border border-gray-200 rounded-md px-3 py-1.5 shadow-sm text-xs font-mono text-gray-600">
              <span className="text-emerald-600">●</span> Lat: {FCAI_CENTER[0]}°, Lng: {FCAI_CENTER[1]}°
            </div>
          </Card>

          {/* Controls Panel */}
          <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" /> Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LayerToggle label="Faculty Blocks" icon={MapIcon} active={layers.facultyBlock} onClick={() => toggleLayer("facultyBlock")} />
                <LayerToggle label="Campus Roads" icon={Navigation} active={layers.roads} onClick={() => toggleLayer("roads")} />
                <LayerToggle label="Sensor Network" icon={Target} active={layers.sensors} onClick={() => toggleLayer("sensors")} />
                <LayerToggle label="Occupancy Heatmap" icon={MapIcon} active={layers.heatmap} onClick={() => toggleLayer("heatmap")} />
                <div className="border-t border-border pt-3">
                  <LayerToggle
                    label="Safety Buffer Zone"
                    icon={Shield}
                    active={layers.safetyBuffer}
                    onClick={() => toggleLayer("safetyBuffer")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Location Info
                </CardTitle>
                <CardDescription>FCAI-ZU buffer & building details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buffer Radius Slider */}
                <div className={`space-y-3 p-3 rounded-lg border transition-colors ${layers.safetyBuffer ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/30 border-border opacity-60"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                      Buffer Radius
                    </div>
                    <span className="font-mono text-sm font-bold text-teal-600">{bufferRadius} m</span>
                  </div>

                  <Slider
                    min={50}
                    max={500}
                    step={10}
                    value={[bufferRadius]}
                    onValueChange={(v) => setBufferRadius(v[0])}
                    disabled={!layers.safetyBuffer}
                    className="cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>50 m</span>
                    <span>500 m</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">Buffer Area</span>
                    <span className="font-mono font-bold text-teal-700">
                      {(bufferArea / 1000).toFixed(2)} k m²
                    </span>
                  </div>
                </div>

                {/* Selected Building Info */}
                {selectedBuilding ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <h3 className="font-mono font-bold text-base">{selectedBuilding.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedBuilding.lat.toFixed(4)}°N, {selectedBuilding.lng.toFixed(4)}°E
                      </p>
                    </div>
                    <div className={`text-xs font-mono font-bold px-2 py-1 rounded inline-block ${
                      avgOccupancy >= 95 ? "bg-destructive/10 text-destructive" :
                      avgOccupancy >= 80 ? "bg-yellow-500/10 text-yellow-600" :
                      "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      Avg Occupancy: {Math.round(avgOccupancy)}%
                    </div>
                    <div className="space-y-1">
                      {selectedBuildingRooms.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex justify-between text-xs font-mono">
                          <span>{r.name}</span>
                          <span className={
                            r.status === "Alert" ? "text-destructive" :
                            r.status === "Warning" ? "text-yellow-600" : "text-emerald-600"
                          }>{r.status}</span>
                        </div>
                      ))}
                      {selectedBuildingRooms.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{selectedBuildingRooms.length - 3} more rooms</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/40 rounded-md p-3 text-xs text-muted-foreground text-center border border-dashed border-border">
                    Click a building polygon to see details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
