export class RPLNaiveParser {
    /**
     * Parse RPL code and extract keywords and function names
     * @param text RPL code text
     * @returns Keywords and function names
     */
    parse(text: string): {
        keywords: string[];
        functions: string[];
        metavariables: string[];
        operators: string[];
        imports: string[];
    } {
        const keywords = this.extractKeywords(text);
        const functions = this.extractFunctions(text);
        const metavariables = this.extractMetavariables(text);
        const operators = this.extractOperators(text);
        const imports = this.extractImportedModules(text);
        return { keywords, functions, metavariables, operators, imports };
    }

    readonly RPLKeywordList: string[] = ["pattern", "patt", "util", "import"];

    readonly RustKeywordList: string[] = [
        "fn",
        "let",
        "mut",
        "struct",
        "impl",
        "enum",
        "const",
        "use",
    ];

    get_keywords(): string[] {
        return this.RPLKeywordList.concat(this.RustKeywordList);
    }

    /**
     * Extract keywords
     * @param text RPL code text
     * @returns Keywords array
     */
    private extractKeywords(text: string): string[] {
        const keywords = new Set<string>();

        let keywordList = this.RPLKeywordList.concat(this.RustKeywordList);

        keywordList.forEach((keyword) => {
            const regex = new RegExp(`\\b${keyword}\\b`, "g");
            let match;
            while ((match = regex.exec(text)) !== null) {
                keywords.add(match[0]);
            }
        });

        return Array.from(keywords);
    }

    readonly RustOperatorList: string[] = [
        "Transmute",
        "PtrToPtr",
        "raw",
        "copy",
        "move",
        "SizeOf",
        "switchInt",
    ];

    /**
     * Extract operators
     * @param text RPL code text
     * @returns Operators array
     */
    private extractOperators(text: string): string[] {
        const operators = new Set<string>();

        let operatorList = this.RustOperatorList;

        operatorList.forEach((operator) => {
            const regex = new RegExp(`\\b${operator}\\b`, "g");
            let match;
            while ((match = regex.exec(text)) !== null) {
                operators.add(match[0]);
            }
        });

        return Array.from(operators);
    }

    /**
     * Extract function names
     * @param text RPL code text
     * @returns Function names array
     */
    private extractFunctions(text: string): string[] {
        const functionRegex = /fn\s+(\w+)\s*\(/g;
        const functions = new Set<string>();
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            functions.add(match[1]);
        }
        return Array.from(functions);
    }

    /**
     * Extract metavariables
     * @param text RPL code text
     * @returns Metavariables array
     */
    private extractMetavariables(text: string): string[] {
        const metavariableRegex = /(?:@?let(?:\s+mut)?\s+)?\$(\w+)\s*[:=]?/g;
        const metavariables = new Set<string>();
        let match;
        while ((match = metavariableRegex.exec(text)) !== null) {
            metavariables.add(match[1]);
        }
        return Array.from(metavariables);
    }

    /**
     * Extract imported Rust modules
     * @param text RPL code text
     * @returns Imported Rust modules array
     */
    private extractImportedModules(text: string): string[] {
        const useRegex = /^\s*use\s+(?:\w+::)*(\w+)\s*;/gm;
        const usedModules = new Set<string>();
        let match;
        while ((match = useRegex.exec(text)) !== null) {
            usedModules.add(match[1]);
        }
        return Array.from(usedModules);
    }
}
