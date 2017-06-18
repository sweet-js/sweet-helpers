'lang sweet.js';
// @flow
import { Either, Left } from './either';
import { Maybe, Just, Nothing } from './maybe';

type Mark = {};

interface Context<T> {
  next(): {
    done: boolean;
    value: T
  };

  mark(): Mark;

  reset(Mark): void;
}

export class ImmutableContext<T> {
  ctx: Context<T>;
  value: Maybe<T>;

  constructor(ctx: Context<T>) {
    this.ctx = ctx;
    let mark = ctx.mark();
    let v = ctx.next();
    ctx.reset(mark);
    this.value = v.done ? new Nothing() : Maybe.of(v.value);
  }

  head(): Maybe<T> {
    return this.value;
  }

  rest(): ImmutableContext<T> {
    this.ctx.next();
    return new ImmutableContext(this.ctx); 
  }
}

export default class Parser<A, C> {
  runner: ImmutableContext<C> => Either<string, [A, ImmutableContext<C>]>;

  constructor(runner: ImmutableContext<C> => Either<string, [A, ImmutableContext<C>]>) {
    this.runner = runner;
  }
  
  run(ctx: ImmutableContext<*>): Either<string, [A, ImmutableContext<*>]> {
    return this.runner(ctx);
  }


  // $FlowFixMe: computed properties still not supported in flow
  static ['fantasy-land/of'](a: A): Parser<A, *> {
    return Parser.of(a);
  }

  static of(a: A): Parser<A, *> {
    return new Parser(ctx => Either.of([a, ctx]));
  }

  static failure(msg: string): Parser<*, *> {
    return new Parser(ctx => { return new Left(msg); });
  }

  // $FlowFixMe: computed properties still not supported in flow
  static ['fantasy-land/zero'](): Parser<*, *> {
    return Parser.zero();
  }

  static zero(): Parser<*, *> {
    return Parser.failure('');
  }

  static item(): Parser<*, *> {
    return new Parser(ctx => {
      let i = ctx.head();
      if (i instanceof Just) {
        return Either.of([i.value, ctx.rest()]);
      } else {
        return new Left('');
      }
    });
  }

  static sat<T>(f: T => boolean, msg: string = 'Did not satisfy predicate'): Parser<T, T> {
    return Parser
      .item()
      .chain(item => f(item) ? Parser.of(item) : Parser.failure(msg));
  }


  static lift2<A, B, C>(f: (A, B) => C): (a: Parser<A, *>, b: Parser<B, *>) => Parser<C, *> {
    return (a, b) => a.chain(va => b.chain(vb => Parser.of(f(va, vb))));
  }

  static sequence(...parsers: Parser<A, C>[]): Parser<A[], C> {
    let init: Parser<A[], C> = Parser.of([]);
    let f: (Parser<A[], C>, Parser<A, C>) => Parser<A[], C> = Parser.lift2((a, b) => a.concat(b));
    return parsers.reduce(f, init);
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/ap']<B>(parser: Parser<A => B, C>): Parser<B, C> {
    return this.ap(parser);
  }

  ap<B>(parser: Parser<A => B, C>): Parser<B, C> {
    return new Parser(ctx => {
      return this.run(ctx)
        .chain(([a, ctx]) => parser.run(ctx).map(([f, ctx]) => [f(a), ctx]));
    });
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/map'](f: A => B): Parser<B, C> {
    return this.map(f);
  }

  map<B>(f: A => B): Parser<B, C> {
    return new Parser(ctx => this.run(ctx).map(([aval, ctx]) => [f(aval), ctx]));
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/alt'](other: Parser<A, C>): Parser<A, C> {
    return this.alt(other);
  }

  alt(other: Parser<A, C>): Parser<A, C> {
    return Parser.disj(this, other);
  }

  static disj<A, C>(a: Parser<A, C>, b: Parser<A, C>, msg: string = 'failed disjunction'): Parser<A, C> {
    return new Parser(ctx => {
      let r = a.run(ctx);
      if (r instanceof Left) {
        return b.run(ctx).bimap(l => msg, r => r);
      }
      return r;
    });
  }

  // $FlowFixMe: computed properties still not supported in flow
  ['fantasy-land/chain']<B>(f: A => Parser<B, *>): Parser<B, *> {
    return this.chain(f);
  }

  chain<B>(f: A => Parser<B, *>): Parser<B, *> {
    return new Parser(ctx => 
      this.run(ctx)
        .map(([v, ctx]) => [f(v), ctx])
        .chain(([parser, ctx]) => parser.run(ctx))
    );
  }
}

