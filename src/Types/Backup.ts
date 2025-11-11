/*
 * คำอธิบาย : Type definition สำหรับแต่ละแถวในตารางไฟล์สำรองข้อมูล
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface BackupRow {
    filename: string;
    size: string;
    status: string;
    createdAt: string;
    [key: string]: unknown;
}

/*
 * คำอธิบาย : Type definition สำหรับ response ของการดึงรายการไฟล์สำรองข้อมูล
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface BackupResponse {
    data: BackupRow[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
}
