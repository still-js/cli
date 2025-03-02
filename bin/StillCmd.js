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
            /** Install StillJS dependency */
            .option('-i, --install <pkgname>', 'Install new dependency from NPM repository compatible with StillFramework\n')
            /** Create new Still Project */
            .option(
                '-c, --create <name...>',
                'Create a new Project or Component as bellow examples:\n'
                + '- example1: ' + colors.bold(colors.green('still -c pg myProj')) + ' create a project named myProj\n'
                + '- example2: ' + colors.bold(colors.green('still -c cp MenuComponent')) + ' create a ne component with name MenuComponent \n'
                + '\n'
            )
            .option(
                '-r, --routes <action>',
                'Display all existing routes\n'
                + '- example: ' + colors.bold(colors.green('still -r list')) + '\n'
            );

        this.program.parse(process.argv);
        const opts = this.program.opts();

        (async () => await this.cmd(opts))();
    }

    /** @param { { create, install, routes } } opts */
    async cmd(opts) {

        if (opts.create) await this.create(opts);

        else if (opts.install) await this.install(opts);

        else if (opts.routes) await this.listRoutes(opts);

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

        this.newCmdLine();
        this.cmdMessage(`New project (${colors.bold(opts.create[0])}) creation initiated:`);
        const spinner = yocto({ text: 'Downloading StillJS from @stilljs/core' });

        const projectName = opts.create[1];
        const result = await helper.createNewStillProject(this, spinner, projectName);
        if (result) {

            spinner.success(`Project ${colors.bold(opts.create[1])} created`);
            this.newCmdLine();
            const unwrapSpinner = yocto({ text: 'Unwrapping root folder' });

            try {
                helper.unwrapStillJSFolder(projectName);
                unwrapSpinner.success(`Process creation ran successfully`)
            } catch (error) {
                unwrapSpinner.error(`Error on unwrapping ${colors.bold(opts.create[1])} project`);
            }

            this.cmdMessage(`\t- type ${colors.bold(colors.green(`cd ${opts.create[1]}`))}  to enter project folder`);
            this.cmdMessage(`\t  and then type ${colors.bold(colors.green('npm run dev'))}  to open in the browser`);
            this.newCmdLine();

        }

        if (!result)
            spinner.error(`Failed to create ${colors.bold(opts.create[1])} project`);
    }

    async createNewComponent(opts) {


        StillCmd.stillProjectRootDir = [];
        this.newCmdLine();
        const spinner = yocto({ text: `Creating new component ${opts.create[1]}` }).start();

        if (FileHelper.isItRootFolder(spinner, this)) return;

        let cmpName = opts.create[1];
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

    async listRoutes(opts) {

        const cmdArgs = String(opts.routes);
        let isListRoutes = cmdArgs.indexOf('list') == 0;
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

}