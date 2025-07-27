# A2A Agent Inspector

Agent-to-Agent Communication Compliance Validation Service

## Overview

A2A Agent Inspector is a FastAPI-based service designed to validate and inspect agent-to-agent communication compliance. It provides APIs for monitoring, validating, and ensuring proper communication protocols between AI agents in the A2A network.

## Features

- 🔍 Agent communication inspection
- ✅ Compliance validation
- 🌐 RESTful API interface
- 🚀 Fast and lightweight
- 📊 Real-time monitoring

## Prerequisites

- Python 3.11 or higher
- [uv](https://docs.astral.sh/uv/) package manager

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd backend/src/a2a_inspector
```

2. Install dependencies using uv:

```bash
uv sync
```

## Quick Start

### Production Mode

Start the A2A Inspector service:

```bash
uv run .
```

The service will be available at `http://localhost:8000`

### Development Mode

For development with auto-reload:

```bash
uv run . dev
```
