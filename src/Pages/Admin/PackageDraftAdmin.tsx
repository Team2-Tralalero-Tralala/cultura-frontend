import { useEffect, useState } from "react";
import NavbarSam from "../../Components/NavbarSam";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { Plus, Edit, Trash } from "lucide-react";

interface Package {
  id: number; // ใช้ index เป็น id
  name: string;
  status: string;
  community: string;
  overseer: string;
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/admin/packages/draft", {
          credentials: "include",
        });
        const result = await res.json();

        console.log("📦 API Result:", result);

        if (!result.data) {
          setPackages([]);
          return;
        }

        // ใช้ index เป็น id แทน
        const formatted: Package[] = result.data.map((pkg: any, index: number) => ({
          id: index, // ใช้ index เป็น key
          name: pkg.name ?? "-",
          status: pkg.statusPackage ?? "DRAFT",
          community: pkg.community?.name ?? "-",
          overseer: pkg.overseerPackage?.username ?? "-",
        }));

        console.log("Formatted Packages:", formatted);

        setPackages(formatted);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleEdit = (pkg: Package) => {
    alert(`📝 แก้ไขแพ็กเกจ: ${pkg.name}`);
  };

  const handleDelete = (pkg: Package) => {
    if (confirm(`คุณต้องการลบแพ็กเกจ: ${pkg.name} ใช่ไหม?`)) {
      setPackages((prev) => prev.filter((_, index) => index !== pkg.id));
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

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.overseer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sarabun">
      <NavbarSam />
      <div className="pt-2 px-4 pb-4">
        <div className="text-[14px] text-black mb-1">
          จัดการแพ็กเกจ <span className="mx-1 font-sarabun">›</span>{" "}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />

          <button
            className="flex items-center border text-white px-4 py-2 rounded-md transition h-10"
            style={{ backgroundColor: "#055035" }}
          >
            <Plus size={18} className="mr-2" />
            <div className="text-[14px] font-bold">เพิ่มแพ็กเกจ</div>
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-4">⏳ กำลังโหลดข้อมูล...</div>
        ) : (
          <DataTable<Package>
            data={filteredPackages}
            columns={columns}
            getRowKey={(r) => r.id} // ใช้ index เป็น key
            pageSizeOptions={[10, 30, 50]}
            defaultPageSize={10}
            theme="brand"
          />
        )}
      </div>
    </div>
  );
};

export default PackageDraftAdmin;
