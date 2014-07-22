code =
    content:content rest:(
        esi:(assign / choose / foreach / vars / text / function) code:code {
            return [esi].concat(code);
        }
    )? {
        var code = [content];
        if (rest) code = code.concat(rest);
        return code;
    }

content =
    chars:(
        !('<' '/'? 'esi:' / '$') char:. {
            return char;
        }
    )* {
        return ['text', chars.join('')];
    }

assign =
    '<esi:assign' attributes:attributes '/>' {
        return ['assign', attributes.name, attributes.value];
    }

choose =
    '<esi:choose>' content when:when* otherwise:otherwise? '</esi:choose>' {
        var choose = ['choose'].concat(when);
        if (otherwise) choose.push(otherwise);
        return choose;
    }

when =
    '<esi:when' attributes:attributes '>' code:code '</esi:when>' content {
        return ['when', attributes.test, code];
    }

otherwise =
    '<esi:otherwise>' code:code '</esi:otherwise>' content {
        return ['otherwise', code];
    }

foreach =
    '<esi:foreach' attributes:attributes '>' code:code '</esi:foreach>' {
        return ['foreach', attributes.collection, code];
    }

vars =
    '<esi:vars' attributes:attributes '/>' {
        return ['vars', attributes.name];
    }

text =
    '<esi:text>' content:(
        !'</esi:text>' char:. {
            return char;
        }
    )* '</esi:text>' {
        return ['text', content.join('')];
    }

attributes =
    list:(
        [ \t\n]+ id:id '="' value:[^"]* '"' {
            return [id, value.join('')];
        }
    )* _ {
        var attributes = {};
        for (var i = 0; i < list.length; i++) {
            attributes[list[i][0]] = list[i][1];
        }
        return attributes;
    }

function =
    '$' id:id '(' _ args:arguments? _ ')' {
        var x = [id];
        if (args) x = x.concat(args);
        return x;
    }

id =
    chars:[a-z_]+ {
        return chars.join('');
    }

arguments =
    argument:string_expression arguments:(
        _ ',' _ arguments:arguments {
            return arguments;
        }
    )? {
        var x = [argument];
        if (arguments) x = x.concat(arguments);
        return x;
    }

boolean_expression =
    boolean_literal /
    number_comparison /
    string_comparison

boolean_literal =
    'true' {
        return true;
    } /
    'false' {
        return false;
    }

number_comparison =
    a:number_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:number_expression {
        return ['n' + op, a, b];
    }

number_expression =
    term /
    a:term _ op:[+-] _ b:number_expression {
        return [op, a, b];
    }

term =
    factor /
    a:factor _ op:[*/] _ b:term {
        return [op, a, b];
    }

factor =
    number_literal /
    '(' _ e:number_expression _ ')' {
        return e;
    }

number_literal =
    ints:[0-9]+ decimals:(
        '.' digits:[0-9]+ {
            return parseFloat('.' + digits.join(''));
        }
    )? {
        var x = parseInt(ints.join(''));
        if (decimals) x += decimals;
        return x;
    }

string_comparison =
    a:string_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:string_expression {
        return ['s' + op, a, b];
    }

string_expression =
    string_literal /
    a:string_literal _ op:'+' _ b:string_expression {
        return ['s' + op, a, b];
    }

string_literal =
    "'" chars:[^']* "'" {
        return chars.join('');
    }

_ =
    [ \t\n]*
