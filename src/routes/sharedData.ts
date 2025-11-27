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

router.put('/:sharedDataId', (req: Request, res: Response) => {
  const { sharedDataId } = req.params;
  const sharedData = req.body;

  if (!sharedData || typeof sharedData !== 'object') {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Request body must contain valid SharedData',
      instance: req.originalUrl
    });
  }

  if (sharedData.sharedDataId && sharedData.sharedDataId !== sharedDataId) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'sharedDataId in body does not match path parameter',
      instance: req.originalUrl
    });
  }

  sharedData.sharedDataId = sharedDataId;

  const isUpdate = sharedDataStore.has(sharedDataId);

  sharedDataStore.set(sharedDataId, sharedData);

  const etag = `"${sharedDataId}-${Date.now()}"`;
  res.set('ETag', etag);

  if (isUpdate) {
    res.status(200).json(sharedData);
  } else {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    res.set('Location', `${baseUrl}/${sharedDataId}`);
    res.status(201).json(sharedData);
  }
});

export default router;
