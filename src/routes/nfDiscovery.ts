import { Router, Request, Response } from 'express';
import { nfStore } from '../storage/nfStore';
import { NFProfile } from '../types/nfProfile';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const {
    'target-nf-type': targetNfType,
    'requester-nf-type': requesterNfType,
    'service-names': serviceNames,
    'limit': limit
  } = req.query;

  let profiles = await nfStore.getAll();

  profiles = profiles.filter(profile => profile.nfStatus === 'REGISTERED');

  if (targetNfType && typeof targetNfType === 'string') {
    profiles = profiles.filter(profile => profile.nfType === targetNfType);
  }

  if (serviceNames && typeof serviceNames === 'string') {
    const requestedServices = serviceNames.split(',');
    profiles = profiles.filter(profile => {
      if (!profile.nfServices || profile.nfServices.length === 0) {
        return false;
      }
      return requestedServices.some(serviceName =>
        profile.nfServices!.some(nfService => nfService.serviceName === serviceName)
      );
    });
  }

  if (requesterNfType && typeof requesterNfType === 'string') {
    profiles = profiles.filter(profile => {
      if (!profile.allowedNfTypes || profile.allowedNfTypes.length === 0) {
        return true;
      }
      return profile.allowedNfTypes.includes(requesterNfType);
    });
  }

  if (profiles.length > 0 && limit && typeof limit === 'string') {
    const maxResults = parseInt(limit, 10);
    if (!isNaN(maxResults) && maxResults > 0) {
      profiles = profiles.slice(0, maxResults);
    }
  }

  res.set('Content-Type', 'application/json');
  res.status(200).json({
    validityPeriod: 3600,
    nfInstances: profiles
  });
});

router.get('/:nfInstanceID', async (req: Request, res: Response) => {
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

  if (profile.nfStatus !== 'REGISTERED') {
    return res.status(404).json({
      type: 'application/problem+json',
      title: 'Not Found',
      status: 404,
      detail: `NF Instance with ID ${nfInstanceID} is not discoverable`,
      instance: req.originalUrl
    });
  }

  res.set('Content-Type', 'application/json');
  res.status(200).json(profile);
});

export default router;
