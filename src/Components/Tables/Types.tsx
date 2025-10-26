/*
* คำอธิบาย : ไฟล์ประกาศชนิดข้อมูล (Type Definitions) สำหรับคอมโพเนนต์ DataTable
* ใช้กำหนดโครงสร้างคอลัมน์ ปุ่มการทำงานต่อแถว/แบบกลุ่ม ธีม และพร็อพหลักของตาราง
* เน้นให้พิมพ์เขียวโครงสร้างข้อมูลชัดเจนและใช้งานซ้ำได้ในหลายบริบท
*/
import React from "react";

export type Column<T extends Record<string, unknown>> = {
    key: keyof T | string;
    header: React.ReactNode;
    width?: string;
    className?: string;
    render?: (row: T) => React.ReactNode;
};

export type IconComponent = React.ComponentType<{ className?: string }>;


export type RowAction<T> = {
    id: string;
    label?: string;
    icon?: IconComponent;
    onClick: (row: T) => void | Promise<void>;
    visible?: (row: T) => boolean;
    disabled?: (row: T) => boolean | { value: boolean; reason?: string };
    intent?: "neutral" | "primary" | "warning" | "danger";
    className?: string;
};

export type BulkAction<T> = {
    id: string;
    label: string;
    icon?: IconComponent;
    onClick: (rows: T[]) => void | Promise<void>;
    confirm?: string | ((rows: T[]) => string);
    intent?: "neutral" | "primary" | "warning" | "danger";
    className?: string;
};

export type PresetId =
    | "edit" | "delete" | "block" | "unblock" | "approve" | "reject" | "copy" | "users";


export type DataTableActionsConfig<T> = {
    header?: React.ReactNode;
    align?: "left" | "right";
    width?: string;
    variant?: "icons" | "buttons";
    items: Array<PresetId | RowAction<T>> | ((row: T) => Array<PresetId | RowAction<T>>);
    callbacks?: Partial<Record<PresetId, (row: T) => void | Promise<void>>>;
    visible?: boolean;
    className?: string;
};

export type ThemeColor = "emerald" | "teal" | "blue" | "violet" | "brand";

export interface DataTableProps<T extends Record<string, unknown>> {
    data: T[];
    total?: number;
    columns: Column<T>[];
    getRowKey?: (row: T, index: number) => React.Key;

    page?: number;
    onPageChange?: (page: number) => void;
    pageSizeOptions?: number[];
    defaultPageSize?: number;

    selectable?: boolean;
    selectedKeys?: React.Key[];
    onSelectedChange?: (keys: React.Key[], rows: T[]) => void;
    bulkActions?: BulkAction<T>[];

    actions?: DataTableActionsConfig<T>;

    striped?: boolean;
    className?: string;
    theme?: ThemeColor;
}
