import { spawn } from 'child_process';
import { Command, program } from 'commander';
import fs from 'fs';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';

export class StillCmd {

    /** @type { Command } */
    program;
    static stillProjectRootDir = [];
    rootFiles = [
        '@still', 'app-setup.js', 'app-template.js', 'index.html', 'route.map.js'
    ];

    constructor() {

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

        this.newCmdLine();
        this.cmdMessage(`New project (${colors.bold(opts.create[0])}) creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS' });
        spinner.start();
        /**
         * Download logic go here
         */
        setTimeout(() => {

            spinner.stop();
            this.newCmdLine();
            this.cmdMessage(`\tProject ${opts.create[1]} created successfully`);
            spinner.success();
            this.cmdMessage(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            this.newCmdLine();

        }, 2000);

    }

    async createNewComponent(opts) {

        StillCmd.stillProjectRootDir = [];
        this.newCmdLine();
        const spinner = yocto({ text: `Creating new component ${opts.create[1]}` });
        spinner.start();

        let cmpName = opts.create[1];
        let cmpPath = cmpName.split('/');
        cmpName = cmpPath.at(-1), cmpPath.pop();

        const fileMetadata = { cmpPath, cmpName };
        this.cmdMessage(`\n  Component will be created at ${cmpPath != '' ? cmpPath.join('/') : './'}/`);

        await this.getRootDirAndParseCmpCreation(fileMetadata, spinner, null,

            async ({ cmpPath, cmpName }, spinnerObj) => {

                const rootFolder = StillCmd.stillProjectRootDir.join('/');
                let folder, dirPath;

                if (cmpPath != '') {
                    folder = cmpPath.shift();
                    dirPath = `${folder ? folder : ''}`;
                }

                while (folder) {

                    const folderExists = fs.existsSync(dirPath);
                    if (!folderExists) fs.mkdirSync(dirPath);

                    folder = cmpPath.shift();
                    if (folder) dirPath = `${dirPath}/${folder}`;
                    await this.sleepFor(200);
                }

                const fileName = String(cmpName[0]).toUpperCase() + String(cmpName.slice(1));
                const cmpContent = this.componentModel(fileName, rootFolder);

                try {

                    const isValidDir = dirPath != '' && dirPath != undefined;
                    const cmpDirPath = isValidDir ? dirPath : '';
                    const cmpFullPath = `${isValidDir ? cmpDirPath + '/' : ''}${fileName}.js`;

                    fs.writeFileSync(`${cmpFullPath}`, cmpContent);
                    spinnerObj.success(`Component ${cmpFullPath} created successfully`);
                    this.newCmdLine();

                } catch (error) {

                    spinnerObj.error('Erro on creating component: ' + fileName);
                    this.cmdMessage(error.message);
                    this.newCmdLine();

                }

            });

    }

    install(opts) {

        const spinner = yocto({ text: 'Installing ' + (opts.install) + ' for Still framework' });
        spinner.start();
        setTimeout(() => {

            spinner.stop();
            this.newCmdLine();
            this.cmdMessage(`\t${opts.install} installed successfully`);
            spinner.success();
            //console.log(`\t- type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            this.newCmdLine();

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
        this.newCmdLine();
        this.cmdMessage(`Type still -h/--help to know what optionss are provided`);
        this.newCmdLine();
    }

    componentTemplate = (cmpName, superClsPath) =>
        'import { ViewComponent } from ' + superClsPath
        + '\nexport class ' + cmpName + ' extends ViewComponent {\n'
        + '\n'
        + '\tconstructor(){\n'
        + '\t\tsuper();'
        + '\n'
        + '\t}\n'
        + '\n'
        + '\n'
        + '}';


    componentModel(cmpName, importPath) {
        const superClsPath = `"${importPath}/@still/component/super/ViewComponent.js";`;
        return this.componentTemplate(cmpName, superClsPath);
    }

    async getRootDirAndParseCmpCreation(fileMetadata, spinner, dir, cb, callNum = 0) {

        let counter = 0;
        let enteredPath = fileMetadata.cmpPath.length ? fileMetadata.cmpPath.join('/') : '';
        let actualDir = dir || (`${process.cwd()}/${enteredPath}`);
        if (!fs.existsSync(actualDir + '/')) {

            const newDirPath = actualDir.split('/');
            newDirPath.pop();
            actualDir = newDirPath.join('/');
            StillCmd.stillProjectRootDir.push('..');

            this.getRootDirAndParseCmpCreation(fileMetadata, spinner, `${actualDir}`, cb, (callNum + 1));
            return;
        }

        this.cmdMessage(`  Serching project root folder ${actualDir}`);
        const files = fs.readdirSync(actualDir);

        for (const file of files) {
            if (this.rootFiles.includes(file)) counter++;
        }

        if (counter == this.rootFiles.length) {
            this.cmdMessage(`  Found project root folder`);
            await cb(fileMetadata, spinner);
        } else {
            StillCmd.stillProjectRootDir.push('..');
            await this.getRootDirAndParseCmpCreation(fileMetadata, spinner, `${actualDir}/..`, cb, (callNum + 1));
            return;
        }

    }

    newCmdLine() {
        console.log(`\n`);
    }

    cmdMessage(msg) {
        console.log(`${msg}`);
    }

    async sleepFor(ms) {
        return new Promise(r => setTimeout(() => r(''), ms));
    }

}