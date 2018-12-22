import { RuntimeError } from '../evaluator/evaluator';
import { builtins } from './builtin';
import { Obj } from './object';

export class Environment {
  public store: {[name: string]: Obj};
  public outer: Environment | undefined;

  constructor(outer?: Environment) {
    this.store = {};
    this.outer = outer;
  }

  public get(name: string): Obj {
    if (this.store.hasOwnProperty(name)) {
      return this.store[name];
    }
    if (this.outer !== undefined) {
        return this.outer.get(name);
    }
    if (builtins.hasOwnProperty(name)) {
        return builtins[name];
    }

    throw new RuntimeError(`undefined identifier: ${name}`);
  }

  public set(name: string, obj: Obj): Obj {
    this.store[name] = obj;
    return obj;
  }

  public extend(): Environment {
    return new Environment(this);
  }
}
