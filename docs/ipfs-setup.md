# IPFS Setup Documentation

This document outlines the setup and configuration for IPFS integration in the Supply Chain Tracker application.

## Local Development Setup

The application uses Docker to run a local IPFS node for development. This ensures a consistent environment and avoids dependency on public IPFS gateways.

### Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js and npm/yarn for the application

### Configuration

The following environment variables are used to configure IPFS connectivity:

| Variable | Development Value | Production Value | Description |
|----------|-------------------|------------------|-------------|
| `NEXT_PUBLIC_IPFS_API_URL` | `http://localhost:5001` | Public IPFS API URL | The API endpoint for IPFS operations |
| `NEXT_PUBLIC_IPFS_GATEWAY` | `http://localhost:8080/ipfs` | Public IPFS gateway URL | The gateway URL for retrieving IPFS content |

These variables are set in the `.env.local` file.

## Running the IPFS Node

1. Ensure you have the `docker-compose.yml` file in the project root
2. Start the IPFS services:
   ```bash
   docker-compose up -d
   ```
3. Verify the services are running:
   ```bash
   docker-compose ps
   ```

The IPFS daemon will be available at `http://localhost:5001` for API calls and `http://localhost:8080/ipfs` for gateway access.

## Using the IPFS Client

The application uses a custom IPFS client (`ipfsClient.ts`) that automatically handles the connection based on the environment:

- In development: Connects to the local IPFS node
- In production: Connects to a configured public IPFS gateway

The client includes built-in fallback mechanisms:
- First, it tries to connect to the IPFS API directly
- If that fails, it falls back to using the gateway for read operations
- Comprehensive error handling with error codes for different failure scenarios

## Testing IPFS Integration

To test that IPFS is working correctly:

1. Start the IPFS services with `docker-compose up -d`
2. Start the application with `npm run dev`
3. Upload a document through the application's document management interface
4. Verify the file is uploaded by checking:
   - The console for successful upload messages
   - The IPFS logs: `docker-compose logs ipfs-node`
   - Accessing the file directly via the gateway URL

## Troubleshooting

### Common Issues

**IPFS node not starting**
- Check Docker is running: `docker ps`
- Check IPFS container logs: `docker-compose logs ipfs-node`
- Ensure ports 5001 and 8080 are not in use by other applications

**Connection timeout to IPFS API**
- Verify the IPFS daemon is fully started (may take 10-15 seconds)
- Check the `.env.local` file has the correct API URL
- Test API connectivity: `curl http://localhost:5001/api/v0/version`

**File not accessible via gateway**
- Ensure the IPFS hash is correct
- Verify the file was successfully pinned
- Check that the gateway service is running

## Production Deployment

For production deployment, you'll need to:

1. Configure a public IPFS API endpoint and gateway
2. Update the environment variables accordingly
3. Consider using a hosted IPFS service like:
   - Infura IPFS
   - Pinata
   - Alchemy IPFS
   - Filebase

Configure authentication if required by your IPFS service provider.