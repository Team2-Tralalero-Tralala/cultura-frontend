    import type { PackageRequestDetail } from "../Types/package-request";

    const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

    /** ดึงรายละเอียดคำขอแพ็กเกจจาก requestId */
    export async function fetchPackageRequestDetail(
    requestId: string
    ): Promise<PackageRequestDetail> {
    const res = await fetch(`${baseURL}/package-requests/${requestId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch package request: ${res.status}`);
    }

    const data = await res.json();
    return data?.data ?? data;
    }
