# AtlasShift

> Architecture-level code migrations with automatic invariant mining

AtlasShift is a production-grade tool for performing safe, architecture-level code transformations. It uses a Planner-driven approach with automatic invariant mining to ensure transformations preserve code correctness.

## Product Pitch

**The Problem**: Refactoring large codebases is risky. Manual migrations are error-prone, and automated tools often break code because they don't understand architectural constraints.

**The Solution**: AtlasShift uses graph-based analysis to understand your codebase structure, automatically discovers invariants that must be preserved, and creates safe migration plans that refuse unsafe transformations.

**Why AtlasShift?**
- ✅ **Safe by default**: Invariant gate prevents breaking changes
- ✅ **Architecture-aware**: Understands code structure, not just syntax
- ✅ **Extensible**: Recipe system for custom transformations
- ✅ **Production-ready**: Built with reliability and testability in mind

## Features

- **Planner-driven migrations**: Architecture-level transformations guided by a planning system
- **Automatic Invariant Mining**: Discovers and validates code invariants before applying changes
- **Invariant Gate**: Refuses unsafe transformations that would violate discovered invariants
- **Recipe System**: Extensible recipe engine for defining migration patterns

## Quick Start

### Prerequisites

- Node.js 24+ 
- pnpm 9+

### Installation

```bash
pnpm install
```

**Note:** If you're setting up the project for the first time, the `pnpm-lock.yaml` file may be a placeholder. Run `pnpm install` to generate the full lockfile, then commit it.

### Development

Start the development server and web UI:

```bash
pnpm dev
```

This starts:
- Server API at `http://localhost:3001`
- Web UI at `http://localhost:3000`

### CLI Usage

```bash
pnpm atlisshift --help
pnpm atlisshift plan ./fixtures/example-repo
```

## Project Structure

```
atlasshift/
├── apps/
│   └── web/          # Next.js web UI
├── packages/
│   ├── core/         # Graphs, planners, invariants, recipe engine
│   ├── cli/          # Command line interface
│   ├── server/       # Local API, job runner, websocket progress
│   └── shared/       # Shared types, Zod schemas
├── fixtures/
│   └── example-repo/ # Example target repository for testing
```

## Architecture

```
┌─────────────┐
│   Recipe    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Planner   │────▶│  Invariant   │
└──────┬──────┘     │    Miner     │
       │            └──────┬───────┘
       ▼                   │
┌─────────────┐            │
│  Graph      │◀───────────┘
│  Builder    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Transform  │
└─────────────┘
```

## Development

### Running Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm typecheck
```

## Docker

Run with Docker Compose:

```bash
docker-compose up
```

This starts both the server and web UI in containers.

## CI/CD

The project uses GitHub Actions for CI. The workflow runs:
- Linting and type checking
- Unit tests
- Build verification

## Troubleshooting

### Port conflicts

If ports 3000 or 3001 are in use, you can change them:
- Server: Set `PORT` environment variable
- Web: Update `NEXT_PUBLIC_API_URL` and Next.js port

### Build errors

Make sure all dependencies are installed:
```bash
pnpm install
```

### Type errors

Run type checking to see detailed errors:
```bash
pnpm typecheck
```

## Roadmap

### Phase 1: Core Foundation ✅
- [x] Graph-based code analysis
- [x] Invariant mining and validation
- [x] Planning system
- [x] Recipe engine
- [x] CLI and web UI

### Phase 2: Enhanced Analysis
- [ ] Type-aware graph building
- [ ] Cross-language support (Python, Java)
- [ ] Advanced pattern detection
- [ ] Machine learning for invariant discovery

### Phase 3: Enterprise Features
- [ ] Multi-repository migrations
- [ ] Incremental migration support
- [ ] Rollback capabilities
- [ ] Migration history and audit logs

### Phase 4: Ecosystem
- [ ] Recipe marketplace
- [ ] IDE integrations
- [ ] CI/CD plugins
- [ ] Community-contributed recipes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
