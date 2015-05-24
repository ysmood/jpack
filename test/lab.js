var kit = require('nokit')
var jpack = require('../src/jpack')

var sample1 = {
    id: 10,
    color: 'red',
    tags: [
        'sun', 'warm'
    ]
}

var sample2 = [1, 2]

var schema1 = {
    type: 'objet',
    properties: {
        id: {
            type: 'number'
        },
        color: {
            type: 'string'
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
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

kit.log(JSON.stringify(
    jpack.genSchema(sample1),
    null,
    4
))
