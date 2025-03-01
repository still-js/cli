import { spawn } from 'child_process';
import { Command, program } from 'commander';
import fs from 'fs';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';

export class StillCmd {

    /** @type { Command } */
    program;
    stillProjectRootDir = '';
    rootFiles = [
        '@still', 'app-setup.js', 'app-template.js', 'index.html', 'route.map.js'
    ];

    constructor() {

        //console.log(`Running from `, process.cwd());
        const files = fs.readdirSync(process.cwd());
        files.forEach(file => {
            console.log(`Curr file: `, file);
        })

        this.program = program;
        this.program.version('0.1');
        this.program
            /** Install StillJS dependency */
            .option('-i, --install <pkgname>', 'Install new dependency from NPM repository compatible with StillFramework\n')
            /** Create new Still Project */
            .option(
                '-c, --create <name...>',
                'Create a new Project or Component as bellow examples:\n'
                + '- example1: ' + colors.bold(colors.green('still -c pg myProj')) + ' create a project named myProj\n'
                + '- example2: ' + colors.bold(colors.green('still -c cp MenuComponent')) + ' create a ne component with name MenuComponent \n'
                + '\n'
            );

        this.program.parse(process.argv);
        const opts = this.program.opts();

        (async () => await this.cmd(opts))();
    }

    /** @param { { create, install } } opts */
    async cmd(opts) {

        if (opts.create) await this.create(opts);

        else if (opts.install) await this.install(opts);

        else this.showGenericHelp();

    }

    async create(opts) {

        const cmdArgs = String(opts.create);
        let isCreateComp = cmdArgs.indexOf('cp') == 0,
            isCreateProj;

        if (isCreateComp) return await this.createNewComponent(opts)

        isCreateProj = cmdArgs.indexOf('pj') == 0;
        if (isCreateProj) return this.createNewProject(opts);


    }

    createNewProject(opts) {

        console.log(``);
        console.log(`New project (${colors.bold(opts.create[0])}) creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS' });
        spinner.start();
        /**
         * Download logic go here
         */
        setTimeout(() => {

            spinner.stop();
            console.log(``);
            console.log(`\tProject ${opts.create[1]} created successfully`);
            spinner.success();
            console.log(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            console.log(``);

        }, 2000);

    }

    async createNewComponent(opts) {

        this.getRootDirAndParseCmpCreation(null, () => {

            /* while(true){
                return;
            } */
            const cmpName = opts.create[1];
            const fileName = String(cmpName[0]).toUpperCase() + String(cmpName.slice(1));
            const cmpContent = this.componentModel(fileName, this.stillProjectRootDir);

            const spinner = yocto({ text: `Creating new component ${fileName}` });
            spinner.start();

            try {
                fs.writeFileSync(`${fileName}.js`, cmpContent);
                console.log(`\nWill create new component for `, fileName);
                spinner.success();
            } catch (error) {
                spinner.error('Erro on creating component: ' + fileName);
            }

        });

    }

    install(opts) {

        const spinner = yocto({ text: 'Installing ' + (opts.install) + ' for Still framework' });
        spinner.start();
        setTimeout(() => {

            spinner.stop();
            console.log(``);
            console.log(`\t${opts.install} installed successfully`);
            spinner.success();
            //console.log(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            console.log(``);

        }, 2000);

        //this.runInstallStillPkg();
    }

    runInstallStillPkg(pkg) {

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

    componentModel(cmpName, importPath) {

        //@still/component/super/ViewComponent.js
        const superClsPath = `"${importPath}@still/component/super/ViewComponent.js";`;
        const template = 'import { ViewComponent } from ' + superClsPath
            + '\nexport class ' + cmpName + ' extends ViewComponent {\n'
            + '\n'
            + '\tconstructor(){\n'
            + '\t\tsuper();'
            + '\n'
            + '\t}\n'
            + '\n'
            + '\n'
            + '}';
        return template;

    }

    getRootDirAndParseCmpCreation(dir, cb, callNum = 0) {

        let counter = 0;
        const actualDir = dir || process.cwd();
        const files = fs.readdirSync(actualDir);
        for (const file of files) {
            if (this.rootFiles.includes(file)) counter++;
        }

        if (counter == this.rootFiles.length) {
            cb();
        } else {
            console.log(`Recursion call ${(callNum + 1)} for dir ${dir}`);
            this.stillProjectRootDir = `../${this.stillProjectRootDir}`;
            this.getRootDirAndParseCmpCreation(`${actualDir}/..`, cb, (callNum + 1));
        }

    }

}