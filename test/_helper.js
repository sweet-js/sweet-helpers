import { ImmutableContext } from '../src/parser';
import { compile } from '@sweet-js/core';
import NodeLoader from '@sweet-js/core/dist/node-loader';
import { transform } from 'babel-core';

export class MockContext {
  constructor(...values) {
    this.index = -1;
    this.values = values;
  }

  static of(...values) {
    return new ImmutableContext(new MockContext(...values));
  }

  mark() { return this.index; }
  reset(mark) { this.index = mark; }

  next() {
    if (this.index < this.values.length - 1) {
      return {
        done: false,
        value: this.values[++this.index]
      };
    }
    return { done: true };
  }
}

/* globals __dirname */

class EntrypointNodeLoader extends NodeLoader {
  constructor(entrypoint, basedir, options) {
    super(basedir, options);
    this.sourceCache.set(`${basedir}/*entrypoint*`, entrypoint);
  }

  normalize(name, refererName, refererAddress) {
    if (name === '*entrypoint*') {
      return `${this.baseDir}/*entrypoint*:0`;
    }
    return super.normalize(name, refererName, refererAddress);
  }
}

export function compileAndEval(code) {
  let output;
  let loader = new EntrypointNodeLoader(code, __dirname);
  let res = transform(compile('*entrypoint*', loader).code).code;
  eval(res);
  return output;
}