;(function (root) {
    var Jpack = function Jpack () {

        // **************************** Public *************************************

        var self = this

        /**
         * Generate simple schema from a sample object. Use it
         * if you feel boring to craft a schema by hand.
         * @param  {JsonType} val
         * @return {JsonType}
         */
        self.genSchema = function (val) {
            var schema = schemaIter(val, {})

            schema.hash = hash(schema)

            return schema
        }

        /**
         * Serialize anything to a data pack.
         * @param  {JsonType} val
         * @param  {JsonType} schema
         * @return {ArrayBuffer}
         */
        self.pack = packIter

        /**
         * Deserialize the data pack to the origin value.
         * @param  {ArrayBuffer} data
         * @param  {JsonType} schema
         * @return {JsonType}
         */
        self.unpack = unpackIter

        /**
         * Use it to extend the data type that jpack supports.
         * By default it implements the `Date` type.
         * @type {Object} Each type should implement two
         * functions. One is `serialize`: `(val) -> SimpleType`.
         * Another one is `parse`: `(val) -> any`.
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

        // **************************** Private ***************************************

        function schemaIter (node, schema) {
            schema.type = getType(node)

            switch (schema.type) {
            case 'array':
                schema.items = {}

                // Every item should be same typed,
                // so we only have to get the first one's type.
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

        /**
         * Get the type of a value.
         * @private
         * @param  {JsonType} val
         * @return {String} The type name.
         */
        function getType (val) {
            var type = typeof val
            switch (type) {
            case 'object':
                if (val === null) return 'null'

                type = val.constructor.name

                if (type === 'Array') return 'array'

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

        function numToStr (num) {
            var str = ''
                , s

            while (num >= numBase) {
                s = num % numBase
                str = codeToStr(s + codeIndex) + str
                num = (num - s) / numBase
            }

            str = codeToStr(num + codeIndex) + str

            return str
        }

        function packIter (node, schema) {
            var type = schema.type

            switch (type) {
            case 'array':
                var arr = []
                for (var i = 0; i < node.length; i++) {
                    arr.push(
                        packIter(node[i], schema.items)
                    )
                }
                return arr

            case 'object':
                var arr = []
                for (key in schema.properties) {
                    arr.push(
                        packIter(node[key], schema.properties[key])
                    )
                }
                return arr

            default:
                var handler = self.types[type]
                if (handler)
                    return handler.serialize(node)

                return node
            }
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

        function getSpackSymbol () {
            numBase--
            return codeToStr(codeIndex++)
        }

        var codeToStr = String.fromCharCode
            , codeIndex = 0
            , numBase = 128
            , $null = getSpackSymbol()
            , $true = getSpackSymbol()
            , $false = getSpackSymbol()
            , $strSign = getSpackSymbol()
            , $arrOpen = getSpackSymbol()
            , $arrClose = getSpackSymbol()
            , $arrSep = getSpackSymbol()
            , $minusSign = getSpackSymbol()
            , $decimalPoint = getSpackSymbol()
            , $strSignEscape = $strSign + $strSign
            , $strSignReg = new RegExp($strSign, 'g')

        function stringifyIter (node) {
            if (node === null) return $null

            switch (typeof node) {
            case 'boolean':
                if (node)
                    return $true
                else
                    return $false

            case 'string':
                return $strSign
                    + node.replace($strSignReg, $strSignEscape)

            case 'number':
                var res = ''
                    , str = ''
                if (node < 0) {
                    res += $minusSign
                    node = -node
                }

                str = node + ''

                var dotIndex = str.indexOf('.')

                if (dotIndex > -1) {
                    res += numToStr(+str.slice(0, dotIndex))
                        + $decimalPoint
                        + numToStr(+str.slice(dotIndex + 1))
                } else {
                    res += numToStr(node)
                }

                return res

            // In fact it can only be an array.
            case 'object':
                var len = node.length
                  , lenI = len - 1
                  , i = 0
                  , str = ''
                str += $arrOpen
                for (; i < len; i++) {
                    if (i < lenI)
                        str += stringifyIter(node[i], str) + $arrSep
                    else
                        str += stringifyIter(node[i], str)
                }
                return str + $arrClose
            }
        }

        /**
         * Convert a SimpleType into a string.
         * @param  {SimpleType} spt
         * @private
         * @return {String}
         */
        function stringify (spt) {
            return new Buffer(stringifyIter(spt))
        }

        // [10, true, [12345, [1, 2, 3], 'hello world'], 'test']
        console.log(stringify([-1.2, 10]))

        /**
         * Convert a string to a SimpleType.
         * @private
         * @param  {String} str
         * @return {SimpleType}
         */
        function parse (str) {
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

