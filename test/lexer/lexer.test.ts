import { Lexer } from '../../src/lexer/lexer';
import { Token } from '../../src/token/token';

describe('lexer', () => {
  describe('nextToken()', () => {
    it('should tokenize one-character symbols', () => {
      const input = `=+(){},;`;
      const expectedTokens = [
        new Token('ASSIGN', '='),
        new Token('PLUS', '+'),
        new Token('LPAREN', '('),
        new Token('RPAREN', ')'),
        new Token('LBRACE', '{'),
        new Token('RBRACE', '}'),
        new Token('COMMA', ','),
        new Token('SEMICOLON', ';'),
        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should tokenize identifiers, literals, and keywords', () => {
      const input = `
let five = 5;
let add = fn(x, y) {
  x + y;
}
let result = add(five, 10);
      `;
      const expectedTokens = [
        new Token('LET', 'let'),
        new Token('IDENT', 'five'),
        new Token('ASSIGN', '='),
        new Token('INT', '5'),
        new Token('SEMICOLON', ';'),

        new Token('LET', 'let'),
        new Token('IDENT', 'add'),
        new Token('ASSIGN', '='),
        new Token('FUNCTION', 'fn'),
        new Token('LPAREN', '('),
        new Token('IDENT', 'x'),
        new Token('COMMA', ','),
        new Token('IDENT', 'y'),
        new Token('RPAREN', ')'),
        new Token('LBRACE', '{'),

        new Token('IDENT', 'x'),
        new Token('PLUS', '+'),
        new Token('IDENT', 'y'),
        new Token('SEMICOLON', ';'),

        new Token('RBRACE', '}'),

        new Token('LET', 'let'),
        new Token('IDENT', 'result'),
        new Token('ASSIGN', '='),
        new Token('IDENT', 'add'),
        new Token('LPAREN', '('),
        new Token('IDENT', 'five'),
        new Token('COMMA', ','),
        new Token('INT', '10'),
        new Token('RPAREN', ')'),
        new Token('SEMICOLON', ';'),

        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should tokenize additional one-character symbols', () => {
      const input = `-*/><!;`;
      const expectedTokens = [
        new Token('MINUS', '-'),
        new Token('ASTERISK', '*'),
        new Token('SLASH', '/'),
        new Token('GT', '>'),
        new Token('LT', '<'),
        new Token('BANG', '!'),
        new Token('SEMICOLON', ';'),
        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should tokenize additional keywords', () => {
      const input = `
if (5 < 10) {
  return true;
} else {
  return false;
}
      `;
      const expectedTokens = [
        new Token('IF', 'if'),
        new Token('LPAREN', '('),
        new Token('INT', '5'),
        new Token('LT', '<'),
        new Token('INT', '10'),
        new Token('RPAREN', ')'),
        new Token('LBRACE', '{'),

        new Token('RETURN', 'return'),
        new Token('TRUE', 'true'),
        new Token('SEMICOLON', ';'),

        new Token('RBRACE', '}'),
        new Token('ELSE', 'else'),
        new Token('LBRACE', '{'),

        new Token('RETURN', 'return'),
        new Token('FALSE', 'false'),
        new Token('SEMICOLON', ';'),

        new Token('RBRACE', '}'),

        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should tokenize operators consist of two characters', () => {
      const input = `
5 == 5;
5 != 10;
      `;
      const expectedTokens = [
        new Token('INT', '5'),
        new Token('EQ', '=='),
        new Token('INT', '5'),
        new Token('SEMICOLON', ';'),

        new Token('INT', '5'),
        new Token('NOT_EQ', '!='),
        new Token('INT', '10'),
        new Token('SEMICOLON', ';'),

        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should return only EOF token array for empty input', () => {
      const input = ``;
      const expectedTokens = [
        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });

    it('should tokenize sentense without trailing comma', () => {
      const input = `let a = 5`;
      const expectedTokens = [
        new Token('LET', 'let'),
        new Token('IDENT', 'a'),
        new Token('ASSIGN', '='),
        new Token('INT', '5'),
        new Token('EOF', ''),
      ];

      const lexer = new Lexer(input);

      expectedTokens.forEach((expectedToken) => {
        expect(lexer.nextToken()).toEqual(expectedToken);
      });
    });
  });
});
