/*
 * หน้า : รายละเอียดชุมชนสำหรับฝั่งผู้ใช้ทั่วไป (Guest / Tourist)
 * คำอธิบาย : สำหรับแสดงรายละเอียดของชุมชน (ชุมชนที่เปิด)
 * หน้าที่ : ใช้สำหรับดึงและแสดงข้อมูลรายละเอียดของชุมชนแบบ public
 * สิทธิ์การเข้าถึง : Guest (ไม่ login) และ Tourist (login แล้ว)
 * เส้นทาง (Route) : /tourist/community/:communityId/detail , /guest/community/:communityId/detail
 */

import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useParams } from "react-router-dom";

import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { getCommunityDetailPublic } from "@/Services/community-service";
import CardPackage from "@/Components/CardPackage";
import PaginationRoundedForCardPackage from "@/Components/Pagination/PaginationRoundedForCardPackage";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";

/**
 * คำอธิบาย : ใช้แสดงค่า string หรือคืนค่า "-" หากไม่มีข้อมูล/เป็นค่าว่าง
 *
 * Input:
 *  - value?: string | null
 * Output:
 *  - string (ค่าที่พร้อมแสดงผล)
 */
const displayText = (value?: string | null) =>
  value && String(value).trim() ? value : "-";

/**
 * คำอธิบาย : แปลงวันที่จากรูปแบบ ISO เป็นวันที่แบบไทย (dd/mm/yyyy)
 *
 * Input:
 *  - iso?: string | null
 * Output:
 *  - string (dd/mm/yyyy) หรือ "-" ถ้าแปลงไม่ได้
 */
const toThaiDate = (iso?: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * คำอธิบาย : base url สำหรับไฟล์อัปโหลดจาก backend
 * หมายเหตุ : VITE_API_URL มักลงท้ายด้วย /api → จึงต้องตัดออกเพื่อให้ได้ backend base
 */
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

/**
 * คำอธิบาย : แปลง path ที่ได้จาก backend ให้เป็น URL เต็มของไฟล์ใน /uploads
 *
 * Input:
 *  - fileName?: string | null
 * Output:
 *  - string | undefined (URL เต็มของไฟล์)
 */
function resolveBackendUploadUrl(
  fileName?: string | null
): string | undefined {
  if (!fileName) return undefined;
  const normalized = fileName.replace(/\\/g, "/");
  const cleaned = normalized.replace(/^\/?uploads\//, "");
  return `${backendBaseUrl}/uploads/${cleaned}`;
}

/**
 * คำอธิบาย : ดึง path รูปภาพจาก object โดยรองรับ field หลายชื่อ (กันเคส shape ต่างกัน)
 *
 * Input:
 *  - imageObject: any
 * Output:
 *  - string | null (path รูป)
 */
function pickImagePath(imageObject: any): string | null {
  return (
    imageObject?.url ??
    imageObject?.image ??
    imageObject?.ci_image ??
    imageObject?.filePath ??
    null
  );
}

/**
 * คำอธิบาย : ค้นหารูปภาพของชุมชนตามประเภท (เช่น LOGO, COVER)
 *
 * Input:
 *  - community: any
 *  - type: string
 * Output:
 *  - string | null (path รูป)
 */
function findImage(community: any, type: string): string | null {
  const imageItem = community?.communityImage?.find(
    (imageObject: any) =>
      String(imageObject.type).toUpperCase() === type.toUpperCase()
  );
  return pickImagePath(imageItem);
}

/**
 * คำอธิบาย : คืนค่า Array ของ path รูปภาพที่มี type ตรงตามที่ระบุ
 *
 * Input:
 *  - community: any
 *  - type: string
 * Output:
 *  - string[] (รายการ path รูป)
 */
function listImagesByType(community: any, type: string): string[] {
  const imageArray = (community?.communityImage || []).filter(
    (imageObject: any) =>
      String(imageObject.type).toUpperCase() === type.toUpperCase()
  );

  return imageArray.map(pickImagePath).filter(Boolean) as string[];
}

/**
 * คำอธิบาย : Component สำหรับแสดงข้อมูลในรูปแบบ "Label : Value"
 * Input : -
 * Output : แถวข้อมูล 1 แถว (Label : Value) สำหรับใช้ในหน้ารายละเอียด
 */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_16px_minmax(0,1fr)] md:grid-cols-[220px_16px_minmax(0,1fr)] gap-x-2 items-start">
      <div className="font-bold text-black text-base">{label}</div>
      <div className="text-black font-regular text-base">:</div>
      <div className="text-black font-regular break-words text-base">
        {children ?? "-"}
      </div>
    </div>
  );
}

/**
 * คำอธิบาย : Component สำหรับแสดงโลโก้ของชุมชนในรูปแบบวงกลม
 *             หากมีรูปโลโก้จะแสดงรูปภาพ
 *             หากไม่มีรูปโลโก้จะแสดงตัวอักษรย่อจากชื่อชุมชนแทน
 * Input : -
 * Output : องค์ประกอบโลโก้แบบวงกลม (รูปภาพหรืออักษรย่อ)
 */
function LogoCircle({ src, name, size = 240 }: any) {
  const base =
    "rounded-full ring-4 ring-white shadow-lg overflow-hidden grid place-items-center select-none";
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt="Logo"
        style={style}
        className={`${base} object-cover bg-white`}
      />
    );
  }

  const initial = (name || "").trim().charAt(0)?.toUpperCase() || "?";
  return (
    <div
      style={style}
      className={`${base} bg-gradient-to-br from-emerald-500 to-teal-600`}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>
        {initial}
      </span>
    </div>
  );
}

/**
 * คำอธิบาย : Component สำหรับแสดงภาพปกของชุมชนหรือรายการข้อมูล
 *             หากมีรูปภาพจะแสดงเป็นภาพปก
 *             หากไม่มีรูปภาพจะแสดง placeholder แทน
 * Input : -
 * Output : องค์ประกอบภาพปก (รูปภาพหรือ placeholder)
 */
function CoverRect({ src, height = 300 }: any) {
  if (src) {
    return (
      <img
        src={src}
        alt="Cover"
        style={{ height }}
        className="w-full object-cover"
      />
    );
  }

  return (
    <div style={{ height }} className="w-full bg-gray-100 grid place-items-center">
      <div className="w-[92%] h-[70%] border-2 border-dashed border-gray-300 rounded-xl grid place-items-center">
        <span className="text-gray-500">ไม่มีภาพปก</span>
      </div>
    </div>
  );
}

/**
 * คำอธิบาย : หน้าแสดงรายละเอียดชุมชนแบบ Public สำหรับ Guest / Tourist
 *             - ดึงข้อมูลชุมชน + รายการแพ็กเกจ/ร้านค้า/ที่พัก แบบแยก pagination
 *             - แสดงภาพปก/โลโก้/ข้อมูลติดต่อ/แกลเลอรี/วิดีโอ/แผนที่
 * Input : -
 * Output : หน้ารายละเอียดชุมชน (Public Community Detail Page)
 */
export default function CommunityDetailUser() {
  const location = useLocation();
  const isGuestPath = location.pathname.startsWith("/guest");
  const basePath = isGuestPath ? "/guest" : "/tourist";

  const { communityId } = useParams<{ communityId: string }>();

  const [community, setCommunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [packagePage, setPackagePage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [homestayPage, setHomestayPage] = useState(1);

  // packages
  const [packages, setPackages] = useState<any[]>([]);
  const [packagePagination, setPackagePagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  } | null>(null);

  // stores
  const [stores, setStores] = useState<any[]>([]);
  const [storePagination, setStorePagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  } | null>(null);

  // homestays
  const [homestays, setHomestays] = useState<any[]>([]);
  const [homestayPagination, setHomestayPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  } | null>(null);

 /**
 * คำอธิบาย : ดึง URL รูปปกของแพ็กเกจ (type=COVER) เพื่อใช้แสดงบน CardPackage
 * Input : tourPackage (ข้อมูลแพ็กเกจที่มี packageFile)
 * Output : URL ของรูปปกแพ็กเกจ (ถ้าไม่มีคืนค่า undefined)
 */
  function getPackageCover(tourPackage: any): string | undefined {
    const coverFile = tourPackage?.packageFile?.find(
      (packageFileItem: any) =>
        String(packageFileItem.type).toUpperCase() === "COVER"
    );
    return resolveBackendUploadUrl(coverFile?.filePath);
  }

  /**
 * คำอธิบาย : คำนวณสถานะการจองของแพ็กเกจจากวันเปิด/ปิดจอง
 * Input : tourPackage (ต้องมี bookingOpenDate / bookingCloseDate)
 * Output :
 *   - "UPCOMING" : ยังไม่ถึงวันเปิดจอง
 *   - "OPEN"     : อยู่ในช่วงเปิดจอง
 *   - "CLOSED"   : เลยวันปิดจองแล้ว
 */
  function getBookingStatus(tourPackage: any): "OPEN" | "CLOSED" | "UPCOMING" {
    const now = new Date();
    const open = tourPackage?.bookingOpenDate ? new Date(tourPackage.bookingOpenDate) : null;
    const close = tourPackage?.bookingCloseDate ? new Date(tourPackage.bookingCloseDate) : null;

    if (open && now < open) return "UPCOMING";
    if (close && now > close) return "CLOSED";
    return "OPEN";
  }

  /**
 * คำอธิบาย : ดึง URL รูปปกร้านค้า (type=COVER) สำหรับแสดงในรายการร้านค้าหน้ารายละเอียดชุมชน
 * Input : store (ข้อมูลร้านค้าที่มี storeImage)
 * Output : URL ของรูปปกร้านค้า (ถ้าไม่มีคืนค่า undefined)
 */
  function getStoreCover(store: any): string | undefined {
    const storeCoverImage = store?.storeImage?.find(
      (storeImageItem: any) =>
        String(storeImageItem.type).toUpperCase() === "COVER"
    );
    return resolveBackendUploadUrl(storeCoverImage?.image);
  }

/**
 * คำอธิบาย : ดึง URL รูปปกที่พัก (type=COVER) สำหรับแสดงในรายการที่พักหน้ารายละเอียดชุมชน
 * Input : homestay (ข้อมูลที่พักที่มี homestayImage)
 * Output : URL ของรูปปกที่พัก (ถ้าไม่มีคืนค่า undefined)
 */
  function getHomestayCover(homestay: any): string | undefined {
    const homestayCoverImage = homestay?.homestayImage?.find(
      (homestayImageItem: any) =>
        String(homestayImageItem.type).toUpperCase() === "COVER"
    );
    return resolveBackendUploadUrl(homestayCoverImage?.image);
  }
/**
 * คำอธิบาย : ดึงข้อมูลรายละเอียดชุมชนแบบ Public จาก Backend
 *             - โหลดข้อมูลเมื่อ communityId หรือ page ของ package/store/homestay เปลี่ยน
 *             - อัปเดต state: community, packages, stores, homestays และ pagination
 * Input : -
 * Output : -
 */
  useEffect(() => {
    if (!communityId) return;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ส่ง query.page ให้ตรงกับ BE Controller
        const res = await getCommunityDetailPublic(Number(communityId), {
          packagePage,
          storePage,
          homestayPage,
        });

        const payload = res?.data?.data;

        setCommunity(payload?.community ?? null);

        // packages (รองรับได้ทั้ง shape: {data, pagination} หรือ array ตรง)
        const packageBlock = payload?.packages;
        setPackages(packageBlock?.data ?? packageBlock ?? []);
        setPackagePagination(packageBlock?.pagination ?? null);

        // stores
        const storeBlock = payload?.stores;
        setStores(storeBlock?.data ?? storeBlock ?? []);
        setStorePagination(storeBlock?.pagination ?? null);

        // homestays
        const homestayBlock = payload?.homestays;
        setHomestays(homestayBlock?.data ?? homestayBlock ?? []);
        setHomestayPagination(homestayBlock?.pagination ?? null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [communityId, packagePage, storePage, homestayPage]);

  const coverImage = useMemo(
    () => resolveBackendUploadUrl(findImage(community, "COVER")),
    [community]
  );
  const logoImage = useMemo(
    () => resolveBackendUploadUrl(findImage(community, "LOGO")),
    [community]
  );
  const galleries = useMemo(
    () =>
      (listImagesByType(community, "GALLERY") || [])
        .map(resolveBackendUploadUrl)
        .filter(Boolean) as string[],
    [community]
  );
  const videos = useMemo(
    () =>
      (listImagesByType(community, "VIDEO") || [])
        .map(resolveBackendUploadUrl)
        .filter(Boolean) as string[],
    [community]
  );

  /* ส่วน : Loading / Error Guard */
  if (isLoading && !community) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!community) return <div className="p-8">ไม่พบข้อมูล</div>;

  const isOpen = String(community.status || "").toUpperCase() === "OPEN";

  /* ส่วน : Render */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavbarTourist />

      {/* ทั้งหน้าใช้ container เดียว (เหมือน PackagesPage) */}
      <div className="container mx-auto px-4 py-8">
        {/* Header: Breadcrumb + Title */}
        <div className="mb-6">
          <Breadcrumb
            current={{
              label: community?.name || "ชุมชน",
              to: `${basePath}/community/${communityId}/detail`,
            }}
          />

          <h1 className="mt-4 text-[40px] font-bold leading-tight text-black">
            {community?.name || "-"}
          </h1>
        </div>

        {/* hr ไม่ต้องเต็มจอ (ให้อยู่ใน container จะไม่เบี้ยว) */}
        <hr className="mb-8 w-full border-t-2 border-[#D9D9D9]" />

        {/* ส่วน : ภาพปก + โลโก้ */}
        {(() => {
          const coverHeight = 300;
          const logo = 240;

          return (
            <div className="pb-6">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                <CoverRect src={coverImage} height={coverHeight} />

                <div className="relative px-6 md:px-8 pt-4 pb-8">
                  <div
                    className="absolute left-6 md:left-8 -translate-y-1/2"
                    style={{ top: 0 }}
                  >
                    <LogoCircle src={logoImage} name={community?.name} size={logo} />
                  </div>

                  <div style={{ paddingLeft: logo + 24 }}>
                    {/* ชื่อ + สถานะ */}
                    <div className="flex items-center gap-3">
                      <h1 className="text-[22px] font-bold leading-tight">
                        {displayText(community.name)}
                      </h1>

                      {!!community.status && (
                        <span
                          className={`px-2.5 py-0.5 text-sm rounded-full ${
                            isOpen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {isOpen ? "เปิด" : "ปิด"}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {(community.isRatingVisible || community.ct_is_rating_visible === 1) &&
                      community.rating && (
                        <div className="mt-3 flex items-center gap-2 text-black">
                          <Icon
                            icon="material-symbols:star-rounded"
                            className="text-[22px] text-black"
                          />
                          <span className="text-[16px] font-regular">
                            {Number(community.rating).toFixed(1)} คะแนน
                          </span>
                        </div>
                      )}

                    {/* Location */}
                    <div className="mt-3 flex items-start gap-2 text-black">
                      <Icon
                        icon="mdi:map-marker"
                        className="mt-1 shrink-0 text-[21px]"
                      />
                      <span className="leading-relaxed">
                        {displayText(community.location?.detail)}{" "}
                        {displayText(community.location?.subDistrict)}{" "}
                        {displayText(community.location?.district)}{" "}
                        {displayText(community.location?.province)}{" "}
                        {community.location?.postalCode
                          ? `(${community.location.postalCode})`
                          : ""}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-3 flex items-start gap-2 text-black max-w-4xl">
                      <p className="leading-relaxed">
                        {displayText(community.description)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* รายละเอียดข้อมูลชุมชน (แสดงแบบสองคอลัมน์) */}
        <div className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm leading-relaxed">
            <Row label="ชื่อวิสาหกิจชุมชน">{displayText(community.name)}</Row>
            <Row label="ชื่อย่อ">{displayText(community.alias)}</Row>

            <Row label="ประเภทวิสาหกิจชุมชน">{displayText(community.type)}</Row>
            <Row label="เลขทะเบียน">{displayText(community.registerNumber)}</Row>

            <Row label="วันที่จดทะเบียน">{toThaiDate(community.registerDate)}</Row>
            <Row label="เบอร์โทร">{displayText(community.phone)}</Row>

            <Row label="อีเมล">{displayText(community.email)}</Row>
            <Row label="ที่อยู่">
              <span className="whitespace-pre-line break-words">
                {`${displayText(community.location?.detail)} ${displayText(
                  community.location?.subDistrict
                )} ${displayText(community.location?.district)} ${displayText(
                  community.location?.province
                )} ${
                  community.location?.postalCode
                  ? `${community.location.postalCode}`
                  : ""
                  }`}
              </span>
            </Row>

            <Row label="ละติจูด / ลองจิจูด">
              {community.location?.latitude && community.location?.longitude
                ? `${community.location.latitude}, ${community.location.longitude}`
                : "-"}
            </Row>
            <Row label="คำอธิบายที่อยู่">
              {displayText(community.location?.detailMore)}
            </Row>

            <Row label="ชื่อกิจกรรมหลัก">{displayText(community.mainActivityName)}</Row>
            <Row label="รายละเอียดกิจกรรมหลัก">
              {displayText(community.mainActivityDescription)}
            </Row>

            <Row label="เว็บไซต์">
              {community.urlWebsite ? (
                <a
                  href={community.urlWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {community.urlWebsite}
                </a>
              ) : (
                "-"
              )}
            </Row>

            {Array.isArray(community.communityMembers) && (
              <Row label="จำนวนสมาชิก">
                {(community.communityMembers?.length || 0) +
                  (community.admin ? 1 : 0)}{" "}
                คน
              </Row>
            )}

            <Row label="ชื่อผู้ดูแลหลัก">
              {displayText(
                community.admin
                  ? `${community.admin.fname ?? ""} ${community.admin.lname ?? ""}`.trim()
                  : null
              )}
            </Row>

            <Row label="เบอร์โทรผู้ดูแลหลัก">
              {displayText(community.mainAdminPhone)}
            </Row>

            <Row label="ผู้ประสานงาน">{displayText(community.coordinatorName)}</Row>
            <Row label="เบอร์โทรผู้ประสานงาน">
              {displayText(community.coordinatorPhone)}
            </Row>

            <Row label="ชื่อธนาคาร">{displayText(community.bankName)}</Row>
            <Row label="เลขบัญชี">{displayText(community.accountNumber)}</Row>

            <Row label="ชื่อบัญชีธนาคาร">{displayText(community.accountName)}</Row>
          </div>
        </div>

        {/* ช่องทางการติดต่ออื่น ๆ */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">ช่องทางการติดต่ออื่นๆ</h2>
          <div className="mt-3 space-y-1 text-sm">
            <Row label="Facebook">
              {community.urlFacebook ? (
                <a
                  href={community.urlFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {community.urlFacebook}
                </a>
              ) : (
                "-"
              )}
            </Row>

            <Row label="Line">
              {community.urlLine ? (
                <a
                  href={community.urlLine}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {community.urlLine}
                </a>
              ) : (
                "-"
              )}
            </Row>

            <Row label="Tiktok">
              {community.urlTiktok ? (
                <a
                  href={community.urlTiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {community.urlTiktok}
                </a>
              ) : (
                "-"
              )}
            </Row>

            <Row label="อื่นๆ">{displayText(community.urlOther)}</Row>
          </div>
        </div>

        {/* ประวัติชุมชน */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">ประวัติชุมชน</h2>
          <p className="mt-2 leading-relaxed">{displayText(community.description)}</p>
        </div>

        {/* แกลเลอรีรูปภาพเพิ่มเติม */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">รูปภาพเพิ่มเติม</h2>
          {galleries?.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleries.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url ?? ""}
                  alt=""
                  className="h-40 w-full object-cover rounded-xl"
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-gray-600">-</p>
          )}
        </div>

        {/* วิดีโอเพิ่มเติม */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">วิดีโอเพิ่มเติม</h2>
          {videos?.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.map((url, index) => (
                <video
                  key={`${url}-${index}`}
                  src={url ?? ""}
                  controls
                  className="h-40 w-full object-cover rounded-xl bg-black [&:fullscreen]:object-contain"
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-gray-600">-</p>
          )}
        </div>

        {/* แผนที่ตำแหน่งชุมชน (OpenStreetMap) */}
        {community.location?.latitude && community.location?.longitude && (
          <div className="mt-10 pb-10">
            <h2 className="text-xl font-semibold">แผนที่ตำแหน่งชุมชน</h2>
            <div className="mt-4 overflow-hidden rounded-xl">
              {(() => {
                const latitude = community.location.latitude;
                const longitude = community.location.longitude;
                const zoomDelta = 0.0025;

                const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
                  longitude - zoomDelta
                  }%2C${latitude - zoomDelta}%2C${longitude + zoomDelta}%2C${
                    latitude + zoomDelta
                  }&layer=mapnik&marker=${latitude}%2C${longitude}`;

                return (
                  <iframe
                    width="100%"
                    height="400"
                    frameBorder={0}
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={osmUrl}
                    title="community-openstreetmap"
                    className="block rounded-xl"
                  />
                );
              })()}
            </div>
          </div>
        )}

        {/* ส่วน : แพ็กเกจทั้งหมดของชุมชน (CardPackage + pagination) */}
        <div className="mt-10 pb-10">
          <h2 className="text-xl font-semibold">แพ็กเกจทั้งหมดของชุมชน</h2>

          {(packagePagination?.totalCount ?? packages.length) === 0 ? (
            <p className="mt-3 text-slate-500">ยังไม่มีแพ็กเกจ</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((tourPackage: any) => {
                  const status = getBookingStatus(tourPackage);

                  return (
                    <Link
                      key={tourPackage.id}
                      to={`${basePath}/package/${tourPackage.id}`}
                      className="block rounded-2xl transition-transform duration-150 hover:-translate-y-1"
                    >
                      <CardPackage
                        image={getPackageCover(tourPackage) || ""}
                        title={tourPackage.name || "-"}
                        location={`${community?.location?.district || ""} ${community?.location?.province || ""
                          }`.trim()}
                        bookingStart={tourPackage.bookingOpenDate}
                        bookingEnd={tourPackage.bookingCloseDate}
                        bookingStatus={status}
                        booked={tourPackage.booked ?? tourPackage.bookedCount ?? 0}
                        capacity={tourPackage.capacity ?? 0}
                        tags={(tourPackage.tags ?? tourPackage.tagPackages ?? [])
                          .map((tagItem: any) => tagItem?.name ?? tagItem?.tag?.name)
                          .filter(Boolean)}
                        priceTHB={Number(tourPackage.price ?? 0)}
                      />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <PaginationRoundedForCardPackage
                  totalData={packagePagination?.totalCount ?? 0}
                  onQueryChange={({ page }) => {
                    setPackagePage(page);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* ส่วน : ร้านค้าของชุมชน */}
        <div className="mt-10 pb-10">
          <h2 className="text-xl font-semibold">ร้านค้าของชุมชน</h2>

          {(storePagination?.totalCount ?? stores.length) === 0 ? (
            <p className="mt-3 text-slate-500">ยังไม่มีร้านค้า</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {stores.map((store: any) => {
                  const storeCoverUrl = getStoreCover(store);

                  return (
                    <Link
                      key={store.id}
                      to={`${basePath}/community/${communityId}/detail/store/${store.id}`}
                      className="block rounded-2xl transition-transform duration-150 hover:-translate-y-1"
                    >
                      <div className="w-full">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                          <div className="w-full aspect-[16/9] bg-slate-100">
                            {storeCoverUrl ? (
                              <img
                                src={storeCoverUrl}
                                alt={store?.name || "store"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                                ไม่มีรูปปก
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 font-semibold text-base text-center line-clamp-1">
                          {store?.name || "-"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <PaginationRoundedForCardPackage
                  totalData={storePagination?.totalCount ?? 0}
                  onQueryChange={({ page }) => {
                    setStorePage(page);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* ส่วน : ที่พักของชุมชน */}
        <div className="mt-10 pb-10">
          <h2 className="text-xl font-semibold">ที่พักของชุมชน</h2>

          {(homestayPagination?.totalCount ?? homestays.length) === 0 ? (
            <p className="mt-3 text-slate-500">ยังไม่มีที่พัก</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {homestays.map((homestay: any) => {
                  const homestayCoverUrl = getHomestayCover(homestay);

                  return (
                    <Link
                      key={homestay.id}
                      to={`${basePath}/community/${communityId}/detail/homestay/${homestay.id}`}
                      className="block rounded-2xl transition-transform duration-150 hover:-translate-y-1"
                    >
                      <div className="w-full">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                          <div className="w-full aspect-[16/9] bg-slate-100">
                            {homestayCoverUrl ? (
                              <img
                                src={homestayCoverUrl}
                                alt={homestay?.name || "homestay"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                                ไม่มีรูปปก
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 font-semibold text-base text-center line-clamp-1">
                          {homestay?.name || "-"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <PaginationRoundedForCardPackage
                  totalData={homestayPagination?.totalCount ?? 0}
                  onQueryChange={({ page }) => {
                    setHomestayPage(page);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
