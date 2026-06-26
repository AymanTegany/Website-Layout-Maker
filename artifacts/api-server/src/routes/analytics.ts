import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/analytics/summary", async (req, res) => {
  try {
    // Realistic data for FCAI-ZU
    const totalRooms = 45; // Labs, Lecture halls, Staff rooms
    const totalStudents = 1250;
    const energyUsage = 3450.5; // kWh
    const occupancyRate = 78.5; // %
    const avgTemperature = 23.2; // °C
    const activeAlerts = 3; // Number of red alerts

    res.json({ totalRooms, totalStudents, energyUsage, occupancyRate, avgTemperature, activeAlerts });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch analytics summary");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/analytics/occupancy", async (req, res) => {
  try {
    const data = [
      { room: "Lab 1 (AI)", occupancy: 25 },
      { room: "Lab 2 (Networks)", occupancy: 20 },
      { room: "Lab 3 (Robotics)", occupancy: 15 },
      { room: "Lecture Hall A", occupancy: 120 },
      { room: "Lecture Hall B", occupancy: 85 },
      { room: "Server Room", occupancy: 2 },
      { room: "Library", occupancy: 45 },
      { room: "Staff Room 1", occupancy: 8 },
    ];
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch occupancy data");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/analytics/energy", async (req, res) => {
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseEnergy = [2800, 2650, 3100, 3400, 3800, 4200, 4500, 4300, 3900, 3500, 3100, 2900];
    const data = months.map((month, i) => ({ month, energy: baseEnergy[i] }));
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch energy trend");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/analytics/temperature", async (req, res) => {
  try {
    const data = [
      { room: 101, floor: 1, temperature: 22.5 },
      { room: 102, floor: 1, temperature: 23.0 },
      { room: 103, floor: 1, temperature: 21.8 },
      { room: 201, floor: 2, temperature: 24.1 },
      { room: 202, floor: 2, temperature: 26.5 }, // A bit warm
      { room: 203, floor: 2, temperature: 23.5 },
      { room: 301, floor: 3, temperature: 22.1 },
      { room: 302, floor: 3, temperature: 21.5 },
      { room: 401, floor: 4, temperature: 19.5 }, // Server room cold
    ];
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch temperature distribution");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/analytics/alerts", async (req, res) => {
  try {
    const formatted = [
      {
        id: 1,
        roomName: "Lab 2 (Networks)",
        type: "Temperature Anomaly",
        message: "Temperature exceeds 26°C. AC unit might be malfunctioning. Inspect immediately to prevent equipment overheating.",
        severity: "red",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 2,
        roomName: "Lecture Hall A",
        type: "Overcrowding",
        message: "Occupancy detected at 120 (Capacity 100). HVAC load increasing. Suggest opening ventilation.",
        severity: "yellow",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 3,
        roomName: "Server Room",
        type: "Power Surge",
        message: "Brief power surge detected and mitigated by UPS. Logged for maintenance review.",
        severity: "red",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 4,
        roomName: "Lab 1 (AI)",
        type: "Energy Optimization",
        message: "Lights left on while unoccupied for 30 minutes. Auto-shutdown initiated.",
        severity: "green",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      }
    ];
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch AI alerts");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
