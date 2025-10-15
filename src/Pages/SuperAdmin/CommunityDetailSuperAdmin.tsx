/**
 * จัดการชุมชน (Super Admin หน้ารายละเอียดชุมชนน)
 * - แสดงตารางชุมชน: ชื่อชุมชน / จังหวัด / สถานะ / ผู้ดูแล
 * - ค้นหา + ตัวกรองสถานะ
 * - เลือกหลายแถว, ลบทั้งหมด
 * - ปุ่มแก้ไข/ลบ ต่อแถว
 */

import { Icon } from "@iconify/react";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCommunityDetail } from "@/Services/CommunityService";

// ==== utils ====
const show = (v?: string | null) => (v && String(v).trim() ? v : "-");
const toThaiDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// ==== Row: หัวข้อหนา + ข้อมูลบาง + คอลอนตรงกัน ====
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div
            className="
        grid
        grid-cols-[180px_16px_minmax(0,1fr)]
        md:grid-cols-[220px_16px_minmax(0,1fr)]
        gap-x-2 items-start
      "
        >
            {/* หัวข้อ (หนา) */}
            <div className="font-semibold text-gray-900">{label}</div>

            {/* คอลอน */}
            <div className="text-gray-400">:</div>

            {/* ข้อมูล (บาง) */}
            <div className="text-gray-700 font-normal break-words">
                {children ?? "-"}
            </div>
        </div>
    );
}

// ===== AvatarCircle: ใช้รูปโปรไฟล์ ถ้าไม่มีใช้ตัวอักษรแรกของชื่อ =====
function AvatarCircle({
    src,
    name,
    size = 64,
    className = "",
}: {
    src?: string | null;
    name?: string;
    size?: number;
    className?: string;
}) {
    const base =
        "rounded-full overflow-hidden grid place-items-center select-none ring-2 ring-white shadow-sm";
    const style = { width: size, height: size };

    if (src) {
        return (
            <img
                src={src}
                alt="avatar"
                style={style}
                className={`${base} ${className} object-cover bg-white`}
            />
        );
    }

    // fallback: ตัวอักษรแรก (ไทย/อังกฤษได้หมด)
    const initial =
        (name || "").trim().charAt(0) ? (name || "").trim().charAt(0).toUpperCase() : "?";

    return (
        <div
            style={style}
            className={`${base} ${className} bg-gradient-to-br from-emerald-500 to-teal-600 text-white`}
        >
            <span className="font-semibold" style={{ fontSize: size * 0.45 }}>
                {initial}
            </span>
        </div>
    );
}

// ==== NEW: helpers สำหรับโลโก้/ปก/ไอคอน ====
const getInitial = (name?: string) =>
    (name || "").trim().charAt(0).toUpperCase() || "?";

function LogoCircle({
    src,
    name,
    size = 120,
    className = "",
}: {
    src?: string | null;
    name?: string;
    size?: number;
    className?: string;
}) {
    const base =
        "rounded-full ring-4 ring-white shadow-lg overflow-hidden grid place-items-center select-none";
    const style = { width: size, height: size };

    if (src) {
        return (
            <img
                src={src}
                alt="Logo"
                style={style}
                className={`${base} ${className} object-cover bg-white`}
            />
        );
    }
    // fallback: ตัวอักษรตัวแรก
    return (
        <div
            style={style}
            className={`${base} ${className} bg-gradient-to-br from-emerald-500 to-teal-600`}
        >
            <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>
                {getInitial(name)}
            </span>
        </div>
    );
}

function CoverRect({
    src,
    height = 320,
    className = "",
}: {
    src?: string | null;
    height?: number;
    className?: string;
}) {
    if (src) {
        return (
            <img
                src={src}
                alt="Cover"
                style={{ height }}
                className={`w-full object-cover ${className}`}
            />
        );
    }
    // placeholder ปกสี่เหลี่ยมให้เห็นว่าเว้นไว้
    return (
        <div
            style={{ height }}
            className={`w-full bg-gray-100 grid place-items-center ${className}`}
        >
            <div className="w-[92%] h-[70%] border-2 border-dashed border-gray-300 rounded-xl grid place-items-center">
                <span className="text-gray-500">ไม่มีภาพปก</span>
            </div>
        </div>
    );
}

const Pin = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
        <path
            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
            fill="currentColor"
        />
    </svg>
);
// ===== Icons =====
const Chevron = ({ open }: { open: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
        <path
            d={open ? "M7 15l5-5 5 5" : "M7 10l5 5 5-5"}
            stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

// ===== Generic Accordion =====
function Section({
    title,
    count,
    children,
    defaultOpen = false,
}: {
    title: string;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="mt-4">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left hover:bg-slate-50"
            >
                <span className="font-medium">{title}</span>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    {typeof count === "number" && <span>จำนวน {count} {title}</span>}
                    <Chevron open={open} />
                </div>
            </button>

            {open && (
                <div className="rounded-xl border mt-2 p-4 bg-slate-50">
                    {/* ปุ่มจัดการ – เอาไว้ขวาบนของเนื้อหา */}
                    <div className="flex justify-end mb-3">
                        <button className="bg-dark-green text-white px-4 py-1.5 rounded-lg hover:bg-green-700">
                            จัดการ
                        </button>
                    </div>
                    {children}
                </div>
            )}
        </div>
    );
}

// ===== Cover pickers =====
const getPkgCover = (p: any) =>
    p?.packageFile?.find((f: any) => String(f.type).toUpperCase() === "COVER")?.filePath;
const getStoreCover = (s: any) =>
    s?.storeImage?.find((f: any) => String(f.type).toUpperCase() === "COVER")?.image;
const getHomestayCover = (h: any) =>
    h?.homestayImage?.find((f: any) => String(f.type).toUpperCase() === "COVER")?.image;

// ===== Simple card =====
function ItemCard({
    image,
    title,
    children,
}: {
    image?: string | null;
    title: string;
    children?: React.ReactNode;
}) {
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

export default function CommunityDetailSuperAdmin() {
    const { id } = useParams<{ id: string }>();
    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await fetchCommunityDetail(Number(id));
                setCommunity(data);
            } catch (err: any) {
                setError(err?.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const coverImage = useMemo(
        () => community?.communityImage?.find((img: any) => img.type === "COVER")?.url,
        [community]
    );
    const logoImage = useMemo(
        () => community?.communityImage?.find((img: any) => img.type === "LOGO")?.url,
        [community]
    );
    const galleries = useMemo(
        () => (community?.communityImage || []).filter((img: any) => img.type === "GALLERY"),
        [community]
    );
    const videos = useMemo(
        () => (community?.communityImage || []).filter((img: any) => img.type === "VIDEO"),
        [community]
    );



    if (loading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!community) return <div className="p-8">ไม่พบข้อมูล</div>;

    const isOpen = String(community.status || "").toUpperCase() === "OPEN";

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
            {/* breadcrumb (ไม่มีปุ่มด้านนอกแล้ว) */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-medium flex items-center gap-2">
                    <Link to="/super/communities" className="hover:underline">
                        จัดการชุมชน
                    </Link>
                    <span className="text-gray-500">› รายละเอียดของชุมชน</span>
                </div>
            </div>

            {/* กรอบใหญ่: มีหัวเรื่อง + ปุ่มแก้ไข อยู่ภายในกรอบ */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* แถวหัวเรื่องในกรอบ
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">รายละเอียดของชุมชน</h2>
                    <button className="bg-dark-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                        <i className="mdi mdi-pencil-outline" /> แก้ไข
                    </button>
                </div> */}
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                    <Link
                        to="/super/communities"
                        className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
                    >
                        <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">รายละเอียดของชุมชน</h2>
                    </Link>

                    <button
                        type="button"
                        className="bg-dark-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                        <Icon icon="weui:pencil-filled" className="w-5 h-5" />
                        <span>แก้ไข</span>
                    </button>
                </div>
                {/* กรอบย่อย: ปก + โลโก้ + 3 บรรทัด */}
                {(() => {
                    const COVER_H = 300;   // ความสูงภาพปก
                    const LOGO = 240;      // ขนาดโลโก้ (ลด/เพิ่มได้)

                    return (
                        <div className="px-5 pb-6">
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                                {/* ===== ภาพปก ===== */}
                                <CoverRect src={coverImage} height={COVER_H} />

                                {/* ===== โซนโลโก้ + 3 บรรทัด (อยู่ใต้ปกจริง ๆ) ===== */}
                                <div className="relative px-6 md:px-8 pt-4 pb-8">
                                    {/* โลโก้: เอา “กึ่งกลางโลโก้” ให้เสมอขอบบนของข้อความ */}
                                    <div
                                        className="absolute left-6 md:left-8 -translate-y-1/2"
                                        style={{ top: 0 }}
                                    >
                                        <LogoCircle src={logoImage} name={community?.name} size={LOGO} />
                                    </div>

                                    {/* กล่องข้อความ 3 บรรทัด: ชิดขวาโลโก้ */}
                                    <div style={{ paddingLeft: LOGO + 24 }}>
                                        {/* 1) ชื่อชุมชน + สถานะ */}
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-[22px] font-bold leading-tight">
                                                {show(community.name)}
                                            </h1>
                                            {!!community.status && (
                                                <span
                                                    className={`px-2.5 py-0.5 text-sm rounded-full ${isOpen ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-700"
                                                        }`}
                                                >
                                                    {isOpen ? "เปิด" : "ปิด"}
                                                </span>
                                            )}
                                        </div>

                                        {/* 2) ที่อยู่ */}
                                        <div className="mt-2 flex items-start gap-2 text-slate-700">
                                            <Pin className="mt-0.5 shrink-0" />
                                            <span className="leading-relaxed">
                                                {show(community.location?.address)}
                                            </span>
                                        </div>

                                        {/* 3) คำอธิบาย */}
                                        <p className="mt-3 text-slate-700 leading-relaxed max-w-4xl">
                                            {show(community.description)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}



                {/* ===== รายละเอียดหลักสองคอลัมน์ ===== */}
                <div className="px-6 sm:px-8 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm leading-relaxed">
                        {/* ซ้าย */}
                        <div className="space-y-2.5">
                            <Row label="ชื่อวิสาหกิจชุมชน">{show(community.name)}</Row>
                            <Row label="ประเภทวิสาหกิจชุมชน">{show(community.type)}</Row>
                            <Row label="วันที่จดทะเบียน">{toThaiDate(community.registerDate)}</Row>
                            <Row label="อีเมล">{show(community.email)}</Row>
                            <Row label="ละติจูด / ลองจิจูด">
                                {community.location?.latitude && community.location?.longitude
                                    ? `${community.location.latitude}, ${community.location.longitude}`
                                    : "-"}
                            </Row>
                            <Row label="ชื่อกิจกรรมหลัก">{show(community.mainActivityName)}</Row>
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
                            <Row label="ชื่อผู้ดูแลหลัก">{show(community.mainAdmin)}</Row>
                            <Row label="ผู้ประสานงาน">{show(community.coordinatorName)}</Row>
                            <Row label="ผู้ดูแล">{show(community.mainAdmin)}</Row>
                            <br />
                            <Row label="ชื่อธนาคาร">{show(community.bankName)}</Row>
                            <Row label="ธนาคาร">{show(community.accountName)}</Row>
                        </div>

                        {/* ขวา */}
                        <div className="space-y-2.5">
                            <Row label="ชื่อย่อ">{show(community.alias)}</Row>
                            <Row label="เลขทะเบียน">{show(community.registerNumber)}</Row>
                            <Row label="เบอร์โทร">{show(community.phone)}</Row>
                            <Row label="ที่อยู่">{show(community.location?.address)}</Row>
                            <Row label="คำอธิบายที่อยู่">{show(community.location.detail)}</Row>
                            <Row label="รายละเอียดกิจกรรมหลัก">{show(community.mainActivityDescription)}</Row>
                            <Row label="จำนวนสมาชิก">{show(community.member?.length || 0)} คน</Row>
                            <Row label="เบอร์โทร">{show(community.mainAdminPhone)}</Row>
                            <Row label="เบอร์โทร">{show(community.coordinatorPhone)}</Row>
                            <br />
                            <br />
                            <Row label="เลขบัญชี">{show(community.accountNumber)}</Row>
                        </div>
                    </div>
                </div>

                {/* ช่องทางการติดต่ออื่นๆ */}
                <div className="px-6 sm:px-8 mt-8">
                    <h2 className="text-lg font-semibold">ช่องทางการติดต่ออื่นๆ</h2>
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
                        <Row label="อื่นๆ">{show(community.urlOther)}</Row>
                    </div>
                </div>

                {/* ประวัติ */}
                <div className="px-6 sm:px-8 mt-10">
                    <h2 className="text-lg font-semibold">ประวัติชุมชน</h2>
                    <p className="mt-2 leading-relaxed">{show(community.description)}</p>
                </div>

                {/* แกลเลอรี */}
                <div className="px-6 sm:px-8 mt-10">
                    <h2 className="text-lg font-semibold">รูปภาพเพิ่มเติม</h2>
                    {galleries?.length ? (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {galleries.map((g: any) => (
                                <img
                                    key={g.id ?? g.url}
                                    src={g.url}
                                    alt=""
                                    className="h-40 w-full object-cover rounded-xl"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600">-</p>
                    )}
                </div>


                {/* วิดีโอ */}
                <div className="px-6 sm:px-8 mt-10">
                    <h2 className="text-lg font-semibold">วิดีโอเพิ่มเติม</h2>
                    {videos?.length ? (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {videos.map((g: any) => (
                                <img
                                    key={g.id ?? g.url}
                                    src={g.url}
                                    alt=""
                                    className="h-40 w-full object-cover rounded-xl"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600">-</p>
                    )}
                </div>

                {/* แผนที่ */}
                {community.location?.latitude && community.location?.longitude && (
                    <div className="px-6 sm:px-8 mt-10 pb-10">
                        <h2 className="text-lg font-semibold">แผนที่ตำแหน่งชุมชน</h2>
                        <div className="mt-4 overflow-hidden rounded-xl">
                            <iframe
                                width="100%"
                                height="360"
                                className="block"
                                src={`https://maps.google.com/maps?q=${community.location.latitude},${community.location.longitude}&z=14&output=embed`}
                                loading="lazy"
                                title="community-map"
                            />
                        </div>
                    </div>
                )}
                {/* ====== ต่อจากแผนที่: Accordion 4 ส่วน ====== */}
                <div className="px-6 sm:px-8 mt-6 pb-8">
                    {(() => {
                        const pkgs = (community.packages || []).filter((x: any) => x.communityId === community.id);
                        const stores = (community.stores || []).filter((x: any) => x.communityId === community.id);
                        const homestays = (community.homestays || []).filter((x: any) => x.communityId === community.id);
                        const members = (community.member || []).filter((x: any) => x.memberOfCommunity === community.id);

                        return (
                            <>
                                {/* แพ็กเกจ */}
                                <Section title="แพ็กเกจ" count={pkgs.length}>
                                    {pkgs.length ? (
                                        <div className="space-y-4">
                                            {pkgs.map((p: any) => (
                                                <ItemCard
                                                    key={p.id}
                                                    image={getPkgCover(p)}
                                                    title={p.name}
                                                >
                                                    <div className="space-y-1">
                                                        <div>- ความจุ {p.capacity} คน • ราคา {p.price?.toLocaleString?.() ?? p.price} บาท</div>
                                                        {p.description && <div className="line-clamp-3">{p.description}</div>}
                                                    </div>
                                                </ItemCard>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">ยังไม่มีแพ็กเกจ</div>
                                    )}
                                </Section>

                                {/* ร้านค้า */}
                                <Section title="ร้านค้า" count={stores.length}>
                                    {stores.length ? (
                                        <div className="space-y-4">
                                            {stores.map((s: any) => (
                                                <ItemCard key={s.id} image={getStoreCover(s)} title={s.name}>
                                                    <div className="line-clamp-3">{s.detail || "-"}</div>
                                                </ItemCard>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">ยังไม่มีร้านค้า</div>
                                    )}
                                </Section>

                                {/* ที่พัก */}
                                <Section title="ที่พัก" count={homestays.length}>
                                    {homestays.length ? (
                                        <div className="space-y-4">
                                            {homestays.map((h: any) => (
                                                <ItemCard key={h.id} image={getHomestayCover(h)} title={h.name}>
                                                    <div className="space-y-1">
                                                        <div>- ประเภท {show(h.type)} • รองรับ {show(h.guestPerRoom)} คน/ห้อง • ทั้งหมด {show(h.totalRoom)} ห้อง</div>
                                                        <div className="line-clamp-3">{show(h.facility)}</div>
                                                    </div>
                                                </ItemCard>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">ยังไม่มีที่พัก</div>
                                    )}
                                </Section>

                                {/* รายชื่อสมาชิก */}
                                <Section title="รายชื่อสมาชิก" count={members.length}>
                                    {members.length ? (
                                        <div className="space-y-3">
                                            {members.map((m: any) => {
                                                const fullName = [m.fname, m.lname].filter(Boolean).join(" ").trim();
                                                return (
                                                    <div key={m.id} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-center">
                                                        <AvatarCircle src={m.profileImage} name={fullName || m.username} size={64} />
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{fullName || m.username}</div>
                                                            {m.activityRole && (
                                                                <div className="text-sm text-slate-700">• {m.activityRole}</div>
                                                            )}
                                                            <div className="mt-1 text-sm text-slate-600 truncate">{m.email || "-"}</div>
                                                            <div className="text-sm text-slate-600">{m.phone || "-"}</div>
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
