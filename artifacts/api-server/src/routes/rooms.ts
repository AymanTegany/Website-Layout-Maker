import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/rooms", async (req, res) => {
  try {
    const mockRooms = [
      { id: 1, name: "Lab 1 (AI)", floor: 1, students: 25, capacity: 30, temperature: 22.5, energyUsage: 120.5, occupancyRate: 83.3, status: "Normal", lastCleaned: new Date() },
      { id: 2, name: "Lab 2 (Networks)", floor: 1, students: 20, capacity: 25, temperature: 26.5, energyUsage: 150.2, occupancyRate: 80.0, status: "Alert", lastCleaned: new Date() },
      { id: 3, name: "Lab 3 (Robotics)", floor: 1, students: 15, capacity: 20, temperature: 21.8, energyUsage: 95.0, occupancyRate: 75.0, status: "Normal", lastCleaned: new Date() },
      { id: 4, name: "Lecture Hall A", floor: 2, students: 120, capacity: 100, temperature: 24.1, energyUsage: 320.8, occupancyRate: 120.0, status: "Warning", lastCleaned: new Date() },
      { id: 5, name: "Lecture Hall B", floor: 2, students: 85, capacity: 100, temperature: 23.0, energyUsage: 210.5, occupancyRate: 85.0, status: "Normal", lastCleaned: new Date() },
      { id: 6, name: "Server Room", floor: 3, students: 2, capacity: 5, temperature: 19.5, energyUsage: 850.0, occupancyRate: 40.0, status: "Normal", lastCleaned: new Date() },
      { id: 7, name: "Library", floor: 4, students: 45, capacity: 150, temperature: 22.1, energyUsage: 180.5, occupancyRate: 30.0, status: "Normal", lastCleaned: new Date() },
      { id: 8, name: "Staff Room 1", floor: 4, students: 8, capacity: 10, temperature: 21.5, energyUsage: 45.2, occupancyRate: 80.0, status: "Normal", lastCleaned: new Date() },
    ];
    res.json(mockRooms);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch rooms");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/rooms/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.json(room);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch room");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
