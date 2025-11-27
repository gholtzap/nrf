import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AccessTokenRequest, AccessTokenResponse, AccessTokenError } from '../types/accessToken';
import { tokenStore } from '../storage/tokenStore';

const router = Router();

router.post('/token', async (req: Request, res: Response) => {
  const body = req.body as AccessTokenRequest;

  if (!body.grant_type) {
    const error: AccessTokenError = {
      error: 'invalid_request',
      error_description: 'grant_type is required'
    };
    res.status(400).json(error);
    return;
  }

  if (body.grant_type !== 'client_credentials') {
    const error: AccessTokenError = {
      error: 'unsupported_grant_type',
      error_description: 'Only client_credentials grant type is supported'
    };
    res.status(400).json(error);
    return;
  }

  if (!body.nfInstanceId) {
    const error: AccessTokenError = {
      error: 'invalid_request',
      error_description: 'nfInstanceId is required'
    };
    res.status(400).json(error);
    return;
  }

  if (!body.scope) {
    const error: AccessTokenError = {
      error: 'invalid_request',
      error_description: 'scope is required'
    };
    res.status(400).json(error);
    return;
  }

  const accessToken = crypto.randomBytes(32).toString('hex');
  const expiresIn = 3600;

  await tokenStore.store({
    access_token: accessToken,
    nfInstanceId: body.nfInstanceId,
    scope: body.scope,
    created_at: Date.now(),
    expires_in: expiresIn
  });

  const response: AccessTokenResponse = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    scope: body.scope
  };

  res.status(200).json(response);
});

export default router;
