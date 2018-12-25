import { Identifier } from '../node/expressions';
import { BlockStatement } from '../node/statements';
import { Buffer } from './buffer';
import { Environment } from './environment';

export type Obj = Int | Str | Bool | Func | Arr | Builtin | Nil;

export class Int {
    public readonly objType = 'INT';
    public value: number;

    constructor(value: number) {
        this.value = value;
    }

    public toString(): string {
        return this.value.toString();
    }
}

export class Str {
    public readonly objType = 'STR';
    public value: string;

    constructor(value: string) {
        this.value = value;
    }

    public toString(): string {
        return this.value;
    }
}

export class Bool {
    public readonly objType = 'BOOL';
    public value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    public toString(): string {
        return this.value.toString();
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

    public toString(): string {
        return `fn(${this.parameters.map((p) => p.name).join(', ')}) { ${this.body.string()} }`;
    }
}

export class Arr {
    public readonly objType = 'ARR';
    public elements: Obj[];

    constructor(elements: Obj[]) {
        this.elements = elements;
    }

    public hasIndex(index: number): boolean {
        return 0 <= index && index < this.elements.length;
    }

    public toString(): string {
        return `[${this.elements.map((e) => e.toString()).join(', ')}]`;
    }
}

export type BuiltinFunction = (buffer: Buffer, ...args: Obj[]) => Obj;
export class Builtin {
    public readonly objType = 'BUILTIN';
    public func: BuiltinFunction;

    constructor(func: BuiltinFunction) {
        this.func = func;
    }

    public toString(): string {
        return `builtin function`;
    }
}

export class Nil {
    public readonly objType = 'NIL';
    public readonly value = null;

    constructor() {}

    public toString(): string {
        return `nil`;
    }
}
