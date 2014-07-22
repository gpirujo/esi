fs = require('fs')
fs.readFile('grammar.pegjs', 'utf8', function (err, grammar) {
    if (err) return console.log(err);

    var peg = require("pegjs");
    var parser = peg.buildParser(grammar);

    fs.readFile('example.html', 'utf8', function(err, doc) {
        if (err) return console.log(err);

        var result = parser.parse(doc);

        console.log(require('util').inspect(result, {'colors': true, 'depth': 10}));

    });

});
