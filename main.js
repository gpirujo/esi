require('fs').readFile('example.html', 'utf8', function(err, doc) {
    if (err) return console.log(err);
    require('./esi').run(doc);
});
