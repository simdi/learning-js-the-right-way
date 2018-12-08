const minimist = require('minimist');
const Helper = require('./helpers/helper');

const args = minimist(process.argv.splice(2), { 'string': ['name', 'file'] });

if (args.help || !args.name || !args.file) {
    Helper.help();
    process.exit(1);
}

Helper.readFileAsync(args.file, (err, content) => {
    if(err) console.log('Err', err);
    else 
    return content.toString();
});