

# Auto-Generated Product Tour Video + Demo Mode

## Overview
Create a Remotion-rendered MP4 product tour video that plays in a modal when the user clicks "Watch Demo", plus wire up a "Try Demo" button for the interactive demo mode.

## Phase 1: Remotion Product Tour Video

### Creative Direction
- **Palette**: Electric blue (#3B82F6), Neon purple (#8B5CF6), Cyber cyan (#00FFFF), dark backgrounds (#0F172A)
- **Fonts**: Inter (display) + JetBrains Mono (code/labels) — matching the app's brand
- **Motion style**: Tech Product — crisp snappy transitions, dark UI aesthetic, code-inspired grids
- **Duration**: ~20 seconds at 30fps (600 frames)

### Scenes (5 scenes, ~4s each)
1. **Hero Intro** — "Automate Everything. Build Anything." title reveal with animated workflow nodes appearing
2. **Node Library** — Showcase 21 node types flying into a grid (Triggers, Actions, Logic, AI categories)
3. **Workflow Canvas** — Animated mock canvas showing nodes connecting (Lead Gen flow: Webhook → AI → Filter → Email)
4. **AI Assistant** — Show a chat bubble typing "Build me a lead gen workflow" and nodes auto-generating
5. **Closing** — Stats (10K+ workflows, 500+ integrations, 99.9% uptime) with "Start Building Free" CTA text

### Files to Create
- `remotion/` — full Remotion project (src/Root.tsx, src/MainVideo.tsx, src/scenes/Scene1-5.tsx, scripts/render-remotion.mjs)
- Final MP4 rendered to `public/demo-video.mp4` (bundled with the app)

## Phase 2: Video Modal Component

### New file: `src/components/landing/DemoVideoModal.tsx`
- Dialog/modal that opens when "Watch Demo" is clicked
- Plays the MP4 video with native HTML5 `<video>` controls
- Close button overlay

### Modified file: `src/components/landing/HeroSection.tsx`
- "Watch Demo" button opens the modal instead of navigating to `/workflow/new`

## Phase 3: Interactive Demo Mode

### New files (from previous approved plan)
- `src/contexts/DemoContext.tsx` — mock user + mock data provider
- `src/components/demo/DemoBanner.tsx` — persistent "You're in demo mode" banner

### Modified files
- `src/App.tsx` — add `/demo` and `/demo/workflow/:id` routes
- `src/components/landing/HeroSection.tsx` — add "Try It Free" button linking to `/demo`
- `src/components/landing/CTASection.tsx` — add "Try Demo" button
- `src/pages/Dashboard.tsx` — check `isDemo`, show mock workflows
- `src/pages/WorkflowEditor.tsx` — check `isDemo`, skip Supabase calls

## Implementation Order
1. Build and render the Remotion video (~20s product tour)
2. Add the video modal component to the landing page
3. Implement the interactive demo mode with mock data

## Technical Notes
- Video is rendered once via Remotion CLI and saved as a static asset — no runtime rendering cost
- The demo mode uses only client-side state (Zustand store) with no Supabase calls
- Pre-populated with 3 sample workflows: Lead Generation, Content Pipeline, AI Assistant

