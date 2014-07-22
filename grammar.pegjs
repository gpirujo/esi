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
    '$' id:id '(' _ args:list? _ ')' {
        var x = [id];
        if (args) x = x.concat(args);
        return x;
    }

id =
    chars:[a-z_]+ {
        return chars.join('');
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
        return l;
    }

boolean_expression =
    boolean_term /
    a:boolean_term _ op:('&&' / '||') _ b:boolean_expression {
        return [op, a, b];
    }

boolean_term =
    v:('true' / 'false') {
        return v === 'true';
    } /
    a:number_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:number_expression {
        return [op, a, b];
    } /
    a:string_expression _ op:('<' / '<=' / '>' / '>=' / '==' / '!=') _ b:string_expression {
        return [op, a, b];
    } /
    '(' _ e:boolean_expression _ ')' {
        return e;
    }

string_expression =
    string_term /
    a:string_term _ op:[+] _ b:string_expression {
        return [op, a, b];
    }

string_term =
    "'" chars:[^']* "'" {
        return chars.join('');
    } /
    '(' _ e:string_expression _ ')' {
        return e;
    }

number_expression =
    number_term /
    a:number_term _ op:[+-] _ b:number_expression {
        return [op, a, b];
    }

number_term =
    number_factor /
    a:number_factor _ op:[*/] _ b:number_term {
        return [op, a, b];
    }

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
    }

_ =
    [ \t\n]*
