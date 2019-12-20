const { take_import_line_regexp, take_import_without_from_regexp, flow_tag_regexp } = require('./regexps');
const { flowTag } = require('./constants');

let with_flow_tag = false;
let imports_object = {};
const check_flow_tag = (str) => {
    if (str.search(flow_tag_regexp) !== -1) {
        str = str.replace(flow_tag_regexp, '');
        with_flow_tag = true;
    }
    return str;
};

const getArrayItem = (str, prev_array, trace) => {
    if (trace) {
        console.log('prev_array', prev_array);
        console.log([...prev_array, ...str.split(',').map((element) => element.trim())]);
    }
    return [...prev_array, ...str.split(',').map((element) => {element = element.trim(); return element.replace(/['"`]/g, '')} )].filter((item, index, array) => index < array.length - 1 && !array.slice(index+1).includes(item) || index === array.length - 1);
};
const cutImport = (str, trace) => {
    const replacer = (match, p1, modules, p2, path_from) => {
        if (trace) {
            console.log('match=',match);
        }
        path_from = path_from ? path_from.replace(/['"`]/g, '') : 'self';
        if (!imports_object[path_from]) {
            imports_object[path_from] = {};
            imports_object[path_from].modules_in_curly_braces = [];
            imports_object[path_from].modules = [];
        }
        modules = modules.replace(/\s*\{(.[^}]+)}\s*/gi, (match, p1) => {
            if (trace) {
                console.log(imports_object[path_from].modules_in_curly_braces);
            }
            imports_object[path_from].modules_in_curly_braces = getArrayItem(p1, imports_object[path_from].modules_in_curly_braces, trace);
            if (trace) {
                console.log(imports_object[path_from].modules_in_curly_braces);
            }
            return '';
        });
        if (modules.charAt(modules.length-1) === ',') {
            modules = modules.slice(0,-1);
        }
        if (modules) {

            if (trace) {
                console.log('modules=',modules);
            }
            imports_object[path_from].modules = getArrayItem(modules, imports_object[path_from].modules);
        }
        return '';
    };
    str = check_flow_tag(str);
    if (trace) {
        console.log('str=', str);
    }
    str = str.replace(take_import_line_regexp, replacer);
    if (trace) {
        console.log(take_import_line_regexp);
    }
    str = str.replace(take_import_without_from_regexp, replacer);

    str = str.replace(/(^\s*\n){2,}/gim, '');
    if (trace) {
        console.log('imports_object=', imports_object);
    }
    return str;
};

const deleteImportModule = (key, trace) => {
    if (trace) {
        console.log('key=', key);
        console.log('imports_object', imports_object);
    }
    if (imports_object && imports_object.hasOwnProperty(key)) {
        if (trace) {
            console.log('key=', key);
            console.log('imports_object[key]=', imports_object[key]);
        }
        delete imports_object[key];
    } else if (imports_object && imports_object.hasOwnProperty('self')) {
        if (trace) {
            console.log('imports_object has property self');
        }
        if (imports_object.self.modules.includes(key)) {
            if (trace) {
                console.log('modules includes');
            }
            imports_object.self.modules.splice(imports_object.self.modules.indexOf(key), 1);
        }
        if (imports_object.self.modules_in_curly_braces.includes(key)) {
            imports_object.self.modules_in_curly_braces.splice(imports_object.self.modules_in_curly_braces.indexOf(key), 1);
        }
    }
};

const insertImport = (str, trace) => {

    str = Object.keys(imports_object).map((key) => {
        let return_str = 'import ';
        for (let index in imports_object[key].modules) {
            return_str += key !== 'self' ? `${imports_object[key].modules[index]}` : `'${imports_object[key].modules[index]}'`;
            return_str += index < imports_object[key].modules.length - 1 ? ', ' : '';
        }
        return_str += imports_object[key].modules.length && imports_object[key].modules_in_curly_braces.length ? ', { ' : imports_object[key].modules_in_curly_braces.length ? '{ ' : '';
        for (let index in imports_object[key].modules_in_curly_braces) {
            return_str += key !== 'self' ? `${imports_object[key].modules_in_curly_braces[index]}` : `'${imports_object[key].modules_in_curly_braces[index]}'`;
            return_str += index < imports_object[key].modules_in_curly_braces.length - 1 ? ', ' : '';
        }
        return_str += imports_object[key].modules_in_curly_braces.length ? ` } from '${key}';` : key !== 'self' ? ` from '${key}';` : `;`;
        return return_str;
    }).join('\n') +'\n\n' + str;

    str = with_flow_tag ? flowTag + str : str;
    if (trace) {
        console.log(str);
    }
    return str;
};

const addImportByModuleAndPath = (module, path_from, trace) => {
    if (!imports_object[path_from]) {
        imports_object[path_from] = {};
        imports_object[path_from].modules_in_curly_braces = [];
        imports_object[path_from].modules = [];
    }
    if (module.includes('{')) {
        imports_object[path_from].modules_in_curly_braces = getArrayItem(module, imports_object[path_from].modules_in_curly_braces, trace);
    }
    else {
        imports_object[path_from].modules = getArrayItem(module, imports_object[path_from].modules, trace);
    }
};

const addImportLine = (str, trace) => {
    cutImport(str, trace);
};

const addImportArray = (array, trace) => {
    if (trace) {
        console.log('addImportArray=', array);
    }
    array.forEach((element) => {
        if (trace) {
            console.log('element=', element);
        }
        cutImport(element, trace);
    });
};

const findModule = (name) => {
    name = name.trim();
    return Boolean(imports_object[name]);
};

const initImports = () => {
    imports_object = {};
    with_flow_tag = false;
};

module.exports = {
    cutImport,
    insertImport,
    // cutImportAndGetArray,
    addImportLine,
    addImportArray,
    initImports,
    findModule,
    deleteImportModule,
    addImportByModuleAndPath,
};
