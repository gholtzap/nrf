import { Router, Application } from 'express';
import { configService } from './configService';
import { ApiVersion } from '../types/apiVersion';

export type VersionedRouteConfig = {
  basePath: string;
  routers: Map<ApiVersion, Router>;
};

class ApiVersionService {
  public registerVersionedRoutes(app: Application, config: VersionedRouteConfig): void {
    const apiConfig = configService.get().api;

    config.routers.forEach((router, version) => {
      if (apiConfig.supportedVersions.includes(version)) {
        const fullPath = `${config.basePath}/${version}`;
        app.use(fullPath, router);
      }
    });
  }

  public getSupportedVersions(): ApiVersion[] {
    return configService.get().api.supportedVersions;
  }

  public getDefaultVersion(): ApiVersion {
    return configService.get().api.defaultVersion;
  }

  public isVersionSupported(version: ApiVersion): boolean {
    return configService.get().api.supportedVersions.includes(version);
  }

  public isVersionDeprecated(version: ApiVersion): boolean {
    return configService.get().api.deprecatedVersions.includes(version);
  }
}

export const apiVersionService = new ApiVersionService();
