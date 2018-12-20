import { Lexer } from '../lexer/lexer';
import {
    BoolLiteral, CallExpression,
    Expression, FunctionLiteral,
    Identifier, IfExpression, InfixExpression,
    IntLiteral, Operator,
    ParseInfixFunc,
    ParsePrefixFunc,
    PrefixExpression,
} from '../node/expressions';
import { Program } from '../node/node';
import { BlockStatement, ExpressionStatement, LetStatement, ReturnStatement, Statement } from '../node/statements';
import { Token, TokenType } from '../token/token';

enum Precedence {
    LOWEST = 0,
    EQUAL,
    COMPARISON,
    PLUS_MINUS,
    ASTERISK_SLASH,
    PREFIX,
    CALL,
}

const infixPrecedences: { [type in TokenType]?: Precedence } = {
    EQ: Precedence.EQUAL,
    NOT_EQ: Precedence.EQUAL,
    LT: Precedence.COMPARISON,
    GT: Precedence.COMPARISON,
    PLUS: Precedence.PLUS_MINUS,
    MINUS: Precedence.PLUS_MINUS,
    ASTERISK: Precedence.ASTERISK_SLASH,
    SLASH: Precedence.ASTERISK_SLASH,
    LPAREN: Precedence.CALL,
};

class ParseError implements Error {
    public readonly name = 'ParseError';
    public message: string;

    constructor(message: string) {
        this.message = message;
    }
}

export class Parser {
    public lexer: Lexer;

    public currentToken: Token;
    public peekToken: Token;

    public parsePrefixFuncs: { [type in TokenType]?: ParsePrefixFunc };
    public parseInfixFuncs: { [type in TokenType]?: ParseInfixFunc };

    constructor(lexer: Lexer) {
        this.lexer = lexer;

        this.currentToken = new Token('EOF', '');
        this.peekToken = new Token('EOF', '');

        this.parsePrefixFuncs = {
            IDENT: this.parseIdentifier.bind(this),
            INT: this.parseIntLiteral.bind(this),
            TRUE: this.parseBoolLiteral.bind(this),
            FALSE: this.parseBoolLiteral.bind(this),
            MINUS: this.parsePrefixExpression.bind(this),
            BANG: this.parsePrefixExpression.bind(this),
            LPAREN: this.parseGroupedExpression.bind(this),
            IF: this.parseIfExpression.bind(this),
            FUNCTION: this.parseFunctionLiteral.bind(this),
        };
        this.parseInfixFuncs = {
            EQ: this.parseInfixExpression.bind(this),
            NOT_EQ: this.parseInfixExpression.bind(this),
            LT: this.parseInfixExpression.bind(this),
            GT: this.parseInfixExpression.bind(this),
            PLUS: this.parseInfixExpression.bind(this),
            MINUS: this.parseInfixExpression.bind(this),
            ASTERISK: this.parseInfixExpression.bind(this),
            SLASH: this.parseInfixExpression.bind(this),
            LPAREN: this.parseCallExpression.bind(this),
        };

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const statements: Statement[] = [];

        while (!this.isCurrentTokenType('EOF')) {
            const statement = this.parseStatement();
            statements.push(statement);

            this.nextToken();
        }

        return new Program(statements);
    }

    public parseBlockStatement(): BlockStatement {
        const statements: Statement[] = [];

        this.nextToken();

        while (!this.isCurrentTokenType('RBRACE')) {
            const statement = this.parseStatement();
            statements.push(statement);

            this.nextToken();
        }

        return new BlockStatement(statements);
    }

    private nextToken() {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private isCurrentTokenType(type: TokenType): boolean {
        return this.currentToken.type === type;
    }

    private isPeekTokenType(type: TokenType): boolean {
        return this.peekToken.type === type;
    }

    private currentTokenPrecedence(): Precedence {
        return infixPrecedences[this.currentToken.type] || Precedence.LOWEST;
    }

    private peekTokenPrecedence(): Precedence {
        return infixPrecedences[this.peekToken.type] || Precedence.LOWEST;
    }

    private expectPeekTokenType(type: TokenType): void {
        this.nextToken();
        if (this.currentToken.type !== type) {
            throw new ParseError(`expect peek token type: ${type}, but got token type ${this.peekToken.type}`);
        }
    }

    private parseStatement(): Statement {
        switch (this.currentToken.type) {
            case 'LET':
                return this.parseLetStatement();
            case 'RETURN':
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement {
        this.expectPeekTokenType('IDENT');
        const identifier = new Identifier(this.currentToken, this.currentToken.literal);

        this.expectPeekTokenType('ASSIGN');

        this.nextToken();
        const expression = this.parseExpression(Precedence.LOWEST);
        if (this.isPeekTokenType('SEMICOLON')) {
            this.nextToken();
        }

        return new LetStatement(identifier, expression);
    }

    private parseReturnStatement(): ReturnStatement {
        this.nextToken();
        const expression = this.parseExpression(Precedence.LOWEST);
        if (this.isPeekTokenType('SEMICOLON')) {
            this.nextToken();
        }

        return new ReturnStatement(expression);
    }

    private parseExpressionStatement(): ExpressionStatement {
        const expression = this.parseExpression(Precedence.LOWEST);
        if (this.isPeekTokenType('SEMICOLON')) {
            this.nextToken();
        }

        return new ExpressionStatement(expression);
    }

    private parseExpression(precedence: Precedence): Expression {
        const parsePrefix = this.parsePrefixFuncs[this.currentToken.type];
        if (parsePrefix === undefined) {
            throw new ParseError(`parser has no function to parse prefix expression ${this.currentToken.literal}`);
        }

        let left = parsePrefix();

        while (precedence < this.peekTokenPrecedence()) {
            const parseInfix = this.parseInfixFuncs[this.peekToken.type];
            if (parseInfix === undefined) {
                throw new ParseError(`parser has no function to parse infix expression ${this.peekToken.literal}`);
            }

            this.nextToken();
            left = parseInfix(left);
        }

        return left;
    }

    private parseIdentifier(): Identifier {
        return new Identifier(this.currentToken, this.currentToken.literal);
    }

    private parseIntLiteral(): IntLiteral {
        const value = parseInt(this.currentToken.literal, 10);
        if (isNaN(value)) {
            throw new ParseError(`cannot parse token ${this.currentToken} as a int literal`);
        }

        return new IntLiteral(this.currentToken, value);
    }

    private parseBoolLiteral(): BoolLiteral {
        return new BoolLiteral(this.currentToken, this.currentToken.type === 'TRUE');
    }

    private parsePrefixExpression(): PrefixExpression {
        const token = this.currentToken;
        const operator = this.currentToken.literal as Operator;

        this.nextToken();
        const right = this.parseExpression(Precedence.PREFIX);

        return new PrefixExpression(token, operator, right);
    }

    private parseInfixExpression(left: Expression): InfixExpression {
        const token = this.currentToken;
        const operator = this.currentToken.literal as Operator;

        const precedence = this.currentTokenPrecedence();

        this.nextToken();
        const right = this.parseExpression(precedence);

        return new InfixExpression(token, left, operator, right);
    }

    private parseGroupedExpression(): Expression {
        this.nextToken();
        const groupedExpression = this.parseExpression(Precedence.LOWEST);
        this.expectPeekTokenType('RPAREN');

        return groupedExpression;
    }

    private parseIfExpression(): IfExpression {
        this.expectPeekTokenType('LPAREN');
        this.nextToken();

        const condition = this.parseExpression(Precedence.LOWEST);

        this.expectPeekTokenType('RPAREN');
        this.expectPeekTokenType('LBRACE');

        const consequence = this.parseBlockStatement();

        if (!this.isPeekTokenType('ELSE')) {
            if (this.isPeekTokenType('SEMICOLON')) { this.nextToken(); }
            return new IfExpression(condition, consequence);
        } else {
            this.nextToken();
            this.expectPeekTokenType('LBRACE');

            const alternative = this.parseBlockStatement();
            if (this.isPeekTokenType('SEMICOLON')) { this.nextToken(); }

            return new IfExpression(condition, consequence, alternative);
        }
    }

    private parseFunctionLiteral(): FunctionLiteral {
        this.expectPeekTokenType('LPAREN');
        const parameters = this.parseFunctionParameters();

        this.expectPeekTokenType('LBRACE');
        const body = this.parseBlockStatement();

        return new FunctionLiteral(parameters, body);
    }

    private parseFunctionParameters(): Identifier[] {
        const parameters: Identifier[] = [];
        if (this.isPeekTokenType('RPAREN')) {
            this.nextToken();
            return parameters;
        }

        this.nextToken();
        parameters.push(this.parseIdentifier());

        while (!this.isPeekTokenType('RPAREN')) {
            this.expectPeekTokenType('COMMA');

            this.nextToken();
            parameters.push(this.parseIdentifier());
        }
        this.nextToken();

        return parameters;
    }

    private parseCallExpression(func: Expression): CallExpression {
        const args = this.parseCallArgs();

        return new CallExpression(func, args);
    }

    private parseCallArgs(): Expression[] {
        const args: Expression[] = [];
        if (this.isPeekTokenType('RPAREN')) {
            this.nextToken();
            return args;
        }

        this.nextToken();
        args.push(this.parseExpression(Precedence.LOWEST));

        while (!this.isPeekTokenType('RPAREN')) {
            this.expectPeekTokenType('COMMA');
            this.nextToken();
            args.push(this.parseExpression(Precedence.LOWEST));
        }
        this.nextToken();

        return args;
    }
}
