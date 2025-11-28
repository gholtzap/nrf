import { Router, Request, Response } from 'express';
const jsonpatch = require('fast-json-patch');
import { nfStore } from '../storage/nfStore';
import { UriList } from '../types/uriList';
import { PatchItem } from '../types/patchItem';
import { OptionsResponse } from '../types/optionsResponse';
import { validateToken } from '../middleware/auth';
import { heartbeatService } from '../services/heartbeatService';
import { notificationService } from '../services/notificationService';
import { validate, validateContentType } from '../middleware/validation';
import {
  NFProfileSchema,
  PatchArraySchema,
  PathParamSchema,
  NFInstancesQuerySchema,
} from '../validation/schemas';

const router = Router();

router.options('/', (_req: Request, res: Response) => {
  const optionsResponse: OptionsResponse = {
    supportedFeatures: undefined
  };

  res.set('Accept-Encoding', 'gzip, deflate');
  res.set('Allow', 'GET, OPTIONS');

  if (optionsResponse.supportedFeatures) {
    res.status(200).json(optionsResponse);
  } else {
    res.status(204).send();
  }
});

router.get('/', validate({ query: NFInstancesQuerySchema }), async (req: Request, res: Response) => {
  const { 'nf-type': nfType, limit, 'page-number': pageNumber, 'page-size': pageSize } = req.query;

  let profiles = await nfStore.getAll();

  if (nfType && typeof nfType === 'string') {
    profiles = profiles.filter(profile => profile.nfType === nfType);
  }

  const totalItemCount = profiles.length;

  let paginatedProfiles = profiles;
  if (pageNumber && pageSize) {
    const page = parseInt(pageNumber as string, 10);
    const size = parseInt(pageSize as string, 10);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    paginatedProfiles = profiles.slice(startIndex, endIndex);
  } else if (limit) {
    const maxItems = parseInt(limit as string, 10);
    paginatedProfiles = profiles.slice(0, maxItems);
  }

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

  const uriList: UriList = {
    _links: {
      self: {
        href: `${baseUrl}${req.url}`
      },
      item: paginatedProfiles.map(profile => ({
        href: `${baseUrl}/${profile.nfInstanceId}`
      }))
    },
    totalItemCount
  };

  res.set('Content-Type', 'application/3gppHal+json');
  res.set('ETag', `"collection-${Date.now()}"`);
  res.status(200).json(uriList);
});

router.get('/:nfInstanceID', validate({ params: PathParamSchema }), async (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;

  const profile = await nfStore.get(nfInstanceID);

  if (!profile) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `NF Instance with ID ${nfInstanceID} not found`,
      instance: req.originalUrl
    });
  }

  res.set('ETag', `"${nfInstanceID}-${Date.now()}"`);
  res.status(200).json(profile);
});

router.put('/:nfInstanceID', validateContentType(['application/json']), validate({ params: PathParamSchema, body: NFProfileSchema }), validateToken, async (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;
  const profile = req.body;

  if (profile.nfInstanceId && profile.nfInstanceId !== nfInstanceID) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'nfInstanceId in body does not match path parameter',
      instance: req.originalUrl
    });
  }

  profile.nfInstanceId = nfInstanceID;

  const isUpdate = await nfStore.has(nfInstanceID);

  await nfStore.set(nfInstanceID, profile);

  await heartbeatService.recordHeartbeat(nfInstanceID, profile.heartBeatTimer);

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  const nfInstanceUri = `${baseUrl}/${nfInstanceID}`;

  await notificationService.sendNotifications(
    profile,
    'NF_REGISTERED',
    nfInstanceUri
  );

  const etag = `"${nfInstanceID}-${Date.now()}"`;
  res.set('ETag', etag);

  if (isUpdate) {
    res.status(200).json(profile);
  } else {
    res.set('Location', nfInstanceUri);
    res.status(201).json(profile);
  }
});

router.patch('/:nfInstanceID', validateContentType(['application/json-patch+json', 'application/json']), validate({ params: PathParamSchema, body: PatchArraySchema }), validateToken, async (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;
  const patchOperations: PatchItem[] = req.body;

  const profile = await nfStore.get(nfInstanceID);

  if (!profile) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `NF Instance with ID ${nfInstanceID} not found`,
      instance: req.originalUrl
    });
  }

  const ifMatch = req.get('If-Match');
  if (ifMatch) {
    const currentEtag = `"${nfInstanceID}-${profile.nfInstanceId}"`;
    if (ifMatch !== currentEtag && ifMatch !== '*') {
      return res.status(412).json({
        type: 'application/problem+json',
        title: 'Precondition Failed',
        status: 412,
        detail: 'If-Match header does not match current resource ETag',
        instance: req.originalUrl
      });
    }
  }

  try {
    const patchResult = jsonpatch.applyPatch(profile, patchOperations);

    if (patchResult.newDocument) {
      await nfStore.set(nfInstanceID, patchResult.newDocument);

      await heartbeatService.recordHeartbeat(nfInstanceID, patchResult.newDocument.heartBeatTimer);

      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
      const nfInstanceUri = `${baseUrl}/${nfInstanceID}`;

      await notificationService.sendNotifications(
        patchResult.newDocument,
        'NF_PROFILE_CHANGED',
        nfInstanceUri,
        patchOperations
      );

      const etag = `"${nfInstanceID}-${Date.now()}"`;
      res.set('ETag', etag);
      res.status(200).json(patchResult.newDocument);
    } else {
      return res.status(400).json({
        type: 'application/problem+json',
        title: 'Bad Request',
        status: 400,
        detail: 'Failed to apply patch operations',
        instance: req.originalUrl
      });
    }
  } catch (error) {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: error instanceof Error ? error.message : 'Invalid patch operations',
      instance: req.originalUrl
    });
  }
});

router.delete('/:nfInstanceID', validate({ params: PathParamSchema }), validateToken, async (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;

  const profile = await nfStore.get(nfInstanceID);

  if (!profile) {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `NF Instance with ID ${nfInstanceID} not found`,
      instance: req.originalUrl
    });
  }

  await nfStore.delete(nfInstanceID);

  await heartbeatService.deleteHeartbeat(nfInstanceID);

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  const nfInstanceUri = `${baseUrl}/${nfInstanceID}`;

  await notificationService.sendNotifications(
    profile,
    'NF_DEREGISTERED',
    nfInstanceUri
  );

  res.status(204).send();
});

export default router;
