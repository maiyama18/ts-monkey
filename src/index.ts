import { Evaluator } from './evaluator/evaluator';
import { Lexer } from './lexer/lexer';
import { Program } from './node/node';
import { Buffer } from './object/buffer';
import { Environment } from './object/environment';
import { Parser } from './parser/parser';
import { Token } from './token/token';

export const lex = (input: string): Token[] => {
    const lexer = new Lexer(input);

    const result = [];
    while (true) {
        const token = lexer.nextToken();
        result.push(token);
        if (token.type === 'EOF') { break; }
    }

    return result;
};

export const parse = (input: string): Program => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    return parser.parseProgram();
};

export const evaluate = (input: string): string => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    const evaluator = new Evaluator();
    const buffer = new Buffer();
    const env = new Environment();

    evaluator.eval(program, env, buffer);
    return buffer.toString();
};

export * from './token/token';
export * from './node/node';
export * from './node/expressions';
export * from './node/statements';
export * from './object/object';
export * from './object/environment';
