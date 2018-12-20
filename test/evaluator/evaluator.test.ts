import { Evaluator } from '../../src/evaluator/evaluator';
import { Lexer } from '../../src/lexer/lexer';
import { Environment } from '../../src/object/environment';
import { Bool, Int, Obj } from '../../src/object/object';
import { Parser } from '../../src/parser/parser';

describe('evaluator', () => {
    describe('expression statements', () => {
        describe('int', () => {
            it('should eval int', () => {
                const input = `42;`;
                const expected = 42;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });

        describe('bool', () => {
            it('should eval true', () => {
                const input = 'true;';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval false', () => {
                const input = 'false;';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });
        });

        describe('prefix', () => {
            it('should eval -[int]', () => {
                const input = '-42;';
                const expected = -42;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval -(-[int])', () => {
                const input = '-(-42);';
                const expected = 42;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval ![bool]', () => {
                const input = '!true;';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval ![int]', () => {
                const input = '!5;';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval !![bool]', () => {
                const input = '!!true;';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });
        });

        describe('infix', () => {
            it('should eval [int] + [int]', () => {
                const input = '3 + 4;';
                const expected = 7;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] + -[int]', () => {
                const input = '3 + -4;';
                const expected = -1;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] - [int]', () => {
                const input = '3 - 4;';
                const expected = -1;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] * [int]', () => {
                const input = '3 * 4;';
                const expected = 12;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] / [int]', () => {
                const input = '8 / 4;';
                const expected = 2;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] == [int] for true', () => {
                const input = '2 == 2;';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] == [int] for false', () => {
                const input = '2 == 3;';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] != [int] for false', () => {
                const input = '2 != 2;';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [int] != [int] for true', () => {
                const input = '2 != 3;';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });
        });

        describe('func', () => {
            it('should eval func with no param', () => {
                const input = `let five = fn() { 5; }; five();`;
                const expected = 5;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval func with 1 param', () => {
                const input = `let double = fn(x) { x * 2; }; double(5);`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval func with 2 params', () => {
                const input = `let add = fn(x, y) { x + y; }; add(2, 5);`;
                const expected = 7;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });

        describe('if', () => {
            it('should eval if expressions for condition true', () => {
                const input = `if (10 > 1) { 10; }`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval if expressions for condition false', () => {
                const input = `if (1 > 10) { 9; } else { 10; }`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval if expressions for condition false but with no alternative', () => {
                const input = `if (1 > 10) { 10; }`;

                const actual = testEval(input);
                expect(actual.objType).toBe('NIL');
            });
        });

    });

    describe('statements', () => {
        describe('return', () => {
            it('should eval return statement', () => {
                const input = `return 10;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval last expression as returned value when there is no explicit return', () => {
                const input = `10;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval return statement when there are previous statements', () => {
                const input = `8; 9; return 10;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval nested return statement', () => {
                const input = `if (true) { return 10; } return 9;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval nested-nested return statement', () => {
                const input = `if (true) { if (true) { return 10; }; return 9; } return 8;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });

        describe('let', () => {
            it('should assign value in let statement', () => {
                const input = `let a = 10; a;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should assign calculated value in let statement', () => {
                const input = `let a = 5 + 5; a;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should assign identifier value in let statement', () => {
                const input = `let b = 10; let a = b; a;`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });
    });
});

const testEval = (input: string): Obj => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    const env = new Environment();
    const evaluator = new Evaluator();
    return evaluator.eval(program, env);
};
