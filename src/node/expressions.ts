import { Token } from '../token/token';
import { BlockStatement } from './statements';

export type Expression =
    | Identifier
    | IntLiteral
    | StrLiteral
    | BoolLiteral
    | PrefixExpression
    | InfixExpression
    | IfExpression
    | FuncLiteral
    | CallExpression
    | HashLiteral
    | ArrLiteral
    | IndexExpression;

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

    public toString(): string {
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

    public toString(): string {
        return this.value.toString();
    }
}

export class StrLiteral {
    public readonly nodeType = 'STR_LITERAL';
    public token: Token;
    public value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    public toString(): string {
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

    public toString(): string {
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

    public toString(): string {
        return `(${this.operator}${this.right.toString()})`;
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

    public toString(): string {
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
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

    public toString(): string {
        const str = `if ${this.condition.toString()} ${this.consequence.string()}`;
        return this.alternative === undefined ? str : `${str} else ${this.alternative}`;
    }
}

export class FuncLiteral {
    public readonly nodeType = 'FUNC_LITERAL';
    public readonly token = new Token('IF', 'if');
    public parameters: Identifier[];
    public body: BlockStatement;

    constructor(parameters: Identifier[], body: BlockStatement) {
        this.parameters = parameters;
        this.body = body;
    }

    public toString(): string {
        return `fn(${this.parameters.map((ident) => ident.toString()).join(', ')}) ${this.body.string()}`;
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

    public toString(): string {
        return `${this.func.toString()}(${this.args.map((arg) => arg.toString()).join(', ')})`;
    }
}

export class HashLiteral {
    public readonly nodeType = 'HASH_LITERAL';
    public token = new Token('LBRACKET', '{');
    public pairs: Map<Expression, Expression>;

    constructor(pairs: Map<Expression, Expression>) {
        this.pairs = pairs;
    }

    public toString(): string {
        let str = '{ ';
        for (const [k, v] of this.pairs.entries()) {
            str += `${k}: ${v}`;
        }
        str += ' }';

        return str;
    }
}

export class ArrLiteral {
    public readonly nodeType = 'ARR_LITERAL';
    public token = new Token('LBRACKET', '[');
    public elements: Expression[];

    constructor(elements: Expression[]) {
        this.elements = elements;
    }

    public toString(): string {
        return `[${this.elements.map((e) => e.toString()).join(', ')}]`;
    }
}

export class IndexExpression {
    public readonly nodeType = 'INDEX_EXPRESSION';
    public readonly token = new Token('LPAREN', '[');
    public left: Expression;
    public index: Expression;

    constructor(left: Expression, index: Expression) {
        this.left = left;
        this.index = index;
    }

    public toString(): string {
        return `${this.left}[${this.index}]`;
    }
}
