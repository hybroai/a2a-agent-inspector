# A2A Agent Inspector

## Overview

A2A Agent Inspector is a tool designed for validating and inspecting agent-to-agent communication compliance. It is built using FastAPI for the backend and Next.js for the frontend, providing a seamless experience for users to monitor and manage AI agents.

## Features

- **Agent Communication Inspection**: Validate the communication protocols between AI agents.
- **Compliance Validation**: Ensure that agents adhere to specified communication standards.
- **User-Friendly Interface**: A responsive frontend built with Next.js for easy interaction.
- **Real-Time Monitoring**: Monitor agent interactions in real-time.

## Quick Start with Docker

The easiest way to deploy A2A Agent Inspector is using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine

### Build and Run

```bash
# Build the Docker image
./docker.sh build

# Run the container
./docker.sh run
```

Or use Docker commands directly:

```bash
# Build
docker build -t a2a-agent-inspector .

# Run
docker run -d -p 3000:3000 --name a2a-inspector a2a-agent-inspector
```

### Custom Port

```bash
# Using the script
PORT=8080 ./docker.sh run

# Or with Docker
docker run -d -p 8080:3000 --name a2a-inspector a2a-agent-inspector
```

### Access the Application

| Endpoint     | URL                          |
| ------------ | ---------------------------- |
| Web UI       | http://localhost:3000        |
| API Docs     | http://localhost:3000/docs   |
| Health Check | http://localhost:3000/health |

### Container Management

```bash
# View logs
./docker.sh logs
# or
docker logs -f a2a-inspector

# Stop the container
./docker.sh stop
# or
docker stop a2a-inspector

# Check container status
docker ps | grep a2a-inspector
```

## Local Development

For local development without Docker, see the setup instructions in the respective directories:

- [Backend Setup](./backend/README.md) - FastAPI backend
- [Frontend Setup](./frontend/README.md) - Next.js frontend

## Contributing

Contributions are welcome! Please see the contributing guidelines for more information.

## License

This project is licensed under the MIT License.
