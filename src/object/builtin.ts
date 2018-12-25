import { NIL, RuntimeError } from '../evaluator/evaluator';
import { Buffer } from '../object/buffer';
import { Arr, Builtin, Int, Nil, Obj } from './object';

const lenFunc = (buffer: Buffer, ...args: Obj[]): Int => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments for len wrong: expected=1, got=${args.length}`);
    }
    const arg = args[0];
    switch (arg.objType) {
        case 'STR':
            return new Int(arg.value.length);
        case 'ARR':
            return new Int(arg.elements.length);
        default:
            throw new RuntimeError(`argument type wrong: expected=STR, got=${arg.objType}`);
    }
};

const pushFunc = (buffer: Buffer, ...args: Obj[]): Arr => {
    if (args.length !== 2) {
        throw new RuntimeError(`number of arguments for push wrong: expected=2, got=${args.length}`);
    }
    const arr = args[0];
    const elem = args[1];
    if (arr.objType !== 'ARR') {
        throw new RuntimeError(`argument type for push wrong: expected=ARR, got=${arr.objType}`);
    }

    return new Arr([...arr.elements, elem]);
};

const firstFunc = (buffer: Buffer, ...args: Obj[]): Obj => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments for first wrong: expected=1, got=${args.length}`);
    }
    const arr = args[0];
    if (arr.objType !== 'ARR') {
        throw new RuntimeError(`argument type for first wrong: expected=ARR, got=${arr.objType}`);
    }

    return (arr.elements.length === 0) ? NIL : arr.elements[0];
};

const lastFunc = (buffer: Buffer, ...args: Obj[]): Obj => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments for last wrong: expected=1, got=${args.length}`);
    }
    const arr = args[0];
    if (arr.objType !== 'ARR') {
        throw new RuntimeError(`argument type for last wrong: expected=ARR, got=${arr.objType}`);
    }

    return (arr.elements.length === 0) ? NIL : arr.elements.slice(-1)[0];
};

const restFunc = (buffer: Buffer, ...args: Obj[]): Obj => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments for rest wrong: expected=1, got=${args.length}`);
    }
    const arr = args[0];
    if (arr.objType !== 'ARR') {
        throw new RuntimeError(`argument type for rest wrong: expected=ARR, got=${arr.objType}`);
    }

    return (arr.elements.length === 0) ? NIL : new Arr(arr.elements.slice(1));
};

const putsFunc = (buffer: Buffer, ...args: Obj[]): Obj => {
    for (const arg of args) {
        buffer.write(`${arg.toString()}\n`);
    }

    return NIL;
};

export const builtins: {[name: string]: Builtin} = {
    len: new Builtin(lenFunc),
    push: new Builtin(pushFunc),
    first: new Builtin(firstFunc),
    last: new Builtin(lastFunc),
    rest: new Builtin(restFunc),
    puts: new Builtin(putsFunc),
};
