export interface AccountProfile {
  certificate: string;
  email: string;
  full_name: string;
  id: number;
  kakao_talk_id: string;
  name_card: string;
  notification_settings: [
    {
      channel: string;
      is_enable: boolean;
      type: string;
    }
  ];
  password: string;
  phone: string;
  photo_profile: string;
  status: string;
  username: string;
}

export interface AccountSettingResponse {
  success: boolean;
  message: string;
}
