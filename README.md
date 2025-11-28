# NRF (Network Repository Function)

5G Core Network Repository Function implementation.

## Overview

This project implements the NRF component based on 3GPP specifications.

## Features

### IMPLEMENTED FEATURES

- NFManagement Service - Get NF Instance (GET /nnrf-nfm/v1/nf-instances/{nfInstanceID})
- NFManagement Service - Query NF Instances (GET /nnrf-nfm/v1/nf-instances)
- NFManagement Service - NF Registration (PUT /nnrf-nfm/v1/nf-instances/{nfInstanceID})
- NFManagement Service - NF Update (PATCH /nnrf-nfm/v1/nf-instances/{nfInstanceID})
- NFManagement Service - NF Deregistration (DELETE /nnrf-nfm/v1/nf-instances/{nfInstanceID})
- NFManagement Service - OPTIONS (OPTIONS /nnrf-nfm/v1/nf-instances)
- NFManagement Service - Get Shared Data (GET /nnrf-nfm/v1/shared-data/{sharedDataId})
- NFManagement Service - Register Shared Data (PUT /nnrf-nfm/v1/shared-data/{sharedDataId})
- NFManagement Service - Update Shared Data (PATCH /nnrf-nfm/v1/shared-data/{sharedDataId})
- NFManagement Service - Delete Shared Data (DELETE /nnrf-nfm/v1/shared-data/{sharedDataId})
- Subscription Service - Create Subscription (POST /nnrf-nfm/v1/subscriptions)
- Subscription Service - Update Subscription (PATCH /nnrf-nfm/v1/subscriptions/{subscriptionID})
- Subscription Service - Delete Subscription (DELETE /nnrf-nfm/v1/subscriptions/{subscriptionID})
- Subscription Service - Get Subscription (GET /nnrf-nfm/v1/subscriptions/{subscriptionID})
- NFDiscovery Service - Search NF Instances (GET /nnrf-disc/v1/nf-instances)
- NFDiscovery Service - Get NF Instance by ID (GET /nnrf-disc/v1/nf-instances/{nfInstanceID})
- Bootstrapping Service - Get Bootstrapping Info (GET /bootstrapping)
- AccessToken Service - Request Access Token (POST /oauth2/token)
- OAuth2 token generation and validation
- Heartbeat reception and processing
- NF health status monitoring
- Automatic deregistration on heartbeat timeout
- Configurable heartbeat intervals
- Grace period handling
- PLMN ID filtering
- S-NSSAI filtering
- TAI filtering
- DNN filtering
- Capacity and priority-based selection
- Locality-based selection
- NF set/service set support

### NOT IMPLEMENTED FEATURES

#### Core NRF Services (3GPP TS 29.510)

#### Data Models & Storage
- NFProfile data structure (all NF types: AMF, SMF, UPF, AUSF, UDM, UDR, PCF, NSSF, NEF, CHF, etc.)
- NFService data structure
- SubscriptionData data structure
- In-memory database/storage system
- Persistent storage option (MongoDB)
- NF Instance ID generation and validation
- TTL and expiry management for NF registrations
- Heartbeat timer management

#### Search & Discovery Features
- Complex query parameter parsing and filtering
- NF type filtering
- Service name filtering
- AMF Set/Region filtering
- GUAMI filtering

#### HTTP/2 & REST Infrastructure
- HTTP/2 server setup
- RESTful API routing framework
- Request validation middleware
- Response formatting (application/json, application/problem+json)
- Error handling and problem details (RFC 7807)
- CORS support
- Rate limiting
- Request logging

#### Authentication & Security
- NF authentication via OAuth2
- TLS/mTLS support
- Certificate management
- Signature verification

#### Notification System
- Event subscription handling
- Webhook-based notifications
- NF status change notifications (REGISTERED, SUSPENDED, UNDISCOVERABLE)
- NF profile change notifications
- Retry mechanism for failed notifications
- Notification correlation ID tracking

#### Configuration Management
- YAML/JSON configuration file support
- Environment variable configuration
- NRF instance configuration (FQDN, IP, port)
- Database connection configuration
- Security configuration (TLS certs, OAuth settings)
- Heartbeat timer configuration
- Log level configuration

#### 3GPP Compliance Features
- Support for all NF types defined in TS 23.501
- API versioning support (v1, v2, etc.)
- Custom vendor extensions support
- Compliance with TS 29.510 specifications
- Compliance with TS 29.500 (general 5G SBI)
- Support for indirect communication (via SCP)
