export interface AccountProfile {
  username: string;
  firstName: string;
  lastName: string;
  agentCompany: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface AccountSettingResponse {
  success: boolean;
  message: string;
}
