# Moyu Provider Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the source project's frontend provider/model configuration flow while keeping an env-controlled Moyu-only mode that still exposes full model configuration for the Moyu provider.

**Architecture:** Add a small frontend-only provider mode module that reads a Vite env flag and shapes visible provider metadata. Restore the richer source-project provider registry and provider setup/settings UI, then apply Moyu-mode filtering and presets in the renderer without touching any Electron backend code.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, Testing Library, Zustand

---

### Task 1: Add failing tests for provider mode metadata

**Files:**
- Create: `tests/unit/provider-mode.test.ts`
- Modify: `tests/unit/providers.test.ts`

**Step 1: Write the failing test**

Add tests that verify:
- default mode exposes the source-project provider metadata list, including non-custom providers
- Moyu mode only exposes `custom`
- Moyu mode keeps `custom.showBaseUrl === true` and `custom.showModelId === true`

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/provider-mode.test.ts tests/unit/providers.test.ts`
Expected: FAIL because the provider mode module does not exist and the current frontend registry still hardcodes Moyu-only metadata with hidden model config.

**Step 3: Write minimal implementation**

Create a frontend provider mode helper and update `src/lib/providers.ts` to restore full provider metadata plus env-driven filtering.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/provider-mode.test.ts tests/unit/providers.test.ts`
Expected: PASS

### Task 2: Add failing tests for settings UI in Moyu mode

**Files:**
- Create: `tests/unit/providers-settings-mode.test.tsx`
- Modify: `tests/setup.ts`

**Step 1: Write the failing test**

Add a renderer test that verifies in Moyu mode:
- settings still renders the add-provider button
- only the Moyu/custom provider can be added
- editing a custom account shows model/base URL inputs

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/providers-settings-mode.test.tsx`
Expected: FAIL because the current settings UI hides add-provider and model config for Moyu.

**Step 3: Write minimal implementation**

Update `src/components/settings/ProvidersSettings.tsx` to restore source-project behavior and apply frontend-only Moyu-mode filtering/presets.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/providers-settings-mode.test.tsx`
Expected: PASS

### Task 3: Add failing tests for setup provider flow in Moyu mode

**Files:**
- Create: `tests/unit/setup-provider-mode.test.tsx`

**Step 1: Write the failing test**

Add a renderer test that verifies in Moyu mode:
- setup only shows the Moyu/custom provider
- setup still shows model/base URL configuration controls for that provider

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/setup-provider-mode.test.tsx`
Expected: FAIL because the current setup page hardcodes a reduced Moyu flow.

**Step 3: Write minimal implementation**

Update `src/pages/Setup/index.tsx` to restore source-project provider configuration UI while filtering available providers in Moyu mode.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/setup-provider-mode.test.tsx`
Expected: PASS

### Task 4: Verify and sync docs

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `README.ja-JP.md`

**Step 1: Run focused verification**

Run:
- `pnpm test tests/unit/provider-mode.test.ts tests/unit/providers.test.ts tests/unit/providers-settings-mode.test.tsx tests/unit/setup-provider-mode.test.tsx`
- `pnpm run typecheck`

Expected: PASS

**Step 2: Update docs**

Document the new frontend env toggle and clarify that Moyu mode keeps full model configuration while limiting visible providers.

**Step 3: Run final verification**

Run: `pnpm test && pnpm run typecheck`
Expected: PASS, or document any unrelated existing failures.
