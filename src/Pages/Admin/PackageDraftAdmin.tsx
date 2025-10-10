import { useEffect, useState } from "react";
import NavbarSam from "../../Components/NavbarSam";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { Plus, Edit, Trash } from "lucide-react";

interface Package extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
  community?: string;
  overseer?: string;
}

const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/packages?statusPublish=DRAFT")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          status: pkg.statusPublish || "Draft",
          community: pkg.community || "-",
          overseer: pkg.overseer || "-",
        }));
        setPackages(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleEdit = (pkg: Package) => {
    alert(`Edit package: ${pkg.name}`);
  };

  const handleDelete = (pkg: Package) => {
    if (confirm(`คุณต้องการลบแพ็กเกจ: ${pkg.name} ใช่ไหม?`)) {
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
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
            size={16}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => handleEdit(pkg)}
          />
          <Trash
            size={16}
            className="text-red-600 hover:text-red-800 cursor-pointer"
            onClick={() => handleDelete(pkg)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="font-sarabun">
      <NavbarSam />
      <div className="pt-2 px-4 pb-4">
        <div className="text-[14px] text-black mb-1">
          จัดการแพ็กเกจ <span className="mx-1 font-sarabun">›</span>{" "}
          <span className="font-medium" style={{ color: '#494949' }}>ฉบับร่าง</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[20px] font-medium">ฉบับร่าง</h1>
        </div>
        <div className="flex items-center justify-between mb-3 font-sarabun">
          <SearchBarTable
            value=""
            onChange={() => {}}
          />

          <button
            className="flex items-center border text-white px-4 py-2 rounded-md transition h-10 w-33"
            style={{ backgroundColor: '#055035' }}
          >
            <Plus size={18} className="mr-2" />
            <div className="text-[14px] font-bold">เพิ่มแพ็กเกจ</div>
          </button>
        </div>

        <DataTable<Package>
          data={packages}
          columns={columns}
          getRowKey={(r) => r.id}
          pageSizeOptions={[10, 30, 50]}
          defaultPageSize={10}
          theme="brand"
        />
      </div>
    </div>
  );
};

export default PackageDraftAdmin;
