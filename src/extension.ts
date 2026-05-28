import * as vscode from "vscode";
import { BloumeRpcClient } from "./client";
import { getCurrentActivity } from "./activity";

let client: BloumeRpcClient | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
let startedAt: number = Date.now();
const DEBOUNCE_MS = 5000;

function getConfig() {
    const cfg = vscode.workspace.getConfiguration("bloumechatRpc");
    return {
        enabled: cfg.get<boolean>("enabled", true),
        serverUrl: cfg.get<string>("serverUrl", "wss://bloumechat.com"),
        token: cfg.get<string>("token", ""),
    };
}

function scheduleUpdate(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendActivity, DEBOUNCE_MS);
}

function sendActivity(): void {
    if (!client) return;
    const cfg = getConfig();
    if (!cfg.enabled) {
        client.setActivity(null);
        return;
    }
    const activity = getCurrentActivity(startedAt);
    client.setActivity(activity.type === "none" ? null : activity);
}

function initClient(): void {
    const cfg = getConfig();
    if (!cfg.enabled || !cfg.token) return;

    client?.disconnect();
    startedAt = Date.now();
    client = new BloumeRpcClient(cfg.serverUrl, cfg.token);
    client.connect();
    scheduleUpdate();
}

export function activate(context: vscode.ExtensionContext): void {
    initClient();

    const onEditorChange = vscode.window.onDidChangeActiveTextEditor(() => {
        startedAt = Date.now();
        scheduleUpdate();
    });

    const onWindowState = vscode.window.onDidChangeWindowState(() => {
        scheduleUpdate();
    });

    const onConfigChange = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration("bloumechatRpc")) {
            initClient();
        }
    });

    context.subscriptions.push(onEditorChange, onWindowState, onConfigChange);
}

export function deactivate(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    client?.setActivity(null);
    client?.disconnect();
    client = null;
}
