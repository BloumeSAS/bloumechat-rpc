import * as vscode from "vscode";

export interface RpcActivityPayload {
    type: "using" | "browsing" | "listening" | "playing" | "none";
    name: string;
    details?: string;
    startedAt?: number;
}

export function getCurrentActivity(startedAt: number): RpcActivityPayload {
    const config = vscode.workspace.getConfiguration("bloumechatRpc");
    const showFileName = config.get<boolean>("showFileName", true);
    const showWorkspace = config.get<boolean>("showWorkspace", true);

    const editor = vscode.window.activeTextEditor;
    const windowState = vscode.window.state;

    if (!windowState.focused) {
        return { type: "none", name: "" };
    }

    let details = "Idle";

    if (editor) {
        const fileName = showFileName
            ? editor.document.fileName.split(/[\\/]/).pop() || "Unknown file"
            : null;
        const workspaceFolder = showWorkspace
            ? vscode.workspace.getWorkspaceFolder(editor.document.uri)?.name || null
            : null;

        if (fileName && workspaceFolder) {
            details = `${fileName} — ${workspaceFolder}`;
        } else if (fileName) {
            details = fileName;
        } else if (workspaceFolder) {
            details = workspaceFolder;
        }
    }

    return {
        type: "using",
        name: "Visual Studio Code",
        details,
        startedAt,
    };
}
