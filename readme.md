**Jpack is on its very early stage, don't make PR for it, only issue will be resolved.**

# Overview

Jpack should be language neutral, extendable and fast.
It is based on the subset of json-schema.


# Terms

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

0. `SimpleType` to `ArrayBuffer`

  Such as `[1, [3, 'test'], 2]` to `...`.


# Hash Sum

Hash sum of the schema will be placed before the pack:

|  1 | 2 |  ...  |
|  hash  |  pack |

The hash is 16bit

It will make sure the decoding schema is on the right version.


# API

- ### **[genSchema(obj)](src/jpack.js?source#L13)**

    Generate simple schema from a sample object. Use it
    if you feel boring to craft a schema by hand.

    - **<u>param</u>**: `obj` { _Object_ }

    - **<u>return</u>**: { _Object_ }

- ### **[pack(obj, schema)](src/jpack.js?source#L27)**

    Serialize anything to a data pack.

    - **<u>param</u>**: `obj` { _Any_ }

    - **<u>param</u>**: `schema` { _Object_ }

    - **<u>return</u>**: { _ArrayBuffer_ }

- ### **[unpack(data, schema)](src/jpack.js?source#L37)**

    Deserialize the data pack to the origin value.

    - **<u>param</u>**: `data` { _ArrayBuffer_ }

    - **<u>param</u>**: `schema` { _Object_ }

    - **<u>return</u>**: { _Any_ }

- ### **[types](src/jpack.js?source#L78)**

    Use it to extend the data type that jpack supports.
    By default it implements the `Date` type.

    - **<u>type</u>**: { _Object_ }

        Each type should implement two
        functions. One is `serialize`: `(val) -> SimpleType`.
        Another one is `parse`: `(val) -> any`.

    - **<u>example</u>**:

        This will let jpack support custom type `Size`.
        ```javascript
        var Size = function Size (w, h) {
            this.w = w
            this.h = h
        }
        Size.prototype.area = function () {
            return this.w * this.h
        }

        jpack.types['Size'] = {
            serialize: function (s) {
                return [s.w, s.h]
            },
            parse: function (s) {
                return new Size(s[0], s[1])
            }
        }

        console.log(Size.name) // => "Size"

        var obj = {
            'a': new Size(1, 2)
        }

        var schema = jpack.genSchema(obj)

        jpack.pack(obj, schema)
        ```

