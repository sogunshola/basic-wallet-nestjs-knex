export interface User {
  id: number;
  deletedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;

  fullName: string;
  verified: boolean;
}
