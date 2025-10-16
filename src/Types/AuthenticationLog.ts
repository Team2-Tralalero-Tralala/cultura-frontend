// แถวข้อมูลแต่ละรายการในตาราง
export type AuthenticationLogRow = {
  id: number;
  userId: number;
  loginTime: string | null;
  logoutTime: string | null;
  ipAddress: string;
  user: {
    id: number;
    username: string;
    role: {
      id: number;
      name: string;
    };
  };
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};