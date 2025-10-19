export interface PackageRequestDetail {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  startDate: string;
  dueDate: string;
  bookingOpenDate: string;
  bookingCloseDate: string;
  facility: string;
  overseerPackage: { fname: string; lname: string };
  createPackage: { fname: string; lname: string };
  tagPackages: { tag: { name: string } }[];
  packageFile: { filePath: string }[];
  location: {
    houseNumber: string;
    villageNumber: string;
    alley: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    detail: string;
    latitude: number;
    longitude: number;
  };
}
