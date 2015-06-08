**Jpack is on its very early stage, it's not ready for production. Don't make PR for it, only issue will be resolved.**

# Overview

Jpack should be language neutral, extendable and fast.
And it should support event IE6.
It is based on the subset of json-schema.


# Terms

### `JsonType`

Same as the [json.org spec][].
It represents one of these types: `String`, `Number`, `Boolean`, `Object`, `Array` or `null`.

### `SimpleValue`

It represents one of these types: `String`, `Number`, `Boolean` or `null`.

### `SimpleArray`

It's an array that contains only `SimpleValue` or `SimpleArray`.
Such as `[1, 'str', [true, null]]` is a `SimpleArray`, but `[1, {a: true}]` isn't.

### `SimpleType`

It is an `SimpleValue` or `SimpleArray`.


# Pack Process

0. `Serializable` to `SimpleType`

  Such as `10` to `10` or `{ a: 1, b: { d: 3, e: 'test' }, c: 2 }` to `[1, [3, 'test'], 2]`.

0. `SimpleType` to `Spack`

  Such as `[1, [3, 'test'], 2]` to `[1|[3|{test}]]`.

## Spack Encoding

Convert `SimpleType` into a plain string. Spack is simpler and faster than JSON.
The result string will be more compact and smaller than JSON. Thus it's not human
readable.

### Null

`\0`

### Boolean

- `true` to `\1`
- `false` to `\2`

### String:

- string sign: `\3`

### Array

- `[` to `\4`
- `]` to `\5`
- `,` to `\6`

Such as: `[1, 2, 3]` to `\41\62\63\5`.

### Number:

Number will be convert to base 119.

- minus sign: `\7`
- decimal point: `\8`
- digit: `\9` ~ `\127`

Spack won't support something like `10E+10`.

# Hash Sum

Hash sum of the schema will be placed before the pack:

|  1 | 2 |  ...  |
|  hash  |  pack |

The hash is 16bit

It will make sure the decoding schema is on the right version.


# API

<%= doc['src/jpack.js'] %>

[json.org spec]: http://www.json.org/