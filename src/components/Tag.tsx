import React from "react";
import Label from "./Label";
import type { LabelProps } from "./Label"; // ⬅️ ใช้ import type

type TagProps = LabelProps;

export const Tag: React.FC<TagProps> = ({ label, className }) => {
    return (
        <div className="w-20 h-9 border-1 border-gray-600 rounded-lg flex items-center justify-center font-medium">
            <Label label={label} className={className} />
        </div>
    );
};
