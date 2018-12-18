import { Statement } from './statements';
import { Expression } from './expressions';

export class Program {
    public readonly nodeType = 'PROGRAM';
    public statements: Statement[];

    constructor(statements: Statement[]) {
        this.statements = statements;
    }

    public string(): string {
        return this.statements.map((statement) => statement.string()).join('');
    }
}

export type Node = Program | Statement | Expression;
