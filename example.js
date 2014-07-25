require('fs').readFile(process.argv[2], 'utf8', function(err, doc) {
    if (err) return console.log(err);

    var parser = require('./esi_parser.js');
    var bytecode = parser.parse(doc);

    console.log(require('util').inspect(bytecode, {'depth': 20, 'colors': true}));

    var interpreter = require('./esi_interpreter');
    interpreter.run(bytecode, process.stdout, function() {
        console.log('fin');
    }, function(err) {
        console.log(err);
    }, function(url, output, finish, err) {
        require('http').get(url, function(res) {
            res.on('data', function(chunk) {
                output.write(chunk);
            });
            res.on('end', finish);
        }).on('error', err);
    });

});
