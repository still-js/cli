import fs from 'fs';
import colors from 'yoctocolors';
import { sleepFor } from '../util/time.js';


export class FileHelper {

    static rootFiles = [
        '@still', 'app-setup.js', 'app-template.js', 'index.html', 'route.map.js'
    ];

    static wasRootFolderReached(actualDir) {

        const files = fs.readdirSync(actualDir);

        let counter = 0;
        for (const file of files) {
            if (FileHelper.rootFiles.includes(file)) counter++;
        }

        return {
            flag: counter == FileHelper.rootFiles.length,
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
        'import { ViewComponent } from ' + superClsPath
        + '\nexport class ' + cmpName + ' extends ViewComponent {\n'
        + '\n'
        + '\tisPublic = true;'
        + '\n'
        + '\ttemplate = `<h1 style="width: 100%; text-align:center; margin-top:10%;">' + cmpName + '  auto generated content</h1>`;\n'
        + '\n'
        + '\tconstructor(){\n'
        + '\t\tsuper();'
        + '\n'
        + '\t}\n'
        + '\n'
        + '\n'
        + '}';


    static componentModel(cmpName, importPath) {
        const superClsPath = `"${importPath}/@still/component/super/ViewComponent.js";`;
        return FileHelper.componentTemplate(cmpName, superClsPath);
    }

    static createComponentFile(cmpName, rootFolder, dirPath, fileName) {

        const cmpContent = FileHelper.componentModel(cmpName, rootFolder);
        const isValidDir = dirPath != '' && dirPath != undefined;
        const cmpDirPath = isValidDir ? dirPath : '';
        const cmpFullPath = `${isValidDir ? cmpDirPath + '/' : ''}${fileName}.js`;

        fs.writeFileSync(`${cmpFullPath}`, cmpContent);

        return cmpFullPath;

    }

    static isItRootFolder(spinner, cmdObj, showLog = true) {

        const { flag, actualDir } = FileHelper.wasRootFolderReached(process.cwd());

        if (flag) {
            if (showLog) {

                spinner.error(`Failed to create new component`);
                cmdObj.cmdMessage(
                    '\n  Components ' + colors.bold(colors.red('cannot')) + ' be created from the root folder:\n\n'
                    + '\t- please enter the app folder by typing '
                    + colors.bold(colors.green('cd app'))
                    + '\n\t- Then you can create the component'
                );
                cmdObj.newCmdLine();

            }
            return { flag, actualDir };
        }

        return { flag, actualDir };

    }

}