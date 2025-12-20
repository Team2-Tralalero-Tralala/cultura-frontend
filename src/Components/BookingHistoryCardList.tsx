/*
 * Component: BookingHistoryCardList
 * คำอธิบาย:  การ์ดแสดงประวัติการจอง
 */
import { useNavigate } from "react-router-dom";
export type BookingStatus = "Payment" | "Complete" | "Cancel" | "Review" | string;
export interface BookingItem {
    id: number;
    title: string;
    location: string;
    price: number;
    bookingDate?: string;
    status: BookingStatus;
    statusLabel: string;
}

interface BookingHistoryCardListProps {
    isLoading: boolean;
    bookings: BookingItem[];
}

/*
 * คำอธิบาย: ฟังก์ชันสำหรับแสดงรายการประวัติการจอง
 * Input : isLoading, bookings
 * Output : ไม่มีข้อมูลส่งกลับ
 */
export default function BookingHistoryCardList({ isLoading, bookings }: BookingHistoryCardListProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4">
            {isLoading ? (
                <div className="py-10 text-center text-gray-500">กำลังโหลด...</div>
            ) : bookings.length === 0 ? (
                <div className="py-10 text-center text-gray-400">ไม่มีประวัติการจอง</div>
            ) : (
                bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                        onClick={() => navigate(`/tourist/booking-history/${booking.id}`)}
                    >
                        {/* Card Content */}
                        <div className="flex flex-col gap-1 pr-20">
                            <h3 className="text-lg font-bold text-black">
                                {booking.title}
                            </h3>
                            <p className="text-sm text-gray-500">{booking.location}</p>
                            <p className="text-xs text-gray-400">จองเมื่อ: {booking.bookingDate}</p>
                            <p className="mt-1 font-bold text-gray-900">
                                ราคา THB {booking.price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Status (Top Right) */}
                        <div className="absolute top-6 right-6 text-sm text-gray-400">
                            {booking.statusLabel}
                        </div>

                        {/* Action Buttons (Bottom Right) */}
                        <div className="mt-4 flex justify-end gap-3 sm:absolute sm:bottom-6 sm:right-6 sm:mt-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tourist/booking-history/${booking.id}/feedback`);
                                }}
                                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                ข้อเสนอแนะ
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tourist/booking-history/${booking.id}`);
                                }}
                                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                ดูเพิ่มเติม
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
