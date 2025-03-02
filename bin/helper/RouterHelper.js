import { Table as TerminalTable } from 'console-table-printer';
import fs from 'fs';
import beautify from 'js-beautify';

export class RouterHelper {

    static viewRoutesMapRE() {

        const complementRE = /[\s \n]{0,}(\:)[\s \n]{0,}[\s \n]{0,}(\{)[\s \n]{0,}/;
        const vrRE = /viewRoutes/.source + complementRE.source;
        const regularRE = /regular/.source + complementRE.source;
        return new RegExp(vrRE + regularRE);

    }

    static updateProjectRoutes(file, cmpName, cmpPath) {

        let routesContent = fs.readFileSync(file, { encoding: 'utf-8' });

        let componentRoute = cmpPath.replace(`${cmpName}.js`, '');
        if (componentRoute.at(-1) == '/')
            componentRoute = componentRoute.slice(0, -1);

        const re = RouterHelper.viewRoutesMapRE();
        const newRoute = `${cmpName}: 'app/${componentRoute}',\n`;

        routesContent = routesContent.replace(re, (mt) => {
            return 'viewRoutes: {\nregular: {\n' + newRoute;
        });

        const newRoutesContent = (
            beautify(routesContent, { indent_size: 4, space_in_empty_paren: true })
        );

        try {
            fs.writeFileSync(file, newRoutesContent, { encoding: 'utf-8' });
            return true;
        } catch (error) {
            console.log(`Error on generating the `, error.message);
            return false;
        }

    }

    static checkIfRouteExists(file, cmpName) {

        let routesContent = fs.readFileSync(file, { encoding: 'utf-8' });
        const complementRe = /[\n \s]{0,}:/;
        const componentRe = new RegExp(cmpName);

        const re = componentRe.source + complementRe.source;
        const componentExists = routesContent.match(new RegExp(re));

        return componentExists;

    }

    static async listRoutes(file) {

        let routesContent = fs.readFileSync(file, { encoding: 'utf-8' });
        routesContent = routesContent.replace(/export(\s){0,1}const(\s)/g, 'global.');
        routesContent = routesContent.replace(/export(\s)/g, '');
        eval(routesContent);

        const consoleTable = new TerminalTable();

        const routes = Object.entries(stillRoutesMap.viewRoutes.regular);
        for (const [field, value] of routes) {
            consoleTable.addRow(
                {
                    'Route Name': String.raw`${field}`,
                    'Path': `${value}/`,
                    'Full Path': `${value}/${field}.js`
                }, { color: 'cyan' }
            );
        }

        consoleTable.printTable();

    }


}