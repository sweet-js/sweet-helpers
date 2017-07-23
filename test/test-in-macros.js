import test from 'ava';
import { compileAndEval } from './_helper';

test('a mapped combinator should work inside a macro', t => {
  let output = compileAndEval(`
  'lang sweet.js';
  import { identifier } from '../combinators' for syntax;
  import { ImmutableContext } from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ictx = new ImmutableContext(ctx);
    let result = identifier.map(ident => H.unwrap(ident).value).run(ictx);
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
  import { ImmutableContext } from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ictx = new ImmutableContext(ctx);
    let ident = identifierWith(val => val === 'foo');
    let result = ident.map(ident => H.unwrap(ident).value).run(ictx);
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
  import Parser, { ImmutableContext } from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ictx = new ImmutableContext(ctx);
    let ident = C.identifier.map(ident => H.unwrap(ident).value);
    let result = C.sequence(ident, ident, ident).run(ictx);
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
  import Parser, { ImmutableContext } from '../parser' for syntax;
  import * as H from '../helpers.js' for syntax;

  syntax m = ctx => {
    let ictx = new ImmutableContext(ctx);
    let ident = C.identifier.map(ident => H.unwrap(ident).value);
    let inner = C.bracesInner(C.sequence(ident, ident, ident));
    let result = inner.run(ictx);
    
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
