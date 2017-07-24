Helper API
==============================

The helper library contains the following kinds of functions:

* an :func:`unwrap` function that returns the primitive representation of a syntax object
* ``is*`` functions that test the type of a syntax object (e.g. :func:`isIdentifier` for identifiers and :func:`isStringLiteral` for strings)
* ``from*`` functions that create new syntax objects from primitive data


unwrap
---------------

.. function:: unwrap(value : any)

  :param any value: The value to unwrap, can be anything.
  :rtype: ``{ value?: string | number | Term[] }``

  When invoked with a flat syntax object (i.e. not delimiters), :func:`unwrap` returns an object with a single ``value`` property that holds the primitive representation of that piece of syntax (a string for string literals, keywords, and identifiers or a number for numeric literals).

  For syntax objects that represent delimiters, :func:`unwrap` returns an object who's ``value`` property is a list of the syntax objects inside the delimiter.

  For all other inputs :func:`unwrap` returns the empty object.

  .. code-block:: js

    import { unwrap } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let id = ctx.next().value;
      let delim = ctx.next().value;

      unwrap(id).value === 'foo';  // true
      let num = unwrap(delim).value.get(1);
      unwrap(num).value === 1;     // true
      // ...
    };
    m foo (1)

is*
--------------------

.. function:: isIdentifier(value : any)

  Returns true if the argument is an identifier.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isNumericLiteral(value : any)

  Returns true if the argument is a numeric literal.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isStringLiteral(value : any)

  Returns true if the argument is a string literal.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isKeyword(value : any)

  Returns true if the argument is a keyword.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isPunctuator(value : any)

  Returns true if the argument is a punctuator (e.g. ``.``, ``;``, ``*``, etc.).

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isTemplate(value : any)

  Returns true if the argument is a template.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isSyntaxTemplate(value : any)

  Returns true if the argument is a syntax template.

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isDelimiter(value : any)

  Returns true if the argument is a delimiter (e.g. ``()``, ``[]``, ``{}``).

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isParens(value : any)

  Returns true if the argument is a paren delimiter (e.g. ``()``).

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isBrackets(value : any)

  Returns true if the argument is a brackets delimiter (e.g. ``[]``).

  :param any value: The value to check.
  :rtype: ``boolean``

.. function:: isBraces(value : any)

  Returns true if the argument is a braces delimiter (e.g. ``{}``).

  :param any value: The value to check.
  :rtype: ``boolean``

from*
-----------------------


.. function:: fromIdentifier(other : Term, s : string)

  Create a new identifier syntax object named after the provided string using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param string s: The name of the new identifier
  :rtype: :data:`Term`

  .. code-block:: js

    import { fromIdentifier } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);

      return #`${fromIdentifier(dummy, 'bar')}`;
    };
    m foo

  .. code-block:: js

    bar

  Be careful which syntax object you use to create a new syntax object via ``fromIdentifier`` and related functions since the new object will share the original's lexical context. In most cases you will want to create a "dummy" syntax object inside a macro definition and then use that as a base to create new objects. By using a dummy syntax object you are using the scope of the macro definition; usually the macro definition scope is what you want.

  You may be tempted to reuse the syntax object provided by ``ctx.name()`` but resist that feeling! The ``ctx.name()`` syntax object comes from the macro call-site and so any syntax objects created from it will carry the lexical context of the call-site. Sometimes this is what you want, but most of the time this breaks hygiene.

.. function:: fromNumber(other : Syntax, n : number)

  Create a new numeric literal syntax object with the value ``n`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param number n: The numeric value of the new numeric literal
  :rtype: :data:`Term`

  .. code-block:: js

    import { fromNumber } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);

      return #`${fromNumber(dummy, 1)}`;
    };
    m

  .. code-block:: js

    1

.. function:: fromStringLiteral(other : Syntax, s : string)

  Create a new string literal syntax object with the value ``s`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param number s: The string value of the new string literal
  :rtype: :data:`Term`

  .. code-block:: js

    import { unwrap, fromStringLiteral } from '@sweet-js/helpers' for syntax;

    syntax to_str = ctx => {
      let dummy = #`dummy`.get(0);
      let arg = unwrap(ctx.next().value).value;
      return #`${fromStringLiteral(dummy, arg)}`;
    }
    to_str foo


  .. code-block:: js

    'foo'



.. function:: fromPunctuator(other : Syntax, punc : string)

  Creates a punctuator (e.g. ``+``, ``==``, etc.) from its string representation ``punc`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param number punc: The string representation of the new punctuator.
  :rtype: :data:`Term`

  .. code-block:: js

    import { fromPunctuator } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);
      return #`1 ${fromPunctuator(dummy, '+')} 1`;
    };
    m


  .. code-block:: js

    1 + 1


.. function:: fromKeyword(other : Syntax, kwd : string)

  Create a new keyword syntax object with the value ``kwd`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param number kwd: The string representation of the new keyword.
  :rtype: :data:`Term`

  .. code-block:: js

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);
      return #`${fromKeyword(dummy, 'let')} x = 1`;
    };
    m


  .. code-block:: js

    let x = 1

.. function:: fromBraces(other : Syntax, inner : Term[])

  Creates a curly brace delimiter with inner syntax objects ``inner`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param inner: The list terms to go inside the delimiter.
  :type inner: :data:`Term` []
  :rtype: :data:`Term`

  .. code-block:: js

    import { fromBraces } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);
      let block = #`let x = 1;`;
      return #`${fromBraces(dummy, block)}`;
    };
    m

  .. code-block:: js

    {
      let x = 1;
    }


.. function:: fromBrackets(other : Syntax, inner : Term[])

  Creates a bracket delimiter with inner syntax objects ``inner`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param inner: The list terms to go inside the delimiter.
  :type inner: :data:`Term` []
  :rtype: :data:`Term`

  .. code-block:: js

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);
      let elements = #`1, 2, 3`;
      return #`${fromBrackets(dummy, elements)}`;
    };
    m


  .. code-block:: js

    [1, 2, 3]


.. function:: fromParens(other : Syntax, inner : Term[])

  Creates a paren delimiter with inner syntax objects ``inner`` using the lexical context from ``other``.

  :param other: The term to take the lexical context from.
  :type other: :data:`Term`
  :param inner: The list terms to go inside the delimiter.
  :type inner: :data:`Term` []
  :rtype: :data:`Term`

  .. code-block:: js

    import { fromParens } from '@sweet-js/helpers' for syntax;

    syntax m = ctx => {
      let dummy = #`dummy`.get(0);
      let expr = #`5 * 5`;
      return #`1 + ${fromParens(dummy, expr)}`;
    };
    m

  .. code-block:: js

    1 + (5 * 5)
