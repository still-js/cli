import { Command, program } from 'commander';
import fs from 'fs';
import yocto from 'yocto-spinner';
import colors from 'yoctocolors';
import { FileHelper } from './helper/FileHelper.js';
import { FrameworkHelper } from './helper/FrameworkHelper.js';
import { RouterHelper } from './helper/RouterHelper.js';

export class StillCmd {

    /** @type { Command } */
    program;
    static stillProjectRootDir = [];
    static createTypeOptions = {
        'COMPONENT': 'COMPONENT',
        'PROJECT': 'PROJECT',
    }

    constructor() {

        this.program = program;
        this.program.version('0.1');
        this.program
            .command('create <type> <name>')
            .description(
                'Create a new Project or Component as bellow examples:\n'
                + '- example1: ' + colors.bold(colors.green('still create pg myProj')) + ' create a project named myProj\n'
                + '- example2: ' + colors.bold(colors.green('still create cp MenuComponent')) + ' create a ne component with name MenuComponent \n'

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
            .description(
                'Alias to route, produces the same result\n'
            );

        this.program
            .command('c <type> <name>')
            .description('Alias for create, produces the same result:\n');

        this.program
            .command('app <action>')
            .description(
                'Allow to prosecute operation on top of the application\n'
                + '- example: ' + colors.bold(colors.green('still app open'))
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

        let isCreateComp = this.checkCreateOption(COMPONENT, cmdArgs),
            isCreateProj;

        if (isCreateComp) return await this.createNewComponent(opts)

        isCreateProj = this.checkCreateOption(PROJECT, cmdArgs);
        if (isCreateProj) return await this.createNewProject(opts);

    }

    async createNewProject(opts) {

        const helper = FrameworkHelper;
        const projectName = opts.name;

        this.newCmdLine();
        this.cmdMessage(`New project (${colors.bold(projectName)}) creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS from @stilljs/core' });

        const result = await helper.createNewStillProject(this, spinner, projectName);
        if (result) {

            spinner.success(`Project ${colors.bold(projectName)} created`);
            this.newCmdLine();
            const unwrapSpinner = yocto({ text: 'Unwrapping root folder' });

            try {
                helper.unwrapStillJSFolder(projectName);
                unwrapSpinner.success(`Process creation ran successfully`)
            } catch (error) {
                unwrapSpinner.error(`Error on unwrapping ${colors.bold(projectName)} project`);
            }

            this.cmdMessage(`\t- type ${colors.bold(colors.green(`cd ${projectName}`))}  to enter project folder`);
            this.cmdMessage(`\t  and then type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            this.newCmdLine();

        }

        if (!result)
            spinner.error(`Failed to create ${colors.bold(projectName)} project`);
    }

    async createNewComponent(opts) {


        StillCmd.stillProjectRootDir = [];
        this.newCmdLine();
        const spinner = yocto({ text: `Creating new component ${opts.name}` }).start();

        if (FileHelper.isItRootFolder(spinner, this)) return;

        let cmpName = opts.name;
        let cmpPath = cmpName.split('/');
        cmpName = cmpPath.at(-1), cmpPath.pop();

        const fileMetadata = { cmpPath, cmpName };
        this.cmdMessage(`\n  Component will be created at ${cmpPath != '' ? cmpPath.join('/') : './'}/`);

        await this.getRootDirThenRunCallback(fileMetadata, spinner, null,

            async ({ cmpPath, cmpName, routeFile }, spinnerObj) => {

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

                    const cmpFullPath = FileHelper.createComponentFile(
                        cmpName, rootFolder, dirPath, fileName
                    );

                    spinnerObj.success(`Component ${cmpFullPath} created successfully`);

                    const routeSpinner = yocto({ text: `Creating the route` }).start();
                    const addRoute = RouterHelper.updateProjectRoutes(routeFile, cmpName, cmpFullPath);
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

    install(opts) {

        const spinner = yocto({ text: 'Installing ' + (opts.install) + ' for Still framework' });
        spinner.start();
        setTimeout(() => {

            spinner.stop();
            this.newCmdLine();
            this.cmdMessage(`\t${opts.install} installed successfully`);
            spinner.success();
            this.newCmdLine();

        }, 2000);
    }

    showGenericHelp() {
        this.newCmdLine();
        this.cmdMessage(`Type still -h/--help to know what optionss are provided`);
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
     *  @param {{ cmpPath, cmpName, routeFile }, spinnerObj} cb 
     */
    async getRootDirThenRunCallback(fileMetadata, spinner, dir, cb, callNum = 0) {

        let enteredPath = fileMetadata?.cmpPath?.length ? fileMetadata.cmpPath.join('/') : '';
        let actualDir = dir || (`${process.cwd()}/${enteredPath}`);
        if (!fs.existsSync(actualDir + '/')) {

            const newDirPath = actualDir.split('/');
            newDirPath.pop();
            actualDir = newDirPath.join('/');
            StillCmd.stillProjectRootDir.push('..');

            this.getRootDirThenRunCallback(fileMetadata, spinner, `${actualDir}`, cb, (callNum + 1));
            return;
        }

        this.cmdMessage(`  Serching project root folder ${actualDir}`);

        if (FileHelper.wasRootFolderReached(actualDir)) {
            this.cmdMessage(`  Found project root folder`);
            await cb({ ...fileMetadata, routeFile: `${actualDir}/route.map.js` }, spinner);
        } else {
            StillCmd.stillProjectRootDir.push('..');
            await this.getRootDirThenRunCallback(fileMetadata, spinner, `${actualDir}/..`, cb, (callNum + 1));
            return;
        }

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

        let isListRoutes = opts.action == 'list';
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
        if (!StillCmd.silentConsoleLog)
            console.log(`\n`);
    }

    cmdMessage(msg) {
        if (!StillCmd.silentConsoleLog)
            console.log(`${msg}`);
    }

    parseCmdType() {

        let opts;
        const command = process.argv.slice(2);

        if (command[0] == 'create' || command[0] == 'c')
            opts = { 'create': command[1], name: command[2] };

        if (command[0] == 'route' || command[0] == 'r')
            opts = { 'route': command[0], action: command[1] };

        if (command[0] == 'app' || command[0] == 'A')
            opts = { 'app': command[0], action: command[1] };

        return opts;
    }

}