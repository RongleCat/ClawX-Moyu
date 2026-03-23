# Theme Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the app theme so light mode is pure white, hero typography uses the system UI font at a smaller size, and the main accent shifts from blue to orange-red without changing logic.

**Architecture:** Centralize the visual refresh through global theme tokens and shared title utilities, then clean up page and modal components that still hard-code beige and blue values. Keep every edit within CSS classes, inline presentation styles, and static visual constants.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Radix UI, Vite, Electron

---

### Task 1: Add design docs and shared visual primitives

**Files:**
- Modify: `src/styles/globals.css`
- Create: `docs/plans/2026-03-23-theme-refresh-design.md`
- Create: `docs/plans/2026-03-23-theme-refresh.md`

**Step 1:** Add pure-white light theme tokens and reusable hero/section title utility classes.

**Step 2:** Confirm the new utility classes can replace repeated serif inline styles without touching behavior.

### Task 2: Update app shell surfaces

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/TitleBar.tsx`
- Modify: `src/components/ui/switch.tsx`

**Step 1:** Replace light beige shell backgrounds with white or token-based surfaces.

**Step 2:** Let the switch and shell controls inherit the new orange-red primary system.

### Task 3: Replace repeated hero title styling

**Files:**
- Modify: `src/pages/Settings/index.tsx`
- Modify: `src/pages/Models/index.tsx`
- Modify: `src/pages/Agents/index.tsx`
- Modify: `src/pages/Channels/index.tsx`
- Modify: `src/pages/Cron/index.tsx`
- Modify: `src/pages/Skills/index.tsx`
- Modify: `src/pages/Chat/index.tsx`
- Modify: `src/components/settings/ProvidersSettings.tsx`

**Step 1:** Swap repeated serif headline classes and inline font-family styles for shared system-font hero and section title classes.

**Step 2:** Reduce headline sizes one step while preserving spacing and hierarchy.

### Task 4: Clean up hard-coded light surfaces and blue accents

**Files:**
- Modify: `src/pages/Skills/index.tsx`
- Modify: `src/pages/Cron/index.tsx`
- Modify: `src/pages/Agents/index.tsx`
- Modify: `src/components/channels/ChannelConfigModal.tsx`
- Modify: `src/components/settings/ProvidersSettings.tsx`
- Modify: `src/pages/Settings/index.tsx`

**Step 1:** Replace beige dialog/input backgrounds with white or token-driven muted surfaces.

**Step 2:** Replace explicit blue buttons, icons, links, and focus rings with token-based primary styling or orange-red utility colors.

### Task 5: Verify no logic drift

**Files:**
- Modify: none
- Test: repository typecheck

**Step 1:** Run `pnpm run typecheck`.

**Step 2:** Review the diff to confirm changes stay within styling and presentation only.
