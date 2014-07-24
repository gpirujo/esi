var util = require('util');
module.exports = {
    'run': function run(code) {

        var output = '';
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
                output += stack.pop();
            },

            'assign': function() {
                var x = stack.pop();
                var y = stack.pop();
                heap[x] = y;
            },

            '$dollar': function() {
                stack.pop(); //true
                output += '$';
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
                // FIXME
                output += 'aca va el include';
                /*
                http.get(a, function(res) {
                    console.log("Got response: " + res.statusCode);
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
                */
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

        while (pos < code.length) {
            if (actions.hasOwnProperty(code[pos])) {
                actions[code[pos]]();
            } else {
                stack.push(code[pos]);
            }
            pos++;
        }

        return output;

    }
};
