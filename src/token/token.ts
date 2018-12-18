export type TokenType =
  | 'ILLEGAL'
  | 'EOF'
  // identifier & literal
  | 'IDENT'
  | 'INT'
  // operators
  | 'ASSIGN'
  | 'PLUS'
  | 'MINUS'
  | 'ASTERISK'
  | 'SLASH'
  | 'BANG'
  | 'LT'
  | 'GT'
  | 'EQ'
  | 'NOT_EQ'
  // delimiters
  | 'COMMA'
  | 'SEMICOLON'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACE'
  | 'RBRACE'
  // keywords
  | 'LET'
  | 'FUNCTION'
  | 'IF'
  | 'ELSE'
  | 'RETURN'
  | 'TRUE'
  | 'FALSE';

export class Token {
  public type: TokenType;
  public literal: string;

  constructor(type: TokenType, literal: string) {
    this.type = type;
    this.literal = literal;
  }
}

export const getTokenTypeFromLiteral = (literal: string): TokenType => {
  switch (literal) {
    case 'let':
      return 'LET';
    case 'fn':
      return 'FUNCTION';
    case 'if':
      return 'IF';
    case 'else':
      return 'ELSE';
    case 'return':
      return 'RETURN';
    case 'true':
      return 'TRUE';
    case 'false':
      return 'FALSE';
    default:
      return 'IDENT';
  }
};
