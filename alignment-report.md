# Large Screen Alignment Regression

## Summary
When the workspace is displayed on wide monitors (>1280px) the workspace column drifts off-center and some top-bar elements fall under the sidebar instead of aligning with the ideal GiF layout. Screenshot `1Screenshot_2026-01-07_17-39-00.jpg` shows the desired layout, while `2Screenshot_2026-01-07_17-39-12.jpg` and `3Screenshot_2026-01-07_17-39-42.jpg` capture the current misalignment (main content and header extend beyond the intended grid area and no longer align with the right column).

## Steps to Reproduce
1. Open the frontend on a screen wider than ~1360px (or resize the browser window to that width).
2. Observe the workspace frame: the topbar and the content grid expand fully instead of staying centered inside a constrained layout, causing the sidebar to appear detached and the cards to stretch horizontally.
3. Compare against the reference layout in `1Screenshot_2026-01-07_17-39-00.jpg` to confirm the misalignment.

## Expected Result
- The main `.main` and `.content` areas remain centered within a stable width (e.g., max 1360px) on large screens.
- The top-bar container shares that same center alignment, keeping the CTA buttons and filters in line with the content cards.
- The visual relationship between the sidebar and the right column matches the reference screenshot (`1Screenshot_2026-01-07_17-39-00.jpg`).

## Actual Result
- The `.main` and `.content` areas stretch across the full viewport width and are left-aligned, misplacing cards and making the right column appear to drift.
- The topbar also stretches, so its right-side buttons no longer align with the content grid.
- Screenshots `2Screenshot_2026-01-07_17-39-12.jpg` and `3Screenshot_2026-01-07_17-39-42.jpg` show the misalignment layers for reference.

## Notes
- No code change has successfully addressed this yet; this report captures the persistent layout issue.
