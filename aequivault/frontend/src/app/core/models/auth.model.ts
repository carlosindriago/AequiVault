export interface SetupInitRequest {
  companyName: string;
  email: string;
  password: string;
}

export interface SetupInitResponse {
  token: string;
  email: string;
  tenantId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  tenantId: string;
}

export interface SetupStatusResponse {
  isInitialized: boolean;
}
