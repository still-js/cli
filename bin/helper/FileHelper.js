import fs from 'fs';
import colors from 'yoctocolors';
import { sleepFor } from '../util/time.js';


export class FileHelper {

    static rootFiles = [
        '@still', 'app-setup.js', 'app-template.js', 'index.html', 'route.map.js'
    ];

    static rootFilesForLone = [
        'app', 'route.map.js'
    ];

    static loneProjectExists() {
        return FileHelper.rootFilesForLone.filter(r => fs.existsSync(`${process.env.PWD}/${r}`)).length
            === FileHelper.rootFilesForLone.length
    }

    static stillProjectExists() {
        return FileHelper.rootFiles.filter(r => fs.existsSync(`${process.env.PWD}/${r}`)).length
            === FileHelper.rootFiles.length
    }

    static wasRootFolderReached(actualDir, forLoneCmp = false) {

        const rootFolderStat = forLoneCmp
            ? FileHelper.rootFilesForLone
            : FileHelper.rootFiles;

        const files = fs.readdirSync(actualDir);

        let counter = 0;
        for (const file of files) {
            if (rootFolderStat.includes(file)) counter++;
        }

        return {
            flag: counter == rootFolderStat.length,
            actualDir
        };
    }

    static async parseDirTree(cmpPath, cmpName) {

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
            await sleepFor(200);
        }

        const fileName = String(cmpName[0]).toUpperCase() + String(cmpName.slice(1));
        return { dirPath, fileName }


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
        + '\n'
        + '\tconstructor(){\n'
        + '\t\tsuper();'
        + '\n'
        + '\t}\n'
        + '\n'
        + '\n'
        + '}';


    static componentModel(cmpName, importPath, isLone) {
        let superClsPath = '';
        if (!isLone) {
            superClsPath = `"${importPath}/@still/component/super/ViewComponent.js";`;
            superClsPath = `import { ViewComponent } from ${superClsPath}\n\n`;
        }
        return FileHelper.componentTemplate(cmpName, superClsPath);
    }

    static createComponentFile(cmpName, rootFolder, dirPath, fileName, isLone) {

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

}