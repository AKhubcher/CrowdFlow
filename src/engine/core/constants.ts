// Physics
export const FIXED_DT = 1 / 60; // 16.67ms
export const DEFAULT_MAX_SPEED = 2.0;
export const DEFAULT_MAX_FORCE = 0.15;
export const DEFAULT_AGENT_RADIUS = 5;
export const DEFAULT_AGENT_MASS = 1.0;

// Steering weights
export const WEIGHT_GOAL = 1.0;
export const WEIGHT_SEPARATION = 2.5;
export const WEIGHT_ALIGNMENT = 0.3;
export const WEIGHT_WALL_AVOIDANCE = 3.0;
export const WEIGHT_HAZARD_AVOIDANCE = 4.0;
export const WEIGHT_ATTRACTOR_PULL = 0.5;
export const WEIGHT_NOISE = 0.0;

// Steering radii
export const SEPARATION_RADIUS = 25;
export const ALIGNMENT_RADIUS = 50;
export const WALL_AVOIDANCE_DISTANCE = 30;
export const HAZARD_AVOIDANCE_DISTANCE = 80;

// Spatial hash
export const SPATIAL_CELL_SIZE = 50; // ~2x interaction radius

// Stress
export const STRESS_INCREASE_DENSITY = 0.005;
export const STRESS_INCREASE_HAZARD = 0.01;
export const STRESS_INCREASE_PANIC = 0.008;
export const STRESS_DECREASE_OPEN = 0.003;
export const STRESS_DECREASE_PROGRESS = 0.002;
export const STRESS_FREEZE_THRESHOLD = 0.8;

// Rendering
export const STATS_POLL_INTERVAL = 100; // ms (10fps)
export const HEATMAP_UPDATE_INTERVAL = 10; // frames
export const TRAIL_LENGTH = 20;
export const TRAIL_FADE = 0.92;

// Snapshots
export const SNAPSHOT_INTERVAL = 60; // frames (1/sec at 60fps)
export const SNAPSHOT_BUFFER_SIZE = 60; // 60 seconds max

// World defaults
export const DEFAULT_WORLD_WIDTH = 1200;
export const DEFAULT_WORLD_HEIGHT = 800;

// Flow field
export const FLOW_FIELD_RESOLUTION = 10; // pixels per cell

// Colors
export const AGENT_COLOR_CALM = '#06b6d4';
export const AGENT_COLOR_STRESSED = '#f97316';
export const AGENT_COLOR_PANIC = '#ef4444';
export const WALL_COLOR = '#64748b';
export const EXIT_COLOR = '#10b981';
export const HAZARD_COLOR = '#ef4444';
export const ATTRACTOR_COLOR = '#8b5cf6';
