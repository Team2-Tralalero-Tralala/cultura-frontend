/**
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดของชุมชน (Member)
 * หน้าที่ : ใช้สำหรับดึงและแสดงข้อมูลรายละเอียดของวิสาหกิจชุมชนจากฐานข้อมูล
 * สิทธิ์การเข้าถึง : Member เท่านั้น (ดึงข้อมูลชุมชนของตนเอง)
 * เส้นทาง (Route) : /member/community/own
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getCommunityDetailByMember } from "@/Libs/CommunityService";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/*
 * คำอธิบาย : แปลงค่าข้อความสำหรับแสดงผล หากไม่มีข้อมูลหรือเป็นค่าว่างจะแสดง "-"
 * Input : textValue (string | null | undefined)
 * Output : string
 */
const displayText = (textValue?: string | null) => (textValue && String(textValue).trim() ? textValue : "-");

/*
 * คำอธิบาย : แปลงวันที่จากรูปแบบ ISO string เป็นวันที่รูปแบบไทย (dd/mm/yyyy)
 * Input : isoDateString (string | null | undefined)
 * Output : string
 */
const toThaiDate = (isoDateString?: string | null) => {
  if (!isoDateString) return "-";
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/*
 * คำอธิบาย : ค่า URL Backend Base จาก Environment Variable
 */
const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * คำอธิบาย : แปลงพาธไฟล์ที่เก็บจาก backend ให้เป็น URL ดาวน์โหลดเต็มรูปแบบ
 * Input : fileName (string | null)
 * Output : string | undefined
 */
function resolveBackendUploadUrl(fileName?: string | null): string | undefined {
  if (!fileName) return undefined;
  // แปลง backslash -> forward slash
  const normalizedPath = fileName.replace(/\\/g, "/");
  const cleanedPath = normalizedPath.replace(/^\/?uploads\//, "");
  return `${backendBaseUrl}/uploads/${cleanedPath}`;
}

/*
 * คำอธิบาย : ดึง path รูปภาพจาก object โดยรองรับชื่อ field ที่แตกต่างกัน
 * Input : imageEntity (any)
 * Output : string | null
 */
function pickImagePath(imageEntity: any): string | null {
  return imageEntity?.url ?? imageEntity?.image ?? imageEntity?.ci_image ?? imageEntity?.filePath ?? null;
}

/*
 * คำอธิบาย : ค้นหารูปภาพของชุมชนตามประเภทที่กำหนด
 * Input : communityData (any), imageType (string)
 * Output : string | null
 */
function findImage(communityData: any, imageType: string): string | null {
  const imageItem = communityData?.communityImage?.find(
    (image: any) => String(image.type).toUpperCase() === imageType.toUpperCase()
  );
  return pickImagePath(imageItem);
}

/*
 * คำอธิบาย : ดึงรายการ path รูปภาพของชุมชนตามประเภทที่กำหนด
 * Input : communityData (any), imageType (string)
 * Output : string[]
 */
function listImagesByType(communityData: any, imageType: string): string[] {
  const imageLists = (communityData?.communityImage || []).filter(
    (image: any) => String(image.type).toUpperCase() === imageType.toUpperCase()
  );
  return imageLists.map(pickImagePath).filter(Boolean) as string[];
}

// Components ย่อยที่ใช้ภายในหน้า

/*
 * คำอธิบาย : แสดงแถวข้อมูลแบบ Label : Value
 * Input : label (string), children (ReactNode)
 * Output : React element
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_16px_minmax(0,1fr)] md:grid-cols-[220px_16px_minmax(0,1fr)] gap-x-2 items-start">
      <div className="font-bold text-black text-base">{label}</div>
      <div className="text-black font-normal text-base">:</div>
      <div className="text-black font-normal break-words text-base">{children ?? "-"}</div>
    </div>
  );
}

/*
 * คำอธิบาย : แสดงรูปโปรไฟล์ของผู้ใช้ (หรืออักษรย่อหากไม่มีรูป)
 * Input : src, name, size
 * Output : React element
 */
function AvatarCircle({ src, name, size = 64 }: any) {
  const baseClassName =
    "rounded-full overflow-hidden grid place-items-center select-none ring-2 ring-white shadow-sm";
  const style = { width: size, height: size };

  if (src)
    return <img src={src} alt="avatar" style={style} className={`${baseClassName} object-cover bg-white`} />;

  const initialName = (name || "").trim().charAt(0)?.toUpperCase() || "?";
  return (
    <div
      style={style}
      className={`${baseClassName} bg-gradient-to-br from-emerald-500 to-teal-600 text-white`}
    >
      <span className="font-semibold" style={{ fontSize: size * 0.45 }}>
        {initialName}
      </span>
    </div>
  );
}

/*
 * คำอธิบาย : แสดงโลโก้ของชุมชนแบบวงกลมใหญ่
 * Input : src, name, size
 * Output : React element
 */
function LogoCircle({ src, name, size = 120 }: any) {
  const baseClassName =
    "rounded-full ring-4 ring-white shadow-lg overflow-hidden grid place-items-center select-none";
  const style = { width: size, height: size };

  if (src)
    return <img src={src} alt="Logo" style={style} className={`${baseClassName} object-cover bg-white`} />;

  const initialName = (name || "").trim().charAt(0)?.toUpperCase() || "?";
  return (
    <div style={style} className={`${baseClassName} bg-gradient-to-br from-emerald-500 to-teal-600`}>
      <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>
        {initialName}
      </span>
    </div>
  );
}

/*
 * คำอธิบาย : แสดงภาพปก (แนวนอนสี่เหลี่ยม)
 * Input : src, height
 * Output : React element
 */
function CoverRect({ src, height = 320 }: any) {
  if (src) return <img src={src} alt="Cover" style={{ height }} className="w-full object-cover" />;
  return (
    <div style={{ height }} className="w-full bg-gray-100 grid place-items-center">
      <div className="w-[92%] h-[70%] border-2 border-dashed border-gray-300 rounded-xl grid place-items-center">
        <span className="text-gray-500">ไม่มีภาพปก</span>
      </div>
    </div>
  );
}

/*
 * คำอธิบาย : Icon Pin (หมุดพิกัด)
 * Input : props
 * Output : React element (SVG)
 */
const Pin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path
      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      fill="currentColor"
    />
  </svg>
);

/*
 * คำอธิบาย : Accordion สำหรับส่วนต่าง ๆ เช่น แพ็กเกจ / ร้านค้า / ที่พัก / สมาชิก
 * Input : title, count, children, defaultOpen, onManage
 * Output : React element
 */
function Section({
  title,
  count,
  children,
  defaultOpen = false,
  onManage,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onManage?: () => void;
}) {
  const [isSectionOpen, setIsSectionOpen] = useState(defaultOpen);
  return (
    <div className="mt-4">
      <button
        onClick={() => setIsSectionOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left hover:bg-slate-50 text-base font-semibold"
      >
        <span className="font-bold text-base">{title}</span>
        <div className="flex items-center gap-3 font-normal text-base text-slate-600">
          {typeof count === "number" && (
            <span>
              จำนวน {count} {title}
            </span>
          )}
          <Icon icon={isSectionOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} />
        </div>
      </button>

      {isSectionOpen && (
        <div className="rounded-xl border mt-2 p-4 bg-slate-50">
          {/* ปุ่มจัดการ (แสดงเฉพาะเมื่อมี onManage) */}
          {onManage && (
            <div className="flex justify-end mb-3">
              <button
                onClick={onManage}
                className="bg-dark-green text-white px-4 py-1.5 rounded-lg hover:bg-green-700"
              >
                จัดการ
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

/*
 * คำอธิบาย : การ์ดสำหรับแสดงรายการภายใน Section (เช่น ร้านค้า / ที่พัก)
 * Input : image, title, children
 * Output : React element
 */
function ItemCard({ image, title, children }: any) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex gap-4">
      <div className="w-44 h-28 rounded-lg overflow-hidden bg-slate-100 border shrink-0">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
            ไม่มีรูป
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        {children && <div className="mt-2 text-sm text-slate-700">{children}</div>}
      </div>
    </div>
  );
}

/**
 * คำอธิบาย: Component หลักแสดงหน้าละเอียดชุมชน
 * Input: -
 * Output: หน้าแสดงรายละเอียดชุมชน
 */
export function DetailCommunityPage() {
  const navigate = useNavigate();
  const [community, setCommunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ดึงข้อมูลชุมชน (ของ Member เอง)*/
  useEffect(() => {
    (async () => {
      try {
        const response = await getCommunityDetailByMember();
        setCommunity(response?.data?.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ดึงรูปจาก backend*/
  const coverImage = useMemo(
    () => resolveBackendUploadUrl(findImage(community, "COVER")),
    [community]
  );
  const logoImage = useMemo(
    () => resolveBackendUploadUrl(findImage(community, "LOGO")),
    [community]
  );
  const galleryImageLists = useMemo(
    () =>
      (listImagesByType(community, "GALLERY") || [])
        .map(resolveBackendUploadUrl)
        .filter(Boolean) as string[],
    [community]
  );
  const videoLists = useMemo(
    () =>
      (listImagesByType(community, "VIDEO") || [])
        .map(resolveBackendUploadUrl)
        .filter(Boolean) as string[],
    [community]
  );

  /* สถานะโหลด / error */
  if (isLoading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!community) return <div className="p-8">ไม่พบข้อมูล</div>;

  const isStatusOpen = String(community.status || "").toUpperCase() === "OPEN";

  /* ส่วนแสดงผลหลัก */
  return (
    <div className="w-full space-y-4">
      {/* Breadcrumb นำทางหน้า */}
      <div>
        <Breadcrumb
          current={{
            label: community?.name || "ชุมชน",
            to: "member/community/own", // path ของหน้าปัจจุบัน
            isFromSidebar: true,
          }}
        />
      </div>

      {/* กล่องหลักแสดงรายละเอียด */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm box-border w-full p-6">
        {/* ส่วนหัว */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h1 className="font-bold text-xl text-black">รายละเอียดของชุมชน</h1>
        </div>

        {/* ภาพปกและโลโก้ชุมชน */}
        {(() => {
          const COVER_HEIGHT = 300;
          const LOGO_SIZE = 240;
          return (
            <div className="px-6 sm:px-8 pb-6">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                <CoverRect src={coverImage} height={COVER_HEIGHT} />
                <div className="relative px-6 md:px-8 pt-4 pb-8">
                  <div className="absolute left-6 md:left-8 -translate-y-1/2" style={{ top: 0 }}>
                    <LogoCircle src={logoImage} name={community?.name} size={LOGO_SIZE} />
                  </div>

                  <div style={{ paddingLeft: LOGO_SIZE + 24 }}>
                    {/* Title + Status */}
                    <div className="flex items-center gap-3">
                      <h1 className="text-[22px] font-bold leading-tight">
                        {displayText(community.name)}
                      </h1>

                      {!!community.status && (
                        <span
                          className={`px-2.5 py-0.5 text-sm rounded-full ${isStatusOpen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {isStatusOpen ? "เปิด" : "ปิด"}
                        </span>
                      )}
                    </div>

                    {/* Rating (ถ้ามีค่า) */}
                    {(community.isRatingVisible || community.ct_is_rating_visible === 1) &&
                      community.rating && (
                        <div className="mt-3 flex items-center gap-2 text-black">
                          <Icon
                            icon="material-symbols:star-rounded"
                            className="text-[22px] text-black"
                          />
                          <span className="text-[16px] font-normal">
                            {Number(community.rating).toFixed(1)} คะแนน
                          </span>
                        </div>
                      )}

                    {/* Location */}
                    <div className="mt-3 flex items-start gap-2 text-black">
                      <Pin className="mt-1.5 shrink-0" />
                      <span className="leading-relaxed">
                        {displayText(community.location?.detail)} {displayText(community.location?.subDistrict)}{" "}
                        {displayText(community.location?.district)} {displayText(community.location?.province)}{" "}
                        {community.location?.postalCode ? `(${community.location.postalCode})` : ""}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-3 flex items-start gap-2 text-black max-w-4xl">
                      <p className="leading-relaxed">{displayText(community.description)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* รายละเอียดข้อมูลชุมชน (แสดงแบบสองคอลัมน์) */}
        <div className="px-6 sm:px-8 mt-2">
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
                )} ${displayText(community.location?.district)} ${displayText(community.location?.province)} ${community.location?.postalCode ? `(${community.location.postalCode})` : ""
                  }`}
              </span>
            </Row>

            <Row label="ละติจูด / ลองจิจูด">
              {community.location?.latitude && community.location?.longitude
                ? `${community.location.latitude}, ${community.location.longitude}`
                : "-"}
            </Row>
            <Row label="คำอธิบายที่อยู่">{displayText(community.location?.detailMore)}</Row>

            <Row label="ชื่อกิจกรรมหลัก">{displayText(community.mainActivityName)}</Row>
            <Row label="รายละเอียดกิจกรรมหลัก">{displayText(community.mainActivityDescription)}</Row>

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
            <Row label="จำนวนสมาชิก">
              {displayText(
                (community.communityMembers?.length || 0) +
                (community.admin ? 1 : 0)
              )} คน
            </Row>

            <Row label="ชื่อผู้ดูแลหลัก">{displayText(community.mainAdmin)}</Row>
            <Row label="เบอร์โทรผู้ดูแลหลัก">{displayText(community.mainAdminPhone)}</Row>

            <Row label="ชื่อผู้ประสานงาน">{displayText(community.coordinatorName)}</Row>
            <Row label="เบอร์โทรผู้ประสานงาน">{displayText(community.coordinatorPhone)}</Row>

            <Row label="ผู้ดูแล">
              {displayText(
                community.admin
                  ? `${community.admin.fname ?? ""} ${community.admin.lname ?? ""}`.trim()
                  : null
              )}
            </Row>
            <div />

            <Row label="ชื่อธนาคาร">{displayText(community.bankName)}</Row>
            <Row label="เลขบัญชี">{displayText(community.accountNumber)}</Row>

            <Row label="ชื่อบัญชีธนาคาร">{displayText(community.accountName)}</Row>
          </div>
        </div>

        {/* ช่องทางการติดต่ออื่น ๆ */}
        <div className="px-6 sm:px-8 mt-8">
          <h2 className="text-xl font-bold">ช่องทางการติดต่ออื่นๆ</h2>
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
        <div className="px-6 sm:px-8 mt-10">
          <h2 className="text-xl font-bold">ประวัติชุมชน</h2>
          <p className="mt-2 leading-relaxed">{displayText(community.description)}</p>
        </div>

        {/* แกลเลอรีรูปภาพเพิ่มเติม */}
        <div className="px-6 sm:px-8 mt-10">
          <h2 className="text-xl font-bold">รูปภาพเพิ่มเติม</h2>
          {galleryImageLists?.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImageLists.map((url, index) => (
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
        <div className="px-6 sm:px-8 mt-10">
          <h2 className="text-xl font-bold">วิดีโอเพิ่มเติม</h2>
          {videoLists?.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videoLists.map((url, index) => (
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
          <div className="px-6 sm:px-8 mt-10 pb-10">
            <h2 className="text-xl font-semibold">แผนที่ตำแหน่งชุมชน</h2>
            <div className="mt-4 overflow-hidden rounded-xl">
              {(() => {
                const lat = community.location.latitude;
                const lng = community.location.longitude;
                const zoomDelta = 0.0025;
                const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomDelta
                  }%2C${lat - zoomDelta}%2C${lng + zoomDelta}%2C${lat + zoomDelta
                  }&layer=mapnik&marker=${lat}%2C${lng}`;
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

        {/* Accordion: ร้านค้า / ที่พัก / สมาชิก */}
        <div className="px-6 sm:px-8 mt-6 pb-8">
          {(() => {
            const storeLists = (community.stores || []).filter(
              (store: any) => store.communityId === community.id
            );
            const homestayLists = (community.homestays || []).filter(
              (homestay: any) => homestay.communityId === community.id
            );

            return (
              <>
                {/* ส่วนแสดงข้อมูลร้านค้า */}
                <Section
                  title="ร้านค้า"
                  count={storeLists.length}
                // onManage={() => navigate(`/admin/community/stores`)}
                >
                  {storeLists.length ? (
                    <div className="space-y-4">
                      {storeLists.map((store: any) => (
                        <ItemCard
                          key={store.id}
                          image={resolveBackendUploadUrl(
                            store?.storeImage?.find(
                              (imageFile: any) => String(imageFile.type).toUpperCase() === "COVER"
                            )?.image
                          )}
                          title={store.name}
                        >
                          <div className="line-clamp-3">{store.detail || "-"}</div>
                        </ItemCard>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">ยังไม่มีร้านค้า</div>
                  )}
                </Section>

                {/* ส่วนแสดงข้อมูลที่พัก */}
                <Section
                  title="ที่พัก"
                  count={homestayLists.length}
                // onManage={() => navigate(`/admin/community/homestays`)}
                >
                  {homestayLists.length ? (
                    <div className="space-y-4">
                      {homestayLists.map((homestay: any) => (
                        <ItemCard
                          key={homestay.id}
                          image={resolveBackendUploadUrl(
                            homestay?.homestayImage?.find(
                              (imageFile: any) => String(imageFile.type).toUpperCase() === "COVER"
                            )?.image
                          )}
                          title={homestay.name}
                        >
                          <div className="space-y-1">
                            <div>
                              - ประเภท {displayText(homestay.type)} • รองรับ {displayText(homestay.guestPerRoom)} คน/ห้อง •
                              ทั้งหมด {displayText(homestay.totalRoom)} ห้อง
                            </div>
                            <div className="line-clamp-3">{displayText(homestay.facility)}</div>
                          </div>
                        </ItemCard>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">ยังไม่มีที่พัก</div>
                  )}
                </Section>

                {/* ส่วนแสดงข้อมูลสมาชิก */}
                <Section
                  title="รายชื่อสมาชิก"
                  count={
                    (community.communityMembers?.length || 0) +
                    (community.admin ? 1 : 0)
                  }
                // onManage={() => navigate(`/admin/members`)}
                >
                  {community.communityMembers?.length || community.admin ? (
                    <div className="space-y-3">
                      {/* การ์ดแอดมินชุมชน */}
                      {community.admin && (() => {
                        const admin = community.admin;
                        const adminFullName = [admin.fname, admin.lname].filter(Boolean).join(" ").trim();

                        return (
                          <div
                            key={`admin-${admin.id}`}
                            // onClick={() => navigate(`/admin/member/${admin.id}`)}
                            className="bg-emerald-50 border-emerald-200 rounded-xl border shadow-sm p-4 flex gap-4 items-center"
                          >
                            <AvatarCircle
                              src={resolveBackendUploadUrl(admin.profileImage)}
                              name={adminFullName || admin.username}
                              size={64}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-medium truncate">
                                <span className="truncate">
                                  {adminFullName || admin.username}
                                </span>

                                {/* badge แอดมินชุมชน ต่อท้ายชื่อ */}
                                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  แอดมินชุมชน
                                </span>
                              </div>

                              {admin.activityRole && (
                                <div className="text-sm text-slate-700 mt-1">
                                  • {admin.activityRole}
                                </div>
                              )}
                              <div className="mt-1 text-sm text-slate-600 truncate">
                                {admin.email || "-"}
                              </div>
                              <div className="text-sm text-slate-600">
                                {admin.phone || "-"}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* การ์ดสมาชิกทั่วไป */}
                      {community.communityMembers?.map((communityMember: any) => {
                        const member = communityMember.user;
                        const fullName = [member.fname, member.lname].filter(Boolean).join(" ").trim();

                        return (
                          <div
                            key={communityMember.id}
                            // onClick={() => navigate(`/admin/member/${member.id}`)}
                            className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-center"
                          >
                            <AvatarCircle
                              src={resolveBackendUploadUrl(member.profileImage)}
                              name={fullName || member.username}
                              size={64}
                            />
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {fullName || member.username}
                              </div>
                              {member.activityRole && (
                                <div className="text-sm text-slate-700">
                                  • {member.activityRole}
                                </div>
                              )}
                              <div className="mt-1 text-sm text-slate-600 truncate">
                                {member.email || "-"}
                              </div>
                              <div className="text-sm text-slate-600">
                                {member.phone || "-"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">ยังไม่มีสมาชิก</div>
                  )}
                </Section>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
