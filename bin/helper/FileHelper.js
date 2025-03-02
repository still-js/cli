import fs from 'fs';
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

        return counter == FileHelper.rootFiles.length;
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

}