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

  contextify(T): Context<T>;

  reset(Mark): void;
}

export class ImmutableContext<T> {
  ctx: Context<T>;
  value: Maybe<T>;
  mark: Mark;

  constructor(ctx: Context<T>) {
    this.ctx = ctx;
    this.mark = ctx.mark();
    let v = ctx.next();
    ctx.reset(this.mark);
    this.value = v.done ? new Nothing() : Maybe.of(v.value);
  }

  head(): Maybe<T> {
    return this.value;
  }

  rest(): ImmutableContext<T> {
    this.ctx.reset(this.mark);
    this.ctx.next();
    return new ImmutableContext(this.ctx); 
  }
}

export default class Parser<A, C> {
  _runner: ImmutableContext<C> => Either<string, [A, ImmutableContext<C>]>;

  constructor(runner: ImmutableContext<C> => Either<string, [A, ImmutableContext<C>]>) {
    this._runner = runner;
  }
  
  run(ctx: ImmutableContext<*> | Context<*>): Either<string, [A, ImmutableContext<*>]> {
    if (!(ctx instanceof ImmutableContext)) {
      ctx = new ImmutableContext(ctx);
    }
    return this._runner(ctx);
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

  static empty(): Parser<void, *> {
    return new Parser(ctx => {
      let i = ctx.head();
      if (i instanceof Nothing) {
        return Either.of([void 0, ctx.rest()]);
      } else {
        return new Left('token stream is not empty');
      }
    });
  }

  static item(): Parser<*, *> {
    return new Parser(ctx => {
      let i = ctx.head();
      if (i instanceof Just) {
        return Either.of([i.value, ctx.rest()]);
      } else {
        return new Left('no more tokens to consume');
      }
    });
  }

  static sat<T>(f: T => boolean, msg: string = 'Did not satisfy predicate'): Parser<T, T> {
    return Parser
      .item()
      .chain(item => f(item) ? Parser.of(item) : Parser.failure(msg));
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
    return new Parser(ctx => {
      let r = this.run(ctx);
      if (r instanceof Left) {
        return other.run(ctx);
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

