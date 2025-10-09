import { useEffect, useState } from "react";
import NavbarSam from "../../Components/NavbarSam";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SerachBarTable";

interface Package extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
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
        }));
        setPackages(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const columns: Column<Package>[] = [
    { key: "name", header: "ชื่อแพ็กเกจ" },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ชื่อผู้ดูแล" },
    { key: "status", header: "สถานะแพ็กเกจ" },
    { key: "setting", header: "จัดการ" },
  ];

  return (
    <div className="font-sarabun">
      <NavbarSam />
      <div className="p-6">
        <SearchBarTable
          value=""
          onChange={() => {}}
        />
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
