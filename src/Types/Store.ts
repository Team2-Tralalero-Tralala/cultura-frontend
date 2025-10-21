export type StoreData = {
  name: string;
  detail: string;
  houseNumber: string;
  villageNumber?: number | null;
  longitude: number;
  latitude: number;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  locationDetail: string;
  location: {
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
  };
  tagStores: number[];
  storeImage: Image[];
};
export type ImageType = "GALLERY" | "VIDEO" | "COVER";

type Image = {
  image: string;
  type: ImageType;
};