import { RuntimeError } from '../evaluator/evaluator';
import { Builtin, Int, Obj } from './object';

const lenFunc = (...args: Obj[]): Int => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments wrong: expected=1, got=${args.length}`);
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

export const builtins: {[name: string]: Builtin} = {
    len: new Builtin(lenFunc),
};
