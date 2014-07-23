var util = require('util');
module.exports = {
    'run': function run(code) {

        var variables = {};

        var run_actions = {
            'assign': function(line) {
                variables[line[1]] = line[2];
            },
            'vars': function(line) {
                return _evaluate(line[1]);
            },
            'text': function(line) {
                return line[1];
            },
            'choose': function(line) {
                var output = '';
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
                return output;
            },
            'foreach': function(line) {
                var output = '';
                var collection = _evaluate(line[1]);
                if (util.isArray(collection) && collection.length && collection[0] == 'array') {
                    collection.shift();
                    for (var j = 0; j < collection.length; j++) {
                        variables['item'] = collection[j];
                        output += _run(line[2]);
                    }
                }
                return output;
            },
            'dollar': function(line) {
                return '$';
            }
        };

        function _run(code) {
            var block_output = '', action_output;
            for (var i = 0; i < code.length; i++) {
                if (run_actions.hasOwnProperty(code[i][0])) {
                    if (action_output = run_actions[code[i][0]](code[i])) {
                        block_output += action_output;
                    }
                } else {
                    throw 'No code for action ' + code[i][0];
                }
            }
            return block_output;
        }

        var evaluate_actions = {
            '*': function(a, b) { return a * b; },
            '/': function(a, b) { return a / b; },
            '+': function(a, b) { return a + b; },
            '-': function(a, b) { return a - b; },
            '<': function(a, b) { return a < b; },
            '>': function(a, b) { return a > b; },
            '<=': function(a, b) { return a <= b; },
            '>=': function(a, b) { return a >= b; },
            '==': function(a, b) { return a == b; },
            '!=': function(a, b) { return a != b; },
            '&&': function(a, b) { return a && b; },
            '||': function(a, b) { return a || b; },
            'var': function(a) { return variables[a]; },
            'matches': function(a, b) {
                var re = new RegExp(b, 'g');
                var x = String(a).match(re);
                variables['MATCHES'] = ['array'].concat(x);
                return Boolean(x);
            },
        };

        function _evaluate(expr) {
            if (util.isArray(expr)) {
                if (evaluate_actions.hasOwnProperty(expr[0])) {
                    var args = [];
                    for (var i = 1; i < expr.length; i++) {
                        args.push(_evaluate(expr[i]));
                    }
                    return evaluate_actions[expr[0]].apply(this, args);
                } else {
                    throw 'No code for expression ' + expr[0];
                }
            } else {
                return expr;
            }
        }
        
        return _run(code);

    }
};
