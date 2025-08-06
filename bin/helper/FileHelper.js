import fs from 'fs';
import colors from 'yoctocolors';
import { sleepFor } from '../util/time.js';


export class FileHelper {

    static rootFiles = [
        '@still', 'app', 'config', 'index.html'
    ];

    static rootFilesForLone = [
        'app', 'config', 'config/route.map.js'
    ];

    static loneProjectExists() {
        const routeFile = FileHelper.rootFilesForLone.slice(-1)[0];
        const isValidProject = fs.existsSync(`${process.env.PWD}/${routeFile}`);
        const totalFilesWithNoRouteFile = FileHelper.rootFilesForLone.length - 1;
        
        return FileHelper.rootFilesForLone.slice(0,2).filter(r => fs.existsSync(`${process.env.PWD}/${r}`)).length
            === totalFilesWithNoRouteFile && isValidProject;
    }

    static stillProjectExists() {
        return FileHelper.rootFiles.filter(r => fs.existsSync(`${process.env.PWD}/${r}`)).length
            === FileHelper.rootFiles.length
    }

    static wasRootFolderReached(actualDir, forLoneCmp = false, noFileOperation = false) {

        let wrongProjectType = false, foundLone = false;
        const rootFolderStat = forLoneCmp
            ? FileHelper.rootFilesForLone.slice(0,2)
            : FileHelper.rootFiles;

        const files = fs.readdirSync(actualDir);        

        let counter = 0, wrongCounter = 0;
        for (const file of files) {
            if (rootFolderStat.includes(file)) counter++;
        }

        for (const file of files) {
            if (FileHelper.rootFiles.includes(file)) wrongCounter++;
        }

        if (noFileOperation)
            foundLone = (counter == FileHelper.rootFilesForLone.length - 1);
        if (FileHelper.loneProjectExists()) foundLone = true;

        const totalMatch = FileHelper.rootFiles.length == wrongCounter;
        if (forLoneCmp && totalMatch) wrongProjectType = true;
        if (!forLoneCmp && !totalMatch) wrongProjectType = true;

        return {
            flag: (counter == rootFolderStat.length) || foundLone,
            actualDir, wrongProjectType
        };
    }

    static async parseDirTree(cmpPath, cmpName) {

        let folder, dirPath, createdFolder;

        if (cmpPath != '') {
            folder = cmpPath.shift();
            dirPath = `${folder ? folder : ''}`;
        }

        while (folder) {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
                createdFolder = true;
            };

            folder = cmpPath.shift();
            if (folder) dirPath = `${dirPath}/${folder}`;
            await sleepFor(200);
        }

        const fileName = String(cmpName[0]).toUpperCase() + String(cmpName.slice(1));
        return { dirPath, fileName, createdFolder }

    }

    static componentTemplate = (cmpName, superClsPath) =>
        superClsPath
        + 'export class ' + cmpName + ' extends ViewComponent {\n'
        + '\n'
        + '\tisPublic = true;'
        + '\n'
        + '\ttemplate = `\n'
        + '\t\t<h1 class="still-fresh-generated-cmp">\n'
        + '\t\t\t' + cmpName + '  auto generated content\n'
        + '\t\t</h1>'
        + '\n\t`;\n'
        + '}';


    static componentModel(cmpName, importPath, isLone) {
        let superClsPath = '';
        if (!isLone) {
            superClsPath = `"${importPath}/@still/component/super/ViewComponent.js";`.replace(/\/\//g,'/');
            superClsPath = `import { ViewComponent } from ${superClsPath}\n\n`;
        }
        return FileHelper.componentTemplate(cmpName, superClsPath);
    }

    static createComponentFile(cmpName, rootFolder, dirPath, fileName, isLone) {
        if (FileHelper.stillProjectExists()) rootFolder = '../' + rootFolder;
        const cmpContent = FileHelper.componentModel(cmpName, rootFolder, isLone);
        const isValidDir = dirPath != '' && dirPath != undefined;
        const cmpDirPath = isValidDir ? dirPath : '';
        const cmpFullPath = `${isValidDir ? cmpDirPath + '/' : ''}${fileName}.js`;

        fs.writeFileSync(`${cmpFullPath}`, cmpContent);
        return cmpFullPath;
    }

    static isItRootFolder(spinner, cmdObj, showLog = true, forLone = false) {

        const { flag, actualDir } = FileHelper.wasRootFolderReached(process.cwd(), forLone);
        if (flag) {
            if (showLog)
                FileHelper.wrongFolderCmpCreationError(spinner, cmdObj);
            return { flag, actualDir };
        }
        return { flag, actualDir };
    }

    static setLoneHomeCmpContent = () =>
        + ''
        + 'export class HomeComponent extends ViewComponent {\n\n'
        + '\tisPublic = true;'
        + '\n\n'
        + '\ttemplate = `\n'
        + '\t\t<div class="itWorked still-worked-home-container">\n'
        + '\t\t\t<h1><u>Still.js Microfrontend Project</u></h1>\n'
        + '\t\t\t<h2 class="still-fw-before-logo">Still.js Framework</h2>\n'
        + '\t\t\t<h1>It Worked</h1>\n'
        + '\t\t\t<p class="still-home-orientation-text">\n'
        + '\t\t\t\tThis is the HomeComponent, go to \n'
        + '\t\t\t\t<b>app/home/HomeComponent&#46;js</b> path<br>\n'
        + '\t\t\t\tand do you adjustments accordingly\n'
        + '\t\t\t</p>\n'
        + '\t\t</div>\n'
        + '\t`;'
        + '\n}';
    

    static wrongFolderCmpCreationError(spinner, cmdObj, forLone = false) {

        let cmd = colors.bold(colors.green('npx still create component'));
        let cmd1 = colors.bold(colors.green('npx still c cp'));

        let cmdTxt = '\n\t- example1: ' + cmd + ' app/path-to/MyComponent'
            + '\n\t- example2: ' + cmd1 + ' app/path-to/MyComponent';
        if (forLone)
            cmdTxt = '\n\t- example1: ' + cmd + ' app/path-to/MyComponent --lone'
                + '\n\t- example2: ' + cmd1 + ' app/path-to/MyComponent --lone';

        spinner.error(`Failed to create new component`);
        cmdObj.cmdMessage(
            '\n  You\'re creating component from project root folder, you ' + colors.bold(colors.red('cannot')) + ' do it'
            + '\n  without specifying the app/ or ./app/ path as the bellow example:\n'
            + cmdTxt
            + '\n\n  Alternatively you can do ' + colors.bold(colors.green('cd app/')) + ' and then create your component from there'
            + '\n  since this is the root of the app'
        );
        cmdObj.newCmdLine();

    }

    static noStillProjectFolderError(spinner, cmdObj) {

        cmdObj.cmdMessage('\n')
        spinner.error(colors.bold(colors.red('Failed to create new component')));
        cmdObj.cmdMessage(
            '\n  You\'re not inside a Still.js project folder, please follow bellow instructions:'
            + '\n\n\t- navigate to you project folder and run ' + colors.bold(colors.green('npx still create component'))
            + ' app/path-to/MyComponent again '
            + '\n\n\t-  or create a new projec typing ' + colors.bold(colors.green('npx still create project project-name'))
        );
        cmdObj.newCmdLine();

    }

    static noLoneProjectFolderError(spinner, cmdObj) {

        cmdObj.cmdMessage('\n')
        spinner.error(colors.bold(colors.red('Failed to create new component')));
        cmdObj.cmdMessage(
            '\n  You\'re not inside a Lone folder structure:'
            + '\n\n\t- please init your lone project by running ' + colors.bold(colors.green('npx still lone'))
            + '\n\n\t-  and then inside the folder structure create a new component typing ' + colors.bold(colors.green('npx still create component app/path-to/MyComponent'))
        );
        cmdObj.newCmdLine();
    }

    static readFile = (path) => fs.readFileSync(path,{ encoding: 'utf-8' });

    static getConfig = (configPath,  path, spinner = null, cmdObj = null) => {
        const route = 'route.map.js', config = 'settings/default.json';
        const newPath = path.replace(route,config);
        const fileContent = JSON.parse(FileHelper.readFile(newPath));
        global.fileContent = fileContent;

        const svcPath = eval(`fileContent.${configPath}`);
        if(svcPath === undefined) {
            cmdObj.newCmdLine();
            spinner.error(colors.bold(colors.red(`config path (${configPath}) does not exists`)));
        }
        else{
            const config = 'config/route.map.js'; 
            const servicesFldr = path.replace(config,`app/${svcPath}`);
            return FileHelper.readDirTree(servicesFldr);   
        }
        
    }

    static backendFiles = [];
    static readDirTree(dirPath){
        if (fs.existsSync(dirPath)) {
            const result = fs.readdirSync(dirPath);
            for(const file of result){
                if(file.endsWith('.js')){
                    FileHelper.backendFiles.push(dirPath+file);
                }else{
                    FileHelper.readDirTree(dirPath+file+'/');
                }
            }
        };
        return FileHelper.backendFiles;
    }

    static readServiceFile(filePath){
        const service = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return service; 
    }


}