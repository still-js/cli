#!/usr/bin/env node

import { spawn } from 'child_process';
import { program } from 'commander';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';


function runStillInstall() {

    const iProcess = spawn('npm', ['i']);

    iProcess.stdout.setEncoding('utf8');
    iProcess.stderr.setEncoding('utf8');

    iProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    iProcess.stderr.on('data', (data) => {
        process.stdout.write(data);
    });

}

program

program.version('0.1');

program
    /** Install StillJS dependency */
    .option('-i, --install <value>', 'Install new dependency from NPM repository compatible with StillFramework')
    /** Create new Still Project */
    .option('-c, --create <projectname>', 'Create new StillJS project')

program.parse(process.argv);

const opts = program.opts();

if (opts.install) {

    console.log(`Installing `, opts.install);

} else if (opts.create) {

    console.log(``);
    console.log(`New project (${colors.bold(opts.create)}) creation initiated:`);
    const spinner = yocto({ text: 'Downloading StillJS' });
    spinner.start();
    setTimeout(() => {
        spinner.stop();
        console.log(``);
        console.log(`\tProject ${opts.create} created successfully`);
        spinner.success()
        console.log(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
        console.log(``);
    }, 2000);

} else {
    console.log(``);
    console.log(`Type still -h/--help to know what optionss are provided`);
    console.log(``);
}
