module.exports = {
    'run': function run(code, os) {

        var variables = {};

        (function _run(code) {
            for (var i = 0; i < code.length; i++) {
                var line = code[i];

                if (line[0] == 'assign') {
                    variables[line[1]] = line[2];

                } else if (line[0] == 'vars') {
                    os.write(String(variables[line[1]]));

                } else if (line[0] == 'text') {
                    os.write(line[1]);

                } else if (line[0] == 'choose') {
                    for (var j = 1; j < line.length; j++) {
                        if (line[j][0] == 'when') {
                            _run(line[j][2]);
                        } else if (line[j][0] == 'otherwise') {
                            _run(line[j][1]);
                        }
                    }

                } else if (line[0] == 'foreach') {
                    for (var j = 0; j < 3; j++) {
                        variables['item'] = j;
                        _run(line[2]);
                    }

                } else if (line[0] == 'dollar') {
                    os.write('$');

                }
            }
        })(code);

    }
};
