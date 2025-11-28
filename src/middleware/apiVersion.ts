import { Request, Response, NextFunction } from 'express';
import { configService } from '../services/configService';
import { ApiVersion } from '../types/apiVersion';

export function validateApiVersion(req: Request, res: Response, next: NextFunction): void {
  const config = configService.get();
  const versionMatch = req.path.match(/\/(v\d+)\//);

  if (!versionMatch) {
    return next();
  }

  const requestedVersion = versionMatch[1] as ApiVersion;

  if (!config.api.supportedVersions.includes(requestedVersion)) {
    res.status(400).json({
      type: 'application/problem+json',
      title: 'Unsupported API Version',
      status: 400,
      detail: `API version ${requestedVersion} is not supported. Supported versions: ${config.api.supportedVersions.join(', ')}`,
      instance: req.originalUrl
    });
    return;
  }

  if (config.api.deprecatedVersions.includes(requestedVersion)) {
    res.set('Deprecated', 'true');
    res.set('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString());
  }

  req.apiVersion = requestedVersion;
  next();
}

declare global {
  namespace Express {
    interface Request {
      apiVersion?: ApiVersion;
    }
  }
}
