module.exports = {
    'run': function run(code) {

        var variables = {};

        return (function _run(code) {
            var output = '';
            for (var i = 0; i < code.length; i++) {
                var line = code[i];

                if (line[0] == 'assign') {
                    variables[line[1]] = line[2];

                } else if (line[0] == 'vars') {
                    output += variables[line[1]];

                } else if (line[0] == 'text') {
                    output += line[1];

                } else if (line[0] == 'choose') {
                    for (var j = 1; j < line.length; j++) {
                        if (line[j][0] == 'when') {
                            output += _run(line[j][2]);
                        } else if (line[j][0] == 'otherwise') {
                            output += _run(line[j][1]);
                        }
                    }

                } else if (line[0] == 'foreach') {
                    for (var j = 0; j < 3; j++) {
                        variables['item'] = j;
                        output += _run(line[2]);
                    }

                } else if (line[0] == 'dollar') {
                    output += '$';

                }
            }
            return output;
        })(code);

    }
};
