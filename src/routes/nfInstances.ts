import { Router, Request, Response } from 'express';
import { nfStore } from '../storage/nfStore';
import { UriList } from '../types/uriList';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { 'nf-type': nfType, limit, 'page-number': pageNumber, 'page-size': pageSize } = req.query;

  let profiles = nfStore.getAll();

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

router.get('/:nfInstanceID', (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;

  const profile = nfStore.get(nfInstanceID);

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

router.put('/:nfInstanceID', (req: Request, res: Response) => {
  const { nfInstanceID } = req.params;
  const profile = req.body;

  if (!profile || typeof profile !== 'object') {
    return res.status(400).json({
      type: 'application/problem+json',
      title: 'Bad Request',
      status: 400,
      detail: 'Request body must contain a valid NFProfile',
      instance: req.originalUrl
    });
  }

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

  const isUpdate = nfStore.has(nfInstanceID);

  nfStore.set(nfInstanceID, profile);

  const etag = `"${nfInstanceID}-${Date.now()}"`;
  res.set('ETag', etag);

  if (isUpdate) {
    res.status(200).json(profile);
  } else {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    res.set('Location', `${baseUrl}/${nfInstanceID}`);
    res.status(201).json(profile);
  }
});

export default router;
