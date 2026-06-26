// lib/mock-data.ts

// تعريف هيكل البيانات الخاص بالقاعات (Hall) لضمان اتساق البيانات
export interface Hall {
  id: string;
  name: string;
  students: number;
  temperature: number;
  occupancyRate: number;
  status: 'alert' | 'normal';
}

// دالة توليد بيانات عشوائية للمحاكاة
export const generateHallData = (id: string): Partial<Hall> => {
  return {
    students: Math.floor(Math.random() * 150) + 20, // عدد طلاب بين 20 و 170
    temperature: Math.floor(Math.random() * 8) + 22, // درجة حرارة بين 22 و 30
    occupancyRate: Math.floor(Math.random() * 100), // نسبة إشغال بين 0 و 100
    status: Math.random() > 0.8 ? "alert" : "normal", // توزيع عشوائي للحالات
  };
};