import { EmployeeRoleType } from 'src/employees/types';

export type JwtPayload = {
  role: EmployeeRoleType;
  id: string;
  email: string;
  name: string;
};

export type RefreshToken = {
  refreshToken: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
