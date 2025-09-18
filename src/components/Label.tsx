import React from "react";

export type LabelProps = {   
    label: string;
    className?: string;
};

const Label: React.FC<LabelProps> = ({ label, className }) => {
    return <div className={className}>{label}</div>;
};

export default Label;
