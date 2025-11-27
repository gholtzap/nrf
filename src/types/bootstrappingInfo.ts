export type BootstrappingInfo = {
  nrfNfMgmtUri?: string;
  nrfDiscUri?: string;
  nrfAccessTokenUri?: string;
  oauth2Required?: {
    [key: string]: boolean;
  };
  customInfo?: {
    [key: string]: any;
  };
};
