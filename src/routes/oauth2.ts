import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AccessTokenRequest, AccessTokenResponse, AccessTokenError } from '../types/accessToken';
import { tokenStore } from '../storage/tokenStore';
import { validate, validateContentType } from '../middleware/validation';
import { AccessTokenRequestSchema } from '../validation/schemas';

const router = Router();

router.post('/token', validateContentType(['application/x-www-form-urlencoded', 'application/json']), validate({ body: AccessTokenRequestSchema }), async (req: Request, res: Response) => {
  const body = req.body as AccessTokenRequest;

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
