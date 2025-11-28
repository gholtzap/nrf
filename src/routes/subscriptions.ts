import { Router, Request, Response } from 'express';
import { subscriptionStore } from '../storage/subscriptionStore';
import { SubscriptionData } from '../types/subscriptionData';
import { randomUUID } from 'crypto';
import * as jsonpatch from 'fast-json-patch';
import { PatchItem } from '../types/patchItem';
import { validateToken } from '../middleware/auth';
import { validate, validateContentType } from '../middleware/validation';
import {
  SubscriptionDataSchema,
  PatchArraySchema,
  SubscriptionPathParamSchema,
} from '../validation/schemas';

const router = Router();

router.get('/:subscriptionID', validate({ params: SubscriptionPathParamSchema }), async (req: Request, res: Response) => {
  const { subscriptionID } = req.params;

  const existingSubscription = await subscriptionStore.get(subscriptionID);

  if (!existingSubscription) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Subscription with ID ${subscriptionID} not found`,
      instance: req.originalUrl
    });
  }

  res.set('Accept-Encoding', 'gzip, deflate');
  res.set('Content-Encoding', 'gzip');
  res.status(200).json(existingSubscription);
});

router.post('/', validateContentType(['application/json']), validate({ body: SubscriptionDataSchema }), validateToken, async (req: Request, res: Response) => {
  const subscriptionData: SubscriptionData = req.body;

  const subscriptionId = randomUUID();
  subscriptionData.subscriptionId = subscriptionId;

  await subscriptionStore.set(subscriptionId, subscriptionData);

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  res.set('Location', `${baseUrl}/${subscriptionId}`);
  res.set('Accept-Encoding', 'gzip, deflate');
  res.set('Content-Encoding', 'gzip');

  res.status(201).json(subscriptionData);
});

router.patch('/:subscriptionID', validateContentType(['application/json-patch+json', 'application/json']), validate({ params: SubscriptionPathParamSchema, body: PatchArraySchema }), validateToken, async (req: Request, res: Response) => {
  const { subscriptionID } = req.params;
  const patches: PatchItem[] = req.body;

  const existingSubscription = await subscriptionStore.get(subscriptionID);

  if (!existingSubscription) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Subscription with ID ${subscriptionID} not found`,
      instance: req.originalUrl
    });
  }

  const errors = jsonpatch.validate(patches, existingSubscription);
  if (errors) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid patch operations',
      instance: req.originalUrl
    });
  }

  const patchedSubscription = { ...existingSubscription };
  jsonpatch.apply(patchedSubscription, patches);

  await subscriptionStore.set(subscriptionID, patchedSubscription);

  res.set('Accept-Encoding', 'gzip, deflate');
  res.set('Content-Encoding', 'gzip');
  res.status(200).json(patchedSubscription);
});

router.delete('/:subscriptionID', validate({ params: SubscriptionPathParamSchema }), validateToken, async (req: Request, res: Response) => {
  const { subscriptionID } = req.params;

  const existingSubscription = await subscriptionStore.get(subscriptionID);

  if (!existingSubscription) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Subscription with ID ${subscriptionID} not found`,
      instance: req.originalUrl
    });
  }

  await subscriptionStore.delete(subscriptionID);

  res.status(204).send();
});

export default router;
