# MCP Bridge - Design Concept

**Design Philosophy:** Modern, professional, technical aesthetic inspired by your Examark project.

---

## Color Palette

### Primary Colors (Bridge Theme)

Based on your Examark preferences + bridge connectivity theme:

```css
/* Primary - Blue (trust, technology, connection) */
--bridge-primary: #4F46E5;        /* Indigo 600 - main brand */
--bridge-primary-light: #818CF8;  /* Indigo 400 - hover states */
--bridge-primary-dark: #3730A3;   /* Indigo 800 - active states */

/* Accent - Teal (data flow, connectivity) */
--bridge-accent: #14B8A6;         /* Teal 500 - highlights */
--bridge-accent-light: #5EEAD4;   /* Teal 300 - backgrounds */

/* Status Colors */
--bridge-success: #22C55E;        /* Green 500 - connected */
--bridge-warning: #F59E0B;        /* Amber 500 - connecting */
--bridge-error: #EF4444;          /* Red 500 - disconnected */
--bridge-info: #3B82F6;           /* Blue 500 - info states */

/* Gradients */
--bridge-gradient-primary: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
--bridge-gradient-status: linear-gradient(135deg, #22C55E 0%, #14B8A6 100%);
```

### Why These Colors?

- **Indigo** (#4F46E5): Matches your Examark primary, professional tech feel
- **Teal** (#14B8A6): Represents data flowing across the bridge
- **Success Green** (#22C55E): Same as Examark, consistent brand
- **Amber** (#F59E0B): Same as Examark accent, familiar

---

## Icon Design

### Concept: Bridge Symbol + Data Flow

**Primary Icon (128x128, 96x96, 48x48, 32x32, 16x16):**

```
┌─────────────────────────────┐
│                             │
│     💻 ←→→→ 🌉 →→→ ☁️        │
│        LOCAL ─ BRIDGE ─ WEB │
│                             │
└─────────────────────────────┐
```

**Design Elements:**

1. **Bridge Symbol**
   - Simple arch/bridge shape
   - Gradient fill (indigo → teal)
   - Clean, modern line work

2. **Data Flow Arrows**
   - Bidirectional arrows (←→)
   - Animated in UI contexts
   - Teal accent color

3. **Connection Indicators**
   - Left: Computer icon (local MCP servers)
   - Right: Cloud icon (Claude.ai)
   - Center: Bridge structure

### Size Adaptations

**128x128, 96x96:** Full scene with local/cloud/bridge
**48x48:** Bridge + arrows only
**32x32:** Simplified bridge
**16x16:** Bridge icon only (solid color)

---

## Typography

Based on your Examark preferences:

```css
/* Fonts */
--font-text: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-code: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
```

---

## Extension Popup UI

### Layout (400px × 600px)

```
┌────────────────────────────────────┐
│  🌉 MCP Bridge           [⚙️] [❌]  │  ← Header
├────────────────────────────────────┤
│  Bridge Status: ● Connected        │  ← Health Check
│  http://localhost:3000/sse         │
├────────────────────────────────────┤
│  Servers (2 active)                │  ← Server List
│  ┌──────────────────────────────┐  │
│  │ ✅ filesystem                │  │
│  │ 📁 /Users/dt                 │  │
│  │ [Edit] [Remove]              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ ✅ shell                     │  │
│  │ 🐚 execute commands          │  │
│  │ [Edit] [Remove]              │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  [+ Add Server]  [📋 Templates]   │  ← Actions
└────────────────────────────────────┘
```

### Visual Style

- **Rounded corners:** 12px
- **Shadows:** 0 4px 20px rgba(0,0,0,0.08)
- **Transitions:** 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Hover states:** translateY(-2px) + shadow increase

---

## Quick Templates UI

When user clicks "📋 Templates":

```
┌────────────────────────────────────┐
│  Quick Add Server                  │
├────────────────────────────────────┤
│  Choose a template:                │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 📁 Filesystem Server         │ │
│  │ Access local files           │ │
│  │ [Add]                        │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 🐚 Shell Server              │ │
│  │ Execute commands             │ │
│  │ [Add]                        │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 📊 Git Server                │ │
│  │ Repository operations        │ │
│  │ [Add]                        │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Cancel] [Custom Server]         │
└────────────────────────────────────┘
```

**Card Styling (matching Examark):**
- Gradient background: rgba(79, 70, 229, 0.05)
- Border: 1px solid rgba(79, 70, 229, 0.1)
- Hover: translateY(-6px) + top gradient border
- Icon: 2.5rem, colored with --bridge-primary

---

## Health Check Indicator

### States

**Connected (Green):**
```
┌─────────────────────────────────┐
│ Bridge Status: ● Connected      │
│ http://localhost:3000/sse       │
│ 2 servers active                │
└─────────────────────────────────┘
```

**Connecting (Amber):**
```
┌─────────────────────────────────┐
│ Bridge Status: ⏳ Connecting... │
│ http://localhost:3000/sse       │
│ Checking connection...          │
└─────────────────────────────────┘
```

**Disconnected (Red):**
```
┌─────────────────────────────────┐
│ Bridge Status: ⚠️ Disconnected  │
│ http://localhost:3000/sse       │
│ Start: ./mcp-bridge start       │
└─────────────────────────────────┘
```

### Visual Design
- Pulsing animation for "Connecting"
- Gradient background matching status color
- Clear action instructions when disconnected

---

## README Enhancement

### Hero Section

Update to match Examark style:

```markdown
<div align="center">

![MCP Bridge Hero](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=15,17,19,21,23&height=200&section=header&text=MCP%20Bridge&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Connect%20Claude%20→%20Local%20MCP&descAlignY=55&descSize=22&fontColor=ffffff)

[![Chrome](https://img.shields.io/badge/Chrome-Extension-4F46E5?style=flat-square&logo=googlechrome&logoColor=white)](chrome://extensions)
[![Status](https://img.shields.io/badge/Status-Active-22C55E?style=flat-square)](http://localhost:3000/health)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)](LICENSE)

**Bridge the gap between Claude.ai and your local MCP servers.**

[Quick Start](#quick-start) · [Documentation](#documentation) · [Report Bug](https://github.com/dt/mcp-bridge-extension/issues)

</div>
```

### Workflow Diagram

```markdown
## How It Works

┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Claude.ai  │ ←──→ │  MCP Bridge  │ ←──→ │ Local MCP   │
│  (Browser)  │ SSE  │  Extension   │ stdio│  Servers    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ SSE Bridge   │
                    │ localhost:   │
                    │ 3000         │
                    └──────────────┘
```

---

## Button Styles

Based on Examark:

```css
.bridge-button {
  background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
  border-radius: 12px;
  padding: 0.8rem 1.8rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bridge-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
}

.bridge-button-secondary {
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: var(--bridge-primary);
}
```

---

## Animation Concepts

### 1. Bridge Loading State

```
Data flowing across bridge (left → right → left)
→→→ 🌉 →→→
```

### 2. Connection Pulse

```css
@keyframes bridge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 3. Health Check Indicator

```css
@keyframes status-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
}
```

---

## Feature Cards

Server configuration cards matching Examark style:

```css
.server-card {
  background: linear-gradient(180deg,
    var(--bg-color) 0%,
    rgba(79, 70, 229, 0.05) 100%);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.server-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--bridge-gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.server-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.15);
}

.server-card:hover::before {
  opacity: 1;
}
```

---

## Icon Specifications

### SVG Template (Base)

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Bridge arch -->
  <path d="M20,80 Q64,20 108,80"
        stroke="url(#bridgeGradient)"
        stroke-width="12"
        fill="none"
        stroke-linecap="round"/>

  <!-- Bridge supports -->
  <rect x="16" y="80" width="8" height="30" fill="url(#bridgeGradient)"/>
  <rect x="104" y="80" width="8" height="30" fill="url(#bridgeGradient)"/>

  <!-- Data flow arrows (animated in web contexts) -->
  <path d="M30,60 L50,60 M50,55 L60,60 L50,65 Z"
        fill="#14B8A6"
        class="flow-arrow"/>
</svg>
```

### Sizes to Generate

- **128x128** - Full detail with arrows and labels
- **96x96** - Full bridge with arrows
- **48x48** - Simplified bridge shape
- **32x32** - Bridge arch only
- **16x16** - Minimal bridge icon (solid color)

---

## Implementation Priority

### Phase 1: Core Visual Identity ✅
1. **Icon Suite** - All 5 sizes in SVG + PNG
2. **Color Palette** - CSS variables defined
3. **README Hero** - Capsule render + badges

### Phase 2: Extension UI Polish
4. **Popup Redesign** - Modern card-based layout
5. **Health Check** - Visual status indicator
6. **Animations** - Smooth transitions

### Phase 3: Quick Features
7. **Templates UI** - Quick-add server cards
8. **Settings Panel** - Bridge URL configuration
9. **Tooltips** - Helpful guidance

---

## Files to Create

```
/dist-chrome/icon/
├── bridge-16.svg     → Minimal bridge
├── bridge-32.svg     → Simple arch
├── bridge-48.svg     → Bridge + supports
├── bridge-96.svg     → Full bridge + arrows
├── bridge-128.svg    → Complete scene
├── bridge-16.png     → Export from SVG
├── bridge-32.png     → Export from SVG
├── bridge-48.png     → Export from SVG
├── bridge-96.png     → Export from SVG
└── bridge-128.png    → Export from SVG

/src/
├── popup.css         → Updated with Examark-style cards
├── popup.html        → Restructured layout
└── popup.js          → Health check + templates

/docs/
├── DESIGN-CONCEPT.md → This file
└── screenshots/      → Extension screenshots
```

---

## Next Steps

1. Generate SVG icons (5 sizes)
2. Convert SVG → PNG for Chrome
3. Update popup.css with new styles
4. Implement health check indicator
5. Add quick template UI
6. Update README with hero banner

---

**Design inspired by:** [Examark](https://github.com/Data-Wise/examark) aesthetic
**Color psychology:** Indigo (trust) + Teal (flow) + Green (success)
**Philosophy:** Clean, modern, professional, technical
