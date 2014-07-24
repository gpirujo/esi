var util = require('util');
module.exports = {
    'run': function run(code) {

        var variables = {};
        var stack = [];
        var pos = 0;
        var actions = {

            'var': function() {
                stack.push(variables[stack.pop()]);
            },

            '*': function() {
                stack.push(stack.pop() * stack.pop());
            },

            '/': function() {
                stack.push(stack.pop() / stack.pop());
            },

            '+': function() {
                stack.push(stack.pop() + stack.pop());
            },

            '-': function() {
                stack.push(stack.pop() - stack.pop()); 
            },

            '<': function() {
                stack.push(stack.pop() < stack.pop());
            },

            '>': function() {
                stack.push(stack.pop() > stack.pop());
            },

            '<=': function() {
                stack.push(stack.pop() <= stack.pop());
            },

            '>=': function() {
                stack.push(stack.pop() >= stack.pop());
            },

            '==': function() {
                stack.push(stack.pop() == stack.pop());
            },

            '!=': function() {
                stack.push(stack.pop() != stack.pop());
            },

            '&&': function() {
                stack.push(stack.pop() && stack.pop());
            },

            '||': function() {
                stack.push(stack.pop() && stack.pop());
            },

            'matches': function() {
                var re = new RegExp(stack.pop(), 'g');
                var x = String(stack.pop()).match(re);
                variables['MATCHES'] = ['array'].concat(x);
                stack.push(Boolean(x));
            },

            'vars': function() {
                output += stack.pop();
            },

            'text': function() {
                output += stack.pop();
            },

            'assign': function() {
                variables[stack.pop()] = stack.pop();
            },

            'call': function() {
                // FIXME
                if (stack.pop() == 'dollar') {
                    output += '$';
                }
            },

            'len': function() {
                stack.push(stack.pop().length);
            },

            '$set_redirect': function(a) {
                throw {
                    'type': 'redirect',
                    'location': a,
                };
            },

            'include': function(a) {
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

            'rewind': function() {
                pos -= stack.pop();
            },

            'forward': function() {
                pos += stack.pop();
            },

            'forward on false': function() {
                var steps = stack.pop();
                if (!stack.pop()) {
                    pos += steps;
                }
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
