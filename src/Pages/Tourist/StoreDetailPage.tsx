import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer"
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import { getStoreWithOtherStoresInCommunity } from "@/Services/store-service";
import { Tag } from "@/Components/Tag";
import { Icon } from "@iconify/react";
import Thumbnails from "@/Components/Thumbnails";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";

type StoreTag = { 
    id: number; 
    name: string 
};

type StoreImage = { 
    image: string 
};

type StoreLocation = {
    houseNumber?: string;
    villageNumber?: string;
    alley?: string;
    subDistrict?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    detail?: string;
};
type Store = {
    id: number;
    name: string;
    detail: string | null;
    storeImage: StoreImage[];
    communityId: number;
    location: StoreLocation | null;
    tagStores: { tag: StoreTag }[];
};

type OtherStore = { 
    id: number; 
    name: string; 
    storeImage: 
    StoreImage[] 
};

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace("/api", "") || "http://localhost:3000";

/*
 * ฟังก์ชัน : resolveBackendUploadUrl
 * คำอธิบาย : แปลงชื่อไฟล์จาก backend เป็น URL ใช้งานได้
 * Input : fileName (string | undefined) - ชื่อไฟล์ที่ได้จาก backend
 * Output : string | undefined - URL ของไฟล์ภาพ
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const cleaned = fileName.replace(/^\/?uploads\//, "");
    return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/*
 * ฟังก์ชัน : buildStoreAddressLine
 * คำอธิบาย : สร้าง string แสดงที่อยู่ร้านค้าจาก object location
 * Input : location (StoreLocation | null | undefined)
 * Output : string - ที่อยู่แบบรวม
 */
function buildStoreAddressLine(location?: StoreLocation | null): string {
    const text = [
        location?.houseNumber,
        location?.villageNumber ? `หมู่ ${location.villageNumber}` : "",
        location?.alley,
        location?.subDistrict ? `ต.${location.subDistrict}` : "",
        location?.district ? `อ.${location.district}` : "",
        location?.province ? `จ.${location.province}` : "",
        location?.postalCode,
    ].filter(Boolean).join(" ");
    return text || "-";
}

/*
 * ฟังก์ชัน : StoreDetailPage
 * คำอธิบาย : แสดงรายละเอียดร้านค้า พร้อมรายการร้านค้าอื่นในชุมชน และ pagination
 * Input : ไม่มี
 * Output : React Component ที่ render หน้าแสดงรายละเอียดร้านค้า และร้านค้าอื่นในชุมชน
 */
export default function StoreDetailPage() {
    const { communityId, storeId } = useParams();
    const limit = 12;

    const [store, setStore] = useState<Store | null>(null);
    const [otherStores, setOtherStores] = useState<OtherStore[]>([]);
    const [totalOtherStores, setTotalOtherStores] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchStore = async () => {
            const res = await getStoreWithOtherStoresInCommunity(
                Number(communityId),
                Number(storeId),
                page,
                limit
            );
            setStore(res.data.store);
            setOtherStores(res.data.otherStores?.data || []);
            setTotalOtherStores(res.data.otherStores?.pagination?.totalCount || 0);
        };
        fetchStore();
    }, [communityId, storeId, page]);

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarTourist />
            <div className="container mx-auto px-4 py-8">
                <BreadcrumbNavigation 
                current={{ 
                    label: "รายละเอียดร้านค้า", 
                    to: `/tourist/community/${communityId}/detail/store/${storeId}`,
                    }} 
                />

                <h1 className="text-[40px] font-bold text-black mb-6">{store?.name}</h1>

                <div className="flex flex-wrap gap-[29px] mb-6">
                    {store?.tagStores.map((item) => (
                        <Tag key={item.tag.id} label={item.tag.name} className="text-[14px] font-light text-gray-700" />
                    ))}
                </div>

                <p className="text-[16px] text-gray-900 mb-6">
                    <span className="font-semibold">รายละเอียดร้านค้า :</span> {store?.detail || "-"}
                </p>

                <div className="flex items-start gap-[12px] mb-6">
                    <Icon icon="material-symbols:location-on" className="w-5 h-5 mt-[3px] text-black" />
                    <p className="text-[16px] leading-[31px] text-black">{buildStoreAddressLine(store?.location)}</p>
                </div>

                <p className="text-[16px] leading-[31px] text-black mb-6">
                    <span className="font-semibold">คำอธิบายที่อยู่ :</span> {store?.location?.detail || "-"}
                </p>

                <div className="mb-12">
                    {store?.storeImage?.length ? (
                        <Thumbnails items={store.storeImage.map((file, i) => ({
                            type: "image" as const,
                            src: resolveBackendUploadUrl(file.image) || "https://placehold.co/600x400?text=No+Image",
                            alt: `${store.name} - รูป ${i + 1}`,
                        }))} />
                    ) : (
                        <p className="text-gray-500 text-[16px]">ไม่มีรูปภาพ</p>
                    )}
                </div>

                <h2 className="text-[24px] font-bold text-black mt-12 mb-6">ร้านค้าอื่นของชุมชน</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {otherStores.map((other) => {
                        const firstImage = other.storeImage?.[0];
                        const imageUrl = firstImage ? resolveBackendUploadUrl(firstImage.image) : undefined;
                        return (
                            <div key={other.id} className="flex flex-col items-center">
                                <div className="w-full aspect-[17/10] bg-gray-100 rounded-md overflow-hidden mb-2">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={other.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">ไม่มีรูป</div>
                                    )}
                                </div>
                                <p className="text-center text-[16px] font-bold truncate w-full">{other.name}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination ขวาล่าง */}
                <div className="flex justify-end">
                    <Pagination
                        totalData={totalOtherStores}
                        onQueryChange={({ page }) => setPage(page)}
                    />
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>

    );
}
