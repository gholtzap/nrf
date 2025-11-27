import { Router, Request, Response } from 'express';
import { nfStore } from '../storage/nfStore';

const router = Router();

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

export default router;
