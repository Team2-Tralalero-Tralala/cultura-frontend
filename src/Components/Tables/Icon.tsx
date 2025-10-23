/*
* คำอธิบาย : ไฟล์รวบรวมคอมโพเนนต์ไอคอนที่ใช้ซ้ำในระบบ DataTable และส่วนอื่น ๆ
* ใช้ไลบรารี @iconify/react (ชุดไอคอน Material Design Icons - mdi)
* ทุกคอมโพเนนต์รับ className เพื่อให้ปรับขนาดหรือสีจากภายนอกได้อิสระ
*/


import { Icon } from "@iconify/react";

type Props = { className?: string };

export const PencilIcon       = ({ className }: Props) => <Icon icon="mdi:pencil-outline"        className={className} />;
export const TrashIcon        = ({ className }: Props) => <Icon icon="mdi:trash-can-outline"     className={className} />;
export const BanIcon          = ({ className }: Props) => <Icon icon="mdi:block-helper"          className={className} />;
export const CheckIcon        = ({ className }: Props) => <Icon icon="mdi:check"                 className={className} />;
export const XIcon            = ({ className }: Props) => <Icon icon="mdi:close"                 className={className} />;
export const CopyIcon         = ({ className }: Props) => <Icon icon="mdi:content-copy"          className={className} />;
export const UsersIcon        = ({ className }: Props) => <Icon icon="mdi:account-group-outline" className={className} />;
export const ChevronLeftIcon  = ({ className }: Props) => <Icon icon="mdi:chevron-left"          className={className} />;
export const ChevronRightIcon = ({ className }: Props) => <Icon icon="mdi:chevron-right"         className={className} />;
