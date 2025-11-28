import { Router, Request, Response } from 'express';
import { nfStore } from '../storage/nfStore';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const {
    'target-nf-type': targetNfType,
    'requester-nf-type': requesterNfType,
    'service-names': serviceNames,
    'nf-set-id': nfSetId,
    'service-set-id': serviceSetId,
    'limit': limit,
    'plmn-id': plmnId,
    'snssai': snssai,
    'tai': tai,
    'dnn': dnn,
    'preferred-locality': preferredLocality,
    'min-capacity': minCapacity
  } = req.query;

  let profiles = await nfStore.getAll();

  profiles = profiles.filter(profile => profile.nfStatus === 'REGISTERED');

  if (targetNfType && typeof targetNfType === 'string') {
    profiles = profiles.filter(profile => profile.nfType === targetNfType);
  }

  if (nfSetId && typeof nfSetId === 'string') {
    profiles = profiles.filter(profile => profile.nfSetId === nfSetId);
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

  if (serviceSetId && typeof serviceSetId === 'string') {
    profiles = profiles.filter(profile => {
      if (!profile.nfServices || profile.nfServices.length === 0) {
        return false;
      }
      return profile.nfServices.some(nfService => nfService.setId === serviceSetId);
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

  if (plmnId && typeof plmnId === 'string') {
    const [mcc, mnc] = plmnId.split('-');
    if (mcc && mnc) {
      profiles = profiles.filter(profile => {
        if (!profile.plmnList || profile.plmnList.length === 0) {
          return false;
        }
        return profile.plmnList.some(plmn => plmn.mcc === mcc && plmn.mnc === mnc);
      });
    }
  }

  if (snssai && typeof snssai === 'string') {
    const snssaiParts = snssai.split('-');
    const sst = parseInt(snssaiParts[0], 10);
    const sd = snssaiParts[1];
    if (!isNaN(sst)) {
      profiles = profiles.filter(profile => {
        if (!profile.sNssais || profile.sNssais.length === 0) {
          return false;
        }
        return profile.sNssais.some(nssai => {
          if (nssai.sst !== sst) {
            return false;
          }
          if (sd && nssai.sd !== sd) {
            return false;
          }
          return true;
        });
      });
    }
  }

  if (tai && typeof tai === 'string') {
    const taiParts = tai.split('-');
    if (taiParts.length >= 3) {
      const mcc = taiParts[0];
      const mnc = taiParts[1];
      const tac = taiParts[2];
      profiles = profiles.filter(profile => {
        if (!profile.taiList || profile.taiList.length === 0) {
          return false;
        }
        return profile.taiList.some(taiEntry =>
          taiEntry.plmnId.mcc === mcc &&
          taiEntry.plmnId.mnc === mnc &&
          taiEntry.tac === tac
        );
      });
    }
  }

  if (dnn && typeof dnn === 'string') {
    profiles = profiles.filter(profile => {
      if (!profile.dnnList || profile.dnnList.length === 0) {
        return false;
      }
      return profile.dnnList.includes(dnn);
    });
  }

  if (minCapacity && typeof minCapacity === 'string') {
    const minCap = parseInt(minCapacity, 10);
    if (!isNaN(minCap)) {
      profiles = profiles.filter(profile => {
        return profile.capacity !== undefined && profile.capacity >= minCap;
      });
    }
  }

  if (preferredLocality && typeof preferredLocality === 'string') {
    profiles.sort((a, b) => {
      const aLocalityMatch = a.locality === preferredLocality;
      const bLocalityMatch = b.locality === preferredLocality;

      if (aLocalityMatch && !bLocalityMatch) return -1;
      if (!aLocalityMatch && bLocalityMatch) return 1;

      const aPriority = a.priority ?? 0;
      const bPriority = b.priority ?? 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      const aCapacity = a.capacity ?? 0;
      const bCapacity = b.capacity ?? 0;
      return bCapacity - aCapacity;
    });
  } else {
    profiles.sort((a, b) => {
      const aPriority = a.priority ?? 0;
      const bPriority = b.priority ?? 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      const aCapacity = a.capacity ?? 0;
      const bCapacity = b.capacity ?? 0;
      return bCapacity - aCapacity;
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
