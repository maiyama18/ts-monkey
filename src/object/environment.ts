import { Err, Obj } from './object';

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

    return this.outer !== undefined ? this.outer.get(name) : new Err(`undefined identifier: ${name}`);
  }

  public set(name: string, obj: Obj): Obj {
    this.store[name] = obj;
    return obj;
  }

  public extend(): Environment {
    return new Environment(this);
  }
}
