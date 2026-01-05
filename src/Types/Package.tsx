export type PackageRow = {
  id: number;
  title: string;
  community: string;
  owner: string;
  published: boolean;
  approved: boolean;
};

export type PackageDtoFromApi = {
  id: number;
  title: string;
  community: { name: string } | null;
  owner: { fullName: string } | null;
  published: boolean;
  approved: boolean;
};

export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface ParticipantsInPackage {
  id: number;
  bookingAt: string;
  tourist: {
    id: number;
    fname: string;
    lname: string;
    phone: string;
  };
  isParticipate: boolean;
  [key: string]: any;
}
