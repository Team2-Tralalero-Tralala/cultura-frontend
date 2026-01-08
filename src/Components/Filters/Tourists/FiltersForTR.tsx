/*
 * Filter ใช้สำหรับ Role: Tourists
 */
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

export type FilterOption = {
  label: string;
  value: string | string[];
};

export type FilterSection = {
  title: string;
  key: string; // Key for the state object (e.g., 'status', 'period')
  options: FilterOption[];
};

type FilterProps = {
  sections: FilterSection[];
  selected: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
  label?: string;
  icon?: string;
};

export default function FilterDropdown({ sections, selected, onChange, label, icon }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * คำอธิบาย: ตรวจสอบการคลิกพื้นที่อื่นนอกจาก Dropdown เพื่อปิดเมนู
   * Input: -
   * Output: - (อัปเดต state open)
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2 border border-black rounded-lg bg-white text-black hover:bg-gray-50"
      >
        <span>{label || "ตัวกรอง"}</span>
        {icon ? (
          <Icon icon={icon} width={24} height={24} className="text-black" />
        ) : (
          <Icon icon="mdi:filter-variant" width={24} height={24} className="text-black" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] w-max rounded-lg border border-black bg-white p-4 shadow-lg z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">ตัวกรอง</h3>
            <Icon icon="heroicons:bars-3-bottom-right" width={24} height={24} />
          </div>

          {sections.map((section, index) => (
            <div key={section.key} className={index > 0 ? "mt-4" : ""}>
              <h4 className="mb-2 font-bold text-base">{section.title}</h4>
              <div className="flex flex-col gap-2">
                {section.options.map((option, index) => {
                  const isSelected =
                    JSON.stringify(selected[section.key]) === JSON.stringify(option.value);
                  return (
                    <button
                      key={index}
                      onClick={() => onChange(section.key, option.value)}
                      className="flex items-center gap-3 text-left hover:bg-gray-50 rounded-md p-1"
                    >
                      {/* Radio Icon */}
                      <div className={`flex items-center justify-center`}>
                        {isSelected ? (
                          <Icon
                            icon="mdi:radiobox-marked"
                            className="text-[#00BF6A]"
                            width={20}
                            height={20}
                          />
                        ) : (
                          <Icon
                            icon="mdi:radiobox-blank"
                            className="text-[#00BF6A]"
                            width={20}
                            height={20}
                          />
                        )}
                      </div>
                      <span className="text-black">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
