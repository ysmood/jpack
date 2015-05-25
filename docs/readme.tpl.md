# Overview

Jpack should be language neutral. It is based on the json schema.

# Encoding

0. `object *` -> `array *`

Such as `{ a: 1, b: { d: 3, e: 'test' }, c: 2 }` -> `[1, [3, 'test'], 2]`

0. `array *` -> `encoding`

Such as `[1, [3, 'test'], 2]` -> `{ 1, { 3, [test] }, 2 }`


# Hash Sum

Hash sum of the schema will be placed before the pack:

|  1 | 2 |  ...  |
|  hash  |  pack |

The hash is 16bit