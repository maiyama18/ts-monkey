import {
    ArrLiteral,
    CallExpression,
    Expression, HashLiteral,
    IfExpression, IndexExpression,
    InfixExpression,
    PrefixExpression,
} from '../node/expressions';
import { Node, Program } from '../node/node';
import { BlockStatement } from '../node/statements';
import { Buffer } from '../object/buffer';
import { Environment } from '../object/environment';
import { Arr, Bool, Func, Hash, HashKey, HashPair, Int, Nil, Obj, Str } from '../object/object';

export const TRUE = new Bool(true);
export const FALSE = new Bool(false);
export const NIL = new Nil();

export class RuntimeError implements Error {
    public readonly name = 'RuntimeError';
    public message: string;

    constructor(message: string) {
        this.message = message;
    }
}

export class ReturnSignal implements Error {
    public readonly name = 'ReturnSignal';
    public readonly message = 'return signal';
    public obj: Obj;

    constructor(obj: Obj) {
        this.obj = obj;
    }
}

export class Evaluator {
    constructor() {}

    public eval(node: Node, env: Environment, buffer: Buffer): Obj {
        switch (node.nodeType) {
            // statement
            case 'PROGRAM':
                return this.evalProgram(node, env, buffer);
            case 'BLOCK_STATEMENT':
                return this.evalBlockStatement(node, env, buffer);
            case 'LET_STATEMENT':
                env.set(node.identifier.name, this.eval(node.expression, env, buffer));
                return NIL;
            case 'EXPRESSION_STATEMENT':
                return this.eval(node.expression, env, buffer);
            case 'RETURN_STATEMENT':
                throw new ReturnSignal(this.eval(node.expression, env, buffer));

            // expression
            case 'IDENTIFIER':
                return env.get(node.name);
            case 'INT_LITERAL':
                return new Int(node.value);
            case 'STR_LITERAL':
                return new Str(node.value);
            case 'BOOL_LITERAL':
                return node.value ? TRUE : FALSE;
            case 'PREFIX_EXPRESSION':
                return this.evalPrefixExpression(node, env, buffer);
            case 'INFIX_EXPRESSION':
                return this.evalInfixExpression(node, env, buffer);
            case 'IF_EXPRESSION':
                return this.evalIfExpression(node, env, buffer);
            case 'FUNC_LITERAL':
                return new Func(node.parameters, node.body, env);
            case 'CALL_EXPRESSION':
                return this.evalCallExpression(node, env, buffer);
            case 'ARR_LITERAL':
                return this.evalArrLiteral(node, env, buffer);
            case 'HASH_LITERAL':
                return this.evalHashLiteral(node, env, buffer);
            case 'INDEX_EXPRESSION':
                return this.evalIndexExpression(node, env, buffer);
        }

        return NIL;
    }

    private evalProgram(program: Program, env: Environment, buffer: Buffer): Obj {
        const { statements } = program;

        let evaluated: Obj = NIL;

        for (const statement of statements) {
            try {
                evaluated = this.eval(statement, env, buffer);
            } catch (err) {
                if (err instanceof RuntimeError) {
                    throw err;
                } else if (err instanceof ReturnSignal) {
                    return err.obj;
                }
            }
        }

        return evaluated;
    }

    private evalBlockStatement(blockStatement: BlockStatement, env: Environment, buffer: Buffer): Obj {
        const { statements } = blockStatement;

        let evaluated: Obj = NIL;
        for (const statement of statements) {
            evaluated = this.eval(statement, env, buffer);
        }

        return evaluated || NIL;
    }

    private evalPrefixExpression(prefixExp: PrefixExpression, env: Environment, buffer: Buffer): Obj {
        const { operator, right } = prefixExp;
        const evaledRight = this.eval(right, env, buffer);

        switch (operator) {
            case '-':
                if (evaledRight.objType !== 'INT') {
                    throw new RuntimeError(`invalid operator: ${operator}${evaledRight.objType}`);
                }
                return new Int(-evaledRight.value);
            case '!':
                if (evaledRight === NIL || evaledRight === FALSE) {
                    return TRUE;
                }
                return FALSE;
        }

        return NIL;
    }

    private evalInfixExpression(infixExp: InfixExpression, env: Environment, buffer: Buffer): Obj {
        const { operator, left, right } = infixExp;
        const evaledLeft = this.eval(left, env, buffer);
        const evaledRight = this.eval(right, env, buffer);

        if (evaledLeft.objType !== evaledRight.objType) {
            throw new RuntimeError(`type mismatch: ${evaledLeft.objType} ${operator} ${evaledRight.objType}`);
        }

        switch (evaledLeft.objType) {
            case 'INT':
                return this.evalInfixIntsExpression(operator, evaledLeft, evaledRight as Int);
            case 'STR':
                return this.evalInfixStrsExpression(operator, evaledLeft, evaledRight as Str);
            case 'BOOL':
                return this.evalInfixBoolsExpression(operator, evaledLeft, evaledRight as Bool);
        }

        return NIL;
    }

    private evalInfixIntsExpression(operator: string, left: Int, right: Int): Obj {
        switch (operator) {
            case '+':
                return new Int(left.value + right.value);
            case '-':
                return new Int(left.value - right.value);
            case '*':
                return new Int(left.value * right.value);
            case '/':
                return new Int(left.value / right.value);
            case '==':
                return left.value === right.value ? TRUE : FALSE;
            case '!=':
                return left.value !== right.value ? TRUE : FALSE;
            case '>':
                return left.value > right.value ? TRUE : FALSE;
            case '<':
                return left.value < right.value ? TRUE : FALSE;
        }

        throw new RuntimeError(`invalid operator: ${left.objType} ${operator} ${right.objType}`);
    }

    private evalInfixStrsExpression(operator: string, left: Str, right: Str): Obj {
        switch (operator) {
            case '+':
                return new Str(left.value + right.value);
            case '==':
                return left.value === right.value ? TRUE : FALSE;
            case '!=':
                return left.value !== right.value ? TRUE : FALSE;
        }

        throw new RuntimeError(`invalid operator: ${left.objType} ${operator} ${right.objType}`);
    }

    private evalInfixBoolsExpression(operator: string, left: Bool, right: Bool): Obj {
        switch (operator) {
            case '==':
                return left.value === right.value ? TRUE : FALSE;
            case '!=':
                return left.value !== right.value ? TRUE : FALSE;
        }

        throw new RuntimeError(`invalid operator: ${left.objType} ${operator} ${right.objType}`);
    }

    private evalIfExpression(ifExp: IfExpression, env: Environment, buffer: Buffer): Obj {
        const { condition, consequence, alternative } = ifExp;
        const evaledCondition = this.eval(condition, env, buffer);

        if (evaledCondition === FALSE) {
            if (alternative === undefined) {
                return NIL;
            }
            return this.eval(alternative, env, buffer);
        } else {
            return this.eval(consequence, env, buffer);
        }
    }

    private evalArrLiteral(arrLiteral: ArrLiteral, env: Environment, buffer: Buffer): Obj {
        const evaledElements = this.evalExpressions(arrLiteral.elements, env, buffer);
        return new Arr(evaledElements);
    }

    private evalHashLiteral(hashLiteral: HashLiteral, env: Environment, buffer: Buffer): Obj {
        const pairs = new Map<HashKey, HashPair>();
        for (const [key, value] of hashLiteral.pairs) {
            const evaledKey = this.eval(key, env, buffer);
            const evaledValue = this.eval(value, env, buffer);

            if (evaledKey.objType !== 'STR' && evaledKey.objType !== 'INT' && evaledKey.objType !== 'BOOL') {
                throw new RuntimeError(`type for hash key wrong: ${evaledKey.objType}`);
            }

            const hashKey = evaledKey.hashKey();
            pairs.set(hashKey, new HashPair(evaledKey, evaledValue));
        }

        return new Hash(pairs);
    }

    private evalCallExpression(callExp: CallExpression, env: Environment, buffer: Buffer): Obj {
        const { args, func } = callExp;

        const evaledFunc = this.eval(func, env, buffer);
        const evaledArgs = this.evalExpressions(args, env, buffer);

        switch (evaledFunc.objType) {
            case 'FUNC':
                const extendedEnv = this.getEnvForFuncCall(evaledFunc, evaledArgs);
                // implemented return using exception throwing
                try {
                    return this.eval(evaledFunc.body, extendedEnv, buffer);
                } catch (err) {
                    if (err instanceof ReturnSignal) {
                        return err.obj;
                    }
                }
                break;
            case 'BUILTIN':
                return evaledFunc.func(buffer, ...evaledArgs);
        }
        return NIL;
    }

    private evalExpressions(args: Expression[], env: Environment, buffer: Buffer): Obj[] {
        const objects: Obj[] = [];
        for (const arg of args) {
            const obj = this.eval(arg, env, buffer);
            objects.push(obj);
        }

        return objects;
    }

    private getEnvForFuncCall(func: Func, args: Obj[]): Environment {
        const extendedEnv = func.env.extend();
        for (let i = 0; i < args.length; i++) {
            const name = func.parameters[i].name;
            extendedEnv.set(name, args[i]);
        }

        return extendedEnv;
    }

    private evalIndexExpression(indexExp: IndexExpression, env: Environment, buffer: Buffer): Obj {
        const { left, index } = indexExp;

        const evaledLeft = this.eval(left, env, buffer);
        const evaledIndex = this.eval(index, env, buffer);

        switch (evaledLeft.objType) {
            case 'ARR':
                return this.evalArrIndexExpression(evaledLeft, evaledIndex);
            case 'HASH':
                return this.evalHashIndexExpression(evaledLeft, evaledIndex);
            default:
                throw new RuntimeError(`${evaledLeft.toString()} is not an ARR nor HASH: got=${evaledLeft.objType}`);
        }
    }

    private evalArrIndexExpression(arr: Arr, index: Obj): Obj {
        if (index.objType !== 'INT') {
            throw new RuntimeError(`${index.toString()} is not an INT: got=${index.objType}`);
        }
        if (!arr.hasIndex(index.value)) {
            throw new RuntimeError(`index ${index.toString()} out of range for ARR ${arr.toString()}`);
        }

        return arr.elements[index.value];
    }

    private evalHashIndexExpression(hash: Hash, index: Obj): Obj {
        if (index.objType !== 'INT' && index.objType !== 'BOOL' && index.objType !== 'STR') {
            throw new RuntimeError(`${index.toString()} is not an INT nor BOOL nor STR: got=${index.objType}`);
        }

        const hashKey = index.hashKey();
        const pair = hash.pairs.get(hashKey);
        return pair !== undefined ? pair.value : NIL;
    }
}
