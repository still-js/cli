import { Command, program } from 'commander';
import fs from 'fs';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';
import { FileHelper } from './helper/FileHelper.js';
import { FrameworkHelper } from './helper/FrameworkHelper.js';
import { RouterHelper } from './helper/RouterHelper.js';

export class StillCmd {

    /** @type { Command } */ program;
    static stillProjectRootDir = [];
    static createTypeOptions = {
        'COMPONENT': 'COMPONENT',
        'PROJECT': 'PROJECT',
    }
    filePathTracker = [];

    constructor() {

        this.program = program;
        this.program.version('0.1');

        this.program
            .command('init')
            .description(
                'Start a project in the current folder as the\n'
                + '- example: ' + colors.bold(colors.green('still init')) + ' starts still project in the current folder\n'
            );

        this.program
            .command('lone')
            .description(
                'Setup a project in the current folder:\n'
                + '- example: ' + colors.bold(colors.green('still lone')) + ' setup lone project in the current folder \n'
            );

        this.program
            .command('serve')
            .description('Run the project and open to in the default browser\n');

        this.program
            .command('create <type> <name> [args...]')
            .option('--lone', 'instruction for Lone Component generation')
            .description(
                'Create a Component as the bellow examples:\n'
                + '- example1: ' + colors.bold(colors.green('still create cp LeftMenu')) + ' create a new component with name LeftMenu \n'
                + '- example2: ' + colors.bold(colors.green('still create cp LeftMenu --lone')) + ' create a new component with name LeftMenu for within Lone project \n'
            );

        this.program
            .command('c <type> <name>')
            .option('--lone', 'instruction for Lone Component generation')
            .description('Alias for create, produces the same result:\n');

        this.program
            .command('install <arguments...>')
            .description(
                'Install new library form NPM:\n'
                + '- example1: ' + colors.bold(colors.green('still install @stilljs/tabulator')) + ' install StillJS tabulator grid component\n'
            );


        this.program
            .command('route <action>')
            .description(
                'Display all existing routes\n'
                + '- example1: ' + colors.bold(colors.green('still route list')) + '\n'
                + '- example2: ' + colors.bold(colors.green('still route l')) + '\n'
            );

        this.program
            .command('r <action>')
            .description('Alias to route, produces the same result\n');

        this.program
            .command('app <action>')
            .description(
                'Allow to prosecute operation on top of the application\n'
                + '- example: ' + colors.bold(colors.green('still app serve'))
                + ' opens the app in the browser in the default port of 8181\n'
            );

        this.program
            .command('A <action>')
            .description(
                'Alias for app, produces the same result:\n'
            );

        this.program.parse(process.argv);
        const opts = this.parseCmdType();

        (async () => await this.cmd(opts))();
    }

    /** @param { { create, install, routes } } opts */
    async cmd(opts) {

        if (opts.create) await this.create(opts);

        else if (opts.install) await this.install(opts);

        else if (opts.route) await this.listRoutes(opts);

        else if (opts.app) await this.runAppOperation(opts);

        else this.showGenericHelp();

    }

    async create(opts) {

        const { COMPONENT, PROJECT } = StillCmd.createTypeOptions;
        const cmdArgs = String(opts.create);

        const isCreateComp = this.checkCreateOption(COMPONENT, cmdArgs)
        if (isCreateComp) return await this.createComponent(opts)

        const isCreateProj = this.checkCreateOption(PROJECT, cmdArgs);
        if (isCreateProj) return await this.createNewProject(opts);

    }

    async createNewProject(opts) {

        const helper = FrameworkHelper, isLone = opts.isLone, isInit = opts.isInit;

        let projectName = opts.isLone ? 'lone' : opts.name;
        if (opts.isInit) projectName = 'still_tmp';

        this.newCmdLine();
        const projName = (isLone || isInit) ? ' ' : ` (${colors.bold(projectName)}) `;
        this.cmdMessage(`New project${projName}creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS from @stilljs/core' });

        const result = await helper.createNewStillProject(this, spinner, projectName, isLone, isInit);
        if (result.result !== false) {

            spinner.success(`Project${projName}created`);
            this.newCmdLine();
            const unwrapSpinner = yocto({ text: 'Unwrapping root folder' });

            try {
                helper.unwrapStillJSFolder(projectName, isLone, isInit);
                unwrapSpinner.success(`Process creation ran successfully`)
            } catch (error) {
                unwrapSpinner.error(`Error on unwrapping${projName}project`);
            }

            if (isLone || isInit) {
                const loneDocLink = `https://still-js.github.io/stilljs-doc/installation-and-running-cdn/#cdn-basic-code-sample`;
                this.cmdMessage(`\t- You're all set, use still-cli to generate the your component`);
                if (isLone) {
                    this.cmdMessage(`\t  example: ${colors.bold(colors.green('npx still create component app/MyComponen --lone'))}`);
                    this.cmdMessage(`\t  and after creating it you can embed them, follow the example at the bellow link:`);
                    this.cmdMessage('\t\t' + colors.underline(loneDocLink));
                }
            } else {
                this.cmdMessage(`\t- type ${colors.bold(colors.green(`cd ${projectName}`))}  to enter project folder`);
                this.cmdMessage(`\t  and then type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            }
            this.newCmdLine();

        }

        if (result.result === false) {
            this.cmdMessage(colors.bgRed(`Failed to create${projName}project`));
            if (result.reason === 'overwriting') {
                this.cmdMessage(`\t- Seems like you're accidentally overriding an exsiting project because especific`);
                this.cmdMessage(`\t  files (e.g. ${colors.underline(colors.bold('app/'))} and ${colors.underline(colors.bold('route.map.js'))}) files are present in the current folder`);
            }
            this.newCmdLine();
        }
    }

    async createComponent(opts) {

        if (opts.isLone) {

            if (FileHelper.stillProjectExists()) {
                this.newCmdLine();
                this.cmdMessage(colors.red(`${colors.bold('Wrong Component creation instructions')}: `));
                this.cmdMessage(
                    `\tYou're inside a regular ${colors.bold('Still')} project, you cannot use --lone parameter\n`
                );
                this.newCmdLine();
                return;
            }
            this.createLoneComponent(opts);
        }
        else {
            if (FileHelper.loneProjectExists() && !FileHelper.stillProjectExists()) {
                this.newCmdLine();
                this.cmdMessage(colors.red(`${colors.bold('Wrong Component creation instructions')}: `));
                this.cmdMessage(
                    `\tYou're inside a Still ${colors.bold('Lone/CDN')} based project, you need to use --lone parameter as the examples:\n`
                    + '\texample1: ' + colors.bold(colors.green('npx still create component path-to/MyComponent --lone'))
                    + '\n\texample2: ' + colors.bold(colors.green('npx still c cp path-to/MyComponent --lone'))
                );
                this.newCmdLine();
                return;
            }
            this.createNewComponent(opts)
        };
    }

    async createNewComponent(opts) {

        StillCmd.stillProjectRootDir = [];
        this.newCmdLine();
        const spinner = yocto({ text: `Creating new component ${opts.name}` }).start();
        const isRootFolder = FileHelper.isItRootFolder(spinner, this, false).flag;

        let cmpName = opts.name.startsWith('./') ? opts.name.replace('./', '') : opts.name;
        let cmpPath = cmpName.split('/');
        cmpName = cmpPath.at(-1), cmpPath.pop();

        if (isRootFolder && cmpPath[0] != 'app' && !opts.isLone)
            return FileHelper.wrongFolderCmpCreationError(spinner, this);

        const fileMetadata = { cmpPath, cmpName, isLone: opts.isLone };
        this.cmdMessage(`\n  Component will be created at ${cmpPath != '' ? cmpPath.join('/') : './'}/`);

        await this.getRootDirThenRunCallback(fileMetadata, spinner, null,

            async ({ cmpPath, cmpName, routeFile, filePath }, spinnerObj) => {

                const doesCmpExists = RouterHelper.checkIfRouteExists(routeFile, cmpName);
                if (doesCmpExists) {
                    this.newCmdLine();
                    spinnerObj.error(colors.red(`${colors.bold('Component name conflict error')}: `));
                    this.cmdMessage(
                        colors.bgRed(`\t Component with name ${colors.bold(cmpName)} already exists, please choose another name to avoid conflict`)
                    );
                    this.newCmdLine();
                    return;
                }

                const rootFolder = StillCmd.stillProjectRootDir.join('/');
                const {
                    dirPath,
                    fileName
                } = await FileHelper.parseDirTree(cmpPath, cmpName);

                try {

                    const cmpFullPath = `${filePath}/${cmpName}.js`;
                    FileHelper.createComponentFile(
                        cmpName, rootFolder, dirPath, fileName
                    );

                    spinnerObj.success(`Component ${cmpFullPath} created successfully`);

                    const routeSpinner = yocto({ text: `Creating the route` }).start();
                    const addRoute = RouterHelper.updateProjectRoutes(routeFile, cmpName, cmpFullPath, filePath);
                    if (addRoute)
                        routeSpinner.success(`New route added with path ${cmpFullPath}`);
                    else {
                        routeSpinner.error(`
                            Failed to a route for ${cmpName}, 
                            you can anyway add it manually in the route.map.js file
                        `);
                    }

                    this.newCmdLine();

                } catch (error) {

                    spinnerObj.error('Erro on creating component: ' + fileName);
                    this.cmdMessage(error.message);
                    this.newCmdLine();

                }

            });

    }

    async createLoneComponent(opts) {

        StillCmd.stillProjectRootDir = [];
        this.newCmdLine();
        const spinner = yocto({ text: `Creating new component ${opts.name}` }).start();
        const isRootFolder = FileHelper.isItRootFolder(spinner, this, false, true).flag;

        let cmpName = opts.name.startsWith('./') ? opts.name.replace('./', '') : opts.name;
        let cmpPath = cmpName.split('/');
        cmpName = cmpPath.at(-1), cmpPath.pop();

        if (isRootFolder && cmpPath[0] != 'app' && opts.isLone)
            return FileHelper.wrongFolderCmpCreationError(spinner, this, opts.isLone);

        const fileMetadata = { cmpPath, cmpName, isLone: opts.isLone, isRootFolder };
        this.cmdMessage(`\n  Component will be created at ${cmpPath != '' ? cmpPath.join('/') + '/' : './'}`);

        await this.getRootDirThenRunCallback(fileMetadata, spinner, null,

            async ({ cmpPath, cmpName, routeFile, filePath }, spinnerObj) => {

                const doesCmpExists = RouterHelper.checkIfRouteExists(routeFile, cmpName);
                if (doesCmpExists) {
                    spinnerObj.error(`Component with name ${cmpName} already exists, please choose another name to avoid conflict`);
                    return;
                }

                const rootFolder = StillCmd.stillProjectRootDir.join('/');
                const {
                    dirPath,
                    fileName
                } = await FileHelper.parseDirTree(cmpPath, cmpName);

                try {

                    const cmpFullPath = `${filePath}/${cmpName}.js`;
                    FileHelper.createComponentFile(
                        cmpName, rootFolder, dirPath, fileName, opts.isLone
                    );

                    spinnerObj.success(`Component ${cmpFullPath} created successfully`);
                    const routeSpinner = yocto({ text: `Creating the route` }).start();
                    const addRoute = RouterHelper.updateProjectRoutes(routeFile, cmpName, cmpFullPath, filePath);
                    if (addRoute) routeSpinner.success(`New route added with path ${cmpFullPath}`);
                    else {
                        routeSpinner.error(`
                            Failed to a route for ${cmpName}, 
                            you can anyway add it manually in the route.map.js file
                        `);
                    }
                    this.newCmdLine();

                } catch (error) {

                    spinnerObj.error('Erro on creating component: ' + fileName);
                    this.cmdMessage(error.message);
                    this.newCmdLine();

                }

            });
    }

    async install(opts) {

        const pkgName = opts.pkg, helper = FrameworkHelper;
        const spinner = yocto({ text: `Setting up ${pkgName} instalation process` }).start();
        const { flag } = FileHelper.isItRootFolder(spinner, this, false);

        this.newCmdLine();
        this.cmdMessage(`Starting instalation for (${colors.bold(pkgName)}):`);

        const result = await helper.runInstallStillPkg(
            opts.arguments, null, !flag, { spinner, cmdObj: this }
        );
        if (result) {

            spinner.success(`Package ${colors.bold(pkgName)} installed`);
            this.newCmdLine();
            const unwrapSpinner = yocto({ text: `Unwrapping ${colors.bold(pkgName)}` });

            try {
                helper.unwrapInstalledPkg();
                unwrapSpinner.success(`Installation process finished successfully`)
            } catch (error) {
                unwrapSpinner.error(`Error on unwrapping ${colors.bold(pkgName)} package`);
            }
            this.newCmdLine();

        }

        if (!result)
            spinner.error(`Failed to create ${colors.bold(pkgName)} project`);
    }

    showGenericHelp() {
        this.newCmdLine();
        this.cmdMessage(`Type still -h/--help to know what options are provided`);
        this.newCmdLine();
    }

    checkCreateOption(type, cmdArgs) {

        if (type == StillCmd.createTypeOptions.COMPONENT) {
            return (
                cmdArgs.indexOf('cp') == 0
                || cmdArgs.indexOf('component') == 0
            )
        }

        if (type == StillCmd.createTypeOptions.PROJECT) {
            return (
                cmdArgs.indexOf('pj') == 0
                || cmdArgs.indexOf('project') == 0
            )
        }
    }

    /**
     *  @param {{ cmpPath, cmpName, routeFile, isLone }, spinnerObj} cb 
     */
    async getRootDirThenRunCallback(fileMetadata, spinner, dir, cb, callNum = 0, countFolderBack = 0) {

        let enteredPath = fileMetadata?.cmpPath?.length ? fileMetadata.cmpPath.join('/') : '';
        let actualDir = dir || (`${process.cwd()}/${enteredPath}`);

        if (actualDir.endsWith('/..')) {
            countFolderBack++;
            const sliceIdx = eval(`-${countFolderBack}`);
            const currPath = actualDir.split('/').slice(0, sliceIdx).slice(sliceIdx)[0];
            this.filePathTracker.push(currPath);
        }


        if (callNum == 10 && fileMetadata.isLone)
            return FileHelper.noLoneProjectFolderError(spinner, this);

        if (fileMetadata?.isRootFolder && fileMetadata?.isLone)
            return await cb({ ...fileMetadata, routeFile: `${process.env.PWD}/route.map.js` }, spinner);

        if (callNum == 10)
            return FileHelper.noStillProjectFolderError(spinner, this);

        if (!fs.existsSync(actualDir + '/')) {

            const newDirPath = actualDir.split('/');

            const dirName = newDirPath.pop();
            this.filePathTracker.push(dirName);
            actualDir = newDirPath.join('/');
            StillCmd.stillProjectRootDir.push('..');

            this.getRootDirThenRunCallback(fileMetadata, spinner, `${actualDir}`, cb, (callNum + 1), countFolderBack);
            return;
        }

        spinner.text = 'Serching project root folder';
        if (FileHelper.wasRootFolderReached(actualDir, fileMetadata?.isLone).flag) {
            const filePath = this.filePathTracker.reverse().join('/')
            this.cmdMessage(` -- Validated Still.js project folder`);
            yocto().start().success(`Found project root folder`);
            fileMetadata = { ...fileMetadata, filePath }
            await cb({ ...fileMetadata, routeFile: `${actualDir}/route.map.js` }, spinner);
        } else {
            StillCmd.stillProjectRootDir.push('..');
            await this.getRootDirThenRunCallback(fileMetadata, spinner, `${actualDir}/..`, cb, (callNum + 1), countFolderBack);
            return;
        }

    }

    async runLoneCmpCreation(cb = () => { }, params, spinner) {
        await cb({ ...params }, spinner)
    }

    async runAppOperation(opts) {

        const spinner = yocto();
        if (opts.action == 'serve') {

            spinner.text = `Startin the server`;
            spinner.start();
            StillCmd.silentConsoleLog = true;
            await this.getRootDirThenRunCallback(null, spinner, null,
                async ({ routeFile }) => FrameworkHelper.openApp(routeFile)
            );
            spinner.stop();
            StillCmd.silentConsoleLog = false;

        } else {
            this.newCmdLine();
            this.cmdMessage(`Invalid command argument ${colors.bgRed(` ${opts.action} `)}`);
            this.newCmdLine();
            spinner.start().error(`Failed to start the server`);
            this.newCmdLine();
        }

    }

    async listRoutes(opts) {

        let isListRoutes = opts.action == 'list' || opts.action == 'l';
        this.newCmdLine();
        const spinner = yocto({ text: 'Searching and parsing routes...' }).start();
        this.newCmdLine();
        StillCmd.silentConsoleLog = true;

        if (isListRoutes) {
            await this.getRootDirThenRunCallback(null, spinner, null,
                async ({ routeFile }, spinnerInstance) => {
                    await RouterHelper.listRoutes(routeFile);
                }
            );
        }

        StillCmd.silentConsoleLog = false;
        this.newCmdLine();
        spinner.success(`Routes listed successfully`);
        this.newCmdLine();

    }

    static silentConsoleLog = false;
    newCmdLine() {
        if (!StillCmd.silentConsoleLog) console.log(`\n`);
    }

    cmdMessage(msg) {
        if (!StillCmd.silentConsoleLog) console.log(`${msg}`);
    }

    parseCmdType() {

        let opts;
        const command = process.argv.slice(2);

        const createOpts = ['init', 'lone', 'create', 'c']
        if (createOpts.includes(command[0])) {
            opts = {
                'create': createOpts.slice(0, 2).includes(command[0]) ? 'pj' : command[1],
                name: command[0] == 'init' ? process.env.PWD : command[2],
                isLone: command[3] == '--lone' || command[0] == 'lone',
                isInit: command[0] == 'init'
            };
        }

        if (command[0] == 'route' || command[0] == 'r')
            opts = { 'route': command[0], action: command[1] };

        if (command[0] == 'app' || command[0] == 'A' || command[0] == 'serve') {
            const action = command[0] == 'serve' ? command[0] : command[1];
            const app = command[0] == 'serve' ? 'app' : command[0];
            opts = { app, action };
        }

        if (command[0] == 'install' || command[0] == 'i') {
            opts = {
                'install': command[0],
                arguments: command.slice(1).join(' '),
                pkg: command[1]
            };
        }

        return opts;
    }

}