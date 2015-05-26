var kit = require('nokit')
var jpack = require('../src/jpack')

var sample1 = {
    id: 123,
    color: 'red',
    otherThings: ['ok', 1],
    true: true,
    false: false,
    date: new Date,
    tags: [
        'sun', 'warm'
    ]
}

var schema1 = jpack.genSchema(sample1)

kit.log(schema1)

var packed = jpack.pack(sample1, schema1)

kit.log(packed)

kit.log(jpack.unpack(packed, schema1))

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

kit.log(
    jpack.unpack(jpack.pack(obj, schema), schema).a.area()
)
