import { spawn } from 'child_process';
import { Command, program } from 'commander';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';

export class StillCmd {

    /** @type { Command } */
    program;

    constructor() {

        this.program = program;
        this.program.version('0.1');
        this.program
            /** Install StillJS dependency */
            .option('-i, --install <pkgname>', 'Install new dependency from NPM repository compatible with StillFramework')
            /** Create new Still Project */
            .option('-c, --create <projectname...>', 'Create new StillJS project');

        this.program.parse(process.argv);
        const opts = this.program.opts();

        this.cmd(opts);
    }

    /** @param { { create, install } } opts */
    cmd(opts) {

        if (opts.create) this.createNewProject(opts);

        else if (opts.create) this.installStillPkg(opts);

        else this.showGenericHelp();

    }

    createNewProject(opts) {

        const cmdArgs = String(opts.create);
        let isCreateComp = cmdArgs.indexOf('pg') == 0,
            isCreateProj;

        if (!isCreateComp) {
            isCreateProj = cmdArgs.indexOf('pj') == 0
        }


        console.log(``);
        console.log(`New project (${colors.bold(opts.create)}) creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS' });
        spinner.start();
        setTimeout(() => {

            spinner.stop();
            console.log(``);
            console.log(`\tProject ${opts.create} created successfully`);
            console.log(`\tProject created successfully: `, opts);
            spinner.success()
            console.log(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            console.log(``);
        }, 2000);

    }

    installStillPkg(opts) {
        console.log(`Installing `, opts.install);
        //this.runStillInstall();
    }

    runStillInstall(pkg) {

        const iProcess = spawn('npm', ['i', pkg]);

        iProcess.stdout.setEncoding('utf8');
        iProcess.stderr.setEncoding('utf8');

        iProcess.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        iProcess.stderr.on('data', (data) => {
            process.stdout.write(data);
        });

    }

    showGenericHelp() {
        console.log(``);
        console.log(`Type still -h/--help to know what optionss are provided`);
        console.log(``);
    }

}