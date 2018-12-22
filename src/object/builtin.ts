import { RuntimeError } from '../evaluator/evaluator';
import { Builtin, BuiltinFunction, Int, Obj } from './object';

const lenFunc = (...args: Obj[]): Int => {
    if (args.length !== 1) {
        throw new RuntimeError(`number of arguments wrong: expected=1, got=${args.length}`);
    }
    const arg = args[0];
    if (arg.objType !== 'STR') {
        throw new RuntimeError(`argument type wrong: expected=STR, got=${arg.objType}`);
    }

    return new Int(arg.value.length);
};

export const builtins: {[name: string]: Builtin} = {
    len: new Builtin(lenFunc),
};
