# OneKeyClaw Theme Refresh Design

**Date:** 2026-03-23

**Scope lock:** This change only updates visual styling. It must not modify application behavior, data flow, transport logic, renderer-main boundaries, or any feature-level interaction.

## Goals

- Make light mode pure white across the app, including title bar, sidebar, pages, dialogs, and light-surface inputs that currently use beige tones.
- Reduce all exposed hero headline sizes and replace serif display styling with the platform default UI font stack.
- Change the exposed primary accent from blue to orange-red for switches, primary actions, links, and focus emphasis.

## Approach

- Update global theme tokens in `src/styles/globals.css` so the light palette is driven by white surfaces and an orange-red `primary`.
- Add reusable utility classes for hero titles and section titles to replace repeated inline serif styles.
- Normalize hard-coded beige and blue visual values in page-level and dialog-level components to use white or token-based colors.

## Non-goals

- No copy changes.
- No layout restructuring beyond modest headline size reduction.
- No dark-mode redesign beyond following the updated `primary` token where existing components already consume it.

## Validation

- Run typecheck to ensure no JSX/class edits introduced type issues.
- Review the changed files to confirm the work is styling-only and does not alter logic branches or event handlers.
