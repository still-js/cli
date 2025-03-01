import fs from 'fs';
import beautify from 'js-beautify';

export class RouterHelper {

    static updateProjectRoutes(file, cmpName, cmpPath) {

        let routesContent = fs.readFileSync(file, { encoding: 'utf-8' });

        let componentRoute = cmpPath.replace(`${cmpName}.js`, '');
        if (componentRoute.at(-1) == '/')
            componentRoute = componentRoute.slice(0, -1);

        const complementRE = /[\s \n]{0,}(\:)[\s \n]{0,}[\s \n]{0,}(\{)[\s \n]{0,}/;
        const vrRE = /viewRoutes/.source + complementRE.source;
        const regularRE = /regular/.source + complementRE.source;
        const re = new RegExp(vrRE + regularRE);
        const newRoute = `${cmpName}: '${componentRoute}',\n`;

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


}