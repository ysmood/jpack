**Jpack is on its very early stage, don't make PR for it, only issue will be resolved.**

# Overview

Jpack should be language neutral, extendable and fast.
It is based on the subset of json-schema.


# Pack Process

### `SimpleValue`

It represents one of these types: `String`, `Number`, `Boolean` or `null`.

### `SimpleArray`

It's an array that contains only `SimpleValue` or `SimpleArray`.
Such as `[1, 'str', [true, null]]` is a `SimpleArray`, but `[1, {a: true}]` isn't.

### `SimpleType`

It is an `SimpleValue` or `SimpleArray`.

0. `Serializable` to `SimpleType`

  Such as `10` to `10` or `{ a: 1, b: { d: 3, e: 'test' }, c: 2 }` to `[1, [3, 'test'], 2]`.

0. `SimpleType` to `ArrayBuffer`

  Such as `[1, [3, 'test'], 2]` to `...`.


# Hash Sum

Hash sum of the schema will be placed before the pack:

|  1 | 2 |  ...  |
|  hash  |  pack |

The hash is 16bit

It will make sure the decoding schema is on the right version.


# API

<%= doc['src/jpack.js'] %>