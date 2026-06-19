import * as vscode from "vscode";

export interface RpcActivityPayload {
    type: "using" | "browsing" | "listening" | "playing" | "none";
    name: string;
    details?: string;
    startedAt?: number;
}

/**
 * Human-readable name of the editor actually running this extension.
 *
 * VS Code forks (Cursor, Windsurf, Antigravity, VSCodium…) set their own
 * product name at build time, so `vscode.env.appName` already returns the
 * correct branding ("Cursor", "Windsurf", "Antigravity"…) without needing a
 * hardcoded list — this also means any future fork works automatically.
 */
function getEditorName(): string {
    return vscode.env.appName || "Visual Studio Code";
}

/** Count the errors + warnings reported across the whole workspace. */
function countProblems(): number {
    let count = 0;
    for (const [, diagnostics] of vscode.languages.getDiagnostics()) {
        for (const diag of diagnostics) {
            if (
                diag.severity === vscode.DiagnosticSeverity.Error ||
                diag.severity === vscode.DiagnosticSeverity.Warning
            ) {
                count++;
            }
        }
    }
    return count;
}

/**
 * Build the activity payload for the current editor state.
 *
 * IMPORTANT: the presence is NOT cleared when the window loses focus. Once the
 * user starts the RPC, the activity persists even when switching to another
 * application — it only stops when the user explicitly stops it or disables the
 * extension.
 */
export function getCurrentActivity(startedAt: number): RpcActivityPayload {
    const config = vscode.workspace.getConfiguration("bloumechatRpc");
    const showFileName = config.get<boolean>("showFileName", true);
    const showWorkspace = config.get<boolean>("showWorkspace", true);
    const showFileType = config.get<boolean>("showFileType", true);
    const showLineNumber = config.get<boolean>("showLineNumber", false);
    const showProblems = config.get<boolean>("showProblems", false);

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        // No file open → still "using" the editor, just idle.
        return { type: "using", name: getEditorName(), details: "Idle", startedAt };
    }

    const doc = editor.document;
    const fileName = doc.fileName.split(/[\\/]/).pop() || "Untitled";

    // Primary segment — the file name (carries the extension the webapp uses to
    // render the small file-type icon). Falls back to the language id when the
    // file name is hidden but the file type is still requested.
    const primary: string[] = [];
    if (showFileName) {
        primary.push(fileName);
    } else if (showFileType) {
        primary.push(doc.languageId);
    }

    // Context segments — workspace, cursor position, problems.
    const context: string[] = [];
    if (showWorkspace) {
        const workspaceName =
            vscode.workspace.getWorkspaceFolder(doc.uri)?.name ||
            vscode.workspace.name ||
            null;
        if (workspaceName) context.push(workspaceName);
    }
    if (showLineNumber) {
        const line = editor.selection.active.line + 1;
        const col = editor.selection.active.character + 1;
        context.push(`Ln ${line}:${col}`);
    }
    if (showProblems) {
        const problems = countProblems();
        context.push(problems === 1 ? "1 problem" : `${problems} problems`);
    }

    let details = primary.join(" ");
    if (context.length > 0) {
        details = details ? `${details} — ${context.join(" · ")}` : context.join(" · ");
    }
    if (!details) details = "Editing";

    return { type: "using", name: getEditorName(), details, startedAt };
}
