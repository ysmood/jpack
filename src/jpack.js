var msgpack5 = require('msgpack5')()

var Jpack = function Jpack () {
}

function getType (val) {
    var type = typeof val
    switch (type) {
    case 'object':
        if (val === null) {
            return 'null'
        } else if (val.constructor === Array) {
            return 'array'
        } else {
            return 'object'
        }
    default:
        return type
    }
}

/**
 * Generate simple schema from a sample object. Use it
 * if you feel boring to craft a schema by hand.
 * @param  {Object} obj
 * @return {Object}
 */
Jpack.prototype.genSchema = function (obj) {
    var schema = {}

    var iter = function (node, schema) {
        schema.type = getType(node)

        switch (schema.type) {
        case 'array':
            schema.items = {}
            iter(node[0], schema.items)
            break

        case 'object':
            schema.properties = {}
            for (key in node) {
                schema.properties[key] = {}
                iter(node[key], schema.properties[key])
            }
            break
        }
    }

    iter(obj, schema)

    return schema
}

Jpack.prototype.pack = function (obj, schema) {

    var iter = function (node, schema, arr) {
        switch (schema.type) {
        case 'array':
            for (var i = 0; i < node.length; i++) {
                arr.push(
                    iter(node[i], schema.items, [])
                )
            }
            break

        case 'object':
            for (key in schema.properties) {
                arr.push(
                    iter(node[key], schema.properties[key], [])
                )
            }
            break

        default:
            return node
        }

        return arr
    }

    return msgpack5.encode(
        iter(obj, schema, [])
    )
}

Jpack.prototype.unpack = function (data, schema) {
    var arr = msgpack5.decode(data)
    return arr
}

module.exports = new Jpack
