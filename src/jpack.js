;(function (root) {

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
            var type = getType(node)

            schema.type = type

            switch (type) {
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

    var jpack = new Jpack

    // CMD & AMD Support
    try {
        module.exports = jpack
    }
    catch (e) {
        try {
            define(function () {
                return jpack
            })
        }
        catch (e) {
            root.jpack = jpack
        }
    }


})(this);