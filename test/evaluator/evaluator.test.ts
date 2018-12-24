import { Evaluator } from '../../src/evaluator/evaluator';
import { Lexer } from '../../src/lexer/lexer';
import { Environment } from '../../src/object/environment';
import { Bool, Int, Obj, Str } from '../../src/object/object';
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

        describe('str', () => {
            it('should eval str', () => {
                const input = `"hello world!";`;
                const expected = 'hello world!';

                const actual = testEval(input) as Str;
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

            it('should throw error for -[true]', () => {
                const input = '-true;';
                expect(() => testEval(input)).toThrowError(/invalid operator/);
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

            it('should eval [str] + [str]', () => {
                const input = '"hello" + " " + "world!"';
                const expected = 'hello world!';

                const actual = testEval(input) as Str;
                expect(actual.value).toBe(expected);
            });

            it('should eval [str] == [str] for true', () => {
                const input = '"hello" == "hello";';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [str] == [str] for false', () => {
                const input = '"hello" == "world";';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [str] != [str] for true', () => {
                const input = '"hello" != "world";';
                const expected = true;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should eval [str] != [str] for false', () => {
                const input = '"hello" != "hello";';
                const expected = false;

                const actual = testEval(input) as Bool;
                expect(actual.value).toBe(expected);
            });

            it('should throw error for [int] + [bool]', () => {
                const input = '2 + true;';
                expect(() => testEval(input)).toThrowError(`type mismatch`);
            });

            it('should throw error for [bool] + [bool]', () => {
                const input = 'false + true;';
                expect(() => testEval(input)).toThrowError(`invalid operator`);
            });

            it('should eval [str] - [str]', () => {
                const input = '"hello" - " world"';
                expect(() => testEval(input)).toThrowError(`invalid operator`);
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

            it('should eval top-level closure', () => {
                const input = `let a = 5; let add = fn(x) { x + a; }; add(3);`;
                const expected = 8;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval closure', () => {
                const input = `
let outer_two = 2;
let new_two_generator = fn() { let two = 2; return fn() { return outer_two; } };
let two_generator = new_two_generator()
two_generator();
`;
                const expected = 2;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval nested closure', () => {
                const input = `
let new_adder = fn(x) { return fn(y) { x + y; } };
let add_two = new_adder(2);
add_two(3)
`;
                const expected = 5;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });

        describe('if', () => {
            it('should eval if expressions for condition true', () => {
                const input = `if (10 > 1) { return 10; }`;
                const expected = 10;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should eval if expressions for condition false', () => {
                const input = `if (1 > 10) { return 9; } else { 10; }`;
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

        describe('index', () => {
            it('should eval index expression', () => {
                const input = `["hello", "world"][1];`;
                const expected = 'world';

                const actual = testEval(input) as Str;
                expect(actual.value).toBe(expected);
            });

            it('should eval index expression with identifier left', () => {
                const input = `let arr = ["hello", "world"]; arr[1];`;
                const expected = 'world';

                const actual = testEval(input) as Str;
                expect(actual.value).toBe(expected);
            });

            it('should throw for out of range index', () => {
                const input = `let arr = ["hello", "world"]; arr[3];`;
                expect(() => testEval(input)).toThrowError(`out of range`);
            });

            it('should throw for non int index', () => {
                const input = `let arr = ["hello", "world"]; arr["hello"];`;
                expect(() => testEval(input)).toThrowError(`not an INT`);
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

            it('should throw error for undefined identifier', () => {
                const input = `let a = 10; b;`;
                expect(() => testEval(input)).toThrowError(`undefined identifier`);
            });
        });
    });

    describe('builtin', () => {
        describe('len', () => {
            it('should count the length of STR', () => {
                const input = `len("hello world")`;
                const expected = 11;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should generate 0 for empty STR', () => {
                const input = `len("")`;
                const expected = 0;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should count the length of ARR', () => {
                const input = `len([1, 2, 3, "hello", true])`;
                const expected = 5;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should generate 0 for empty ARR', () => {
                const input = `len([])`;
                const expected = 0;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should throw error for types other than STR / ARR', () => {
                const input = `len(true)`;
                expect(() => testEval(input)).toThrowError(`argument type wrong`);
            });
        });

        describe('push', () => {
            it('should push an element to array', () => {
                const input = `let arr = push([0,1,2], 3); arr[3]`;
                const expected = 3;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });

            it('should throw error for wrong number of arguments', () => {
                const input = `let arr = push([0,1,2])`;
                expect(() => testEval(input)).toThrowError(`number of arguments`);
            });
        });

        describe('first', () => {
            it('should return the first element of ARR', () => {
                const input = `first([2, 0, 1])`;
                const expected = 2;

                const actual = testEval(input) as Int;
                expect(actual.value).toBe(expected);
            });
        });

        describe('last', () => {
            it('should return the last element of ARR', () => {
                const input = `last([2, 0, 1])`;
                const expected = 1;

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
