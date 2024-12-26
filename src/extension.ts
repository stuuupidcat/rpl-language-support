import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

export function activate(context: vscode.ExtensionContext) {
    console.log('vscode-rpl is now active!');

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('rpl', new RPLFormatter())
    );

    console.log('RPL Formatter registered.');
}

export function deactivate() {}

class RPLFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        console.log('Formatting RPL document.');
        const text = document.getText();
        const formatted = await formatRPLWithRustfmt(text);
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );
        console.log('RPL formatting completed.');
        return [vscode.TextEdit.replace(fullRange, formatted)];
    }
}

async function formatRPLWithRustfmt(text: string): Promise<string> {
    return text;

    const lines = text.split('\n');
    const header = lines[0].trim();
    const blocks = text.slice(header.length).trim();

    const formattedHeader = formatHeader(header);

    const formattedBlocks = await extractAndFormatBlocks(blocks, 'rustfmt');

    return `${formattedHeader}\n${formattedBlocks}`;
}

function formatHeader(header: string): string {
    const headerRegex = /^pattern\s+\w+$/;
    if (headerRegex.test(header)) {
        return header;
    }
    const parts = header.split(/\s+/);
    if (parts[0] === 'pattern' && parts.length === 2) {
        return `pattern ${parts[1]}`;
    }
    return header;
}

async function extractAndFormatBlocks(blocks: string, rustfmtPath: string): Promise<string> {
    let formattedBlocks = '';
    let currentIndex = 0;

    while (currentIndex < blocks.length) {
        const keywordMatch = blocks.slice(currentIndex).match(/\b(patt|util|import)\b\s*\{/);
        if (!keywordMatch) {
            formattedBlocks += blocks.slice(currentIndex);
            break;
        }

        const keywordIndex = currentIndex + keywordMatch.index!;
        const blockTypeMatch = blocks.slice(keywordIndex).match(/\b(patt|util|import)\b/);
        if (!blockTypeMatch) {
            formattedBlocks += blocks.slice(currentIndex);
            break;
        }

        const blockType = blockTypeMatch[1];
        const startBraceIndex = blocks.indexOf('{', keywordIndex) + 1;

        const endBraceIndex = findMatchingBrace(blocks, startBraceIndex - 1);
        if (endBraceIndex === -1) {
            formattedBlocks += blocks.slice(currentIndex);
            break;
        }

        const codeBlock = blocks.slice(keywordIndex, endBraceIndex + 1);
        const codeContent = blocks.slice(startBraceIndex, endBraceIndex);
        console.log(`Formatting ${blockType} block: ${codeContent}`);

        const formattedCode = await formatCodeWithRustfmt(codeContent, rustfmtPath);

        const formattedBlock = `${blockType} {\n${formattedCode}\n}`;
        formattedBlocks += blocks.slice(currentIndex, keywordIndex) + formattedBlock;

        currentIndex = endBraceIndex + 1;
    }

    return formattedBlocks;
}

function findMatchingBrace(text: string, startIndex: number): number {
    let braceCount = 0;
    for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '{') {
            braceCount++;
        } else if (text[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                return i;
            }
        }
    }
    return -1;
}

async function formatCodeWithRustfmt(code: string, rustfmtPath: string): Promise<string> {
    const tempFilePath = path.join(os.tmpdir(), `rpl_temp_${Date.now()}.rs`);
    try {
        await fs.writeFile(tempFilePath, code, 'utf8');

        await new Promise<void>((resolve, reject) => {
            exec(`${rustfmtPath} ${tempFilePath}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`rustfmt error: ${stderr}`);
                    console.error(`rustfmt error: ${stderr}`);
                } else {
                    resolve();
                }
            });
        });

        const formattedCode = await fs.readFile(tempFilePath, 'utf8');

        await fs.unlink(tempFilePath);

        return formattedCode;
    } catch (error) {
        vscode.window.showErrorMessage(`RPL Formatter: ${error}`);
        return code;
    }
}
