'lang sweet.js';
// @flow

export class Maybe<T> {
  // $FlowFixMe: computed properties still not supported in flow
  static ['fantasy-land/of'](v: T): Maybe<T> {
    return Maybe.of(v);
  }

  static of(v: T): Maybe<T> {
    return new Just(v);
  }

  // $FlowFixMe: computed properties still not supported in flow
  static ['fantasy-land/empty'](): Maybe<T> {
    return Maybe.empty();
  }

  static empty(): Maybe<T> {
    return new Nothing();
  }

  // $FlowFixMe: computed properties still not supported in flow
  static ['fantasy-land/zero'](): Maybe<T> {
    return Maybe.zero();
  }

  static zero(): Maybe<T> {
    return new Nothing();
  }

  static isJust(v: Maybe<*>): boolean {
    return v instanceof Just;
  }

  static isNothing(v: Maybe<*>): boolean {
    return v instanceof Nothing;
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/map']<V>(f: T => V): Maybe<V> {
    return this.map(f);
  }

  map<V>(f: T => V): Maybe<V> {
    throw new Error();
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/ap']<V>(other: Maybe<(T) => V>): Maybe<V> {
    return this.ap(other);
  }

  ap<V>(other: Maybe<(T) => V>): Maybe<V> {
    throw new Error();
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/chain']<V>(f: T => Maybe<V>): Maybe<V> {
    return this.chain(f);
  }

  chain<V>(f: T => Maybe<V>): Maybe<V> {
    throw new Error();
  }
}

export class Nothing<T> extends Maybe<T> {
  map<V>(f: T => V): Maybe<V> {
    return Maybe.empty();
  }

  ap<V>(other: Maybe<(T) => V>): Maybe<V> {
    return Maybe.empty();
  }

  chain<V>(f: T => Maybe<V>): Maybe<V> {
    return Maybe.empty();
  }
}

export class Just<T> extends Maybe<T> {
  value: T;

  constructor(v: T) {
    super();
    this.value = v;
  }

  map<V>(f: T => V): Maybe<V> {
    return new Just(f(this.value));
  }

  ap<V>(other: Maybe<(T) => V>): Maybe<V> {
    if (other instanceof Just) {
      return Maybe.of(other.value(this.value));
    }
    return Maybe.empty();
  }

  chain<V>(f: T => Maybe<V>): Maybe<V> {
    return f(this.value);
  }
}
