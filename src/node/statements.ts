import { Token } from '../token/token';
import { Expression, Identifier } from './expressions';

export type Statement =
  | BlockStatement
  | LetStatement
  | ReturnStatement
  | ExpressionStatement;

export class BlockStatement {
  public readonly nodeType = 'BLOCK_STATEMENT';
  public readonly token = new Token('LBRACE', '{');
  public statements: Statement[];

  constructor(statements: Statement[]) {
    this.statements = statements || [];
  }

  public string(): string {
    return this.statements.map((statement) => statement.string()).join('');
  }
}

export class LetStatement {
  public readonly nodeType = 'LET_STATEMENT';
  public readonly token = new Token('LET', 'let');
  public identifier: Identifier;
  public expression: Expression;

  constructor(identifier: Identifier, expression: Expression) {
    this.identifier = identifier;
    this.expression = expression;
  }

  public string(): string {
    return `let ${this.identifier.string()} = ${this.expression.string()};`;
  }
}

export class ReturnStatement {
  public readonly nodeType = 'RETURN_STATEMENT';
  public readonly token = new Token('RETURN', 'return');
  public expression: Expression;

  constructor(expression: Expression) {
    this.expression = expression;
  }

  public string(): string {
    return `return ${this.expression.string()}`;
  }
}

export class ExpressionStatement {
  public readonly nodeType = 'EXPRESSION_STATEMENT';
  public token: Token; // first token of expression
  public expression: Expression;

  constructor(expression: Expression) {
    this.token = expression.token;
    this.expression = expression;
  }

  public string(): string {
    return this.expression.string();
  }
}
