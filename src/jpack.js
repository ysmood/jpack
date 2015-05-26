;(function (root) {
    var Jpack = function Jpack () {
        self = this

        /**************************** Public *************************************/

        /**
         * User can use it to extend the data type that jpack supports.
         * @type {Object} Each type should implement two
         * functions. One is `serialize`: `(val) -> String | Number | Boolean | SimpleArray | null`.
         * Another one is `parse`: `(val) -> any`.
         * `SimpleArray` is an array that only contains `String`, `Number`, `Boolean`, `SimpleArray` or `null`.
         * Jpack itself use it to support `Date` type.
         * @example
         * This will let jpack support custom type `Size`.
         * ```javascript
         * var Size = function Size (w, h) {
         *     this.w = w
         *     this.h = h
         * }
         * Size.prototype.area = function () {
         *     return this.w * this.h
         * }
         *
         * jpack.types['Size'] = {
         *     serialize: function (s) {
         *         return [s.w, s.h]
         *     },
         *     parse: function (s) {
         *         return new Size(s[0], s[1])
         *     }
         * }
         *
         * console.log(Size.name) // => "Size"
         *
         * var obj = {
         *     'a': new Size(1, 2)
         * }
         *
         * var schema = jpack.genSchema(obj)
         *
         * jpack.pack(obj, schema)
         * ```
         */
        self.types = {
            'Date': {
                serialize: function (val) {
                    return val.getTime()
                },
                parse: function (val) {
                    return new Date(val)
                }
            }
        }

        /**
         * Generate simple schema from a sample object. Use it
         * if you feel boring to craft a schema by hand.
         * @param  {Object} obj
         * @return {Object}
         */
        self.genSchema = function (obj) {
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
        self.pack = function (val, schema) {
            return packIter(val, schema, [])
        }

        /**
         * Deserialize the data pack to the origin value.
         * @param  {jpack} data
         * @param  {Object} schema
         * @return {Any}
         */
        self.unpack = function (data, schema) {
            return unpackIter(data, schema)
        }

        /**************************** Private ***************************************/

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
                if (val === null) return 'null'

                type = val.constructor.name

                if (type == 'Array') return 'array'

                if (self.types[type]) return type

                return 'object'

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
            var type = schema.type

            switch (type) {
            case 'array':
                for (var i = 0; i < node.length; i++) {
                    arr.push(
                        // Every item should be same typed,
                        // so we only have to get the first one's type.
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
                var handler = self.types[type]
                if (handler)
                    return handler.serialize(node)

                return node
            }

            return arr
        }

        function unpackIter (node, schema) {
            var type = schema.type

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
                var handler = self.types[type]
                if (handler)
                    return handler.parse(node)

                return node
            }

            return obj
        }

        /**
         * Encoding an array into a binary buffer.
         * @param  {Array} arr It only contains
         * `Array`, `String`, `Number`, `Boolean` and `null`.
         * @return {Uint8Array}
         */
        function encoding (arr) {

        }

        /**
         * Decoding a buffer to an array.
         * @param  {Uint8Array} buf
         * @return {Array}
         */
        function decoding (buf) {
        }

    }

    var jpack = new Jpack

    try {
        module.exports = jpack
    } catch (e) {
        try {
            define(function () { return jpack })
        } catch (e) {
            root.jpack = Yaku
        }
    }

})(this);

