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
        macros: string[];
    } {
        // need to parse
        const metavariables = this.extractMetavariables(text);
        const functions = this.extractFunctions(text);
        const imports = this.extractImportedModules(text);

        // don't need to parse
        const keywords = this.get_keywords();
        const operators = this.RustOperatorList;
        const macros = this.rplMacrosList;

        return {
            keywords,
            functions,
            metavariables,
            operators,
            imports,
            macros,
        };
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
        "pub",
        "unsafe",
    ];

    get_keywords(): string[] {
        return this.RPLKeywordList.concat(this.RustKeywordList);
    }

    readonly RustOperatorList: string[] = [
        "Transmute",
        "PtrToPtr",
        "raw",
        "copy",
        "move",
        "SizeOf",
        "switchInt",
        "discriminant",
        "Add",
        "Sub",
        "Mul",
        "Div",
        "Rem",
        "Lt",
        "Le",
        "Eq",
        "Ne",
        "Ge",
        "Gt",
    ];

    rplMacrosList: string[] = ["without!", "or!", "[mir]"];

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
