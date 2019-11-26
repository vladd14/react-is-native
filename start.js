const fs = require('fs');

const { transformVariables, transformStyles, transformMediaMax, transformObjectToString } = require('./styles');
const { exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags,
    platformTransforms, changePlatform, addFlowTags, createAppJs, removeFunctionCall, changeTagName,
    addScreenDimensionListener, replaceStyleAfterFlowFunction, addStatusBarHeight } = require('./codeTransformations');

const path_from = '../insarm-front/src/';
const path_to = '../insarmApp/';

const fileFrom = (from, filename) => {
    return from + filename;
};

const fileTo = (to, filename) => {
    return to + filename;
};

const dirFrom = (dirname) => {
    let dir = path_from + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir
};

const dirTo = (dirname) => {
    let dir = path_to + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir
};

const directories = ['helpers', 'settings', 'reducers', 'apps', 'components', 'urls'];

const copyMainApps = () => {

    directories.forEach( (folder) => {

        const files_in_dir = fs.readdirSync(dirFrom(folder), {});
        if (fs.existsSync(dirTo(folder))) {
            const files_in_dest_folder = fs.readdirSync(dirTo(folder), {});
            files_in_dest_folder.forEach((dest_file) => {
                fs.unlinkSync(fileTo(dirTo(folder), dest_file));
            });
        } else {
            fs.mkdirSync(dirTo(folder), {recursive: true});
        }

        files_in_dir.forEach((file_in_folder) => {

            let fileBuffer = fs.readFileSync(fileFrom(dirFrom(folder), file_in_folder), 'utf-8');
            if (fileBuffer) {
                fileBuffer = exportConnectionTransform(fileBuffer);
                fileBuffer = importNotRequired(fileBuffer, 'import { withNavigation } from \'react-navigation\';');
                fileBuffer = historyToNavigationTransform(fileBuffer);
                // fileBuffer = removeFunctionCall(fileBuffer, 'actions.setPageTitle');
                fileBuffer = removeFormTags(fileBuffer, ['form',]);
                fileBuffer = platformTransforms(fileBuffer);
                if (folder === 'apps' || folder === 'components') {
                    if (file_in_folder === 'PageHeader.js') {
                        fileBuffer = addStatusBarHeight(fileBuffer);
                        fileBuffer = addScreenDimensionListener(fileBuffer);
                    }
                    fileBuffer = addFlowTags(fileBuffer);
                    fileBuffer = replaceStyleAfterFlowFunction(fileBuffer);
                }
                if (folder === 'reducers' && file_in_folder === 'app.js') {
                    fileBuffer = changePlatform(fileBuffer);
                }
                fs.writeFileSync(fileTo(dirTo(folder),  file_in_folder), fileBuffer, );
            }
        });
    });
};

const createAppFile = () => {

    if (fs.existsSync(fileTo(path_to, 'App.js'))) {
        fs.unlinkSync(fileTo(path_to, 'App.js'));
    }

    let fileBuffer = fs.readFileSync(fileFrom(path_from, 'App.js'), 'utf-8');
    if (fileBuffer) {
        fileBuffer = createAppJs(fileBuffer);
        fs.writeFileSync(fileTo(dirTo(path_to),  'App.js'), fileBuffer, );
    }

};

const transferStyles = () => {
    const dir_styles = 'styles';
    const dir_scss = 'scss';
    const dir_css = 'scss/css';
    const scss_variables = '_variables';
    const css_files = ['container', 'header', 'links', 'cards', 'components', 'modifiers', ];
    const main_folder = 'styles';
    const remote_folders = ['css','at_media'];
    const modifiers_file = 'modifiers';
    const at_media_file = 'at_media';

    let at_media_chanks = [];
    { // make variables file first
        if (fs.existsSync(fileTo(dirTo(dir_styles), 'variables.js'))) {
            fs.unlinkSync(fileTo(dirTo(dir_styles), 'variables.js'));
        }

        let fileBuffer = fs.readFileSync(fileTo(dirFrom(dir_scss), `${scss_variables}.scss`), 'utf-8');
        if (fileBuffer) {
            fileBuffer = transformVariables(fileBuffer, 'variables');
            fs.writeFileSync(fileTo(dirTo(dir_styles), 'variables.js'), fileBuffer);
        }
    }

    remote_folders.forEach((folder) => {
        if (fs.existsSync(dirTo(`${main_folder}/${folder}`))) {
            const files_in_dest_folder = fs.readdirSync(dirTo(`${main_folder}/${folder}`), {});
            files_in_dest_folder.forEach((dest_file) => {
                fs.unlinkSync(fileTo(dirTo(`${main_folder}/${folder}`), dest_file));
            });
        } else {
            fs.mkdirSync(dirTo(`${main_folder}/${folder}`), {recursive: true});
        }
    });
    // transfer styles
    css_files.forEach((scss_file_name) => {
        let js_file_name = scss_file_name.replace(/(\w+)/ig, (match, p1) => {
            return p1 + '.js';
        });
        let js_file_media_name = scss_file_name.replace(/(\w+)/ig, (match, p1) => {
            return p1 + '_at_media.js';
        });

        let fileBuffer = fs.readFileSync(fileTo(dirFrom(dir_css), `${scss_file_name}.css`), 'utf-8');
        if (fileBuffer) {
            let fileBufferCSS = transformStyles(fileBuffer, scss_file_name);
            fs.writeFileSync(fileTo(dirTo(`${main_folder}/css`),  js_file_name), fileBufferCSS);

            let fileBufferAtMedia = transformMediaMax(fileBuffer, `${scss_file_name}_at_media`);
            if (fileBufferAtMedia) {
                at_media_chanks.push(fileBufferAtMedia);
            }
        }
    });
    // console.log('at_media_chanks=',at_media_chanks);
    let at_media_merged = at_media_chanks.reduce((accumulator, value) => {
        Object.keys(value).forEach((key) => {
            accumulator[key] = {...accumulator[key], ...value[key]};
        });
        return accumulator;
    });
    let at_media_merged_string = transformObjectToString(at_media_merged, 'at_media');
    fs.writeFileSync(fileTo(dirTo(`${main_folder}/at_media`),  `${at_media_file}.js`), at_media_merged_string);
    //create index.js for styles
    // console.log('found_at_media_files=',at_media_files);
    if (fs.existsSync(fileTo(dirTo(dir_styles), 'index.js'))) {
        fs.unlinkSync(fileTo(dirTo(dir_styles), 'index.js'));
    }
    let fileBufferIndexJs = '';
    css_files.forEach((css_file_name) => {
        fileBufferIndexJs += `import { ${css_file_name} } from './css/${css_file_name}';\n`;
    });

    if (at_media_merged) {
        fileBufferIndexJs += `import { ${at_media_file} } from './at_media/${at_media_file}';\n`;
    }

    fileBufferIndexJs += `\nexport const styles = {`;
    css_files.forEach((css_file_name) => {
        if (css_file_name !== modifiers_file) {
            fileBufferIndexJs += ` ...${css_file_name},`;
        }
    });
    fileBufferIndexJs = fileBufferIndexJs.slice(0,-1);
    fileBufferIndexJs += ` };\n`;

    if (at_media_merged) {
        fileBufferIndexJs += `export const styles_at_media = {`;
        fileBufferIndexJs += ` ...${at_media_file}`;
        fileBufferIndexJs += ` };\n`;
    }

    if (modifiers_file) {
        fileBufferIndexJs += `export const styles_modifiers = {`;
        fileBufferIndexJs += ` ...${modifiers_file}`;
        fileBufferIndexJs += ` };\n`;
    }

    if (fileBufferIndexJs) {
        fs.writeFileSync(fileTo(dirTo(`${main_folder}`),  'index.js'), fileBufferIndexJs);
    }
};

copyMainApps();
createAppFile();
transferStyles();
