export type AccessTokenRequest = {
  grant_type: string;
  nfInstanceId: string;
  nfType?: string;
  targetNfType?: string;
  scope: string;
  requesterPlmn?: {
    mcc: string;
    mnc: string;
  };
  targetPlmn?: {
    mcc: string;
    mnc: string;
  };
};

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

export type AccessTokenError = {
  error: string;
  error_description?: string;
};

export type StoredAccessToken = {
  access_token: string;
  nfInstanceId: string;
  scope: string;
  created_at: number;
  expires_in: number;
};
