/*
 * คำอธิบาย : Component สำหรับแสดงส่วนของแท็กกิจกรรม (กิจกรรมที่แนะนำ)
 * แสดงแท็กในรูปแบบปุ่มที่เรียงกันใน grid และสามารถคลิกได้
 */

interface TagsSectionProps {
  /** หัวข้อของส่วน */
  title: string;
  /** รายการแท็กที่จะแสดง (array of strings) */
  tags: string[];
  /** ฟังก์ชันที่เรียกเมื่อคลิกแท็ก */
  onTagClick?: (tag: string) => void;
}

/*
 * ฟังก์ชัน : TagsSection
 * คำอธิบาย : แสดงส่วนของแท็กกิจกรรมในรูปแบบ grid
 * Input : TagsSectionProps (title, tags, onTagClick)
 * Output : React Component ที่ render ส่วนของแท็ก
 */
export default function TagsSection({
  title,
  tags,
  onTagClick,
}: TagsSectionProps) {
  /*
   * ฟังก์ชัน : handleTagClick
   * คำอธิบาย : จัดการเมื่อคลิกแท็ก
   * Input : tag (string) - แท็กที่ถูกคลิก
   * Output : void
   */
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log("Tag clicked:", tag);
    }
  };

  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-2xl font-bold text-black mb-6">{title}</h2>

        {/* Tags Grid */}
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-black text-sm font-normal hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
