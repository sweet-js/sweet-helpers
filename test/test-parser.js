import test from 'ava';
import Parser from '../src/parser';
import * as C from '../src/combinators';
import { MockContext } from './_helper';

const zero = Parser.sat(n => n === 0, 'zero');
const one = Parser.sat(n => n === 1, 'one');
const two = Parser.sat(n => n === 2, 'two');

test('`of` places a value inside of a parser', t => {
  let result = Parser.of(1).run(MockContext.of());
  t.is(result.right[0], 1);
});

test('`zero` and `failure` make a failed parser', t => {
  let result1 = Parser.zero().run(MockContext.of());
  let result2 = Parser.failure('nothing here').run(MockContext.of());
  t.is(result1.left, '');
  t.is(result2.left, 'nothing here');
});

test('`item` pulls out the next value from the context', t => {
  let result = Parser.item().run(MockContext.of(1, 2, 3));
  t.is(result.right[0], 1);
});

test('`sat` can succeed', t => {
  let result = Parser.sat(n => n > 0).run(MockContext.of(1, 2, 3));
  t.is(result.right[0], 1);
});

test('`sat` can fail', t => {
  let ctx = MockContext.of(1, 2, 3);
  let result = zero.run(ctx);
  t.is(result.left, 'zero');
});

test('`bind` can sequence two parsers', t => {
  let result = one.chain(n1 => two.chain(n2 => Parser.of([n1, n2]))).run(MockContext.of(1, 2));
  t.deepEqual(result.right[0], [1, 2]);
});

test('`sequence` will sequence two parsers', t => {
  let result = C.sequence(one, two).run(MockContext.of(1, 2));
  t.deepEqual(result.right[0], [1, 2]);
});

test('`alt` and `disj` can succeed and fail', t => {
  let oneOrTwo1 = one.alt(two);
  let oneOrTwo2 = C.disj(one, two);
  let oneOrTwo3 = C.disj(one, two, 'failed one or two');

  t.is(oneOrTwo1.run(MockContext.of(1)).right[0], 1);
  t.is(oneOrTwo2.run(MockContext.of(1)).right[0], 1);
  t.is(oneOrTwo1.run(MockContext.of(2)).right[0], 2);
  t.is(oneOrTwo2.run(MockContext.of(2)).right[0], 2);

  t.is(oneOrTwo1.run(MockContext.of(3)).left, 'two');
  t.is(oneOrTwo2.run(MockContext.of(3)).left, 'failed disjunction');
  t.is(oneOrTwo3.run(MockContext.of(3)).left, 'failed one or two');
});

test('can make a new tree type out of existing combinators', t => {
  let oneTree = one.map(n => ({ type: 'number', value: n }));
  t.deepEqual(oneTree.run(MockContext.of(1)).right[0], { type: 'number', value: 1 });
});

test('`many` can succeed', t => {
  let manyOne = C.many(one);

  t.deepEqual(manyOne.run(MockContext.of(1, 1, 1, 0, 1)).right[0], [1, 1, 1]);
  t.deepEqual(manyOne.run(MockContext.of(0, 1)).right[0], []);
});

test('`many1` can succeed', t => {
  let manyOne = C.many1(one);

  t.deepEqual(manyOne.run(MockContext.of(1, 1, 1, 0, 1)).right[0], [1, 1, 1]);
});

test('`many1` can fail', t => {
  let manyOne = C.many1(one);

  t.deepEqual(manyOne.run(MockContext.of(0, 1)).left, 'one');
});

test('`sepBy` can succeed', t => {
  let oneWithZeros = C.sepBy(one, zero);

  t.deepEqual(oneWithZeros.run(MockContext.of(1, 0, 1, 0, 1)).right[0], [1, 1, 1]);
});

test('`sepBy` can succeed with no separator', t => {
  let oneWithZeros = C.sepBy(one, zero);

  t.deepEqual(oneWithZeros.run(MockContext.of(1, 2)).right[0], []);
});

test('`sepBy1` can succeed', t => {
  let oneWithZeros = C.sepBy1(one, zero);

  t.deepEqual(oneWithZeros.run(MockContext.of(1, 0, 1, 0, 1)).right[0], [1, 1, 1]);
});

test('`sepBy1` will fail with no separator', t => {
  let oneWithZeros = C.sepBy1(one, zero);

  t.deepEqual(oneWithZeros.run(MockContext.of(1, 2)).left, 'zero');
});

test('`infixl` can succeed and associates to the left', t => {
  let minus = Parser.sat(c => c === '-');
  let num = Parser.sat(n => typeof n === 'number');
  t.deepEqual(C.infixl(num, minus.map(() => ((x, y) => x - y))).run(MockContext.of(0, '-', 1, '-', 1)).right[0], -2);
});

test('`infixr` can succeed and associates to the right', t => {
  let minus = Parser.sat(c => c === '-');
  let num = Parser.sat(n => typeof n === 'number');
  t.deepEqual(C.infixr(num, minus.map(() => ((x, y) => x - y))).run(MockContext.of(0, '-', 1, '-', 1)).right[0], 0);
});

test('an alternate sequence of a failed sequence matches', t => {
  let ctx = MockContext.of(1, 2);
  let first = C.sequence(Parser.item(), Parser.item(), Parser.zero());
  let second = C.sequence(Parser.item(), Parser.item());
  t.deepEqual(first.alt(second).run(ctx).right[0], [1, 2]);
});