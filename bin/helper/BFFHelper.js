import { FileHelper } from "./FileHelper.js"


export class BFFHelper {

    static parseServices(servicesList = []){

        const RE = BFFRegex.getRE();

        for(let item of servicesList){
            const service = FileHelper.readServiceFile(item);
            const isBff = service.match(RE.bff);
            if(isBff){
                BFFHelper.handleBffGenerations(service, RE)
            }
        }

    }

    static handleBffGenerations(service, RE){

        service.replace(RE.bff, (_, svc, baseSvc) => {
            console.warn(`The service: ${svc} and base is: ${baseSvc}`);
        
            console.log(``);
            console.log(`PARSING GET REQUEST`);
            
            service.replace(RE.get, (_, path, type, rtrn, rtrnType) => {
                console.warn('  Path is - ', path);
                console.warn('  Type is - ', type);
                console.log(`  Return type: `,rtrnType);
                console.log(``);
                
            });
        
            console.log(``);
            console.log(`PARSING POST REQUEST`);
            service.replace(RE.post, (_, path, type, rtrn, rtrnType) => {
                console.warn('  Path is - ', path);
                console.warn('  Type is - ', type);
                console.log(`  Return type: `,rtrnType);
            });
        
        });

    }

}



class BFFRegex {

    static RE_HTTP = /\s{1,}([A-Z0-9\s\/\:\?\$\_\n\t]*?)[\*\s]{1,}\@type[\s]{0,}\{\s{0,}([A-Z0-9]*?)[\s]{0,}\}[\n\t\r\*\s]{0,}(@return){0,1}[\s]{0,}\{{0,1}\s*([A-Z0-9\_]*)\s*\}{0,1}/

    static getRE = () => ({
        bff: /\@BackendFrontend[\$\_A-Z0-9\n\r\t\s]*?\*\/[A-Z0-9\$\_\s]*?class\s{1,}([A-Z0-9\$\_]*?)\s{1,}extends\s(BaseService)/i,
        get: new RegExp(/\@Get/.source + BFFRegex.RE_HTTP.source,'ig'),
        post: new RegExp(/\@Post/.source + BFFRegex.RE_HTTP.source,'ig'),
        delete: new RegExp(/\@Delete/.source + BFFRegex.RE_HTTP.source,'ig'),
        put: new RegExp(/\@Put/.source + BFFRegex.RE_HTTP.source,'ig'),
        patch: new RegExp(/\@Patch/.source + BFFRegex.RE_HTTP.source,'ig'),
    });

}
