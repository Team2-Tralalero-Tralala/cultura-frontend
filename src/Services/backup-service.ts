import api from "@/Libs/api";

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

export const deleteBackup = async (backupId: string): Promise<void> => {
    await api.delete(`/super/backups/${encodeURIComponent(backupId)}`);
};

export const deleteBulkBackups = async (backupIds: string[]): Promise<void> => {
    await api.post(`/super/backups/delete-bulk`, { ids: backupIds });
};

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
