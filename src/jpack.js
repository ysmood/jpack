;(function (root) {

    var Jpack = function Jpack () {
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