# CrowdFlow

A real-time, interactive crowd simulation engine that runs entirely in the browser. CrowdFlow models autonomous agent behavior using custom-built physics, pathfinding, and steering systems — with zero external simulation dependencies.

**[Live Demo](https://crowdflow-sim.vercel.app)**

## Features

- **Real-time simulation** of hundreds of agents with 60Hz fixed-timestep physics
- **7 steering behaviors** — goal seeking, separation, alignment, wall avoidance (3-raycast), hazard avoidance, attractor pull, and stress-scaled noise
- **Stress system** — agents shift from calm (cyan) to panicked (red) based on density, hazards, and panic mode. High stress triggers freezing behavior.
- **Preset scenarios** — evacuation, concert venue, maze, bottleneck, counterflow, and multi-floor layouts
- **Interactive editor** — draw walls, place exits, drop hazards, and add attractors with per-tool custom cursors
- **Live parameter tuning** — adjust steering weights, max speed, and behavior in real time via sliders
- **Visualization overlays** — density heatmap, flow field arrows, agent trails, velocity vectors, spatial grid, and bottleneck detection
- **Analytics** — evacuation sparkline chart, flow rate, bottleneck highlighting, and click-to-trace individual agent paths
- **Panic mode** — toggle on any scenario to increase speed, widen separation, add noise, and trigger freeze events
- **Timeline scrubbing** — rewind and replay simulation history via snapshot playback
- **Session tracking** — analytics dashboard with session history and CSV export
- **Custom scenarios** — save and load your own environment configurations

## Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero with live background simulation, feature highlights, metrics ticker, embedded mini-sim |
| Simulator | `/simulator` | Full interactive simulation with control panel, overlays, and editor tools |
| How It Works | `/how-it-works` | Interactive demos for steering behaviors, spatial hashing (with brute-force FPS comparison), and a clickable agent decision flowchart |
| Scenarios | `/scenarios` | Browse and launch preset scenarios or load custom ones |
| Dashboard | `/dashboard` | Session history, per-scenario stats, and data export |
| About | `/about` | Project motivation, architecture overview, and creator bio |

## Tech Stack

- **React 18** + **TypeScript** — UI and type safety
- **Vite** — build tooling and dev server
- **Tailwind CSS** — styling
- **HTML5 Canvas** — 4-layer rendering system (no graphics libraries)
- **Custom engine** — all physics, collision detection, pathfinding (BFS flow fields), and steering behaviors are built from scratch

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
│   ├── core/        # Agent, Engine, World, types, constants, stress system
│   ├── steering/    # 7 steering behaviors + SteeringManager
│   ├── collision/   # Agent-agent and agent-wall collision resolution
│   ├── pathfinding/ # BFS flow field + exit selector with crowding penalty
│   ├── spatial/     # Spatial hash grid for O(n) neighbor queries
│   ├── math/        # Vec2, LineSegment, utilities
│   └── snapshot/    # Timeline snapshot manager
├── renderer/        # Canvas rendering layers and camera system
│   ├── layers/      # Environment, Agent, FlowField, Grid, Bottleneck, Overlay, UI
│   ├── effects/     # Trails, Heatmap, GlowShader
│   └── camera/      # Camera with pan/zoom
├── bridge/          # React ↔ Engine connection (hooks + controller)
├── pages/           # Landing, Simulator, How It Works, Dashboard, Scenarios, About
├── presets/         # 7 built-in scenario configurations
├── components/      # Reusable UI components
└── hooks/           # Custom React hooks
```

## Architecture

CrowdFlow uses a decoupled architecture with three independent layers:

1. **Engine** — runs the simulation loop, agent logic, and physics with no React dependencies. Could run headlessly in Node.js.
2. **Renderer** — draws to 4 stacked HTML5 canvases (environment, heatmap/overlays, agents, UI). Only redraws layers that have changed.
3. **Bridge** — connects React state to the engine via a `SimulationController` and custom hooks. UI polls stats at 10fps — never re-renders for simulation state.

Performance is driven by a spatial hash grid for O(n) neighbor lookups, zero-allocation hot loops, fixed-timestep physics, and selective layer redraws.

## License

MIT
