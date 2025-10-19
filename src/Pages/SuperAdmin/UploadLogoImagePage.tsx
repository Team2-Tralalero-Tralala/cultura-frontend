/*
 * File: UploadLogoImagePage.tsx
 * Component: UploadLogoImagePage (Client)
 * Description:
 *   - Upload/manage logos and hero images with preview cards
 *   - Uses UploadCard only for the “+” slot; previews are custom with edit/delete icons
 *   - Shows confirm and result modals when editing/deleting images
 */

"use client";
import React, { useState, useRef, useEffect } from "react";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";

/* Result modal to show success/error after actions */
function ResultModal({
    open,
    status,
    message,
    onClose,
}: {
    open: boolean;
    status: "success" | "error";
    message: string;
    onClose: () => void;
}) {
    if (!open) return null;
    const headClass =
        status === "success"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-red-100 text-red-800";
    const title = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";
    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
            <div className="relative z-10 w-[612px] max-w-full h-[200px] rounded-2xl bg-white shadow-xl">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${headClass}`}>
                    <Icon icon="circum:circle-alert" className="h-5 w-5" />
                    <h3 className="text-base font-semibold">{title}</h3>
                </div>
                <div className="px-5 py-4 text-gray-700">{message}</div>
                <div className="px-5 pb-5">
                    <Button type="confirm-admin" htmlType="button" onClick={onClose}>
                        ตกลง
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function UploadLogoImagePage() {
    const [generalLogo, setGeneralLogo] = useState<File[]>([]);
    const [partnerLogo, setPartnerLogo] = useState<File[]>([]);
    const [heroImages, setHeroImages] = useState<File[]>([]);

    const [generalPreviews, setGeneralPreviews] = useState<{ url: string }[]>([]);
    const [partnerPreviews, setPartnerPreviews] = useState<{ url: string }[]>([]);
    const [heroPreviews, setHeroPreviews] = useState<{ url: string }[]>([]);

    useEffect(() => {
        const urls = generalLogo.map((f) => ({ url: URL.createObjectURL(f) }));
        setGeneralPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
    }, [generalLogo]);

    useEffect(() => {
        const urls = partnerLogo.map((f) => ({ url: URL.createObjectURL(f) }));
        setPartnerPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
    }, [partnerLogo]);

    useEffect(() => {
        const urls = heroImages.map((f) => ({ url: URL.createObjectURL(f) }));
        setHeroPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
    }, [heroImages]);

    const editInputRef = useRef<HTMLInputElement | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDesc, setConfirmDesc] = useState("");
    const [pendingCategory, setPendingCategory] = useState<"general" | "partner" | "hero" | null>(null);
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
    const [tempFile, setTempFile] = useState<File | null>(null);

    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultMessage, setResultMessage] = useState("");

    const handleAddFiles = (category: "general" | "partner" | "hero", files: File[]) => {
        if (category === "general") {
            setGeneralLogo((prev) => {
                const remain = 1 - prev.length;
                return [...prev, ...files.slice(0, remain)];
            });
        } else if (category === "partner") {
            setPartnerLogo((prev) => {
                const remain = 1 - prev.length;
                return [...prev, ...files.slice(0, remain)];
            });
        } else {
            setHeroImages((prev) => {
                const remain = 5 - prev.length;
                return [...prev, ...files.slice(0, remain)];
            });
        }
    };

    const onEditClick = (category: "general" | "partner" | "hero", index: number) => {
        setPendingCategory(category);
        setPendingIndex(index);
        setPendingAction("edit");
        editInputRef.current?.click();
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(e.target.files ?? []);
        if (!fileList.length) return;
        setTempFile(fileList[0]);
        setConfirmTitle("ยืนยันการแก้ไขรูปภาพหรือไม่");
        setConfirmDesc("คุณจะไม่สามารถย้อนกลับได้");
        setConfirmOpen(true);
        e.target.value = "";
    };

    const onDeleteClick = (category: "general" | "partner" | "hero", index: number) => {
        setPendingCategory(category);
        setPendingIndex(index);
        setPendingAction("delete");
        setConfirmTitle("ยืนยันการลบรูปภาพหรือไม่");
        setConfirmDesc("คุณจะไม่สามารถย้อนกลับได้");
        setConfirmOpen(true);
    };

    const handleCancelConfirm = () => {
        setConfirmOpen(false);
        setTempFile(null);
        setPendingCategory(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    const handleConfirmAction = () => {
        if (pendingCategory == null || pendingIndex == null || pendingAction == null) {
            setConfirmOpen(false);
            return;
        }
        if (pendingAction === "delete") {
            if (pendingCategory === "general") {
                setGeneralLogo((prev) => prev.filter((_, idx) => idx !== pendingIndex));
            } else if (pendingCategory === "partner") {
                setPartnerLogo((prev) => prev.filter((_, idx) => idx !== pendingIndex));
            } else {
                setHeroImages((prev) => prev.filter((_, idx) => idx !== pendingIndex));
            }
            setResultStatus("success");
            setResultMessage("ลบรูปภาพสำเร็จ");
            setResultOpen(true);
        } else if (pendingAction === "edit") {
            if (!tempFile) {
                setResultStatus("error");
                setResultMessage("ไม่ได้เลือกไฟล์ใหม่");
                setResultOpen(true);
            } else {
                if (pendingCategory === "general") {
                    setGeneralLogo((prev) => {
                        const arr = [...prev];
                        arr[pendingIndex] = tempFile;
                        return arr;
                    });
                } else if (pendingCategory === "partner") {
                    setPartnerLogo((prev) => {
                        const arr = [...prev];
                        arr[pendingIndex] = tempFile;
                        return arr;
                    });
                } else {
                    setHeroImages((prev) => {
                        const arr = [...prev];
                        arr[pendingIndex] = tempFile;
                        return arr;
                    });
                }
                setResultStatus("success");
                setResultMessage("แก้ไขรูปภาพสำเร็จ");
                setResultOpen(true);
            }
        }
        setConfirmOpen(false);
        setTempFile(null);
        setPendingCategory(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    const renderPreviewCards = (previews: { url: string }[], category: "general" | "partner" | "hero") =>
        previews.map((p, idx) => {
            const width = category === "hero" ? 200 : 200;
            const height = category === "hero" ? 120 : 120;
            return (
                <div
                    key={idx}
                    className="relative shrink-0 overflow-hidden rounded-xl shadow border border-gray-200"
                    style={{ width, height }}
                >
                    <img
                        src={p.url}
                        alt={`preview-${category}-${idx}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                    <div className="absolute bottom-2 right-2 z-20 flex space-x-2">
                        <button
                            type="button"
                            onClick={() => onEditClick(category, idx)}
                            className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            title="แก้ไขรูป"
                        >
                            <Icon icon="mdi:pencil" className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDeleteClick(category, idx)}
                            className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            title="ลบรูป"
                        >
                            <Icon icon="mdi:delete" className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>
                </div>
            );
        });

    const remainGeneral = 1 - generalLogo.length;
    const remainPartner = 1 - partnerLogo.length;
    const remainHero = 5 - heroImages.length;

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-6">
            <div className="max-w-6xl h-full mx-auto bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        การเพิ่ม/แก้ไข โลโก้และรูปภาพ
                    </h1>
                    {/* <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">สถานะเซิร์ฟเวอร์</span>
                        <span className="flex items-center bg-emerald-600 text-white rounded-full px-3 py-1 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                            ออนไลน์
                        </span>
                    </div> */}
                </div>

                <div className="flex">
                    <div className="flex flex-col items-center mr-8">
                        <div className="h-[20px] border-l border-black"></div>
                        <div className="w-4 h-4 bg-black rounded-full" />
                        <div className="h-[227px] border-l border-black"></div>
                        <div className="w-4 h-4 bg-black rounded-full" />
                        <div className="h-[227px] border-l border-black "></div>
                    </div>

                    <div className="flex-1 space-y-12">
                        <section>
                            <h2 className="mt-4 text-lg font-medium text-gray-800 mb-4">โลโก้</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        โลโก้ผู้ใช้งานทั่วไป
                                    </h3>
                                    <div className="flex flex-wrap items-start gap-3">
                                        {renderPreviewCards(generalPreviews, "general")}
                                        {remainGeneral > 0 && (
                                            <UploadCard
                                                max={remainGeneral}
                                                accept="image/*"
                                                multiple={false}
                                                value={[]}
                                                onChange={(files: File[]) => handleAddFiles("general", files)}
                                                itemW={200}
                                                itemH={120}
                                                square={false}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        โลโก้พาร์ทเนอร์
                                    </h3>
                                    <div className="flex flex-wrap items-start gap-3">
                                        {renderPreviewCards(partnerPreviews, "partner")}
                                        {remainPartner > 0 && (
                                            <UploadCard
                                                max={remainPartner}
                                                accept="image/*"
                                                multiple={false}
                                                value={[]}
                                                onChange={(files: File[]) => handleAddFiles("partner", files)}
                                                itemW={200}
                                                itemH={120}
                                                square={false}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                รูปภาพในหน้าแรก
                            </h2>
                            <div className="flex flex-wrap items-start gap-4">
                                {renderPreviewCards(heroPreviews, "hero")}
                                {remainHero > 0 && (
                                    <UploadCard
                                        max={remainHero}
                                        accept="image/*"
                                        multiple={remainHero > 1}
                                        value={[]}
                                        onChange={(files: File[]) => handleAddFiles("hero", files)}
                                        itemW={200}
                                        itemH={120}
                                        square={false}
                                    />
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            {/* Hidden input for edit action */}
            <input
                type="file"
                accept="image/*"
                ref={editInputRef}
                className="hidden"
                onChange={handleEditFileChange}
            />
            {/* Modals */}
            <Modal
                open={confirmOpen}
                title={confirmTitle}
                text={confirmDesc}
                onCancel={handleCancelConfirm}
                onConfirm={handleConfirmAction}
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />
            <ResultModal
                open={resultOpen}
                status={resultStatus}
                message={resultMessage}
                onClose={() => setResultOpen(false)}
            />
        </main>
    );
}
