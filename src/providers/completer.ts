import * as vscode from "vscode";
import { RPLNaiveParser } from "../parsers/rplNaiveParser";

/**
 * registerCompletionProvider
 * @param context vscode.ExtensionContext
 */
export function registerCompleter(context: vscode.ExtensionContext) {
    const completer = new RPLCompleter();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            "rpl",
            completer
            // ...completer.getTriggerCharacters()
        )
    );
    console.log("RPL Completer registered.");
}

class RPLCompleter implements vscode.CompletionItemProvider {
    private parser: RPLNaiveParser;

    constructor() {
        this.parser = new RPLNaiveParser();
    }

    /**
     * Provide completion items
     * @param document current document
     * @param position Cursor position
     * @param token Cancellation token
     * @param context Completion context
     * @returns Completion items
     */
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[]> {
        const completionItems: vscode.CompletionItem[] = [];

        const text = document.getText();

        const parsedData = this.parser.parse(text);

        completionItems.push(
            ...this.generateKeywordCompletionItems(parsedData.keywords)
        );

        /* completionItems.push(
            ...this.generateFunctionCompletionItems(parsedData.functions)
        ); */

        completionItems.push(
            ...this.generateMetavariableCompletionItems(
                parsedData.metavariables
            )
        );

        completionItems.push(
            ...this.generateOperatorCompletionItems(parsedData.operators)
        );

        completionItems.push(
            ...this.generateImportCompletionItems(parsedData.imports)
        );

        return completionItems;
    }

    /**
     * enerate keyword completion items
     * @param keywords Keywords array
     * @returns CompletionItem array
     */
    private generateKeywordCompletionItems(
        keywords: string[]
    ): vscode.CompletionItem[] {
        return keywords.map((keyword) => {
            const item = new vscode.CompletionItem(
                keyword,
                vscode.CompletionItemKind.Keyword
            );
            item.detail = "RPL Keyword";
            return item;
        });
    }

    /**
     * Generate function completion items
     * @param functions Function names array
     * @returns CompletionItem array
     */
    private generateFunctionCompletionItems(
        functions: string[]
    ): vscode.CompletionItem[] {
        return functions.map((func) => {
            const item = new vscode.CompletionItem(
                func,
                vscode.CompletionItemKind.Function
            );
            item.detail = "RPL Function";
            return item;
        });
    }

    /**
     * Generate completion items for metavariables
     * @param metavariables Metavariables array
     * @returns CompletionItem array
     */
    private generateMetavariableCompletionItems(
        metavariables: string[]
    ): vscode.CompletionItem[] {
        return metavariables.map((meta) => {
            const item = new vscode.CompletionItem(
                meta,
                vscode.CompletionItemKind.Variable
            );
            item.detail = "RPL Metavariable";
            return item;
        });
    }

    /**
     * Generate completion items for operators
     * @param operators Operators array
     * @returns CompletionItem array
     */
    private generateOperatorCompletionItems(
        operators: string[]
    ): vscode.CompletionItem[] {
        return operators.map((operator) => {
            const item = new vscode.CompletionItem(
                operator,
                vscode.CompletionItemKind.Operator
            );
            item.detail = "RPL Operator";
            return item;
        });
    }

    /**
     * Generate completion items for imports
     * @param imports Imports array
     * @returns CompletionItem array
     */
    private generateImportCompletionItems(
        imports: string[]
    ): vscode.CompletionItem[] {
        return imports.map((imp) => {
            const item = new vscode.CompletionItem(
                imp,
                vscode.CompletionItemKind.Module
            );
            item.detail = "RPL Import";
            return item;
        });
    }

    /**
     * Get trigger characters
     * @returns Trigger characters
     */
    public getTriggerCharacters(): string[] {
        let list = [":", "$"];
        // push all alphabets
        for (let i = 65; i < 91; i++) {
            list.push(String.fromCharCode(i));
        }
        return list;
    }
}
