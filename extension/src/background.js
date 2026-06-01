// KCProbe TCP Driver — background service worker.
//
// This is the transport layer only. It owns the connection to embedded devices
// and exposes a small, GENERIC message API to the web app. Keep device-specific
// and higher-level command logic in the web app, not here, so new device
// components never require an extension change.
//
// The web app reaches this worker via chrome.runtime.sendMessage(EXTENSION_ID, msg)
// (allowed origins are listed under externally_connectable in manifest.json).
//
// Message contract (app -> extension -> response):
//   { type: "KCPROBE_PING" }            -> { type: "KCPROBE_PONG", version }
//
// Phase 1 will extend this with connect / send / disconnect message types.
// When a message type adds an async response, return `true` from the listener
// to keep the sendResponse channel open.

const PROTOCOL = {
  PING: "KCPROBE_PING",
  PONG: "KCPROBE_PONG",
}

chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    switch (message?.type) {
      case PROTOCOL.PING:
        sendResponse({
          type: PROTOCOL.PONG,
          version: chrome.runtime.getManifest().version,
        })
        return false

      default:
        sendResponse({
          type: "KCPROBE_ERROR",
          error: `Unknown message type: ${message?.type}`,
        })
        return false
    }
  }
)
