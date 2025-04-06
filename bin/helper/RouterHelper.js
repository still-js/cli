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
        routesContent = routesContent.replace(/export(\s){0,1}const(\s)/g, 'global.');
        routesContent = routesContent.replace(/export(\s)/g, '');
        eval(routesContent);

        let componentRoute = cmpPath.replace(`${cmpName}.js`, '');
        let url = RouterHelper.parseUrlPath(cmpName, componentRoute);

        if (componentRoute.at(-1) == '/')
            componentRoute = componentRoute.slice(0, -1);

        const pathInit = componentRoute.startsWith('app/') ? '' : 'app/'

        stillRoutesMap.viewRoutes.regular[cmpName] = {
            path: `${pathInit}${componentRoute}`, url
        }

        const identConfig = { indent_size: 4, space_in_empty_paren: true };
        const newRoutesContent = ''
            + RouterHelper.routeFileTopCOmment() + '\n'
            + 'export const stillRoutesMap = '
            + beautify(JSON.stringify(stillRoutesMap).replace(/"([^"]+)":/g, '$1:'), identConfig) + '\n'
            + '\n\n' + RouterHelper.stillGetRouteFuncContent() + '\n';

        try {
            fs.writeFileSync(file, newRoutesContent, { encoding: 'utf-8' });
            return true;
        } catch (error) {
            console.log(`Error on generating the `, error.message);
            return false;
        }

    }

    /** @param { String } cmpName */
    static parseUrlPath(cmpName, componentRoute) {

        let pathName = cmpName.slice(-1).toLowerCase() == '.js'
            ? cmpName.slice(0, -3)
            : cmpName;

        let path = componentRoute.replace(/app\//i, '');
        path = path.replace(/components\//i, '/');
        path = path.replace(/component\//i, '/');
        path = path.replace(/\/\//i, '/');
        if (path.slice(-1) == '/') path = path.slice(0, -1)

        pathName = pathName.replace(/components/i, '');
        pathName = pathName.replace(/Component/i, '');

        const resource = pathName.split('')
            .map(
                (ltr, idx) => {

                    const isPrevCapitalLtr = pathName[idx - 1]?.toUpperCase() == pathName[idx - 1];
                    const is2PrevCapitalLtr = pathName[idx - 2]?.toUpperCase() == pathName[idx - 2];
                    const isCurrCapitalLtr = ltr == ltr.toUpperCase();
                    const first = idx == 0;
                    const second = idx == 1;

                    return !first && (isCurrCapitalLtr && !isPrevCapitalLtr)
                        ? `-${ltr.toLowerCase()}`
                        : (isPrevCapitalLtr && !isCurrCapitalLtr && is2PrevCapitalLtr && !second)
                            ? `-${ltr.toLowerCase()}`
                            : ltr.toLowerCase()
                }
            )
            .join('');

        if (!path.startsWith('/')) path = '/' + path;
        if (!path.endsWith('/')) path = path.slice(0, -1);

        return path.toLowerCase() + '/' + resource

    }

    static stillGetRouteFuncContent() {
        return ''
        //+ 'export function $stillGetRouteMap() {\n\n'
        //+ '\treturn {'
        //+ '\t\troute: {\n'
        //+ '\t\t\t...stillRoutesMap.viewRoutes.regular,\n'
        //+ '\t\t\t...stillRoutesMap.viewRoutes.lazyInitial\n'
        //+ '\t\t},\n'
        //+ '\t}\n'
        //+ '}';
    }

    static routeFileTopCOmment() {
        return `
        /**
         * Don't change the constante name as it'll impact on the component routing
         */
        `;
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

        const consoleTable = new TerminalTable({
            columns: [
                { name: 'routeName', alignment: 'left', title: 'Route Name' },
                { name: 'Path', alignment: 'left' },
                { name: 'URL', alignment: 'left' }
            ]
        });

        const routes = Object.entries(stillRoutesMap.viewRoutes.regular);
        for (const [field, value] of routes) {
            consoleTable.addRow(
                {
                    routeName: String.raw`${field} `,
                    Path: `${value.path}/${field}`,
                    URL: `${value.url}`,
                }, { color: 'cyan' }
            );
        }

        consoleTable.printTable();

    }


}