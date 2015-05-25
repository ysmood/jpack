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

function hash (obj) {
    var str = JSON.stringify(obj)
    var h = 65536
    var len = str.length
    for (var i = 0; i < len; i++) {
        h = ( (h << 1 | h >>> 31) & 0xffffffff ) ^ str.charCodeAt(i)
    }
    return h >>> 0
}

/**
 * Generate simple schema from a sample object. Use it
 * if you feel boring to craft a schema by hand.
 * @param  {Object} obj
 * @return {Object}
 */
Jpack.prototype.genSchema = function (obj) {
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
                if (!node.hasOwnProperty(key))
                    continue

                schema.properties[key] = {}
                iter(node[key], schema.properties[key])
            }
            break
        }

        return schema
    }

    var schema = iter(obj, {})

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

    return iter(val, schema, [])
}

/**
 * Deserialize the data pack to the origin value.
 * @param  {jpack} data
 * @param  {Object} schema
 * @return {Any}
 */
Jpack.prototype.unpack = function (data, schema) {

    var iter = function (node, schema) {
        switch (schema.type) {
        case 'array':
            var obj = []
            for (var i = 0; i < node.length; i++) {
                obj.push(
                    iter(node[i], schema.items)
                )
            }
            break

        case 'object':
            var i = 0,
                obj = {}
            for (key in schema.properties) {
                obj[key] =
                    iter(node[i++], schema.properties[key])
            }
            break

        default:
            return node
        }

        return obj
    }

    return iter(data, schema)
}

module.exports = new Jpack
