# @kcprobe/extension

Chrome extension (Manifest V3) that acts as the **TCP transport layer** for the
KCProbe web app. It owns the connection to embedded devices and exposes a small,
generic message API over `chrome.runtime` messaging. All device-specific and
higher-level command logic lives in the web app — keep this extension minimal.

This package has **no build step**: `src/background.js` is plain JS and the
folder loads as-is.

## Load unpacked (development)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this `extension/` folder
4. Copy the extension ID — the web app uses it to send messages

## Message contract

| Request                    | Response                            |
| -------------------------- | ----------------------------------- |
| `{ type: "KCPROBE_PING" }` | `{ type: "KCPROBE_PONG", version }` |

The web app uses `KCPROBE_PING` to detect that the extension is installed and to
read its version. `connect` / `send` / `disconnect` message types will be added
in Phase 1.

> **Note on TCP:** the classic `chrome.sockets.tcp` API is a Chrome **Apps** API
> and is not available to MV3 extensions. The actual raw-TCP mechanism (Direct
> Sockets API in an Isolated Web App, a native-messaging host, etc.) is still an
> open decision — see [../CLAUDE.md](../CLAUDE.md).

## Allowed origins

`externally_connectable` in [manifest.json](manifest.json) restricts which pages
may message the extension — currently the GitHub Pages site and `localhost` for
development.
