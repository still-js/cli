import { exec, execSync, spawn } from 'child_process';
import { platform } from 'os';
import colors from 'yoctocolors';
import { StillCmd } from '../StillCmd.js';

export class FrameworkHelper {

    /** 
     * @type { StillCmd } cmdInstance 
     * */
    static cmdInstance;

    /** 
     * @param { StillCmd } cmdInstance 
     * */
    static async createNewStillProject(cmdInstance, spinnerInstance, projectName) {

        FrameworkHelper.cmdInstance = cmdInstance;
        spinnerInstance.start();
        return await FrameworkHelper.runInstallStillPkg('@stilljs/core', projectName);
    }

    static async runInstallStillPkg(
        pkg,
        projectName = null,
        noFromOutside = null,
        { cmdObj = null, spinner } = {}
    ) {

        if (pkg == '@stilljs/core')
            await FrameworkHelper.initAProject(projectName);

        return new Promise((resolve) => {

            if (noFromOutside != null) {
                if (noFromOutside) {
                    spinner.error(`Failed to install package`);
                    cmdObj.cmdMessage(
                        '\n  Package installation ' + colors.bold(colors.red('cannot')) + ' needs to root in the root folder:\n\n'
                        + '\t- please change to the '
                        + colors.bold(colors.green('root folder'))
                        + '\n\t- Then you can install a package'
                    );
                    cmdObj.newCmdLine();
                    return resolve(false);
                }
            }

            if (!noFromOutside) {

                let _global = '';
                let enterFolderCmd = `cd ./${projectName}`

                if (pkg == 'live-server') _global = '-g';
                if (pkg != 'live-server' && pkg != '@stilljs/core')
                    enterFolderCmd = null;

                const complement = `${enterFolderCmd != null ? enterFolderCmd + ' && ' : ''}`;
                const iProcess = spawn(
                    `${complement} npm i ${pkg} ${_global}`, [], { shell: true }
                );

                iProcess.stdout.setEncoding('utf8');
                iProcess.stderr.setEncoding('utf8');

                iProcess.stdout.on('data', (data) => {
                    process.stdout.write(data);
                });

                iProcess.stderr.on('data', (data) => {
                    process.stdout.write(data);
                    resolve(false);
                });

                iProcess.stdout.on('end', (data) => {

                    if (pkg == '@stilljs/core')
                        FrameworkHelper.runInstallStillPkg('live-server');

                    resolve(true);

                });

            }
        });


    }

    static async initAProject(projectName) {

        const obj = FrameworkHelper.cmdInstance;

        return new Promise((resolve) => {

            exec(`mkdir ${projectName}`, async (err, stdout, stderr) => {

                if (err) {
                    obj.cmdMessage(`Error on creating the folder ${projectName}`)
                    resolve(false);
                    return;
                }

                try {

                    execSync(`cd ./${projectName} && npm init -y`);
                    resolve(true);

                } catch (error) {
                    obj.cmdMessage(`Error on initiating the project: `, error);
                    resolve(false);
                }

            });

        });
    }

    static unwrapStillJSFolder(projectName) {

        const moveToRootCmd = 'mv node_modules/@stilljs/core/* ./';
        const removePkgJson = `rm -rf ./${projectName}/package-lock.json`;
        const removeNodeMod = `rm -rf ./${projectName}/node_modules`;

        execSync(`cd ./${projectName} && ${moveToRootCmd}`);
        execSync(`${removeNodeMod} && ${removePkgJson}`);

    }


    static unwrapInstalledPkg() {

        const moveToRootCmd = 'mv node_modules/@stilljs/* @still/vendors/';
        const removePkgJson = `rm -rf ./package-lock.json`;
        const removeNodeMod = `rm -rf ./node_modules`;

        execSync(`${moveToRootCmd}`);
        execSync(`${removeNodeMod} && ${removePkgJson}`);

    }

    static isWindows() {
        return platform() == 'win32';
    }

    static openApp(rootPath) {

        rootPath = rootPath.replace('route.map.js', '').replace('app//', 'app/');
        const cmd = spawn(`npx live-server ${rootPath}`, [], { shell: true });

        cmd.stdout.setEncoding('utf8');
        cmd.stderr.setEncoding('utf8');

        cmd.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        cmd.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    }


}