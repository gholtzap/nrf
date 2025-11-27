import { Router, Request, Response } from 'express';
import { subscriptionStore } from '../storage/subscriptionStore';
import { SubscriptionData } from '../types/subscriptionData';
import { randomUUID } from 'crypto';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const subscriptionData: SubscriptionData = req.body;

  if (!subscriptionData || typeof subscriptionData !== 'object') {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Request body must contain valid SubscriptionData',
      instance: req.originalUrl
    });
  }

  if (!subscriptionData.nfStatusNotificationUri) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'nfStatusNotificationUri is required',
      instance: req.originalUrl
    });
  }

  const subscriptionId = randomUUID();
  subscriptionData.subscriptionId = subscriptionId;

  await subscriptionStore.set(subscriptionId, subscriptionData);

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  res.set('Location', `${baseUrl}/${subscriptionId}`);
  res.set('Accept-Encoding', 'gzip, deflate');
  res.set('Content-Encoding', 'gzip');

  res.status(201).json(subscriptionData);
});

export default router;
