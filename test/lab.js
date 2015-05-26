var kit = require('nokit')
var jpack = require('../src/jpack')

var sample1 = {
    id: 123,
    color: 'red',
    otherThings: ['ok', 1],
    true: true,
    false: false,
    tags: [
        'sun', 'warm'
    ]
}

var schema1 = jpack.genSchema(sample1)

kit.log(schema1)

var packed = jpack.pack(sample1, schema1)

kit.log(jpack.unpack(packed, schema1))