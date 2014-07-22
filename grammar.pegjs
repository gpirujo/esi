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
        _ id:id '="' value:[^"]* '"' {
            return [id, value.join('')];
        }
    )* _? {
        var attributes = {};
        for (var i = 0; i < list.length; i++) {
            attributes[list[i][0]] = list[i][1];
        }
        return attributes;
    }

function =
    '$' id:id '(' args:[^)]* ')' {
        return [id, args.join('')];
    }

id =
    chars:[a-z_]+ {
        return chars.join('');
    }

_ =
    [ \t\n]+
