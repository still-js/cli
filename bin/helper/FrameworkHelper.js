import { exec, execSync, spawn } from 'child_process';
import { platform } from 'os';
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

    static async runInstallStillPkg(pkg, projectName) {

        if (pkg == '@stilljs/core')
            await FrameworkHelper.initAProject(projectName);

        return new Promise((resolve) => {

            let _global = '', enterFolderCmd = `cd ./${projectName}`;
            if (pkg == 'live-server') _global = '-g';

            const iProcess = spawn(
                `${enterFolderCmd} && npm i ${pkg} ${_global}`, [], { shell: true }
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

    static isWindows() {
        return platform() == 'win32';
    }


}