import { Identifier } from '../node/expressions';
import { BlockStatement } from '../node/statements';
import { Environment } from './environment';

export type Obj = Int | Bool | RetVal | Err | Func | Nil;

export class Int {
    public readonly objType = 'INT';
    public value: number;

    constructor(value: number) {
        this.value = value;
    }

    public inspect(): string {
        return this.value.toString();
    }
}

export class Bool {
    public readonly objType = 'BOOL';
    public value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    public inspect(): string {
        return this.value.toString();
    }
}

export class RetVal {
    public readonly objType = 'RET_VAL';
    public value: Obj;

    constructor(value: Obj) {
        this.value = value;
    }

    public inspect(): string {
        return this.value.inspect();
    }
}

export class Func {
    public readonly objType = 'FUNC';
    public parameters: Identifier[];
    public body: BlockStatement;
    public env: Environment; // environment when the function is defined

    constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    public inspect(): string {
        return `fn(${this.parameters.map((p) => p.name).join(', ')}) { ${this.body.string()} }`;
    }
}

export class Err {
    public readonly objType = 'ERR';
    public message: string;

    constructor(message: string) {
        this.message = message;
    }

    public inspect(): string {
        return `ERROR: ${this.message}`;
    }
}

export class Nil {
    public readonly objType = 'NIL';
    public readonly value = null;

    constructor() {}

    public inspect(): string {
        return `${this.value}`;
    }
}
