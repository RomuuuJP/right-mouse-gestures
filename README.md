# Right Mouse Gestures

A lightweight Chrome extension that lets you control your browser with mouse gestures. Hold the right mouse button, move the mouse to draw a gesture, and release the button to execute the corresponding action.

Features real-time gesture trails, command previews, adjustable sensitivity, and a multilingual settings page.

## Features

- **Mouse gestures** — Navigate, scroll, refresh pages, close tabs, and switch between tabs.
- **Real-time visual feedback** — Display the mouse trail and the currently recognized command while performing a gesture.
- **Configurable sensitivity** — Adjust gesture recognition sensitivity to match your preferences.
- **Multilingual interface** — Supports Simplified Chinese, Japanese, and English.
- **Visual settings page** — Configure sensitivity and language through an intuitive interface.
- **Unknown gesture cancellation** — Unrecognized gestures are canceled without executing browser actions.
- **Manifest V3** — Built using the Chrome Extensions Manifest V3 architecture.

## Supported Gestures

| Gesture | Action |
| --- | --- |
| Right | Navigate forward |
| Left | Navigate backward |
| Up | Scroll up |
| Down | Scroll down |
| Up → Down | Refresh the current page |
| Down → Up | Refresh the current page |
| Down → Right | Close the current tab |
| Up → Left | Switch to the previous tab |
| Up → Right | Switch to the next tab |
| Any unrecognized gesture | Cancel the action |

Tab switching follows the tab order in the current window and wraps around at either end.

## Installation

### Install from Source

1. Download or clone this repository.
2. Extract the files if you downloaded a ZIP archive.
3. Open `chrome://extensions/` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted extension directory containing `manifest.json`.

The extension should now be available in Chrome.

## Configuration

Open the extension's details page at `chrome://extensions/`, then select **Extension options** to access the settings page.

Available settings:

- **Language** — Simplified Chinese, Japanese, or English.
- **Sensitivity** — Adjust how much mouse movement is required to recognize a gesture.
- **Save settings** — Apply and save your preferences.
- **Reset to defaults** — Restore the default configuration.

Higher sensitivity means less mouse movement is required to recognize a gesture.

## Usage

1. Open a regular web page.
2. Press and hold the right mouse button.
3. Move the mouse in the desired direction or gesture pattern.
4. Check the displayed gesture trail and command preview.
5. Release the right mouse button to execute the recognized action.

If the gesture does not match any supported command, the action is canceled.

## Compatibility and Limitations

- Designed for Google Chrome and Chromium-based browsers that support Manifest V3.
- Browser-level actions require the appropriate Chrome extension permissions.
- Chrome internal pages, the Chrome Web Store, and certain restricted pages may not allow content scripts to run.
- PDF viewers and pages containing embedded content may have limited gesture support.
- Scrolling inside nested containers may vary depending on the page structure.
- Compatibility may vary across websites and browser versions.

## Permissions

The extension may require permissions such as:

- `tabs` — Manage and switch browser tabs.
- `storage` — Save user preferences.
- `host_permissions` or equivalent content-script access — Detect mouse gestures and display visual feedback on supported pages.

The actual permissions are defined in `manifest.json`.

## Languages

- Simplified Chinese (`zh-CN`)
- Japanese (`ja`)
- English (`en`)

## Development

The extension uses standard Chrome extension technologies:

- JavaScript
- HTML
- CSS
- Chrome Extensions Manifest V3

To test changes, open `chrome://extensions/` and click **Reload** on the extension card.

## License

Choose and add a license file, such as the MIT License, if you intend to distribute this project as open source.

---

**Contributions and feedback are welcome.**
