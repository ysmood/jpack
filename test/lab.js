var kit = require('nokit')
var jpack = require('../src/jpack')

var sample1 = {
    id: 10,
    color: 'red',
    null: null,
    true: true,
    tags: [
        'sun', 'warm'
    ]
}

var sample2 = [
    {
        id: 1
    },
    {
        id: 2
    }
]

var schema1 = {
    "type": "object",
    "properties": {
        "id": {
            "type": "number"
        },
        "color": {
            "type": "string"
        },
        "null": {
            "type": "null"
        },
        "true": {
            "type": "boolean"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
}

var schema2 = {
    type: 'array',
    items: {
        type: 'number'
    }
}

var len = function (obj) {
    if (Buffer.isBuffer(obj)) {
        console.log(obj.length, obj)
    } else {
        var str = JSON.stringify(obj)
        console.log(str.length, str)
    }
}

len(sample1)

len(
    jpack.pack(sample1, schema1)
)

len(jpack.unpack(
    jpack.pack(sample1, schema1), schema1
))