import { CallExpression, FunctionLiteral, IfExpression, InfixExpression, PrefixExpression } from '../node/expressions';
import { Node, Program } from '../node/node';
import { BlockStatement } from '../node/statements';
import { Environment } from '../object/environment';
import { Bool, Func, Int, Nil, Obj } from '../object/object';

const TRUE = new Bool(true);
const FALSE = new Bool(false);
const NIL = new Nil();

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

  public eval(node: Node, env: Environment): Obj {
    switch (node.nodeType) {
      // statement
      case 'PROGRAM':
        return this.evalProgram(node, env);
      case 'BLOCK_STATEMENT':
        return this.evalBlockStatement(node, env);
      case 'LET_STATEMENT':
        return env.set(node.identifier.name, this.eval(node.expression, env));
      case 'EXPRESSION_STATEMENT':
        return this.eval(node.expression, env);
      case 'RETURN_STATEMENT':
        throw new ReturnSignal(this.eval(node.expression, env));

      // expression
      case 'IDENTIFIER':
        return env.get(node.name);
      case 'INT_LITERAL':
        return new Int(node.value);
      case 'BOOL_LITERAL':
        return node.value ? TRUE : FALSE;
      case 'FUNCTION_LITERAL':
        return new Func(node.parameters, node.body, env);
      case 'PREFIX_EXPRESSION':
        return this.evalPrefixExpression(node, env);
      case 'INFIX_EXPRESSION':
        return this.evalInfixExpression(node, env);
      case 'IF_EXPRESSION':
        return this.evalIfExpression(node, env);
      case 'CALL_EXPRESSION':
        return this.evalCallExpression(node, env);
    }

    return NIL;
  }

  private evalProgram(program: Program, env: Environment): Obj {
    const { statements } = program;

    let evaluated: Obj = NIL;

    for (const statement of statements) {
      try {
        evaluated = this.eval(statement, env);
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

  private evalBlockStatement(blockStatement: BlockStatement, env: Environment): Obj {
    const { statements } = blockStatement;

    let evaluated: Obj = NIL;
    for (const statement of statements) {
      evaluated = this.eval(statement, env);
    }

    return evaluated || NIL;
  }

  private evalPrefixExpression(prefixExp: PrefixExpression, env: Environment): Obj {
    const { operator, right } = prefixExp;
    const evaledRight = this.eval(right, env);

    switch (operator) {
      case '-':
        if (evaledRight.objType !== 'INT') {
          throw new RuntimeError(`invalid operator: ${operator}${evaledRight.objType}`);
        }
        return new Int(-evaledRight.value);
      case '!':
        if (evaledRight === NIL || evaledRight === FALSE) { return TRUE; }
        return FALSE;
    }

    return NIL;
  }

  private evalInfixExpression(infixExp: InfixExpression, env: Environment): Obj {
    const { operator, left, right } = infixExp;
    const evaledLeft = this.eval(left, env);
    const evaledRight = this.eval(right, env);

    if (evaledLeft.objType !== evaledRight.objType) {
      throw new RuntimeError(`type mismatch: ${evaledLeft.objType} ${operator} ${evaledRight.objType}`);
    }

    switch (evaledLeft.objType) {
      case 'INT':
        return this.evalInfixIntegersExpression(operator, evaledLeft, evaledRight as Int);
      case 'BOOL':
        return this.evalInfixBooleansExpression(operator, evaledLeft, evaledRight as Bool);
    }

    return NIL;
  }

  private evalInfixIntegersExpression(operator: string, left: Int, right: Int): Obj {
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

  private evalInfixBooleansExpression(operator: string, left: Bool, right: Bool): Obj {
    switch (operator) {
      case '==':
        return left.value === right.value ? TRUE : FALSE;
      case '!=':
        return left.value !== right.value ? TRUE : FALSE;
    }

    throw new RuntimeError(`invalid operator: ${left.objType} ${operator} ${right.objType}`);
  }

  private evalIfExpression(ifExp: IfExpression, env: Environment): Obj {
    const { condition, consequence, alternative } = ifExp;
    const evaledCondition = this.eval(condition, env);

    if (evaledCondition === FALSE) {
      if (alternative === undefined) { return NIL; }
      return this.eval(alternative, env);
    } else {
      return this.eval(consequence, env);
    }
  }

  private evalCallExpression(callExp: CallExpression, env: Environment): Obj {
    const { args, func }  = callExp;
    const funcLiteral = func as FunctionLiteral;

    const evaledFunc = this.eval(funcLiteral, env);
    if (evaledFunc.objType !== 'FUNC') { return NIL; }

    const evaledArgs = [];
    for (const arg of args) {
        const evaledArg = this.eval(arg, env);
        evaledArgs.push(evaledArg);
    }

    const extendedEnv = evaledFunc.env.extend();
    for (let i = 0; i < args.length; i++) {
      const name = evaledFunc.parameters[i].name;

      extendedEnv.set(name, evaledArgs[i]);
    }

    try {
        return this.eval(evaledFunc.body, extendedEnv);
    } catch (err) {
        console.log('CAUGHT', err);
        return err.obj;
    }
  }
}
