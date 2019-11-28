const {take_import_line_regexp, flow_tag_regexp} = require('./regexps');

const flowTag = `/**
 * @format
 * @flow
 */
`;

let with_flow_tag = false;
let imports = [];
let imports_object = {};
const check_flow_tag = (str) => {
    if (str.search(flow_tag_regexp) !== -1) {
        str = str.replace(flow_tag_regexp, '');
        with_flow_tag = true;
    }
    return str;
};

const getArrayItem = (str, prev_array) => {
    return [...prev_array, ...str.split(',').map((element) => element.trim())].filter((item, index, array) => array.slice(index+1).slice(array.indexOf(item)+1).indexOf(item) === -1);
};
const cutImport = (str) => {
    const replacer = (match, p1, modules, path_from) => {
        if ( !imports_object[path_from]) {
            imports_object[path_from] = {};
            imports_object[path_from].modules_in_curly_braces = [];
            imports_object[path_from].modules = [];
        }
        modules = modules.replace(/\s*\{(.[^}]+)}\s*/gi, (match, p1) => {
            imports_object[path_from].modules_in_curly_braces = getArrayItem(p1, imports_object[path_from].modules_in_curly_braces);
            return '';
        });
        if (!imports_object[path_from].modules_in_curly_braces) {
            imports_object[path_from].modules_in_curly_braces = [];
        }
        if (modules.charAt(modules.length-1) === ',') {
            modules = modules.slice(0,-1);
        }
        if (modules) {
            imports_object[path_from].modules = getArrayItem(modules, imports_object[path_from].modules);
        }

        if (imports.indexOf(p1) === (-1)) {
            imports.push(p1);
        }
        return '';
    };
    str = check_flow_tag(str);
    str = str.replace(take_import_line_regexp, replacer);
    str = str.replace(/(^\s*\n){2,}/gim, '');
    return str;
};

const insertImport = (str) => {

    str = Object.keys(imports_object).map((key) => {
        let return_str = 'import ';
        for (let index in imports_object[key].modules) {
            return_str += `${imports_object[key].modules[index]}`;
            return_str += index < imports_object[key].modules.length - 1 ? ', ' : '';
        }
        return_str += imports_object[key].modules.length && imports_object[key].modules_in_curly_braces.length ? ', { ' : imports_object[key].modules_in_curly_braces.length ? '{ ' : '';
        for (let index in imports_object[key].modules_in_curly_braces) {
            return_str += `${imports_object[key].modules_in_curly_braces[index]}`;
            return_str += index < imports_object[key].modules_in_curly_braces.length - 1 ? ', ' : '';
        }
        return_str += imports_object[key].modules_in_curly_braces.length ? ` } from ${key};` : ` from ${key};`;
        return return_str;
    }).join('\n') +'\n\n' + str;

    str = with_flow_tag ? flowTag + str : str;

    return str;
};

const cutImportAndGetArray = (str) => {
    str = cutImport(str);
    return {
        text: str,
        imports: imports,
    };
};

const addImportLine = (str) => {
    cutImport(str);
};

const addImportArray = (array) => {
    array.forEach((element) => {
        cutImport(element);
    });
};

const findModule = (name) => {
    name = name.trim();
    return Boolean(imports_object[name]);
};

const initImports = () => {
    imports_object = {};
    imports.splice(0, imports.length);
    with_flow_tag = false;
};

module.exports = {
    cutImport,
    insertImport,
    cutImportAndGetArray,
    addImportLine,
    addImportArray,
    initImports,
    findModule,
};
