/*
 * คำอธิบาย : Component สำหรับแสดงการ์ดบริการท้องถิ่น (เช่น ที่พัก ร้านค้า)
 * แสดงรูปภาพและชื่อของบริการ พร้อมลิงก์ไปยังหน้ารายละเอียด
 */
import { Link } from "react-router-dom";

interface LocalServiceCardProps {
    id: number;
    name: string;
    imageUrl?: string;
    to: string;
    onClick?: () => void;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดงการ์ดบริการ 
 * Input : props (LocalServiceCardProps)
 * Output : ส่วนแสดงผล ของการ์ด
 */
export default function LocalServiceCard({
    name,
    imageUrl,
    to,
    onClick,
}: LocalServiceCardProps) {
    return (
        <Link
            to={to}
            className="group block"
            onClick={onClick}
        >
            <div className="bg-white overflow-hidden rounded-lg transition-all duration-300">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative rounded-lg border border-gray-200">
                    <img
                        src={imageUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="font-bold text-black text-base group-hover:text-[#055035] transition">
                        {name}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
