var util = require('util');
module.exports = {
    'run': function run(code) {

        var variables = {};

        var actions = {

            'var': function(a) {
                return variables[_evaluate(a)];
            },

            '*': function(a, b) {
                return _evaluate(a) * _evaluate(b);
            },

            '/': function(a, b) {
                return _evaluate(a) / _evaluate(b);
            },

            '+': function(a, b) {
                return _evaluate(a) + _evaluate(b);
            },

            '-': function(a, b) {
                return _evaluate(a) - _evaluate(b);
            },

            '<': function(a, b) {
                return _evaluate(a) < _evaluate(b);
            },

            '>': function(a, b) {
                return _evaluate(a) > _evaluate(b);
            },

            '<=': function(a, b) {
                return _evaluate(a) <= _evaluate(b);
            },

            '>=': function(a, b) {
                return _evaluate(a) >= _evaluate(b);
            },

            '==': function(a, b) {
                return _evaluate(a) == _evaluate(b);
            },

            '!=': function(a, b) {
                return _evaluate(a) != _evaluate(b);
            },

            '&&': function(a, b) {
                return _evaluate(a) && _evaluate(b);
            },

            '||': function(a, b) {
                return _evaluate(a) || _evaluate(b);
            },

            'matches': function(a, b) {
                var re = new RegExp(_evaluate(b), 'g');
                var x = String(_evaluate(a)).match(re);
                variables['MATCHES'] = ['array'].concat(x);
                return Boolean(x);
            },

            'vars': function(a) {
                return _evaluate(a);
            },

            'text': function(a) {
                return a;
            },

            'assign': function(a, b) {
                variables[_evaluate(a)] = _evaluate(b);
            },

            'block': function() {
                var output = '';
                for (var i = 0; i < arguments.length; i++) {
                    output += _evaluate(arguments[i]);
                }
                return output;
            },

            'choose': function() {
                var output = '';
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i][0] == 'when') {
                        if (_evaluate(arguments[i][1])) {
                            output += _evaluate(arguments[i][2]);
                            break;
                        }
                    } else if (arguments[i][0] == 'otherwise') {
                        output += _evaluate(arguments[i][1]);
                        break;
                    }
                }
                return output;
            },

            'foreach': function(a, b) {
                var output = '';
                var collection = _evaluate(a);
                if (util.isArray(collection) && collection.length && collection[0] == 'array') {
                    for (var j = 1; j < collection.length; j++) {
                        variables['item'] = collection[j];
                        output += _evaluate(b);
                    }
                }
                return output;
            },

            '$dollar': function() {
                return '$';
            },

            '$set_redirect': function(a) {
                throw {
                    'type': 'redirect',
                    'location': a,
                };
            },

            'include': function(a) {
                return 'aca va el include';
                http.get(a, function(res) {
                    console.log("Got response: " + res.statusCode);
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
            },

        };

        function _evaluate(expr) {
            if (util.isArray(expr)) {
                if (!actions.hasOwnProperty(expr[0])) throw 'No code for expression ' + util.inspect(expr); // for devs
                return actions[expr[0]].apply(this, expr.slice(1));
            } else {
                return expr;
            }
        }
        
        return _evaluate(code);

    }
};
