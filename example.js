require('fs').readFile('example.html', 'utf8', function(err, doc) {
    if (err) return console.log(err);

    var parser = require('./esi_parser.js');
    var bytecode = parser.parse(doc);

    var interpreter = require('./esi_interpreter');
    interpreter.run(bytecode, process.stdout);

});
