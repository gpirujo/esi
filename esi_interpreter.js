var util = require('util');
module.exports = {
    'run': function run(code) {

        var variables = {};

        function _run(code) {
            var output = '';
            for (var i = 0; i < code.length; i++) {
                var line = code[i];

                if (line[0] == 'assign') {
                    variables[line[1]] = line[2];

                } else if (line[0] == 'vars') {
                    output += _evaluate(line[1]);

                } else if (line[0] == 'text') {
                    output += line[1];

                } else if (line[0] == 'choose') {
                    for (var j = 1; j < line.length; j++) {
                        if (line[j][0] == 'when') {
                            if (_evaluate(line[j][1])) {
                                output += _run(line[j][2]);
                                break;
                            }
                        } else if (line[j][0] == 'otherwise') {
                            output += _run(line[j][1]);
                        }
                    }

                } else if (line[0] == 'foreach') {
                    var collection = _evaluate(line[1]);
                    if (util.isArray(collection) && collection.length && collection[0] == 'array') {
                        collection.shift();
                        for (var j = 0; j < collection.length; j++) {
                            variables['item'] = collection[j];
                            output += _run(line[2]);
                        }
                    }

                } else if (line[0] == 'dollar') {
                    output += '$';

                }
            }
            return output;
        }

        function _evaluate(expr) {
            if (util.isArray(expr)) {
                if (expr[0] == 'var') {
                    return variables[expr[1]];
                } else if (expr[0] == '*') {
                    return expr[1] * expr[2];
                } else if (expr[0] == '/') {
                    return expr[1] / expr[2];
                } else if (expr[0] == '+') {
                    return expr[1] + expr[2];
                } else if (expr[0] == '-') {
                    return expr[1] - expr[2];
                } else if (expr[0] == '<') {
                    return expr[1] < expr[2];
                } else if (expr[0] == '<=') {
                    return expr[1] <= expr[2];
                } else if (expr[0] == '>') {
                    return expr[1] > expr[2];
                } else if (expr[0] == '>=') {
                    return expr[1] >= expr[2];
                } else if (expr[0] == '==') {
                    return expr[1] == expr[2];
                } else if (expr[0] == '!=') {
                    return expr[1] != expr[2];
                } else if (expr[0] == '&&') {
                    return Boolean(expr[1] && expr[2]);
                } else if (expr[0] == '||') {
                    return Boolean(expr[1] || expr[2]);
                } else if (expr[0] == 'matches') {
                    var re = new RegExp(expr[2], 'g');
                    var x = String(expr[1]).match(re);
                    variables['MATCHES'] = ['array'].concat(x);
                    return Boolean(x);
                } else {
                    console.log('Cannot evaluate ' + util.inspect(expr));
                }
            } else {
                return expr;
            }
        }
        
        return _run(code);

    }
};
