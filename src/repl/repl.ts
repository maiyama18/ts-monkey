import * as readline from 'readline';
import { Evaluator } from '../evaluator/evaluator';
import { Lexer } from '../lexer/lexer';
import { Buffer } from '../object/buffer';
import { Environment } from '../object/environment';
import { Parser } from '../parser/parser';

const PROMPT = '-> ';

const env = new Environment();
const evaluator = new Evaluator();

const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const repl = () => {
    io.question(PROMPT, (input) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const buffer = new Buffer();

        try {
            const program = parser.parseProgram();
            const obj = evaluator.eval(program, env, buffer);

            if (!buffer.empty()) { process.stdout.write(buffer.toString()); }
            console.log(obj.inspect());
        } catch (err) {
            console.error(err.message);
        }

        repl();
    });
};

repl();
