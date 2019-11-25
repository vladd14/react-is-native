const {take_import_line_regexp, flow_tag_regexp} = require('./regexps');

const flowTag = `/**
 * @format
 * @flow
 */
`;

let with_flow_tag = false;
let imports = [];
const check_flow_tag = (str) => {
    if (str.search(flow_tag_regexp) !== -1) {
        str = str.replace(flow_tag_regexp, '');
        with_flow_tag = true;
    }
    return str;
};
const cutImport = (str) => {
    const replacer = (match, p1) => {
        if (imports.indexOf(p1) === (-1)) {
            imports.push(p1);
        }
        return '';
    };
    str = check_flow_tag(str);
    str = str.replace(take_import_line_regexp, replacer);
    return str;
};

const insertImport = (str) => {

    if (with_flow_tag) {
        str = flowTag + imports.join('\n') +'\n\n' + str;
    }
    else {
        str = imports.join('\n') +'\n\n' + str;
    }
    return str;
};

const cutImportAndGetArray = (str) => {
    let imports = [];
    const addImport = (match) => {
        if (imports.indexOf(match) === (-1)) {
            imports.push(match);
        }
        return '';
    };
    if (str) {
        str = check_flow_tag(str);
        str = str.replace(take_import_line_regexp, addImport);
    }
    return {
        text: str,
        imports: imports,
    };
};

const addImportLine = (str) => {
    imports.push(str);
};

const addImportArray = (array) => {
    imports = imports.concat(array);
};

const initImports = () => {
    imports.splice(0, imports.length);
    with_flow_tag = false;
};

const findModule = (name) => {
    const replacer = (match) => {
        console.log('match=', match);
    };

    const regExp = new RegExp(`\\s+${name}\\s+`, 'mig');

    return imports.join(' ').search(regExp) !== -1
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
