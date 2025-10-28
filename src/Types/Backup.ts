export interface BackupRow {
    filename: string;
    size: string;
    status: string;
    createdAt: string;
    [key: string]: unknown;
}

export interface BackupResponse {
    data: BackupRow[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
}
