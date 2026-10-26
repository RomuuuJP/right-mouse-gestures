# Right Mouse Gestures

Chrome Manifest V3 extension with visual mouse gestures, native right-click preservation, adjustable recognition thresholds, and Chinese / Japanese / English UI.

## Install

1. Open `chrome://extensions`, enable Developer mode.
2. Select **Load unpacked** and select the folder containing `manifest.json`.
3. Open extension details → **Extension options** to change sensitivity and thresholds.
4. Refresh already-open web pages after updating the extension.

## Gestures

Hold the right mouse button and drag past the activation threshold. Release to run a recognized gesture.

| Gesture | Action |
| --- | --- |
| → | Forward |
| ← | Back |
| ↑ | Scroll up |
| ↓ | Scroll down |
| ↑↓ or ↓↑ | Reload |
| ↓→ | Close tab |
| ↑← | Previous tab |
| ↑→ | Next tab |
| Other | Cancel |

A regular right-click without a gesture keeps Chrome's native context menu. Gestures are not activated on text inputs, content-editable elements, `canvas`, or videos. Browser-restricted pages (such as `chrome://`, Chrome Web Store, certain built-in PDF views) cannot receive injected content scripts. On platforms that show the context menu at right-button **press** rather than release, a script cannot retroactively suppress a menu after the drag is detected.

## Recognition

- Activation distance: minimum movement to enter gesture mode.
- First-stroke sensitivity: minimum distance for the initial cardinal direction.
- Turn distance: minimum distance to recognize a second orthogonal segment; reversals use a slightly lower threshold, measured from the previous segment's actual extreme point.
- Maximum two directional segments; additional directions cancel the command.
- Use `Esc` to cancel an in-progress gesture.

## Tests

Run `node --test tests/*.test.js` (Node.js 18+). No external dependencies required.
