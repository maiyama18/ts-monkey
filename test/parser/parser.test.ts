import { Lexer } from '../../src/lexer/lexer';
import {
    BoolLiteral,
    Expression, Identifier,
    InfixExpression,
    IntLiteral,
    Operator,
    PrefixExpression,
} from '../../src/node/expressions';
import { ExpressionStatement, LetStatement, ReturnStatement, Statement } from '../../src/node/statements';
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
            const input = `return foo`;
            const { statements } = parseProgram(input);

            expect(statements.length).toBe(1);

            const returnStatement = statements[0] as ReturnStatement;
            testSingleExpression(returnStatement.expression, 'foo');
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
            return testIntegerLiteral(expression, expected as number);
        case 'boolean':
            return testBooleanLiteral(expression, expected as boolean);
        case 'string':
            return testIdentifier(expression, expected as string);
    }
};

const testIntegerLiteral = (expression: Expression, expected: number) => {
    expect(expression).toBeInstanceOf(IntLiteral);
    expect((expression as IntLiteral).value).toBe(expected);
};
const testBooleanLiteral = (expression: Expression, expected: boolean) => {
    expect(expression).toBeInstanceOf(BoolLiteral);
    expect((expression as BoolLiteral).value).toBe(expected);
};
const testIdentifier = (expression: Expression, expected: string) => {
    expect(expression).toBeInstanceOf(Identifier);
    expect((expression as Identifier).name).toBe(expected);
};
