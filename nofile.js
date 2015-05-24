module.exports = function (task, option) {
    var kit = require('nokit')

    task('lab', function () {
        kit.monitorApp({
            args: ['test/lab.js']
        })
    })
}