/*
 * คำอธิบาย : Service สำหรับจัดการ API การสำรองข้อมูล
 * โดยแบ่งออกเป็นส่วนหลัก ได้แก่
 * 1. ดึงรายการไฟล์สำรองข้อมูล (พร้อม pagination และ search)
 * 2. ลบไฟล์สำรองข้อมูล (เดี่ยว/หลายไฟล์)
 * 3. ดาวน์โหลดไฟล์สำรองข้อมูล
 */
import api from "@/Libs/api";

/*
 * คำอธิบาย : Type definition สำหรับ response ของการดึงรายการไฟล์สำรองข้อมูล
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface BackupResponse {
    data: {
        data: Array<{
            filename: string;
            size: string;
            status: string;
            createdAt: string;
        }>;
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
        };
    };
}

/*
 * คำอธิบาย : ดึงรายการไฟล์สำรองข้อมูลจาก API
 * Input :
 *    - page (number): หน้าที่ต้องการ (default: 1)
 *    - limit (number): จำนวนรายการต่อหน้า (default: 10)
 *    - searchQuery (string): คำค้นหา (default: "")
 * Output :
 *    - คืนค่า Promise ของ BackupResponse ที่ประกอบด้วยข้อมูลไฟล์สำรองข้อมูลและ pagination
 */
export const fetchBackups = async (
    page: number = 1,
    limit: number = 10,
    searchQuery: string = ""
): Promise<BackupResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
    });

    const response = await api.get(`/super/backups?${params}`);
    return response.data;
};

/*
 * คำอธิบาย : ลบไฟล์สำรองข้อมูลไฟล์เดียวจากเซิร์ฟเวอร์
 * Input :
 *    - backupId (string): ชื่อไฟล์สำรองข้อมูลที่ต้องการลบ
 * Output :
 *    - คืนค่า Promise<void> หากลบสำเร็จ
 *    - หากเกิดข้อผิดพลาดจะ throw error
 */
export const deleteBackup = async (backupId: string): Promise<void> => {
    await api.delete(`/super/backups/${encodeURIComponent(backupId)}`);
};

/*
 * คำอธิบาย : ลบไฟล์สำรองข้อมูลหลายไฟล์จากเซิร์ฟเวอร์
 * Input :
 *    - backupIds (string[]): array ของชื่อไฟล์สำรองข้อมูลที่ต้องการลบ
 * Output :
 *    - คืนค่า Promise<void> หากลบสำเร็จ
 *    - หากเกิดข้อผิดพลาดจะ throw error
 */
export const deleteBulkBackups = async (backupIds: string[]): Promise<void> => {
    await api.post(`/super/backups/delete-bulk`, { ids: backupIds });
};

/*
 * คำอธิบาย : ดาวน์โหลดไฟล์สำรองข้อมูลจากเซิร์ฟเวอร์
 * Input :
 *    - backupId (string): ชื่อไฟล์สำรองข้อมูลที่ต้องการดาวน์โหลด
 * Output :
 *    - ดาวน์โหลดไฟล์ผ่านเบราว์เซอร์
 *    - หากเกิดข้อผิดพลาดจะ throw error พร้อมข้อความภาษาไทย
 */
export const downloadBackup = async (backupId: string): Promise<void> => {
    try {
        const response = await api.get(`/super/backups/${encodeURIComponent(backupId)}`, {
            responseType: 'blob',
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Set filename from response headers or use backupId
        const contentDisposition = response.headers['content-disposition'];
        let filename = backupId;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error('ไม่สามารถดาวน์โหลดไฟล์สำรองข้อมูลได้');
    }
};
