code =
    content:content rest:(
        esi:(assign / choose / foreach / vars / text / include / function) code:code {
            return [esi].concat(code.slice(1));
        }
    )? {
        var code = ['block', content];
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
    '<esi:assign' __ 'name="' _ n:id _ '"' _ '>' e:expression '</esi:assign>' {
        return ['assign', n, e];
    }

choose =
    '<esi:choose>' content when:when* otherwise:otherwise? '</esi:choose>' {
        var choose = ['choose'].concat(when);
        if (otherwise) choose.push(otherwise);
        return choose;
    }

when =
    '<esi:when' __ 'test="' _ e:boolean_expression _ '"' _ '>' code:code '</esi:when>' content {
        return ['when', e, code];
    }

otherwise =
    '<esi:otherwise>' code:code '</esi:otherwise>' content {
        return ['otherwise', code];
    }

foreach =
    '<esi:foreach' __ 'collection="' _ e:array_expression _ '"' _ '>' code:code '</esi:foreach>' {
        return ['foreach', e, code];
    }

vars =
    '<esi:vars>' e:expression '</esi:vars>' {
        return ['vars', e];
    }

text =
    '<esi:text>' content:(
        !'</esi:text>' char:. {
            return char;
        }
    )* '</esi:text>' {
        return ['text', content.join('')];
    }

include =
    '<esi:include' __ 'src="' src:[^"]+ '"' _ '/>' {
        return ['include', src.join('')];
    }

function =
    '$' id:id '(' _ args:list? _ ')' {
        var x = ['$' + id];
        if (args) x = x.concat(args);
        return x;
    }

id =
    initial:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
        return initial + rest.join('');
    }

list =
    e:expression {
        return [e];
    } /
    e:expression _ ',' _ l:list {
        var x = [e];
        x = x.concat(list);
        return x;
    }

expression =
    boolean_expression /
    number_expression /
    string_expression /
    array_expression

array_expression =
    '[' l:list ']' {
        return ['array', l];
    } /
    variable /
    function

boolean_expression =
    boolean_term /
    a:boolean_term _ op:('&&' / '||') _ b:boolean_expression {
        return [op, a, b];
    }

boolean_term =
    a:number_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:number_expression {
        return [op, a, b];
    } /
    a:string_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:string_expression {
        return [op, a, b];
    } /
    a:string_expression __ 'matches' __ "'''" re:[^']* "'''" {
        return ['matches', a, re.join('')];
    } /
    '(' _ e:boolean_expression _ ')' {
        return e;
    } /
    v:('true' / 'false') {
        return v === 'true';
    } /
    variable /
    function

string_expression =
    a:string_term _ op:[+] _ b:string_expression {
        return [op, a, b];
    } /
    string_term

string_term =
    "'" chars:[^']* "'" {
        return chars.join('');
    } /
    '(' _ e:string_expression _ ')' {
        return e;
    } /
    variable /
    function

number_expression =
    a:number_term _ op:[+-] _ b:number_expression {
        return [op, a, b];
    } /
    number_term

number_term =
    a:number_factor _ op:[*/] _ b:number_term {
        return [op, a, b];
    } /
    number_factor

number_factor =
    ints:[0-9]+ decimals:(
        '.' digits:[0-9]+ {
            return parseFloat('.' + digits.join(''));
        }
    )? {
        var x = parseInt(ints.join(''));
        if (decimals) x += decimals;
        return x;
    } /
    '(' _ e:number_expression _ ')' {
        return e;
    } /
    variable /
    function

variable =
    '$(' _ id:id sub:(
        '{' _ e:string_expression _ '}' {
            return e;
        }
    )? _ ')' {
        var x = ['var', id];
        if (sub) x.push(sub);
        return x;
    }

_ =
    [ \t\n]*

__ =
    [ \t\n]+
