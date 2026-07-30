export interface SupplierDTO {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDTO {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface UpdateSupplierDTO {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface GetSupplierByIdDTO {
  id: string;
}
