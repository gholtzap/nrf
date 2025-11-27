import { Router, Request, Response } from 'express';
import { sharedDataStore } from '../storage/sharedDataStore';
import * as jsonpatch from 'fast-json-patch';
import { PatchItem } from '../types/patchItem';

const router = Router();

router.get('/:sharedDataId', async (req: Request, res: Response) => {
  const { sharedDataId } = req.params;

  const sharedData = await sharedDataStore.get(sharedDataId);

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

router.put('/:sharedDataId', async (req: Request, res: Response) => {
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

  const isUpdate = await sharedDataStore.has(sharedDataId);

  await sharedDataStore.set(sharedDataId, sharedData);

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

router.patch('/:sharedDataId', async (req: Request, res: Response) => {
  const { sharedDataId } = req.params;
  const patches: PatchItem[] = req.body;

  if (!Array.isArray(patches) || patches.length === 0) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Request body must contain a non-empty array of patch operations',
      instance: req.originalUrl
    });
  }

  const existingData = await sharedDataStore.get(sharedDataId);

  if (!existingData) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Shared Data with ID ${sharedDataId} not found`,
      instance: req.originalUrl
    });
  }

  const errors = jsonpatch.validate(patches, existingData);
  if (errors) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid patch operations',
      instance: req.originalUrl
    });
  }

  const patchedData = { ...existingData };
  jsonpatch.apply(patchedData, patches);

  await sharedDataStore.set(sharedDataId, patchedData);

  const etag = `"${sharedDataId}-${Date.now()}"`;
  res.set('ETag', etag);
  res.status(200).json(patchedData);
});

router.delete('/:sharedDataId', async (req: Request, res: Response) => {
  const { sharedDataId } = req.params;

  const exists = await sharedDataStore.has(sharedDataId);

  if (!exists) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `Shared Data with ID ${sharedDataId} not found`,
      instance: req.originalUrl
    });
  }

  await sharedDataStore.delete(sharedDataId);

  res.status(204).send();
});

export default router;
