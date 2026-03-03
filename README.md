# CrowdFlow

A real-time, interactive crowd simulation engine that runs entirely in the browser. CrowdFlow models autonomous agent behavior using custom-built physics, pathfinding, and steering systems — with zero external simulation dependencies.

**[Live Demo](https://crowdflow-sim.vercel.app)**

## Features

- **Real-time simulation** of hundreds of agents with 60Hz fixed-timestep physics
- **Preset scenarios** — evacuation, concert venue, maze, bottleneck, counterflow, and multi-floor layouts
- **Interactive editor** — draw walls, place exits, drop hazards, and add attractors directly on the canvas
- **Visualization overlays** — heatmaps, flow fields, agent trails, velocity vectors, and grid
- **Simulation controls** — play/pause, speed adjustment, step-forward debugging, and timeline scrubbing
- **Session tracking** — analytics dashboard with session history and data export
- **Custom scenarios** — save and load your own environment configurations

## Tech Stack

- **React** + **TypeScript** — UI and type safety
- **Vite** — build tooling and dev server
- **Tailwind CSS** — styling
- **HTML5 Canvas** — 4-layer rendering system (no graphics libraries)
- **Custom engine** — all physics, collision detection, pathfinding (BFS flow fields), and steering behaviors (7 total) are built from scratch

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
git clone https://github.com/AKhubcher/CrowdFlow.git
cd CrowdFlow
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── engine/          # Core simulation (physics, collision, steering, pathfinding)
├── renderer/        # Canvas rendering layers and camera system
├── bridge/          # React ↔ Engine connection (hooks + controller)
├── pages/           # Landing, Simulator, How It Works, Dashboard, Scenarios, About
├── presets/         # Built-in scenario configurations
├── components/      # Reusable UI components
└── hooks/           # Custom React hooks
```

## Architecture

CrowdFlow uses a decoupled architecture with three independent layers:

1. **Engine** — runs the simulation loop, agent logic, and physics with no React dependencies
2. **Renderer** — draws to 4 stacked HTML5 canvases (environment, agents, overlays, UI)
3. **Bridge** — connects React state to the engine via a controller and custom hooks

Performance is driven by a spatial hash grid for O(n) neighbor lookups, pooled agent allocation, and selective layer redraws.

## License

MIT
