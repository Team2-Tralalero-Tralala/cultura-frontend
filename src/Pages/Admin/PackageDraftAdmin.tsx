import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import { Plus, Edit, Trash } from "lucide-react";
import { ChevronRight } from "lucide-react";

// เพิ่ม id สำหรับ unique key
interface Package {
  id: string;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
}

// debounce function
function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const fetchPackages = async (search = "", page = 1, limit = 10) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`http://localhost:3000/api/admin/packages/draft?${query}`, {
        credentials: "include",
      });
      const result = await res.json();

      const formatted: Package[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? pkg.name,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.username ?? "-",
            status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage ?? "-",
          }))
        : [];

      setPackages(formatted);
      setPagination((prev) => ({
        ...prev,
        totalCount: result.totalCount ?? formatted.length,
        totalPages: result.totalCount
          ? Math.ceil(result.totalCount / prev.limit)
          : 1,
        currentPage: page,
        limit,
      }));
    } catch (err) {
      console.error("Fetch error:", err);
      setPackages([]);
      setPagination((prev) => ({ ...prev, totalCount: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchPackages, 300), []);

  useEffect(() => {
    debouncedFetch(searchTerm, pagination.currentPage, pagination.limit);
  }, [searchTerm, pagination.currentPage, pagination.limit, debouncedFetch]);

  const handleEdit = (pkg: Package) => alert(`แก้ไขแพ็กเกจ: ${pkg.name}`);
  const handleDelete = (pkg: Package) => alert(`ลบแพ็กเกจ: ${pkg.name}`);

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
    <div className="font-sarabun bg-[#F0F0F0]">
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
          onClick={() => window.location.href = "/admin/packages/create"} // redirect
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
        getKey={(pkg) => pkg.id} // unique
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(newPage) => setPagination((prev) => ({ ...prev, currentPage: newPage }))}
        onPageSizeChange={(newLimit) => setPagination((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }))}
        isLoading={loading}
      />
    </div>
  );
};

export default PackageDraftAdmin;
