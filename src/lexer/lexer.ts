import { getTokenTypeFromLiteral, Token } from '../token/token';

export class Lexer {
    private readonly input: string;
    private position: number;
    private peekPosition: number;
    private char: string;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.peekPosition = 1;
        this.char = input.length > 0 ? input[0] : '';
    }

    public nextToken(): Token {
        this.skipWhiteSpaces();

        let token: Token;
        switch (this.char) {
            case '=':
                if (this.peekChar() === '=') {
                    this.consumeChar();
                    token = new Token('EQ', '==');
                    break;
                }
                token = new Token('ASSIGN', '=');
                break;
            case '!':
                if (this.peekChar() === '=') {
                    this.consumeChar();
                    token = new Token('NOT_EQ', '!=');
                    break;
                }
                token = new Token('BANG', '!');
                break;
            case '+':
                token = new Token('PLUS', '+');
                break;
            case '-':
                token = new Token('MINUS', '-');
                break;
            case '*':
                token = new Token('ASTERISK', '*');
                break;
            case '>':
                token = new Token('GT', '>');
                break;
            case '<':
                token = new Token('LT', '<');
                break;
            case '/':
                token = new Token('SLASH', '/');
                break;
            case '(':
                token = new Token('LPAREN', '(');
                break;
            case ')':
                token = new Token('RPAREN', ')');
                break;
            case '{':
                token = new Token('LBRACE', '{');
                break;
            case '}':
                token = new Token('RBRACE', '}');
                break;
            case ',':
                token = new Token('COMMA', ',');
                break;
            case ';':
                token = new Token('SEMICOLON', ';');
                break;
            case '':
                token = new Token('EOF', '');
                break;
            case '"':
                const strLiteral = this.readStrLiteral();
                token = new Token('STR', strLiteral);
                break;
            default:
                if (isLetter(this.char)) { // IDENT, LET, FUNCTION, TRUE, FALSE, IF, ELSE
                    const literal = this.readIdentifier();
                    const type = getTokenTypeFromLiteral(literal);
                    token = new Token(type, literal);
                } else if (isDigit(this.char)) { // INT
                    const literal = this.readIntLiteral();
                    token = new Token('INT', literal);
                } else {
                    token = new Token('ILLEGAL', '');
                }
        }

        this.consumeChar();
        return token;
    }

    private consumeChar() {
        this.char = (this.peekPosition < this.input.length) ? this.input[this.peekPosition] : '';

        this.position += 1;
        this.peekPosition += 1;
    }

    private peekChar(): string {
        return (this.peekPosition < this.input.length) ? this.input[this.peekPosition] : '';
    }

    private readIdentifier(): string {
        const start = this.position;
        while (this.peekChar() !== '' && isLetter(this.peekChar())) {
            this.consumeChar();
        }

        return this.input.substring(start, this.peekPosition);
    }

    private readIntLiteral(): string {
        const start = this.position;
        while (this.peekChar() !== '' && isDigit(this.peekChar())) {
            this.consumeChar();
        }

        return this.input.substring(start, this.peekPosition);
    }

    private readStrLiteral(): string {
        this.consumeChar();

        const start = this.position;
        while (this.peekChar() !== '' && this.char !== '"') {
            this.consumeChar();
        }

        return this.input.substring(start, this.position);
    }

    private skipWhiteSpaces() {
        while (this.char === ' ' || this.char === '\t' || this.char === '\n' || this.char === '\r') {
            this.consumeChar();
        }
    }
}

export const isLetter = (char: string) => char !== '' && 'abcdefghijklmnopqrstuvwxyz_'.indexOf(char) >= 0;
export const isDigit = (char: string) => char !== '' && '0123456789'.indexOf(char) >= 0;
