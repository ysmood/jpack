var Jpack = function Jpack () {
}

/**
 * Generate simple schema from a sample object. Use it
 * if you feel boring to craft a schema by hand.
 * @param  {Object} obj
 * @return {Object}
 */
Jpack.prototype.genSchema = function (obj) {
    var schema = schemaIter(obj, {})

    schema.hash = hash(schema)

    return schema
}

/**
 * Serialize anything to a data pack.
 * @param  {Any} obj
 * @param  {Object} schema
 * @return {Any}
 */
Jpack.prototype.pack = function (val, schema) {
    return packIter(val, schema, [])
}

/**
 * Deserialize the data pack to the origin value.
 * @param  {jpack} data
 * @param  {Object} schema
 * @return {Any}
 */
Jpack.prototype.unpack = function (data, schema) {
    return unpackIter(data, schema)
}

function schemaIter (node, schema) {
    schema.type = getType(node)

    switch (schema.type) {
    case 'array':
        schema.items = {}
        schemaIter(node[0], schema.items)
        break

    case 'object':
        schema.properties = {}
        for (key in node) {
            if (!node.hasOwnProperty(key))
                continue

            schema.properties[key] = {}
            schemaIter(node[key], schema.properties[key])
        }
        break
    }

    return schema
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

function hash (obj) {
    var str = JSON.stringify(obj)

    var l = 16
    var h = Math.pow(2, ((len - len % 2) / 2))
    var rollLen = l - 1
    var mask = 0xffffffff >>> (32 - l)
    var len = str.length

    for (var i = 0; i < len; i++) {
        h = ( (h << 1 | h >>> rollLen) & mask ) ^ str.charCodeAt(i)
    }
    return h >>> 0
}

function packIter (node, schema, arr) {
    switch (schema.type) {
    case 'array':
        for (var i = 0; i < node.length; i++) {
            arr.push(
                packIter(node[i], schema.items, [])
            )
        }
        break

    case 'object':
        for (key in schema.properties) {
            arr.push(
                packIter(node[key], schema.properties[key], [])
            )
        }
        break

    default:
        return node
    }

    return arr
}


function unpackIter (node, schema) {
    switch (schema.type) {
    case 'array':
        var obj = []
        for (var i = 0; i < node.length; i++) {
            obj.push(
                unpackIter(node[i], schema.items)
            )
        }
        break

    case 'object':
        var i = 0,
            obj = {}
        for (key in schema.properties) {
            obj[key] =
                unpackIter(node[i++], schema.properties[key])
        }
        break

    default:
        return node
    }

    return obj
}

function encoding (arr) {

}

function decoding (buf) {
}

module.exports = new Jpack
