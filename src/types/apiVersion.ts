export type ApiVersion = 'v1' | 'v2';

export type ApiVersionConfig = {
  supportedVersions: ApiVersion[];
  defaultVersion: ApiVersion;
  deprecatedVersions: ApiVersion[];
};

export type VersionedRoute = {
  version: ApiVersion;
  path: string;
  handler: any;
};
