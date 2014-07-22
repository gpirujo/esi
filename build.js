require('fs').readFile('grammar.pegjs', 'utf8', function(err, doc) {
    if (err) return console.log(err);
    process.stdout.write('module.exports = ' + require('pegjs').buildParser(doc, {
        'output': 'source'
    }));
});
