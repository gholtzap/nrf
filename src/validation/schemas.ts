import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const UuidSchema = z.string().regex(uuidRegex, 'Invalid UUID format');

export const PlmnIdSchema = z.object({
  mcc: z.string().regex(/^\d{3}$/, 'MCC must be 3 digits'),
  mnc: z.string().regex(/^\d{2,3}$/, 'MNC must be 2 or 3 digits'),
});

export const SNssaiSchema = z.object({
  sst: z.number().int().min(0).max(255),
  sd: z.string().regex(/^[0-9A-Fa-f]{6}$/).optional(),
});

export const TaiSchema = z.object({
  plmnId: PlmnIdSchema,
  tac: z.string().regex(/^[0-9A-Fa-f]{6}$/, 'TAC must be 6 hex digits'),
});

export const GuamiSchema = z.object({
  plmnId: PlmnIdSchema,
  amfId: z.string().regex(/^[0-9A-Fa-f]{6}$/, 'AMF ID must be 6 hex digits'),
});

const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

export const IpEndPointSchema = z.object({
  ipv4Address: z.string().regex(ipv4Regex, 'Invalid IPv4 address').optional(),
  ipv6Address: z.string().regex(ipv6Regex, 'Invalid IPv6 address').optional(),
  transport: z.enum(['TCP', 'UDP']).optional(),
  port: z.number().int().min(1).max(65535).optional(),
}).refine(
  (data) => data.ipv4Address || data.ipv6Address,
  { message: 'Either ipv4Address or ipv6Address must be provided' }
);

export const ApiVersionSchema = z.object({
  apiVersionInUri: z.string().min(1),
  apiFullVersion: z.string().min(1),
});

export const NFServiceSchema = z.object({
  serviceInstanceId: UuidSchema,
  serviceName: z.string().min(1),
  setId: z.string().optional(),
  versions: z.array(ApiVersionSchema).min(1),
  scheme: z.enum(['http', 'https']),
  nfServiceStatus: z.enum(['REGISTERED', 'SUSPENDED', 'UNDISCOVERABLE']),
  fqdn: z.string().optional(),
  ipEndPoints: z.array(IpEndPointSchema).optional(),
  allowedPlmns: z.array(PlmnIdSchema).optional(),
  capacity: z.number().int().min(0).max(65535).optional(),
  load: z.number().int().min(0).max(100).optional(),
  priority: z.number().int().min(0).max(65535).optional(),
});

export const NFProfileSchema = z.object({
  nfInstanceId: UuidSchema,
  nfType: z.string().min(1),
  nfStatus: z.enum(['REGISTERED', 'SUSPENDED', 'UNDISCOVERABLE']),
  heartBeatTimer: z.number().int().min(0).optional(),
  nfSetId: z.string().optional(),
  plmnList: z.array(PlmnIdSchema).optional(),
  sNssais: z.array(SNssaiSchema).optional(),
  nsiList: z.array(z.string()).optional(),
  taiList: z.array(TaiSchema).optional(),
  fqdn: z.string().optional(),
  ipv4Addresses: z.array(z.string().regex(ipv4Regex, 'Invalid IPv4 address')).optional(),
  ipv6Addresses: z.array(z.string().regex(ipv6Regex, 'Invalid IPv6 address')).optional(),
  allowedPlmns: z.array(PlmnIdSchema).optional(),
  allowedNfTypes: z.array(z.string()).optional(),
  allowedNssais: z.array(SNssaiSchema).optional(),
  dnnList: z.array(z.string()).optional(),
  capacity: z.number().int().min(0).max(65535).optional(),
  load: z.number().int().min(0).max(100).optional(),
  locality: z.string().optional(),
  priority: z.number().int().min(0).max(65535).optional(),
  nfServices: z.array(NFServiceSchema).optional(),
  nfProfileChangesSupportInd: z.boolean().optional(),
  nfProfileChangesInd: z.boolean().optional(),
  guamiList: z.array(GuamiSchema).optional(),
  amfSetId: z.string().regex(/^[0-9A-Fa-f]{3}$/).optional(),
  amfRegionId: z.string().regex(/^[0-9A-Fa-f]{2}$/).optional(),
});

export const NFProfileCreateSchema = z.object({
  nfInstanceId: UuidSchema.optional(),
  nfType: z.string().min(1),
  nfStatus: z.enum(['REGISTERED', 'SUSPENDED', 'UNDISCOVERABLE']),
  heartBeatTimer: z.number().int().min(0).optional(),
  nfSetId: z.string().optional(),
  plmnList: z.array(PlmnIdSchema).optional(),
  sNssais: z.array(SNssaiSchema).optional(),
  nsiList: z.array(z.string()).optional(),
  taiList: z.array(TaiSchema).optional(),
  fqdn: z.string().optional(),
  ipv4Addresses: z.array(z.string().regex(ipv4Regex, 'Invalid IPv4 address')).optional(),
  ipv6Addresses: z.array(z.string().regex(ipv6Regex, 'Invalid IPv6 address')).optional(),
  allowedPlmns: z.array(PlmnIdSchema).optional(),
  allowedNfTypes: z.array(z.string()).optional(),
  allowedNssais: z.array(SNssaiSchema).optional(),
  dnnList: z.array(z.string()).optional(),
  capacity: z.number().int().min(0).max(65535).optional(),
  load: z.number().int().min(0).max(100).optional(),
  locality: z.string().optional(),
  priority: z.number().int().min(0).max(65535).optional(),
  nfServices: z.array(NFServiceSchema).optional(),
  nfProfileChangesSupportInd: z.boolean().optional(),
  nfProfileChangesInd: z.boolean().optional(),
  guamiList: z.array(GuamiSchema).optional(),
  amfSetId: z.string().regex(/^[0-9A-Fa-f]{3}$/).optional(),
  amfRegionId: z.string().regex(/^[0-9A-Fa-f]{2}$/).optional(),
});

export const PatchItemSchema = z.object({
  op: z.enum(['add', 'remove', 'replace', 'move', 'copy', 'test']),
  path: z.string().min(1),
  value: z.any().optional(),
  from: z.string().optional(),
}).refine(
  (data) => {
    if (data.op === 'add' || data.op === 'replace' || data.op === 'test') {
      return data.value !== undefined;
    }
    if (data.op === 'move' || data.op === 'copy') {
      return data.from !== undefined;
    }
    return true;
  },
  { message: 'Invalid patch operation: missing required fields' }
);

export const PatchArraySchema = z.array(PatchItemSchema).min(1);

export const NotificationEventTypeSchema = z.enum([
  'NF_REGISTERED',
  'NF_DEREGISTERED',
  'NF_PROFILE_CHANGED',
  'NF_STATUS_CHANGED',
]);

export const SubscriptionDataSchema = z.object({
  nfStatusNotificationUri: z.string().url(),
  subscriptionId: UuidSchema.optional(),
  reqNfInstanceId: UuidSchema.optional(),
  sharedDataIds: z.array(z.string()).optional(),
  subscrCond: z.any().optional(),
  validityTime: z.string().optional(),
  reqNotifEvents: z.array(NotificationEventTypeSchema).optional(),
  plmnId: PlmnIdSchema.optional(),
  nid: z.string().optional(),
  notifCondition: z.any().optional(),
  reqNfType: z.string().optional(),
  reqNfFqdn: z.string().optional(),
  reqSnssais: z.array(z.any()).optional(),
  reqPerPlmnSnssais: z.array(z.any()).optional(),
  reqPlmnList: z.array(PlmnIdSchema).optional(),
  reqSnpnList: z.array(z.any()).optional(),
  servingScope: z.array(z.string()).optional(),
  requesterFeatures: z.string().optional(),
  nrfSupportedFeatures: z.string().optional(),
  hnrfUri: z.string().url().optional(),
  onboardingCapability: z.boolean().optional(),
  targetHni: z.string().optional(),
  preferredLocality: z.string().optional(),
  extPreferredLocality: z.record(z.string(), z.array(z.any())).optional(),
  completeProfileSubscription: z.boolean().optional(),
});

export const AccessTokenRequestSchema = z.object({
  grant_type: z.literal('client_credentials'),
  nfInstanceId: UuidSchema,
  nfType: z.string().optional(),
  targetNfType: z.string().optional(),
  scope: z.string().min(1),
  requesterPlmn: PlmnIdSchema.optional(),
  targetPlmn: PlmnIdSchema.optional(),
});

export const SharedDataSchema = z.record(z.string(), z.any()).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Shared data cannot be empty' }
);

export const NFDiscoveryQuerySchema = z.object({
  'target-nf-type': z.string().optional(),
  'requester-nf-type': z.string().optional(),
  'service-names': z.string().optional(),
  'limit': z.string().regex(/^\d+$/).transform(Number).optional(),
  'offset': z.string().regex(/^\d+$/).transform(Number).optional(),
  'dnn': z.string().optional(),
  'snssais': z.string().optional(),
  'plmn-id': z.string().optional(),
  'tai': z.string().optional(),
  'amf-region-id': z.string().optional(),
  'amf-set-id': z.string().optional(),
  'guami': z.string().optional(),
  'preferred-locality': z.string().optional(),
  'supi': z.string().optional(),
  'ue-ipv4-address': z.string().regex(ipv4Regex, 'Invalid IPv4 address').optional(),
  'ue-ipv6-prefix': z.string().optional(),
  'data-set': z.string().optional(),
  'routing-indicator': z.string().optional(),
  'group-id-list': z.string().optional(),
  'nf-set-id': z.string().optional(),
  'nf-service-set-id': z.string().optional(),
  'requester-nf-instance-id': UuidSchema.optional(),
  'target-nf-instance-id': UuidSchema.optional(),
  'target-nf-fqdn': z.string().optional(),
});

export const NFInstancesQuerySchema = z.object({
  'nf-type': z.string().optional(),
  'limit': z.string().regex(/^\d+$/).transform(Number).optional(),
  'offset': z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const PathParamSchema = z.object({
  nfInstanceID: UuidSchema,
});

export const SubscriptionPathParamSchema = z.object({
  subscriptionID: UuidSchema,
});

export const SharedDataPathParamSchema = z.object({
  sharedDataId: z.string().min(1),
});
