<div align="center">

<img src="https://cdn.bloume.chat/favicon.ico" width="80" height="80" style="border-radius: 20px" />

# BloumeChat RPC

**Show your Visual Studio Code activity on [BloumeChat](https://bloumechat.com) — in real time.**

[![Version](https://img.shields.io/badge/version-1.0.4-6366f1?style=flat-square)](https://github.com/BloumeSAS/bloumechat-rpc/releases)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-007ACC?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=BloumeChat.bloumechat-rpc)
[![License](https://img.shields.io/badge/license-Proprietary-ef4444?style=flat-square)](#-license)
[![Made by Bloume.Fr](https://img.shields.io/badge/made%20by-Bloume.Fr-a855f7?style=flat-square)](https://bloume.fr)
[![Build](https://img.shields.io/github/actions/workflow/status/BloumeSAS/bloumechat-rpc/release.yml?style=flat-square&label=CI)](https://github.com/BloumeSAS/bloumechat-rpc/actions)

---

*Let your friends and server members see what you're hacking on — without leaving VS Code.*

</div>

---

## ✨ Features

| | |
|---|---|
| 💻 **Live activity** | Broadcasts your current file and workspace to BloumeChat in real time |
| 🔒 **Privacy-first** | Your activity respects your BloumeChat privacy settings (Everyone / Friends / Nobody) |
| ⚡ **Instant setup** | One token, one paste — up and running in under 30 seconds |
| 🔄 **Auto-reconnect** | Seamless reconnection if the connection drops, with exponential backoff |
| 🎛️ **Granular control** | Toggle file name, workspace name, or the whole feature — individually |
| 🌐 **Works everywhere** | Compatible with VS Code, VS Code Insiders, and any fork based on Code OSS |

---

## 🚀 Getting Started

### 1 — Install the extension

**From the VS Code Marketplace:**

```
ext install BloumeChat.bloumechat-rpc
```

Or search **"BloumeChat RPC"** in the Extensions panel (`Ctrl+Shift+X`).

**From a `.vsix` file** (latest release):

```bash
code --install-extension bloumechat-rpc-*.vsix
```

---

### 2 — Get your RPC token

1. Open [BloumeChat](https://bloumechat.com) and go to **Settings → Desktop**
2. Scroll to the **Token RPC** section
3. Click the **copy** icon to copy your token

> Your token is unique to your account and never expires unless you rotate it manually.

---

### 3 — Configure the extension

Open VS Code settings (`Ctrl+,`) and search for **BloumeChat RPC**, or edit `settings.json` directly:

```jsonc
{
  // Required — your personal RPC token from BloumeChat Settings > Desktop
  "bloumechatRpc.token": "your_token_here",

  // Optional — all true by default
  "bloumechatRpc.enabled": true,
  "bloumechatRpc.showFileName": true,
  "bloumechatRpc.showWorkspace": true,

  // Optional — only change this if you run your own BloumeChat instance
  "bloumechatRpc.serverUrl": "wss://bloumechat.com"
}
```

That's it. Your BloumeChat profile now shows **Visual Studio Code** as your current activity. 🎉

---

## ⚙️ Configuration Reference

| Setting | Type | Default | Description |
|---|---|---|---|
| `bloumechatRpc.enabled` | `boolean` | `true` | Master toggle for the extension |
| `bloumechatRpc.token` | `string` | `""` | Your BloumeChat RPC token |
| `bloumechatRpc.serverUrl` | `string` | `wss://bloumechat.com` | WebSocket server URL |
| `bloumechatRpc.showFileName` | `boolean` | `true` | Include current file name in activity |
| `bloumechatRpc.showWorkspace` | `boolean` | `true` | Include workspace/project name in activity |

---

## 🔐 Privacy & Security

- Your token authenticates only RPC activity updates — it cannot read messages, servers, or any personal data.
- If you suspect your token was leaked, rotate it instantly in **Settings → Desktop → Token RPC → Regenerate**.
- The extension respects your **Activity Privacy** setting in BloumeChat: if set to **Nobody**, no activity is ever broadcast regardless of this extension.
- No file contents are ever transmitted — only the file name and workspace name.

---

## 📦 How it works

```
VS Code (extension)
      │
      │  Socket.IO (WebSocket)
      │  auth: { rpcToken: "..." }
      ▼
BloumeChat Server
      │
      │  activity:update event
      │  { type: "using", name: "Visual Studio Code", details: "file.ts — MyProject" }
      ▼
Your BloumeChat profile ✓
```

The extension opens a persistent Socket.IO connection to the BloumeChat server, authenticated via your RPC token. When you switch files or projects, it emits an `activity:update` event with a 5-second debounce to avoid flooding. When VS Code loses focus or is closed, the activity is cleared automatically.

---

## 📄 License

© 2024–2026 **Bloume.Fr** — All rights reserved.

This extension is proprietary software distributed by **Bloume.Fr** as part of the BloumeChat platform.
You may use it freely with your BloumeChat account, but you may not copy, modify, distribute, or reverse-engineer it without prior written permission from Bloume.Fr.

---

<div align="center">

Made with ❤️ by **[Bloume.Fr](https://bloume.fr)**

<sub>BloumeChat · The next-generation chat platform</sub>

</div>
