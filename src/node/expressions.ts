import { Token } from '../token/token';
import { BlockStatement } from './statements';

export type Expression =
    | Identifier
    | IntLiteral
    | BoolLiteral
    | PrefixExpression
    | InfixExpression
    | IfExpression
    | FunctionLiteral
    | CallExpression;

export type Operator = '+' | '-' | '*' | '/' | '!' | '==' | '!=' | '>' | '<';

export type ParsePrefixFunc = () => Expression;
export type ParseInfixFunc = (expression: Expression) => Expression;

export class Identifier {
    public readonly nodeType = 'IDENTIFIER';
    public token: Token;
    public name: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.name = value;
    }

    public string(): string {
        return this.name;
    }
}

export class IntLiteral {
    public readonly nodeType = 'INT_LITERAL';
    public token: Token;
    public value: number;

    constructor(token: Token, value: number) {
        this.token = token;
        this.value = value;
    }

    public string(): string {
        return this.value.toString();
    }
}

export class BoolLiteral {
    public readonly nodeType = 'BOOL_LITERAL';
    public token: Token;
    public value: boolean;

    constructor(token: Token, value: boolean) {
        this.token = token;
        this.value = value;
    }

    public string(): string {
        return this.value.toString();
    }
}

export class PrefixExpression {
    public readonly nodeType = 'PREFIX_EXPRESSION';
    public token: Token;
    public operator: Operator;
    public right: Expression;

    constructor(token: Token, operator: Operator, right: Expression) {
        this.token = token;
        this.operator = operator;
        this.right = right;
    }

    public string(): string {
        return `(${this.operator}${this.right.string()})`;
    }
}

export class InfixExpression {
    public readonly nodeType = 'INFIX_EXPRESSION';
    public token: Token;
    public left: Expression;
    public operator: Operator;
    public right: Expression;

    constructor(token: Token, left: Expression, operator: Operator, right: Expression) {
        this.token = token;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    public string(): string {
        return `(${this.left.string()} ${this.operator} ${this.right.string()})`;
    }
}

export class IfExpression {
    public readonly nodeType = 'IF_EXPRESSION';
    public readonly token = new Token('IF', 'if');
    public condition: Expression;
    public consequence: BlockStatement;
    public alternative: BlockStatement | undefined;

    constructor(condition: Expression, consequence: BlockStatement, alternative?: BlockStatement) {
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }

    public string(): string {
        const str = `if ${this.condition.string()} ${this.consequence.string()}`;
        return this.alternative === undefined ? str : `${str} else ${this.alternative}`;
    }
}

export class FunctionLiteral {
    public readonly nodeType = 'FUNCTION_LITERAL';
    public readonly token = new Token('IF', 'if');
    public parameters: Identifier[];
    public body: BlockStatement;

    constructor(parameters: Identifier[], body: BlockStatement) {
        this.parameters = parameters;
        this.body = body;
    }

    public string(): string {
        return `fn(${this.parameters.map((ident) => ident.string()).join(', ')}) ${this.body.string()}`;
    }
}

export class CallExpression {
    public readonly nodeType = 'CALL_EXPRESSION';
    public readonly token = new Token('LPAREN', '(');
    public func: Expression;
    public args: Expression[];

    constructor(func: Expression, args: Expression[]) {
        this.func = func;
        this.args = args;
    }

    public string(): string {
        return `${this.func.string()}(${this.args.map((arg) => arg.string()).join(', ')})`;
    }
}
