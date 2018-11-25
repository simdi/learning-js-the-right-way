const fs = require('fs');
module.exports = {
    help() {
        console.log('Learning JavaScript the right way');
        console.log('');
        console.log('--help');
        console.log('');
        console.log('Usage                      Prints out');
        console.log('Usage                      Hello {Name}');
    },
    readFile(filename, opts) {
        if (opts) return fs.readFileSync(filename).toString();
        return fs.readFileSync(filename);
    },
    readFileAsync(filename, cb) {
        return fs.readFile(filename, cb);
    }
}