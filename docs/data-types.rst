Data Types
==================

ImmutableContext
---------------------

An :class:`ImmutableContext` wraps Sweet's underlying mutable ``context`` in an immutable representation. Basically, it calls ``mark`` and ``reset`` so you don't have to.

.. class:: ImmutableContext(ctx)

  With type parameter ``A``, the value returned by the underlying ``context`` (currently this is always a :data:`Term`).

  Import the :class:`ImmutableContext` class via::

    import { ImmutableContext } from '@sweet-js/helpers/parser';

  :param ctx: The transformer `context <https://www.sweetjs.org/doc/reference#transformer-context>`_ provided by a macro.

  :class:`ImmutableContext` provides a list-like interface; call :meth:`head` to get the next value (wrapped in a :data:`Maybe` since the context might be empty) and :meth:`rest` to get the rest.

  .. method:: head()

    :returns: The next item in the context if it's not empty.
    :rtype: :data:`Maybe` <``A``>

  .. method:: rest()

    :returns: an :data:`ImmutableContext` with the remaining values in the context.
    :rtype: :data:`ImmutableContext` <``A``>

Either
-----------------

An `fantasy-land <https://github.com/fantasyland/fantasy-land>`_ compatible implementation of the Either data type.

.. class:: Either()

  With type parameters ``L`` and ``R`` for :class:`Left` and :class:`Right`, respectively.

  Import the :class:`Either` class via::

    import { Either } from '@sweet-js/helpers/either';

  The static methods of :class:`Either` are:

  .. method:: of(value)

    :param value: Wraps ``value`` in a :class:`Right`.
    :type value: ``A``

  .. method:: isLeft(value)

    :param any value: Tests if :data:`value` is an instance of :class:`Left`.
    :rtype: ``boolean``

  .. method:: isRight(value)

    :param any value: Tests if :data:`value` is an instance of :class:`Right`.
    :rtype: ``boolean``

  The prototype methods of :class:`Either` are:

  .. method:: map(f)

    If the :data:`Either` is a :data:`Right`, apply ``f`` to its wrapped value otherwise do nothing.

    :param f: The function to apply
    :type f: ``R`` => ``C``
    :rtype: :data:`Either` <``L``, ``C``>

  .. method:: ap(e)

    If the :data:`Either` is a :data:`Right`, apply the function in ``e``.

    :param e: The function wrapped in an :data:`Either` to apply
    :type e: :data:`Either` <``L``, ``R`` => ``C``>
    :rtype: :data:`Either` <``L``, ``C``>

  .. method:: chain(f)

    If the :data:`Either` is a :data:`Right`, invoke ``f`` with the wrapped value and return its result.

    :param f: The function to apply
    :type f: ``R`` => :data:`Either` <``L``, ``C``>
    :rtype: :data:`Either` <``L``, ``C``>

  .. method:: extend(f)

    If the :data:`Either` is a :data:`Right`, invoke ``f`` with the :data:`Right` and return a new :data:`Right` wrapping the resulting value.

    :param f: The function to apply.
    :type f: :data:`Either` <``L``, ``R``> => ``C``
    :rtype: :data:`Either` <``L``, ``C``>

  .. method:: bimap(l, r)

    Apply ``l`` or ``r`` depending on if the :data:`Either` is a :data:`Left` or a :data:`Right`, wrapping the result in the appropriate :data:`Either` subtype.

    Like :meth:`either` with wrapping.

    :param l: The function to apply to the :data:`Left`
    :param r: The function to apply to the :data:`Right`
    :type l: ``L`` => ``C``
    :type r: ``R`` => ``D``
    :rtype: :data:`Either` <``C``, ``D``>

  .. method:: either(l, r)

    Apply ``l`` or ``r`` depending on if the :data:`Either` is a :data:`Left` or a :data:`Right`, returning the function's result.

    Like :meth:`bimap` without wrapping.

    :param l: The function to apply to the :data:`Left`
    :param r: The function to apply to the :data:`Right`
    :type l: ``L`` => ``C``
    :type r: ``R`` => ``C``
    :rtype: ``C``

  .. method:: foreach(l, r)

    Apply ``l`` or ``r`` for their effects. Returns the unmodified :data:`Either`.

    :param l: The function to apply to the :data:`Left`
    :param r: The function to apply to the :data:`Right`
    :type l: ``L`` => ``void``
    :type r: ``R`` => ``void``
    :rtype: :data:`Either` <``L``, ``R``>

.. class:: Left(value)

  A subclass of :class:`Either` traditionally used to represent failure.

  With type parameter ``L`` for the value :class:`Left` wraps.

  Import the :class:`Left` class via::

    import { Left } from '@sweet-js/helpers/either';

  :param value: The value to wrap
  :type value: ``A``

.. class:: Right(value)

  A subclass of :class:`Either` traditionally used to represent success.

  With type parameter ``R`` for the value :class:`Right` wraps.

  Import the :class:`Right` class via::

    import { Right } from '@sweet-js/helpers/either';

  :param value: The value to wrap
  :type value: ``A``


Maybe
-----------------

An `fantasy-land <https://github.com/fantasyland/fantasy-land>`_ compatible implementation of the Maybe data type.

.. class:: Maybe()

  With type parameter ``A``.

  Import the :class:`Maybe` class via::

    import { Maybe } from '@sweet-js/helpers/maybe';

  The static methods of :class:`Maybe` are:

  .. method:: of(value)

    Wraps the value in an :data:`Just`.

    :param value: The value to wrap.
    :type value: ``B``
    :rtype: :data:`Maybe` <``B``>

  .. method:: empty()
                 zero()

    Returns a :data:`Nothing`.

  .. method:: isJust(value)

    :param any value: Tests if ``value`` is an instance of :data:`Just`.
    :rtype: ``boolean``

  .. method:: isNothing(value)

    :param any value: Tests if ``value`` is an instance of :data:`Nothing`.
    :rtype: ``boolean``

  The prototype mehtods of :class:`Maybe` are:

  .. method:: map(f)

    If a :data:`Just`, apply ``f`` to the wrapped value and wrap the result in a :data:`Just`.

    :param f: The function to apply.
    :type f: ``A`` => ``B``
    :rtype: :data:`Maybe` <``B``>

  .. method:: ap(m)

    If a :data:`Just` apply the function in ``m`` and wrap the result in a :data:`Just`.

    :param m: The wrapped function to apply.
    :type m: :data:`Maybe` <``A`` => ``B``>
    :rtype: :data:`Maybe` <``B``>

  .. method:: chain(f)

    If a :data:`Just` apply the function in ``f`` to the wrapped value and return the result.

    :param f: The function to apply.
    :type f: ``A`` => :data:`Maybe` <``B``>
    :rtype: :data:`Maybe` <``B``>

.. class:: Just(value)

  A subtype of :data:`Maybe`

  With type parameter ``A``.

  Import the :class:`Just` class via::

    import { Just } from '@sweet-js/helpers/maybe';

  :param value: The value to wrap.
  :type value: ``A``

.. class:: Nothing()

  A subtype of :data:`Maybe`

  Import the :class:`Just` class via::

    import { Just } from '@sweet-js/helpers/maybe';
