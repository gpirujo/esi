require('fs').readFile('example.html', 'utf8', function(err, doc) {
    if (err) return console.log(err);

    var parser = require('./esi_parser.js');
    var bytecode = parser.parse(doc);

    console.log(require('util').inspect(bytecode, {
        'depth': 20,
        'colors': true
    }));

    var interpreter = require('./esi_interpreter');
    var output = interpreter.run(bytecode);

    process.stdout.write(output);

});
