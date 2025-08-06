import { exec, execSync, spawn } from 'child_process';
import { cpSync, rmSync, writeFileSync } from 'fs';
import { platform } from 'os';
import colors from 'yoctocolors';
import { StillCmd } from '../StillCmd.js';
import { FileHelper } from './FileHelper.js';

export class FrameworkHelper {

    /** 
     * @type { StillCmd } cmdInstance 
     * */
    static cmdInstance;

    /** 
     * @param { StillCmd } cmdInstance 
     * */
    static async createNewStillProject(cmdInstance, spinnerInstance, projectName, isLone = false, isInit = false) {

        if (isLone || isInit) {
            if (FileHelper.loneProjectExists() || FileHelper.stillProjectExists())
                return { result: false, reason: 'overwriting' };

        }

        FrameworkHelper.cmdInstance = cmdInstance;
        spinnerInstance.start();
        const result = await FrameworkHelper.runInstallStillPkg('@stilljs/core', projectName, null, { isLone });
        return { result };
    }

    static async runInstallStillPkg(
        pkg,
        projectName = null,
        noFromOutside = null,
        { cmdObj = null, spinner, isLone = null } = {}
    ) {

        projectName = isLone ? 'lone' : projectName;
        if (pkg == '@stilljs/core')
            await FrameworkHelper.initAProject(projectName, isLone);

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

                if(projectName !== null){

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

            }
        });


    }

    static async initAProject(projectName, forLone = false) {

        const obj = FrameworkHelper.cmdInstance;

        return new Promise((resolve) => {

            const projName = forLone ? `lone` : projectName
            exec(`mkdir ${projName}`, async (err, stdout, stderr) => {

                if (err) {
                    obj.cmdMessage(`Error on creating the folder ${projName}`)
                    resolve(false);
                    return;
                }

                try {

                    execSync(`cd ./${projName} && npm init -y`);
                    resolve(true);

                } catch (error) {
                    obj.cmdMessage(`Error on initiating the project: `, error);
                    resolve(false);
                }

            });

        });
    }

    static unwrapStillJSFolder(projectName, forLone, isInit) {

        try {

            if (isInit) {
                cpSync(`${projectName}/node_modules/@stilljs/core/`, `${projectName}/../`, { recursive: true });
                rmSync(`${projectName}/node_modules/`, { recursive: true });
                rmSync(`${projectName}`, { recursive: true });
                rmSync(`jsconfig.json`);
                rmSync(`README.md`);
            } else {
                cpSync(`${projectName}/node_modules/@stilljs/core/`, `${projectName}/../`, { recursive: true });
                rmSync(`${projectName}/node_modules/`, { recursive: true });
            }
            if (forLone) {

                writeFileSync(`${projectName}/../app/home/HomeComponent.js`,FileHelper.setLoneHomeCmpContent().replace(0,''),'utf-8');
                rmSync(`${projectName}/../@still/`, { recursive: true });
                rmSync(`${projectName}/../index.html`, { recursive: true });
                rmSync(`${projectName}/../package.json`, { recursive: true });
                rmSync(`${projectName}/../jsconfig.json`, { recursive: true });
                rmSync(`${projectName}/../README.md`, { recursive: true });
                rmSync(`${projectName}/../config/app-setup.js`, { recursive: true });
                rmSync(`${projectName}/../config/app-template.js`, { recursive: true });

                try {
                    rmSync(`${projectName}/`, { recursive: true });
                } catch (error) {}
                
            }
            return true;
        } catch (error) {
            return false;
        }

    }


    static unwrapInstalledPkg() {

        try {

            cpSync(`node_modules/@stilljs/`, `@still/vendors/`, { recursive: true });
            rmSync(`node_modules`, { recursive: true });
            return true;

        } catch (error) {
            return false;
        }


    }

    static isWindows() {
        return platform() == 'win32';
    }

    static openApp(rootPath) {

        rootPath = rootPath.replace('route.map.js', '').replace('app//', 'app/').replace('/config','');
        if (rootPath.slice(-2) == '//') rootPath = rootPath.slice(0, -1) + './';
        
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