import { useEffect, useState } from "react";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import { Plus, Edit, Trash } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface Package {
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPackages = async () => {
    try {
      const query = new URLSearchParams({ search: searchTerm });
      const res = await fetch(`http://localhost:3000/api/admin/packages/draft?${query}`, {
        credentials: "include",
      });
      const result = await res.json();

      if (!result.data) {
        setPackages([]);
        return;
      }

      const formatted: Package[] = result.data.map((pkg: any) => ({
        name: pkg.name ?? "-",
        community: pkg.community?.name ?? "-",
        overseer: pkg.overseerPackage?.username ?? "-",
        status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage ?? "-",
      }));

      setPackages(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
      setPackages([]);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [searchTerm]);

  const handleEdit = (pkg: Package) => {
    alert(`📝 แก้ไขแพ็กเกจ: ${pkg.name}`);
  };

  const handleDelete = (pkg: Package) => {
    if (confirm(`คุณต้องการลบแพ็กเกจ: ${pkg.name} ใช่ไหม?`)) {
      setPackages((prev) => prev.filter((p) => p.name !== pkg.name));
    }
  };

  const columns: Column<Package>[] = [
    { key: "name", header: "ชื่อแพ็กเกจ" },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ชื่อผู้ดูแล" },
    { key: "status", header: "สถานะแพ็กเกจ" },
    {
      key: "setting",
      header: "จัดการ",
      render: (pkg) => (
        <div className="flex space-x-2">
          <Edit
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => handleEdit(pkg)}
          />
          <Trash
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => handleDelete(pkg)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="font-sarabun bg-[#F0F0F0] ">
      <div className="pt-2 px-4 pb-4">
        <div className="text-[14px] text-black mb-1 flex items-center">
          <span>จัดการแพ็กเกจ</span>
          <ChevronRight size={20} className="mx-1 text-black" />
          <span className="font-medium" style={{ color: "#494949" }}>
            ฉบับร่าง
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[20px] font-medium">ฉบับร่าง</h1>
        </div>

        <div className="flex items-center justify-between mb-3 font-sarabun">
          <SearchBarTable
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          <button
            className="flex items-center border text-white px-4 py-2 rounded-md transition h-10"
            style={{ backgroundColor: "#055035" }}
          >
            <Plus size={18} className="mr-2" />
            <div className="text-[14px] font-bold">เพิ่มแพ็กเกจ</div>
          </button>
        </div>

        <DataTable<Package>
          data={packages}
          columns={columns}
          getRowKey={(pkg) => pkg.name} // ต้อง unique
          pageSizeOptions={[10, 30, 50]}
          defaultPageSize={10}
          theme="brand"
        />
      </div>
    </div>
  );
};

export default PackageDraftAdmin;
