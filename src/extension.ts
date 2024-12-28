import * as vscode from "vscode";

import { registerFormatter } from "./providers/formatter";
import { registerCompleter } from "./providers/completer";

export function activate(context: vscode.ExtensionContext) {
    console.log("rpl-language-support is now active.");

    registerFormatter(context);

    registerCompleter(context);

    console.log("RPL Formatter registered.");
}

export function deactivate() {}
