code =
    content:content esi:(assign / choose / foreach / vars / text / include / function) code:code {
        return content.concat(esi).concat(code);
    } /
    content

content =
    chars:(
        !('<' '/'? 'esi:' / '$') char:. {
            return char;
        }
    )* {
        if (chars.length) {
            return [chars.join(''), 'print'];
        } else {
            return [];
        }
    }

assign =
    '<esi:assign' __ 'name="' _ id:id _ '"' _ '>' e:expression '</esi:assign>' {
        return e.concat([id, 'assign']);
    }

choose =
    '<esi:choose>' content when:when* otherwise:otherwise? '</esi:choose>' {
        var length = 0;
        var code = [];
        if (otherwise) {
            code = otherwise;
            length += otherwise.length;
        }
        for (var i = when.length - 1; i >= 0; i--) {
            code = when[i].concat([length, 'jump']).concat(code);
            length += when[i].length + 2;
        }
        return code;
    }

when =
    '<esi:when' __ 'test="' _ e:boolean_expression _ '"' _ '>' code:code '</esi:when>' content {
        return e.concat([code.length + 2, 'jump on false']).concat(code);
    }

otherwise =
    '<esi:otherwise>' code:code '</esi:otherwise>' content {
        return code;
    }

foreach =
    '<esi:foreach' __ 'collection="' _ e:array_expression _ '"' _ '>' code:code '</esi:foreach>' {
        var start = e.concat([
            'COLLECTION', 'assign',
            'COLLECTION', 'var', '$len', 'COLLECTION_LENGTH', 'assign',
            0, 'item_index', 'assign',
        ]);
        var loop = [
            'item_index', 'var', 'COLLECTION', 'subvar', 'item', 'assign',
        ].concat(code).concat([
            'item_index', 'var', 1, '+', 'item_index', 'assign',
        ]);
        var jof = [
            'item_index', 'var', 'COLLECTION_LENGTH', 'var', '<', loop.length + 2, 'jump on false',
        ];
        var jump = [
            -(loop.length + jof.length + 2), 'jump',
        ];
        return start.concat(jof).concat(loop).concat(jump);
    }

vars =
    '<esi:vars>' e:expression '</esi:vars>' {
        return e.concat(['print']);
    }

text =
    '<esi:text>' content:(
        !'</esi:text>' char:. {
            return char;
        }
    )* '</esi:text>' {
        return [content.join(''), 'print'];
    }

include =
    '<esi:include' __ 'src="' src:[^"]+ '"' _ '/>' {
        return [src.join(''), 'include'];
    }

function =
    '$' id:id '(' _ args:list? _ ')' {
        return (args || []).concat(['$' + id]);
    }

id =
    initial:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
        return initial + rest.join('');
    }

list =
    e:expression _ ',' _ l:list {
        return e.concat(l);
    } /
    e:expression {
        return e;
    }

expression =
    boolean_expression /
    number_expression /
    string_expression /
    array_expression

array_expression =
    '[' l:list ']' {
        return [l];
    } /
    variable /
    function

boolean_expression =
    a:boolean_term _ op:('&&' / '||') _ b:boolean_expression {
        return a.concat(b).concat([op]);
    } /
    boolean_term

boolean_term =
    a:number_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:number_expression {
        return a.concat(b).concat([op]);
    } /
    a:string_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:string_expression {
        return a.concat(b).concat([op]);
    } /
    a:string_expression __ 'matches' __ "'''" re:[^']* "'''" {
        return a.concat([re.join(''), 'matches']);
    } /
    '(' _ e:boolean_expression _ ')' {
        return e;
    } /
    v:('true' / 'false') {
        return [v === 'true'];
    } /
    variable /
    function

string_expression =
    a:string_term _ op:[+] _ b:string_expression {
        return a.concat(b).concat([op]);
    } /
    string_term

string_term =
    "'" chars:[^']* "'" {
        return [chars.join('')];
    } /
    '(' _ e:string_expression _ ')' {
        return e;
    } /
    variable /
    function

number_expression =
    a:number_term _ op:[+-] _ b:number_expression {
        return a.concat(b).concat([op]);
    } /
    number_term

number_term =
    a:number_factor _ op:[*/] _ b:number_term {
        return a.concat(b).concat([op]);
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
        return [x];
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
        if (sub) {
            return sub.concat([id, 'subvar']);
        } else {
            return [id, 'var'];
        }
    }

_ =
    [ \t\n]*

__ =
    [ \t\n]+
