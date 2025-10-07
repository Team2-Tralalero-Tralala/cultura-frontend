import CommunityAccordion from "@/Components/Community/CommunityAccordion";
import Button from "@/Components/Button";

export function CreateCommuninityPage() {
  return (
    <>
      <div className="w-auto">
        <CommunityAccordion />
        <Button type="confirm-admin">สร้าง</Button>
        <Button type="cancel">ยกเลิก</Button>
      </div>
    </>
  );
}
