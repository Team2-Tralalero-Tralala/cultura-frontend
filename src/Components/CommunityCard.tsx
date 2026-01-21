/**
 * คำอธิบาย: Component สำหรับแสดงการ์ดชุมชนแบบง่าย (รูปกลม + ชื่อ)
 */

type CommunityCardProps = {
  name: string;
  imageUrl: string;
};

/**
 * คำอธิบาย: แสดงการ์ดข้อมูลชุมชน
 * Input: name (ชื่อชุมชน), imageUrl (URL รูปภาพชุมชน)
 * Output: JSX Element ที่แสดงการ์ดชุมชน
 */
export default function CommunityCard({ name, imageUrl }: CommunityCardProps) {
  return (
    <div className="flex flex-row justify-center mt-10">
      <div className="mx-2 w-40 h-50 bg-white rounded-xl overflow-hidden text-center p-4">
        {/* รูปภาพชุมชน */}
        <img
          className="mx-auto h-24 w-24 rounded-full bg-gray-300 object-cover"
          src={imageUrl}
          alt={name}
        />
        {/* ชื่อชุมชน */}
        <h2 className="mt-3 text-base font-bold text-gray-800 wrap-break-word">{name}</h2>
      </div>
    </div>
  );
}
