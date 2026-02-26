/**
 * คำอธิบาย: Modal สำหรับยืนยันการยกเลิกการจอง
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/Components/ui/dialog";
import { X } from "lucide-react";
import Button from "../Button";

interface ModalCancelBookingProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REASONS = [
  "ปรับเปลี่ยนแผน",
  "จองผิด/ต้องการแก้ไขจำนวนสมาชิก",
  "ปัญหาด้านการเดินทาง",
  "อื่นๆ",
];

export default function ModalCancelBooking({
  isOpen,
  onClose,
  onConfirm,
}: ModalCancelBookingProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0 rounded-auth-card bg-white"
        aria-describedby={undefined}
      >
        <DialogHeader className="p-6 pb-2 relative">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="text-center text-xl font-medium text-gray-900">
            กรุณาเลือกเหตุผลในการยกเลิกการจอง
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 pb-6 flex flex-col gap-4">
          {REASONS.map((reason) => (
            <div
              key={reason}
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setSelectedReason(reason)}
            >
              <div
                className={`
                flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 
                ${selectedReason === reason ? "border-[#00C853]" : "group-hover:border-gray-400"}
              `}
              >
                {selectedReason === reason && <div className="w-3 h-3 rounded-full bg-[#00C853]" />}
              </div>
              <span className="text-gray-900 text-base">{reason}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="p-6 pt-2 flex justify-end">
          <Button onClick={handleConfirm} isDisabled={!selectedReason} type="confirm-tourist">
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
