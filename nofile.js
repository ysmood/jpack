module.exports = function (task, option) {
    var kit = require('nokit')

    task('lab', 'run lab program for testing new feature', function () {
        kit.monitorApp({
            args: ['test/lab.js']
        })
    })

    task('build', 'build project', function () {
        kit.require('drives')

        kit.warp('src/jpack.js')
        .load(kit.drives.comment2md({
            tpl: 'docs/readme.tpl.md'
        }))
        .run()
    })
}