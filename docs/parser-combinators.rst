Parser Combinators
====================================

Parser combinators are a parsing technique from functional programming that let you build big parsers out of little parsers. Example of parsing combinator libraries include `parsec`_ in Haskell and `parsimmon`_ in JavaScript.

.. _parsec: https://github.com/haskell/parsec
.. _parsimmon: https://github.com/jneen/parsimmon

Parsing syntax in a macro without help is a bit of a chore since you must manage the state of the `transformer context`_ yourself; calls to ``mark`` and ``reset`` make following the parsing logic in the macro difficult. Parser combinators help by threading the context behind the scenes letting you focus on the logic of what you are trying to match.

.. _transformer context: https://www.sweetjs.org/doc/reference#transformer-context

For example, here is a macro written with parser combinators that matches a simplified ``class`` syntax:

.. code-block:: js

  import * as C from '@sweet-js/helpers/combinators' for syntax;
  import { Either } from '@sweet-js/helpers/either' for syntax;

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
      return #`'Parse success!'`;
    }
    return #`'Parse failed!'`;
  }

  class C {
    f(a, b) {
      return a + b;
    }
  }

Parser
---------

Abstractly, a parser is just a function from the input stream to a value and the (potentially) modified input stream (or a failure). Concretely, the :class:`Parser` class provides the parser abstraction:

.. class:: Parser(runner)

  With type parameter ``A``, the type of the value that this parser produces.

  Import the :class:`Parser` class via::

    import Parser from '@sweet-js/helpers/parser';


  :param runner: Gets called when :meth:`run` is invoked. Must return an :class:`Either` of ``string`` to represent failure or a tuple of the result value with type ``A`` and the potentially modified :class:`ImmutableContext`.
  :type runner:
      :data:`ImmutableContext` =>
      :data:`Either` <``string``, [``A``, :data:`ImmutableContext`]>

  For example, you can write a parser that consumes a single value like so:

  .. code-block:: js

    import Parser from '@sweet-js/helpers/parser';
    import { Maybe } from '@sweet-js/helpers/maybe';
    import { Either, Left } from '@sweet-js/helpers/either';

    let one = new Parser(ctx => {
      let i = ctx.head();
      if (Maybe.isJust(i)) {
        return Either.of([i.value, ctx.rest()]);
      } else {
        return new Left('no more tokens to consume');
      }
    });

  .. method:: run(ctx)

    Run the parser over the provided context, wrapping a mutable ``Context`` in an :data:`ImmutableContext` if necessary.

    :param ctx: The context to run on.
    :type ctx: ``Context`` or :data:`ImmutableContext`
    :rtype: :data:`Either` <``string``, [``A``, :data:`ImmutableContext`]>

  The static methods of :class:`Parser` are:

  .. method:: of(value)

    Returns a :data:`Parser` that always succeeds with ``value`` and does not modify the context.

    :param value: The value to initialize the parser.
    :type value: ``A``
    :rtype: :data:`Parser` <``A``>

  .. method:: zero()

    Returns a :data:`Parser` that always fails.

  .. method:: failure(msg)

    Returns a :data:`Parser` that always fails with the provided message.

    :param string msg: The message to dispaly in the failure

  .. method:: item()

    Returns a :data:`Parser` that consumes a single item from the context (or fails if the context is empty).

  .. method:: empty()

    Returns a :data:`Parser` that succeeds if the context is empty and fails otherwise (in either case returns a parser with an unmodified context).

    :rtype: :data:`Parser` <``void``>

  .. method:: sat(pred, [msg])

    Returns a parser that attempts to consume an item from the context and checks that the item consumed satisfies the predicate ``pred``.

    :param pred: A predicate to test the item consumed from the context.
    :type pred: ``A`` => ``boolean``
    :param string msg: An optional message to provide if the predicate failed.
    :rtype: :data:`Parser` <``A``>

  The prototype methods of :class:`Parser` are:

  .. method:: map(f)

    Apply the function ``f`` to the value wrapped by the :data:`Parser`, returning a :data:`Parser` with the result. For example,

    .. code-block:: js

      Parser.of('bob').map(namether => ({ name }))

    would wrap a parsed string in an object.

    :param f: The function to apply.
    :type f: ``A`` => ``B``
    :rtype: :data:`Parser` <``B``>

  .. method:: alt(other)

    Returns a new :data:`Parser` that deferrs to ``other`` if the first :data:`Parser` fails. For example,

    .. code-block:: js

      Parser.zero().alt(Parser.of(true))

    would result in a :data:`Parser` that succeeded with ``true``.

    :param other: The :data:`Parser` to run if this instance fails.

    :type other: :data:`Parser` <``A``>
    :rtype: :data:`Parser` <``A``>

  .. method:: ap(parser)

    If this parser has not failed, invoke the function inside ``parser`` and return a :data:`Parser` with the invocation result.

    :param parser: The :data:`Parser` wrapped function.
    :type parser: :data:`Parser` <``A`` => ``B``>
    :rtype: :data:`Parser` <``B``>

  .. method:: chain(f)

    If this parser has not failed, invoke ``f`` on the wrapped value and return its result.

    :param f: The function to invoke.
    :type f: ``A`` => :data:`Parser` <``B``>
    :rtype: :data:`Parser` <``B``>

Combinators
--------------

.. function:: sequence(...parsers)

  Runs the provided parsers in sequence. The resulting parser only succeeds if all parsers succeed. The resulting parser contains an array of each of the sequenced parsers success. For example,

  .. code-block:: js

    import * as C from '@sweet-js/helpers/combinators';
    import Parser from '@sweet-js/helpers/parser';

    C.sequence(Parser.of(1), Parser.of(2), Parser.of(3))

  would result in a parser with ``[1, 2, 3]`` as its result.

  :param parsers: The parsers to sequence.
  :type parsers: ... :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A[]``>

.. function:: disj(a, b, [msg])

  Returns a parser that attempts to run the ``a`` parser and if it fails runs the ``b`` parser instead.

  :param a: The first parser to try.
  :type a: :data:`Parser` <``A``>
  :param b: The second parser to try.
  :type b: :data:`Parser` <``A``>
  :param string msg: An optional failure message if both parsers fail
  :rtype: :data:`Parser` <``A``>

.. function:: many(p)

  Returns a parser that runs parser ``p`` on the context until it no longer succeeds, producing an array of each success value.

  :param p: The parser to run
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A[]``>

.. function:: many1(p)

  Like :func:`many` but must match at least once.

  :param p: The parser to run
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A[]``>

.. function:: sepBy(p, sep)

  Like :func:`many` but must match the separator parser ``sep``.

  :param p: The parser to run
  :param sep: The parser that matches a separator
  :type p: :data:`Parser` <``A``>
  :type sep: :data:`Parser` <``B``>
  :rtype: :data:`Parser` <``A[]``>

.. function:: sepBy1

  Like :func:`many1` but must match the separator parser ``sep``.

  :param p: The parser to run
  :param sep: The parser that matches a separator
  :type p: :data:`Parser` <``A``>
  :type sep: :data:`Parser` <``B``>
  :rtype: :data:`Parser` <``A[]``>

.. function:: infixl(p, op)

  Matches parser ``p`` as a left associative infix operator, transforming each operand pair with the binary function in ``op``. Similar to :func:`sepBy` but uses ``op`` to "reduce" the result.

  :param p: The parser to match.
  :param op: The operator to match and apply
  :type op: :data:`Parser` <(``A``, ``A``) => ``A``>
  :type p: :data:`Parser` <``A``>

.. function:: infixr(p, op)

  Matches parser ``p`` as a right associative infix operator, transforming each operand pair with the binary function in ``op``. Similar to :func:`sepBy` but uses ``op`` to "reduce" the result.

  :param p: The parser to match.
  :param op: The operator to match and apply
  :type op: :data:`Parser` <(``A``, ``A``) => ``A``>
  :type p: :data:`Parser` <``A``>

.. function:: lift2(f)

  Lifts a binary function to work inside of a parser.

  :param f: The function to lift
  :type f: (``A``, ``B``) => ``C``
  :rtype: (:data:`Parser` <``A``>, :data:`Parser` <``B``>) => :data:`Parser` <``C``>


Syntax specific combinators
----------------------------------

.. function:: identifier()

  Returns a parser that matches a single identifier.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: identifierWith(pred)

  Returns a parser that matches a single identifier that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: keyword()

  Returns a parser that matches a single keyword.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: keywordWith()

  Returns a parser that matches a single keyword that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: punctuator()

  Returns a parser that matches a single punctuator (e.g. ``.``, ``*``, ``;``, etc.).

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: punctuatorWith()

  Returns a parser that matches a single punctuator that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: numeric()

  Returns a parser that matches a single numeric.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: numericWith()

  Returns a parser that matches a single numeric that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``number`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: string()

  Returns a parser that matches a single string.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: stringWith()

  Returns a parser that matches a single string that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: templateElement()

  Returns a parser that matches a single template element.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: templateElementWith()

  Returns a parser that matches a single template element that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: template()

  Returns a parser that matches a single template.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: templateWith()

  Returns a parser that matches a single template that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: regex()

  Returns a parser that matches a single regex.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: regexWith()

  Returns a parser that matches a single regex that also matches the provided predicate.

  :param pred: A predicate to test the matched syntax
  :type pred: ``string`` => ``boolean``
  :rtype: :data:`Parser` <:data:`Term`>

.. function:: braces()

  Returns a parser that matches a single braces syntax.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: brackets()

  Returns a parser that matches a single brackets syntax.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: parens()

  Returns a parser that matches a single parens syntax.

  :rtype: :data:`Parser` <:data:`Term`>

.. function:: delimiterInner(p)

  Returns a parser that matches any delimiter that also matches the provided parser on the syntax inside the delimiter. For example,

  .. code-block:: js

    import * as C from '@sweet-js/helpers/combinators';

    C.delimiterInner(C.many(C.identifier()))

  would match syntax like ``()``, ``(foo bar)``.

  :param p: The parser to run inside the delimiter.
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A``>

.. function:: bracesInner(p)

  Returns a parser that matches any brace syntax that also matches the provided parser on the syntax inside the delimiter. For example,

  .. code-block:: js

    import * as C from '@sweet-js/helpers/combinators';

    C.bracesInner(C.many(C.identifier()))

  would match syntax like ``{}``, ``{foo bar}``.

  :param p: The parser to run inside the delimiter.
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A``>

.. function:: bracketsInner(p)

  Returns a parser that matches any brackets syntax that also matches the provided parser on the syntax inside the delimiter. For example,

  .. code-block:: js

    import * as C from '@sweet-js/helpers/combinators';

    C.bracketsInner(C.many(C.identifier()))

  would match syntax like ``[]``, ``[foo bar]``.

  :param p: The parser to run inside the delimiter.
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A``>

.. function:: parensInner(p)

  Returns a parser that matches any parenthses syntax that also matches the provided parser on the syntax inside the delimiter. For example,

  .. code-block:: js

    import * as C from '@sweet-js/helpers/combinators';

    C.parensInner(C.many(C.identifier()))

  would match syntax like ``()``, ``(foo bar)``.

  :param p: The parser to run inside the delimiter.
  :type p: :data:`Parser` <``A``>
  :rtype: :data:`Parser` <``A``>
