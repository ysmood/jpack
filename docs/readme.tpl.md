# Encoding

0. `object *` -> `array *`

Such as `{ a: 1, b: { d: 3, e: 'test' }, c: 2 }` -> `[1, [3, 'test'], 2]`

0. `array *` -> `encoding`

Such as `[1, [3, 'test'], 2]` -> `{ 1, { 3, [test] }, 2 }`