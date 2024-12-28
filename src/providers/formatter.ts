import * as vscode from "vscode";


export function registerFormatter(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            "rpl",
            new RPLFormatter()
        )
    );
    console.log("RPL Formatter registered.");
}

class RPLFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        console.log("Formatting RPL document.");
        const text = document.getText();
        const formatted = await naiveFormat(text);
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );
        console.log("RPL formatting completed.");
        return [vscode.TextEdit.replace(fullRange, formatted)];
    }
}

async function naiveFormat(text: string): Promise<string> {
    return text;
}