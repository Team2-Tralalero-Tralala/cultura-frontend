import React, { useEffect, useState } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/Components/Button";
import type { PackageRequestDetail } from "@/Types/package-request";
import { fetchPackageRequestDetail } from "@/Services/package-request-service";

export default function DetailPackageRequriedPage() {
    const navigate = useNavigate();
    const { requestId } = useParams<{ requestId: string }>();

    const [data, setData] = useState<PackageRequestDetail | null>(null);

    useEffect(() => {
        fetchPackageRequestDetail(requestId ?? "").then((res) => setData(res));
    }, [requestId]);

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/package-requests')}>
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                    <h1 className="text-lg font-medium text-gray-800">รายละเอียดแพ็กเกจ</h1>
                </div>

                <div className="w-auto">
                    <Button type="confirm-admin">
                        <div className="flex items-center gap-2">
                            <SquarePen className="w-5 h-5" />
                            <span>แก้ไขรายละเอียดแพ็กเกจ</span>
                        </div>
                    </Button>
                </div>
            </div>

            {/* แสดงเฉพาะชื่อแพ็กเกจ */}
            <div className="space-y-4">
                <p className="text-base font-semibold text-gray-900">
                    ชื่อแพ็กเกจ : <span className="font-normal">{data?.name}</span>
                </p>

                <p className="text-base font-semibold text-gray-900 mt-4">
                    คำอธิบาย : <span className="font-normal">{data?.description}</span>
                </p>
            </div>

<div className="grid grid-cols-12 mt-4">
  <div className="col-span-6">
    <p className="text-base font-semibold text-gray-900">
      จำนวนคนที่เดินทางต่อทริป :{" "}
      <span className="font-normal">{data?.capacity} คน</span>
    </p>
  </div>
  <div className="col-span-6 flex justify-center">
    <p className="text-base font-semibold text-gray-900">
      ราคา :{" "}
      <span className="font-normal">
        {data?.price?.toLocaleString("th-TH")} บาท
      </span>
    </p>
  </div>
</div>

            {/* แสดงแท็ก */}
            <div className="flex items-center gap-2 mt-4">
                <p className="text-base font-semibold text-gray-900">แท็ก :</p>
                <div className="flex flex-wrap gap-2">
                    {data?.tagPackages?.length ? (
                        data.tagPackages.map((tagObj, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                                {tagObj.tag?.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">ไม่มีแท็ก</span>
                    )}
                </div>
            </div>
            {/* แสดงรูปภาพแพ็กเกจ */}
            <div className="mt-6">
                <div className="flex flex-wrap gap-4">
                    {data?.packageFile?.length ? (
                        data.packageFile.map((file, index) => (
                            <img
                                key={index}
                                src={file.filePath}
                                alt={`package-image-${index}`}
                                className="rounded-xl border border-gray-200 shadow-sm object-cover w-full max-w-2xl"
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
                    )}
                </div>
            </div>
{/* แถว: ผู้ดูแล | ผู้สร้าง (ใช้ grid แบบเดียวกันเป๊ะ) */}
<div className="grid grid-cols-12 mt-4">
  <div className="col-span-6">
    <p className="text-base font-semibold text-gray-900">
      ผู้ดูแลแพ็กเกจ :{" "}
      <span className="font-normal">
        {data?.overseerPackage?.fname} {data?.overseerPackage?.lname}
      </span>
    </p>
  </div>
  <div className="col-span-6 flex justify-center">
    <p className="text-base font-semibold text-gray-900">
      ผู้สร้างแพ็กเกจ :{" "}
      <span className="font-normal">
        {data?.createPackage?.fname} {data?.createPackage?.lname}
      </span>
    </p>
  </div>
</div>






        </section>
    );
}
