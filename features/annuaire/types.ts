export type AnnuairePersonDto = {
  id: number;
  lastName: string;
  firstName: string;
  jobTitle: string;
  email: string;
  site: string;
  extension: string;
  whatsapp: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AnnuairePersonInput = {
  lastName?: string;
  firstName?: string;
  jobTitle?: string;
  email?: string;
  site?: string;
  extension?: string;
  whatsapp?: string;
  sortOrder?: number;
};

export type AnnuaireListQuery = {
  q: string;
  page: number;
  pageSize: number;
};

export type AnnuaireListResult = {
  items: AnnuairePersonDto[];
  total: number;
  page: number;
  pageSize: number;
};
