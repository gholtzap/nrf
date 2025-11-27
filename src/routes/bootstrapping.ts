import { Router, Request, Response } from 'express';
import { BootstrappingInfo } from '../types/bootstrappingInfo';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUri = `${protocol}://${host}`;

  const bootstrappingInfo: BootstrappingInfo = {
    nrfNfMgmtUri: `${baseUri}/nnrf-nfm/v1`,
    nrfDiscUri: `${baseUri}/nnrf-disc/v1`,
    nrfAccessTokenUri: `${baseUri}/oauth2/token`,
    oauth2Required: {
      nfManagement: false,
      nfDiscovery: false
    }
  };

  res.set('Content-Type', 'application/json');
  res.status(200).json(bootstrappingInfo);
});

export default router;
