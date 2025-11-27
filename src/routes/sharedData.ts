import { Router, Request, Response } from 'express';
import { sharedDataStore } from '../storage/sharedDataStore';

const router = Router();

router.get('/:sharedDataId', (req: Request, res: Response) => {
  const { sharedDataId } = req.params;

  const sharedData = sharedDataStore.get(sharedDataId);

  if (!sharedData) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Shared Data with ID ${sharedDataId} not found`,
      instance: req.originalUrl
    });
  }

  res.set('ETag', `"${sharedDataId}-${Date.now()}"`);
  res.status(200).json(sharedData);
});

export default router;
