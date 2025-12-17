/** 
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดร้านค้า และร้านอื่นๆในชุมชุมเดียวกัน
*/
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
    latitude?: number;
    longitude?: number;
};
type Store = {
    id: number;
    name: string;
    detail: string | null;
    storeImages: StoreImage[];
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
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงชื่อไฟล์จาก backend เป็น URL ใช้งานได้
 * Input : fileName ชื่อไฟล์ที่ได้จาก backend
 * Output : string - URL ของไฟล์ภาพ
*/
function resolveBackendUploadUrl(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const cleaned = fileName.replace(/^\/?uploads\//, "");
    return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง string แสดงที่อยู่ร้านค้าจาก object location
 * Input : object location (StoreLocation)
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

/**
 * คำอธิบาย :
 * Component สำหรับแสดงรายละเอียดร้านค้าในชุมชน
 * โดยดึงข้อมูลร้านหลักและร้านค้าอื่น ๆ ภายในชุมชนเดียวกัน
 *
 * Input :
 * - communityId
 * - storeId
 *
 * Output :
 * - JSX.Element สำหรับหน้าแสดงรายละเอียดร้านค้า
 *   ประกอบด้วยข้อมูลร้าน, รูปภาพ, ที่อยู่, แผนที่,
 *   และรายการร้านค้าอื่นพร้อม Pagination
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

    const lat = store?.location?.latitude;
    const lng = store?.location?.longitude;

    const delta = 0.01;

    const minLat = lat !== undefined ? lat - delta : undefined;
    const maxLat = lat !== undefined ? lat + delta : undefined;
    const minLng = lng !== undefined ? lng - delta : undefined;
    const maxLng = lng !== undefined ? lng + delta : undefined;

    const latLng =
        store?.location?.latitude !== undefined &&
            store?.location?.longitude !== undefined
            ? `${store.location.latitude} ${store.location.longitude}`
            : "";

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
                <a
                    href={`https://www.openstreetmap.org/search?${new URLSearchParams({
                        query: latLng,
                        ...(minLat !== undefined && { minlat: String(minLat) }),
                        ...(maxLat !== undefined && { maxlat: String(maxLat) }),
                        ...(minLng !== undefined && { minlon: String(minLng) }),
                        ...(maxLng !== undefined && { maxlon: String(maxLng) }),
                        zoom: "16",
                    }).toString()}#map=16/${lat}/${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-[12px] mb-6 cursor-pointer hover:text-[#00BF6A] transition-colors"
                >
                    <Icon
                        icon="material-symbols:location-on"
                        className="w-5 h-5 mt-[3px] flex-shrink-0"
                    />
                    <p className="text-[16px] leading-[31px]">
                        {buildStoreAddressLine(store?.location)}
                    </p>
                </a>

                <p className="text-[16px] leading-[31px] text-black mb-6">
                    <span className="font-semibold">คำอธิบายที่อยู่ :</span> {store?.location?.detail || "-"}
                </p>

                <div className="mb-12">
                    {store?.storeImages?.length ? (
                        <Thumbnails items={store.storeImages.map((file, i) => ({
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
                        const imageUrl = firstImage
                            ? resolveBackendUploadUrl(firstImage.image)
                            : undefined;
                        const targetUrl = `/tourist/community/${communityId}/detail/store/${other.id}`;
                        return (
                            <div
                                key={other.id}
                                className="flex flex-col items-center cursor-pointer"
                                onClick={() => {
                                    window.location.href = targetUrl;
                                }}
                            >
                                <div className="w-full aspect-[17/10] bg-gray-100 rounded-md overflow-hidden mb-2">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={other.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            ไม่มีรูป
                                        </div>
                                    )}
                                </div>

                                <p className="text-center text-[16px] font-bold truncate w-full">
                                    {other.name}
                                </p>
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
