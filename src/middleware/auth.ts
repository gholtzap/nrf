import { Request, Response, NextFunction } from 'express';
import { tokenStore } from '../storage/tokenStore';
import { configService } from '../services/configService';

export type AuthenticatedRequest = Request & {
  nfInstanceId?: string;
  scope?: string;
};

export async function validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const config = configService.get();

  if (!config.security.oauth.enabled) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing authorization header'
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid authorization header format. Expected: Bearer <token>'
    });
    return;
  }

  const token = parts[1];

  const isValid = await tokenStore.isValid(token);
  if (!isValid) {
    res.status(401).json({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired access token'
    });
    return;
  }

  const tokenData = await tokenStore.get(token);
  if (tokenData) {
    req.nfInstanceId = tokenData.nfInstanceId;
    req.scope = tokenData.scope;
  }

  next();
}

export async function optionalToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];
    const isValid = await tokenStore.isValid(token);

    if (isValid) {
      const tokenData = await tokenStore.get(token);
      if (tokenData) {
        req.nfInstanceId = tokenData.nfInstanceId;
        req.scope = tokenData.scope;
      }
    }
  }

  next();
}
