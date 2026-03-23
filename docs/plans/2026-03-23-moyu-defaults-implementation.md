# Moyu Defaults Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the Moyu-mode default Base URL and default model to `https://www.moyu.info/v1` and `gpt-5.4` everywhere the frontend pre-fills provider configuration.

**Architecture:** Keep Moyu defaults in shared frontend provider metadata so both the setup wizard and settings page read from one source of truth. Update tests first to lock in the new defaults, then make the minimal implementation changes needed for setup and settings to consume the same metadata.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library

---

### Task 1: Lock in the shared Moyu metadata defaults

**Files:**
- Modify: `tests/unit/providers.test.ts`
- Modify: `src/lib/provider-mode.ts`

**Step 1: Write the failing test**

Update the Moyu-mode provider metadata assertion to expect:

```ts
expect(custom).toMatchObject({
  id: 'custom',
  name: '魔芋',
  defaultBaseUrl: 'https://www.moyu.info/v1',
  defaultModelId: 'gpt-5.4',
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/providers.test.ts`
Expected: FAIL because Moyu metadata still uses the old base URL and does not expose the new default model.

**Step 3: Write minimal implementation**

Update `src/lib/provider-mode.ts` so the Moyu-mode metadata override sets:

```ts
defaultBaseUrl: 'https://www.moyu.info/v1',
defaultModelId: 'gpt-5.4',
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/providers.test.ts`
Expected: PASS.

### Task 2: Lock in setup wizard defaults

**Files:**
- Modify: `tests/unit/setup-provider-mode.test.tsx`
- Modify: `src/pages/Setup/index.tsx`

**Step 1: Write the failing test**

Assert that in Moyu mode, the setup provider form pre-fills:

```ts
expect(await screen.findByDisplayValue('https://www.moyu.info/v1')).toBeInTheDocument();
expect(await screen.findByDisplayValue('gpt-5.4')).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/setup-provider-mode.test.tsx`
Expected: FAIL because setup still initializes empty or old values.

**Step 3: Write minimal implementation**

Make setup initialize `baseUrl` and `modelId` from the selected provider metadata defaults when no saved account value exists.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/setup-provider-mode.test.tsx`
Expected: PASS.

### Task 3: Lock in settings-page defaults for new Moyu accounts

**Files:**
- Modify: `tests/unit/providers-settings-mode.test.tsx`
- Modify: `src/components/settings/ProvidersSettings.tsx`

**Step 1: Write the failing test**

Assert that opening the add-provider dialog in Moyu mode pre-fills:

```ts
expect(screen.getByDisplayValue('https://www.moyu.info/v1')).toBeInTheDocument();
expect(screen.getByDisplayValue('gpt-5.4')).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/providers-settings-mode.test.tsx`
Expected: FAIL because the add form still uses the old base URL and empty model.

**Step 3: Write minimal implementation**

Initialize the new-account form state from the shared provider metadata default values in Moyu mode.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/providers-settings-mode.test.tsx`
Expected: PASS.

### Task 4: Run the focused regression suite

**Files:**
- Verify: `tests/unit/providers.test.ts`
- Verify: `tests/unit/setup-provider-mode.test.tsx`
- Verify: `tests/unit/providers-settings-mode.test.tsx`

**Step 1: Run the focused tests**

Run: `pnpm test tests/unit/providers.test.ts tests/unit/setup-provider-mode.test.tsx tests/unit/providers-settings-mode.test.tsx`

**Step 2: Confirm the result**

Expected: all targeted tests PASS with the new Moyu defaults.
