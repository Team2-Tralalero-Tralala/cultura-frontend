import SidebarSuper from "./Components/SidebarSuper";
import SidebarAdmin from "./Components/SidebarAdmin"; 
import SidebarMember  from "./Components/SidebarMember";

function SidebarForSuperAdmin() {
  return (
    <>

      <SidebarSuper />
    </>
  );
}

function SidebarForAdmin() {
  return (
    <>
      <SidebarAdmin />
    </>
  );
}

function SidebarForMember() {
  return (
    <>
      <SidebarMember />
    </>
  );
}


export default SidebarForAdmin;
