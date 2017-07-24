import test from 'ava';
import { compileAndEval } from './_helper';

test('a mapped combinator should work inside a macro', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import { identifier } from '../combinators' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let result = identifier.map(ident => H.unwrap(ident).value).run(ctx);
    if (result.right[0] === 'foo') {
      return #\`true\`;
    }
    return #\`false\`;
  };
  output = m foo
  `);
  t.is(output, true);
});

test('a with combinator should work inside a macro', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import { identifierWith } from '../combinators' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ident = identifierWith(val => val === 'foo');
    let result = ident.map(ident => H.unwrap(ident).value).run(ctx);
    if (result.right[0] === 'foo') {
      return #\`true\`;
    }
    return #\`false\`;
  };
  output = m foo
  `);
  t.is(output, true);
});

test('sequencing combinators should work inside a macro', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import * as C from '../combinators' for syntax;
  import Parser from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ident = C.identifier.map(ident => H.unwrap(ident).value);
    let result = C.sequence(ident, ident, ident).run(ctx);
    let [a, b, c] = result.right[0];
    if (a === 'foo' && b === 'bar' && c === 'baz') {
      return #\`true\`;
    }
    return #\`false\`;
  };
  output = m foo bar baz
  `);
  t.is(output, true);
});

test('delimiter combinators should allow matching inside', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import * as C from '../combinators' for syntax;
  import Parser from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ident = C.identifier.map(ident => H.unwrap(ident).value);
    let inner = C.bracesInner(C.sequence(ident, ident, ident));
    let result = inner.run(ctx);
    
    let [a, b, c] = result.right[0];
    if (a === 'foo' && b === 'bar' && c === 'baz') {
      return #\`true\`;
    }
    return #\`false\`;
  };
  output = m { foo bar baz }
  `);
  t.is(output, true);
});


test('can match a class example', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import * as C from '../combinators' for syntax;
  import { Either } from '../either' for syntax;
  import Parser from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax class = ctx => {
    let comma = C.punctuatorWith(v => v === ',');
    let method = C.sequence(
      C.identifier,
      C.parensInner(C.sepBy(C.identifier, comma)),
      C.braces
    );
    let result = C.sequence(
      C.identifier,
      C.bracesInner(C.many(method))
    ).run(ctx);

    
    if (Either.isRight(result)) {
      return #\`true\`;
    }
    return #\`false\`;
  };
  output = class name {
    f(a, b) {
      return a + b;
    }
  }
  `);
  t.is(output, true);
});