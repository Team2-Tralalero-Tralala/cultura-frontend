/*
 * คำอธิบาย : Type ของข้อมูล Booking History ที่แสดงในฝั่ง Client
 * อิงจากผลลัพธ์ของ BE ที่ select: tourist, package, status, transferSlip, bookingAt
 */
export interface BookingHistoryItem {
  tourist: { fname: string; lname: string };
  package: { name: string; price: number };
  status: string;
  transferSlip: string | null;
  bookingAt: string;
}
export interface TouristBookingHistory {
  id: number;
  bookingAt: string;
  status: string;
  totalParticipant: number;
  rejectReason: string;
  package: {
    name: string;
    price: number;
    description: string;
    startDate: string;
    dueDate: string;
    packageFile: { filePath: string; type: string }[];
    community: {
      name: string;
      location: {
        province: string;
        district: string;
        subDistrict: string;
        postalCode: string;
        detail: string;
        houseNumber: string;
        alley: string | null;
        villageNumber: string | null;
      };
    };
  };
}
