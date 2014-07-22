var variables = {};
function execute(code, os) {
    for (var i = 0; i < code.length; i++) {
        var line = code[i];
        var command = line[0];

        if (command == 'text') {
            os.write(line[1]);

        } else if (command == 'assign') {
            variables[line[1]] = line[2];

        } else if (command == 'vars') {
            os.write(String(variables[line[1]]));

        } else if (command == 'choose') {
            for (var j = 1; j < line.length; j++) {
                var subcommand = line[j][0];
                if (subcommand == 'when') {
                    execute(line[j][2], os);
                } else if (subcommand == 'otherwise') {
                    execute(line[j][1], os);
                }
            }

        } else if (command == 'foreach') {
            for (var j = 0; j < 3; j++) {
                variables['item'] = j;
                execute(line[2], os);
            }

        } else if (command == 'dollar') {
            os.write('$');

        }
    }
}

exports.run = function(source, output_stream, callback) {
    require('fs').readFile('grammar.pegjs', 'utf8', function (err, grammar) {
        if (err) {
            if (callback) callback(err);
            return;
        }

        var peg = require("pegjs");
        var parser = peg.buildParser(grammar);
        var bytecode = parser.parse(source);
        execute(bytecode, output_stream);

        if (callback) callback(null);

    });
}
