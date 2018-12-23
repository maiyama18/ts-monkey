import { Lexer } from '../../src/lexer/lexer';
import {
    ArrLiteral,
    BoolLiteral,
    Expression, FuncLiteral, Identifier, IfExpression,
    InfixExpression,
    IntLiteral,
    Operator,
    PrefixExpression, StrLiteral,
} from '../../src/node/expressions';
import {
    BlockStatement,
    ExpressionStatement,
    LetStatement,
    ReturnStatement,
} from '../../src/node/statements';
import { Parser } from '../../src/parser/parser';

describe('parser', () => {
    describe('expression', () => {
        describe('IntLiteral', () => {
            it('should parse IntLiteral', () => {
                const input = `42;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, 42);
            });
        });

        describe('StrLiteral', () => {
            it('should parse StrLiteral', () => {
                const input = `"hello world";`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, 'hello world');
            });
        });

        describe('BoolLiteral', () => {
            it('should parse true', () => {
                const input = `true;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, true);
            });

            it('should parse true', () => {
                const input = `false;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, false);
            });
        });

        describe('Identifier', () => {
            it('should parse single char identifier', () => {
                const input = `x;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, 'x');
            });

            it('should parse multiple chars identifier', () => {
                const input = `foo;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, 'foo');
            });

            it('should parse identifier with underscore', () => {
                const input = `foo_bar;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testSingleExpression(expressionStatement.expression, 'foo_bar');
            });
        });

        describe('Prefix Expression', () => {
            it('should parse minus expression', () => {
                const input = `-42;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testPrefixExpression(expressionStatement.expression, '-', 42);
            });

            it('should parse bang expression', () => {
                const input = `!false;`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testPrefixExpression(expressionStatement.expression, '!', false);
            });
        });

        describe('Infix Expression', () => {
            it('should parse plus expression', () => {
                const input = `3 + 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '+', 42);
            });

            it('should parse minus expression', () => {
                const input = `3 - 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '-', 42);
            });

            it('should parse asterisk expression', () => {
                const input = `3 * 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '*', 42);
            });

            it('should parse slash expression', () => {
                const input = `3 / 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '/', 42);
            });

            it('should parse equal expression', () => {
                const input = `3 == 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '==', 42);
            });

            it('should parse not equal expression', () => {
                const input = `3 != 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '!=', 42);
            });

            it('should parse larger than expression', () => {
                const input = `3 > 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '>', 42);
            });

            it('should parse smaller than expression', () => {
                const input = `3 < 42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '<', 42);
            });

            it('should parse infix expression with no internal spaces', () => {
                const input = `3+42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                testInfixExpression(expressionStatement.expression, 3, '+', 42);
            });

            it('should parse infix expression with prefix expression', () => {
                const input = `3 + -42`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;

                const infixExpression = expressionStatement.expression as InfixExpression;
                testSingleExpression(infixExpression.left, 3);
                expect(infixExpression.operator).toBe('+');
                testPrefixExpression(infixExpression.right, '-', 42);
            });

            it('should parse if expression', () => {
                const input = `if (a > 5) { a; } else { return 5; }`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;

                const ifExpression = expressionStatement.expression as IfExpression;
                testInfixExpression((ifExpression.condition) as InfixExpression, 'a', '>', 5);

                testSingleExpression((ifExpression.consequence.statements[0] as ExpressionStatement).expression, 'a');

                testSingleExpression(
                    ((ifExpression.alternative as BlockStatement).statements[0] as ReturnStatement).expression,
                    5,
                );
            });

            it('should throw exception when the parse prefix function is not found', () => {
                const input = `+5;`;
                expect(() => parseProgram(input)).toThrowError(/no function to parse prefix/);
            });

            it('should throw exception when there is no = in let statement', () => {
                const input = `let a 5;`;
                expect(() => parseProgram(input)).toThrowError(/expect peek token type/);
            });
        });

        describe('function', () => {
            it('should parse function', () => {
                const input = `fn(x, y) { x + y; }`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;

                const funcLiteral = expressionStatement.expression as FuncLiteral;

                expect(funcLiteral.parameters[0].name).toBe('x');
                expect(funcLiteral.parameters[1].name).toBe('y');

                testInfixExpression(
                    (((funcLiteral.body.statements[0]) as ExpressionStatement).expression),
                    'x', '+', 'y',
                );
            });

            it('should parse closure', () => {
                const input = `fn (x) { return fn(y) { x + y; } }`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                const funcLiteral = expressionStatement.expression as FuncLiteral;

                expect(funcLiteral.parameters.length).toBe(1);
                expect(funcLiteral.parameters[0].name).toBe('x');

                expect(funcLiteral.body.statements.length).toBe(1);

                const nextedExpressionStatement = funcLiteral.body.statements[0] as ExpressionStatement;
                const closureLiteral = nextedExpressionStatement.expression as FuncLiteral;

                expect(closureLiteral.parameters.length).toBe(1);
                expect(closureLiteral.parameters[0].name).toBe('y');

                testInfixExpression(
                    (((closureLiteral.body.statements[0]) as ExpressionStatement).expression),
                    'x', '+', 'y',
                );
            });
        });

        describe('array literal', () => {
            it('should parse empty array', () => {
                const input = `[];`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                const arrLiteral = expressionStatement.expression as ArrLiteral;

                expect(arrLiteral.elements.length).toBe(0);
            });

            it('should parse array with literal elements', () => {
                const input = `[1, "hello", true];`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                const arrLiteral = expressionStatement.expression as ArrLiteral;

                const { elements } = arrLiteral;
                expect(elements.length).toBe(3);
                testSingleExpression(elements[0], 1);
                testSingleExpression(elements[1], 'hello');
                testSingleExpression(elements[2], true);
            });

            it('should parse array with complex expression elements', () => {
                const input = `[-1, x * y];`;
                const { statements } = parseProgram(input);

                expect(statements.length).toBe(1);

                const expressionStatement = statements[0] as ExpressionStatement;
                const arrLiteral = expressionStatement.expression as ArrLiteral;

                const { elements } = arrLiteral;
                expect(elements.length).toBe(2);
                testPrefixExpression(elements[0], '-', 1);
                testInfixExpression(elements[1], 'x', '*', 'y');
            });
        });
    });

    describe('single statement', () => {
        it('should parse let statement', () => {
            const input = `let foo = 42;`;
            const { statements } = parseProgram(input);

            expect(statements.length).toBe(1);

            const letStatement = statements[0] as LetStatement;
            expect(letStatement.identifier.name).toBe('foo');
            testSingleExpression(letStatement.expression, 42);
        });

        it('should parse return statement', () => {
            const input = `return foo;`;
            const { statements } = parseProgram(input);

            expect(statements.length).toBe(1);

            const returnStatement = statements[0] as ReturnStatement;
            testSingleExpression(returnStatement.expression, 'foo');
        });
    });

    describe('multiple statements', () => {
        it('should parse multiple statements', () => {
            const input = `
let a = 5;
return a;
`;
            const { statements } = parseProgram(input);

            expect(statements.length).toBe(2);

            const letStatement = statements[0] as LetStatement;
            testSingleExpression(letStatement.identifier, 'a');
            testSingleExpression(letStatement.expression, 5);

            const returnStatement = statements[1] as ReturnStatement;
            testSingleExpression(returnStatement.expression, 'a');
        });

        it('should parse multiple statements without trailing semicolon', () => {
            const input = `
let a = 5
return a
a
`;
            const { statements } = parseProgram(input);

            expect(statements.length).toBe(3);

            const letStatement = statements[0] as LetStatement;
            testSingleExpression(letStatement.identifier, 'a');
            testSingleExpression(letStatement.expression, 5);

            const returnStatement = statements[1] as ReturnStatement;
            testSingleExpression(returnStatement.expression, 'a');

            const expressionStatement = statements[2] as ExpressionStatement;
            testSingleExpression(expressionStatement.expression, 'a');
        });
    });
});

const parseProgram = (input: string) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    return parser.parseProgram();
};

const testPrefixExpression = (
    expression: Expression,
    expectedOperator: Operator, expectedRight: number | boolean | string,
) => {
    expect(expression).toBeInstanceOf(PrefixExpression);
    const prefixExpression = expression as PrefixExpression;
    expect(prefixExpression.operator).toBe(expectedOperator);
    testSingleExpression(prefixExpression.right, expectedRight);
};

const testInfixExpression = (
    expression: Expression,
    expectedLeft: number | boolean | string, expectedOperator: Operator, expectedRight: number | boolean | string,
) => {
    expect(expression).toBeInstanceOf(InfixExpression);
    const infixExpression = expression as InfixExpression;
    testSingleExpression(infixExpression.left, expectedLeft);
    expect(infixExpression.operator).toBe(expectedOperator);
    testSingleExpression(infixExpression.right, expectedRight);
};

const testSingleExpression = (expression: Expression, expected: number | boolean | string) => {
    switch (typeof expected) {
        case 'number':
            return testIntLiteral(expression, expected as number);
        case 'boolean':
            return testBoolLiteral(expression, expected as boolean);
        case 'string':
            if (expression.nodeType === 'STR_LITERAL') {
                return testStrLiteral(expression, expected as string);
            } else {
                return testIdentifier(expression, expected as string);
            }
    }
};

const testIntLiteral = (expression: Expression, expected: number) => {
    expect(expression).toBeInstanceOf(IntLiteral);
    expect((expression as IntLiteral).value).toBe(expected);
};
const testStrLiteral = (expression: Expression, expected: string) => {
    expect(expression).toBeInstanceOf(StrLiteral);
    expect((expression as StrLiteral).value).toBe(expected);
};
const testBoolLiteral = (expression: Expression, expected: boolean) => {
    expect(expression).toBeInstanceOf(BoolLiteral);
    expect((expression as BoolLiteral).value).toBe(expected);
};
const testIdentifier = (expression: Expression, expected: string) => {
    expect(expression).toBeInstanceOf(Identifier);
    expect((expression as Identifier).name).toBe(expected);
};
