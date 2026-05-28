import * as vscode from "vscode";
import { BloumeRpcClient, RpcStatus } from "./client";
import { getCurrentActivity } from "./activity";

let client: BloumeRpcClient | null = null;
let statusBar: vscode.StatusBarItem;
let debounceTimer: NodeJS.Timeout | null = null;
let startedAt: number = Date.now();
let currentStatus: RpcStatus = "disconnected";
const DEBOUNCE_MS = 5000;

function getConfig() {
    const cfg = vscode.workspace.getConfiguration("bloumechatRpc");
    return {
        enabled: cfg.get<boolean>("enabled", true),
        token: cfg.get<string>("token", ""),
        showLineNumber: cfg.get<boolean>("showLineNumber", false),
        showProblems: cfg.get<boolean>("showProblems", false),
    };
}

// ---------------------------------------------------------------------------
// Status bar
// ---------------------------------------------------------------------------

function updateStatusBar(): void {
    if (!statusBar) return;
    switch (currentStatus) {
        case "connected":
            statusBar.text = "$(broadcast) BloumeChat";
            statusBar.tooltip = "BloumeChat RPC — Connected. Click to reconnect or stop.";
            statusBar.backgroundColor = undefined;
            break;
        case "connecting":
            statusBar.text = "$(sync~spin) BloumeChat";
            statusBar.tooltip = "BloumeChat RPC — Connecting…";
            statusBar.backgroundColor = undefined;
            break;
        default:
            statusBar.text = "$(debug-disconnect) BloumeChat";
            statusBar.tooltip = "BloumeChat RPC — Stopped. Click to start.";
            statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
            break;
    }
    statusBar.show();
}

function setStatus(status: RpcStatus): void {
    currentStatus = status;
    updateStatusBar();
    // (Re)broadcast the current activity as soon as the socket is (re)connected.
    if (status === "connected") sendActivity();
}

// ---------------------------------------------------------------------------
// Activity broadcasting
// ---------------------------------------------------------------------------

function scheduleUpdate(): void {
    if (!client) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendActivity, DEBOUNCE_MS);
}

function sendActivity(): void {
    if (!client) return;
    client.setActivity(getCurrentActivity(startedAt));
}

// ---------------------------------------------------------------------------
// Lifecycle controls (start / stop / reconnect)
// ---------------------------------------------------------------------------

function start(): void {
    const cfg = getConfig();
    if (!cfg.enabled) {
        vscode.window.showInformationMessage(
            "BloumeChat RPC is disabled. Enable it in Settings → BloumeChat RPC."
        );
        return;
    }
    if (!cfg.token) {
        vscode.window
            .showWarningMessage(
                "BloumeChat RPC: paste your RPC token first (BloumeChat → Settings → Desktop → Token RPC).",
                "Open Settings"
            )
            .then((choice) => {
                if (choice === "Open Settings") {
                    vscode.commands.executeCommand(
                        "workbench.action.openSettings",
                        "bloumechatRpc.token"
                    );
                }
            });
        return;
    }

    client?.disconnect();
    startedAt = Date.now();
    client = new BloumeRpcClient(cfg.token, setStatus);
    client.connect();
}

function stop(): void {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    client?.setActivity(null);
    client?.disconnect();
    client = null;
    setStatus("disconnected");
}

function reconnect(): void {
    stop();
    start();
}

async function control(): Promise<void> {
    const running = !!client;
    const items: (vscode.QuickPickItem & { action: "start" | "stop" | "reconnect" })[] = running
        ? [
              { label: "$(sync) Reconnect", description: "Restart the BloumeChat RPC connection", action: "reconnect" },
              { label: "$(debug-stop) Stop", description: "Stop broadcasting your activity", action: "stop" },
          ]
        : [
              { label: "$(play) Start", description: "Start broadcasting your VS Code activity", action: "start" },
          ];

    const pick = await vscode.window.showQuickPick(items, {
        placeHolder: running ? "BloumeChat RPC — running" : "BloumeChat RPC — stopped",
    });
    if (!pick) return;

    if (pick.action === "start") start();
    else if (pick.action === "reconnect") reconnect();
    else if (pick.action === "stop") stop();
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = "bloumechatRpc.control";
    setStatus("disconnected");

    context.subscriptions.push(
        statusBar,
        vscode.commands.registerCommand("bloumechatRpc.control", control),
        vscode.commands.registerCommand("bloumechatRpc.start", start),
        vscode.commands.registerCommand("bloumechatRpc.stop", stop),
        vscode.commands.registerCommand("bloumechatRpc.reconnect", reconnect),

        vscode.window.onDidChangeActiveTextEditor(() => {
            startedAt = Date.now();
            scheduleUpdate();
        }),
        vscode.window.onDidChangeTextEditorSelection(() => {
            if (getConfig().showLineNumber) scheduleUpdate();
        }),
        vscode.languages.onDidChangeDiagnostics(() => {
            if (getConfig().showProblems) scheduleUpdate();
        }),
        vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
            if (!e.affectsConfiguration("bloumechatRpc")) return;
            const cfg = getConfig();
            if (!cfg.enabled) {
                stop();
                return;
            }
            // Re-apply token / display changes by restarting an active session,
            // or refresh the broadcast if we're already connected.
            if (client) reconnect();
            else scheduleUpdate();
        })
    );

    // Auto-start on launch (the default behaviour).
    if (getConfig().enabled) start();
}

export function deactivate(): void {
    stop();
}
