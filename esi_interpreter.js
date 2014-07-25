var util = require('util');
module.exports = {
    'run': function run(code, output, end, err, http) {

        var heap = {};
        var stack = [];
        var pos = 0;
        var actions = {

            'var': function() {
                var x = stack.pop();
                stack.push(heap[x]);
            },

            'subvar': function() {
                var x = stack.pop();
                var y = stack.pop();
                stack.push(heap[x][y]);
            },

            '*': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x * y);
            },

            '/': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x / y);
            },

            '+': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x + y);
            },

            '-': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x - y);
            },

            '<': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x < y);
            },

            '>': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x > y);
            },

            '<=': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x <= y);
            },

            '>=': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x >= y);
            },

            '==': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x == y);
            },

            '!=': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x != y);
            },

            '&&': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x && y);
            },

            '||': function() {
                var y = stack.pop();
                var x = stack.pop();
                stack.push(x || y);
            },

            'matches': function() {
                var y = new RegExp(stack.pop(), 'g');
                var x = String(stack.pop()).match(y);
                heap['MATCHES'] = x;
                stack.push(Boolean(x));
            },

            'print': function() {
                output.write(stack.pop());
            },

            'assign': function() {
                var x = stack.pop();
                var y = stack.pop();
                heap[x] = y;
            },

            '$dollar': function() {
                stack.pop(); //true
                output.write('$');
            },

            '$len': function() {
                var x = stack.pop();
                stack.push(x.length);
            },

            '$set_redirect': function(a) {
                throw {
                    'type': 'redirect',
                    'location': a,
                };
            },

            'include': function() {
                http(stack.pop(), output, _run, function(e) {
                    _run();
                });
                throw new Error('suspend');
            },

            'jump': function() {
                pos += stack.pop();
            },

            'jump on false': function() {
                var steps = stack.pop();
                if (!stack.pop()) {
                    pos += steps;
                }
            },

            'dump': function() {
                console.log(heap);
            },

        };

        function _run() {
            while (pos < code.length) {
                var action = code[pos++];
                if (actions.hasOwnProperty(action)) {
                    try {
                        actions[action]();
                    } catch (e) {
                        if (e.message == 'suspend') {
                            return;
                        } else {
                            err.call(this, e);
                        }
                    }
                } else {
                    stack.push(action);
                }
            }
            end.call(this);
        }

        _run();

    }
};
