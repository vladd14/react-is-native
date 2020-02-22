const fs = require('fs');
const { spawn } = require('child_process');


const { initImports, cutImport, addImportByModuleAndPath, insertImport, deleteImportModule, findModule,
    addImportLine } = require('./imports');

const { transformVariables, transformStyles, transformMediaMax, transformObjectToString, transformMediaPlatform,
    transformTags, transformColors, transformCustomFontIcons, getSvgPathsFromRequires } = require('./styles');
const { exportConnectionTransform, historyToNavigationTransform, removeExcessTags,
    platformTransforms, changePlatform, addFlowTags, createAppJs, removeFunctionCall, changeTagName,
    addScreenDimensionListener, replaceStyleAfterFlowFunction,
    SimplifyEmptyTags, replaceHtmlForWithFocus, addNavigationRouteProps, removeTagsWithBody,
    removeExcessFreeLines, removeNativeComments, changeNextTag } = require('./codeTransformations');

const { makeStringTitled, fileFrom, fileTo, dirFrom, dirTo, copyFile } = require('./helpers');
const { project_name, project_dir, initial_react_js_project_name, } = require('./constants');

const path_from = `${project_dir}${initial_react_js_project_name}/src/`;
const path_to = `${project_dir}${project_name}/`;

const directories = ['helpers', 'settings', 'reducers', 'apps', 'components', 'urls', 'requirements'];
const excess_modules = ['PageHeader', 'react-router-dom'];
const svg_file_name = 'vectors';
let svg_file = {};

const copyMainApps = () => {

    directories.forEach( (folder) => {

        const files_in_dir = fs.readdirSync(dirFrom(path_from, folder), {});
        if (fs.existsSync(dirTo(path_to, folder))) {
            const files_in_dest_folder = fs.readdirSync(dirTo(path_to, folder), {});
            files_in_dest_folder.forEach((dest_file) => {
                fs.unlinkSync(fileTo(dirTo(path_to, folder), dest_file));
            });
        } else {
            fs.mkdirSync(dirTo(path_to, folder), { recursive: true });
        }

        files_in_dir.forEach((file_in_folder) => {
            if ( !file_in_folder.startsWith('.')) {
                console.log('file_in_folder=',file_in_folder);
                let fileBuffer = fs.readFileSync(fileFrom(dirFrom(path_from, folder), file_in_folder), 'utf-8');
                if (fileBuffer) {
                    initImports();

                    console.log('start removeNativeComments');
                    fileBuffer = removeNativeComments(fileBuffer);
                    console.log('start closeModalTags');
                    fileBuffer = changeNextTag(fileBuffer);

                    console.log('start addNavigationRouteProps');
                    fileBuffer = addNavigationRouteProps(fileBuffer);

                    if (folder === 'apps' || folder === 'components') {
                        if (file_in_folder === 'Main.js') {
                            console.log('start addScreenDimensionListener');
                            fileBuffer = addScreenDimensionListener(fileBuffer, 'Main');
                        }
                        console.log('start addFlowTags');
                        fileBuffer = addFlowTags(fileBuffer);
                        console.log('start replaceHtmlForWithFocus');
                        fileBuffer = replaceHtmlForWithFocus(fileBuffer);
                        console.log('start replaceStyleAfterFlowFunction');
                        fileBuffer = replaceStyleAfterFlowFunction(fileBuffer);
                    }
                    console.log('start cutImport');
                    fileBuffer = cutImport(fileBuffer);
                    excess_modules.forEach((module_name) => deleteImportModule(module_name));

                    if (findModule('Animated')) {
                        deleteImportModule('Animated');
                        addImportLine('import { Animated } from \'react-native\';');
                    }

                    console.log('start removeExcessTags');
                    fileBuffer = removeExcessTags(fileBuffer, ['form']);

                    console.log('start Header');
                    fileBuffer = removeTagsWithBody(fileBuffer, ['PageHeader']);

                    console.log('start exportConnectionTransform');
                    fileBuffer = exportConnectionTransform(fileBuffer);
                    // console.log('start importNotRequired');
                    // fileBuffer = checkReactRouterDomImports(fileBuffer, 'import { withNavigation } from \'react-navigation\';');


                    console.log('start SimplifyEmptyTags');
                    fileBuffer = SimplifyEmptyTags(fileBuffer);
                    console.log('start platformTransforms');
                    fileBuffer = platformTransforms(fileBuffer, file_in_folder);
                    console.log('start changePlatform');
                    if (folder === 'reducers' && file_in_folder === 'app.js') {
                        fileBuffer = changePlatform(fileBuffer);
                    }
                    console.log('start historyToNavigationTransform');
                    fileBuffer = historyToNavigationTransform(fileBuffer);

                    console.log('start collecting svg files');
                    if (folder === 'requirements') {
                        let svgs = getSvgPathsFromRequires(fileBuffer);
                        svg_file = { ...svg_file, ...svgs};
                    }

                    fileBuffer = insertImport(fileBuffer);
                    console.log('start removeExcessFreeLines');
                    fileBuffer = removeExcessFreeLines(fileBuffer);
                    console.log('start writeFileSync');
                    fs.writeFileSync(fileTo(dirTo(path_to, folder), file_in_folder), fileBuffer,);
                }
            }
        });
        if (folder === 'requirements') {
            if (fs.existsSync(fileTo(dirTo(path_to, folder), `${svg_file_name}.js`))) {
                fs.unlinkSync(fileTo(dirTo(path_to, folder), `${svg_file_name}.js`));
            }
            if (fs.existsSync(fileTo(dirFrom(path_from, folder), `${svg_file_name}.js`))) {
                fs.unlinkSync(fileTo(dirFrom(path_from, folder), `${svg_file_name}.js`));
            }
            initImports();
            let fileBuffer = '';
            Object.keys(svg_file).forEach((key) => {
                addImportByModuleAndPath(makeStringTitled(key), svg_file[key]);
                fileBuffer += `export const ${key} = ${makeStringTitled(key)};\n`;
            });
            fileBuffer = insertImport(fileBuffer);

            fs.writeFileSync(fileTo(dirTo(path_to, folder), `${svg_file_name}.js`), fileBuffer);
            fs.writeFileSync(fileTo(dirFrom(path_from, folder), `${svg_file_name}.js`), fileBuffer);

            fileBuffer = fs.readFileSync(fileFrom(dirFrom(path_from, folder), 'index.js'), 'utf-8');
            if (fileBuffer) {
                initImports();
                fileBuffer = cutImport(fileBuffer);
                addImportByModuleAndPath('* as svg', `./${svg_file_name}`);
                fileBuffer = insertImport(fileBuffer);
                if (!fileBuffer.includes(`export const vectors = { ...svg };`)) {
                    fileBuffer += `export const vectors = { ...svg };`;
                }
                fs.writeFileSync(fileTo(dirTo(path_to, folder), 'index.js'), fileBuffer,);
                fs.writeFileSync(fileTo(dirFrom(path_from, folder), 'index.js'), fileBuffer,);
            }
        }
    });
    console.log('store.js has copied');
    copyFile(path_from, path_to, 'store.js');
};

const doPrettier = () => {
    let files = [];
    const dirs_for_prettier = ['apps', 'components', 'styles', 'styles/at_media', 'styles/css', 'styles/platform_modifiers'];
    dirs_for_prettier.forEach( (folder) => {
        // console.log(folder);
        // if (folder === 'apps' || folder === 'components') {
            const files_in_dir = fs.readdirSync(dirFrom(path_to, folder), {});
            files_in_dir.forEach((file_in_folder) => {

                if (!file_in_folder.startsWith('.')) {
                    files.push(fileTo(folder, file_in_folder));
                }
            });
        // }
    });

    const process = spawn('yarn', ['prettier', '--write'].concat(files), { cwd: dirTo(project_dir, project_name) });

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`Prettier OK`);
        }
        else {
            console.log(`Process Prettier exited with code ${code}`);
        }
    });
};

const createAppFile = () => {

    if (fs.existsSync(fileTo(path_to, 'App.js'))) {
        fs.unlinkSync(fileTo(path_to, 'App.js'));
    }

    let fileBuffer = fs.readFileSync(fileFrom(path_from, 'App.js'), 'utf-8');
    if (fileBuffer) {
        fileBuffer = createAppJs(fileBuffer);
        fs.writeFileSync(fileTo(path_to,  'App.js'), fileBuffer, );
    }

};

const transferStyles = () => {
    const dir_styles = 'styles';
    const dir_fonts = 'fonts';
    const dir_scss = 'scss';
    const dir_css = 'scss/css';
    const scss_variables = '_variables';
    const scss_colors = '_colors';
    const scss_font_icons = '_insarm_icons';
    const css_files = [
        'insarm_font',
        'header',
        'containers',
        'links',
        'cards',
        'components',
        'tags',
        'tags_mobile',
        'modifiers',
        'calculations',
        'contacts',
    ];
    const main_folder = 'styles';
    const remote_folders = ['css','at_media', 'platform_modifiers'];
    const modifiers_file = 'modifiers';
    const tags_file = 'tags';
    const tags_mobile_file = 'tags_mobile';
    const at_media_file = 'at_media';
    const platform_modifiers_file = 'platform_modifiers';

    {
        if (!fs.existsSync(dirTo(path_to, dir_styles))) {
            fs.mkdirSync(dirTo(path_to, dir_styles)), { recursive: true };
        } else if (fs.existsSync(fileTo(dirTo(path_to, dir_styles), 'variables.js'))) {
            fs.unlinkSync(fileTo(dirTo(path_to, dir_styles), 'variables.js'));
        }
        // make variables file first
        let fileBuffer = fs.readFileSync(fileTo(dirFrom(path_from, dir_scss), `${scss_variables}.scss`), 'utf-8');
        if (fileBuffer) {
            fileBuffer = transformVariables(fileBuffer, 'variables');
            fs.writeFileSync(fileTo(dirTo(path_to, dir_styles), 'variables.js'), fileBuffer);
        }
    }
    { // make colors file next
        if (fs.existsSync(fileTo(dirTo(path_to, dir_styles), 'colors.js'))) {
            fs.unlinkSync(fileTo(dirTo(path_to, dir_styles), 'colors.js'));
        }

        let fileBuffer = fs.readFileSync(fileTo(dirFrom(path_from, dir_scss), `${scss_colors}.scss`), 'utf-8');
        if (fileBuffer) {
            fileBuffer = transformColors(fileBuffer, 'colors');
            fs.writeFileSync(fileTo(dirTo(path_to, dir_styles), 'colors.js'), fileBuffer);
        }
    }
    //make custom_font_icons_variables
    {
        if (fs.existsSync(fileTo(dirTo(path_to, dir_fonts), 'insarm_icons.js'))) {
            fs.unlinkSync(fileTo(dirTo(path_to, dir_fonts), 'insarm_icons.js'));
        }

        if (fs.existsSync(fileTo(dirFrom(path_from, dir_fonts), 'insarm_icons.js'))) {
            fs.unlinkSync(fileTo(dirFrom(path_from, dir_fonts), 'insarm_icons.js'));
        }

        let fileBuffer = fs.readFileSync(fileTo(dirFrom(path_from, dir_scss), `${scss_font_icons}.scss`), 'utf-8');
        if (fileBuffer) {
            fileBuffer = transformCustomFontIcons(fileBuffer, 'insarm_icons', 'insarm_icon');
            fileBuffer += '\n';
            fs.writeFileSync(fileTo(dirTo(path_to, dir_fonts), 'insarm_icons.js'), fileBuffer);
            fs.writeFileSync(fileTo(dirFrom(path_from, dir_fonts), 'insarm_icons.js'), fileBuffer);
        }
    }
    let at_media_chunks = [];
    let platform_modifiers_chunks = [];
    let at_media_modifiers_chunks = [];
    remote_folders.forEach((folder) => {
        if (fs.existsSync(dirTo(path_to, `${main_folder}/${folder}`))) {
            const files_in_dest_folder = fs.readdirSync(dirTo(path_to, `${main_folder}/${folder}`), {});
            files_in_dest_folder.forEach((dest_file) => {
                fs.unlinkSync(fileTo(dirTo(path_to, `${main_folder}/${folder}`), dest_file));
            });
        } else {
            fs.mkdirSync(dirTo(path_to, `${main_folder}/${folder}`), {recursive: true});
        }
    });
    // transfer styles
    css_files.forEach((scss_file_name) => {
        let js_file_name = scss_file_name.replace(/(\w+)/ig, (match, p1) => {
            return p1 + '.js';
        });
        let fileBuffer;
        try {
            fileBuffer = fs.readFileSync(fileTo(dirFrom(path_from, dir_css), `${scss_file_name}.css`), 'utf-8');
        }
        catch (e) {
            console.log(`file '${scss_file_name}.css' cannot be opened`);
        }

        if (fileBuffer) {
            let fileBufferCSS;
            if (!scss_file_name.includes('tags')) {
                fileBufferCSS = transformStyles(fileBuffer, scss_file_name);
            }
            else {
                fileBufferCSS = transformTags(fileBuffer, scss_file_name);
            }
            if (fileBufferCSS) {
                fs.writeFileSync(fileTo(dirTo(path_to, `${main_folder}/css`), js_file_name), fileBufferCSS);
            }

            if (scss_file_name !== 'modifiers') {
                let fileBufferAtMedia = transformMediaMax(fileBuffer, `${scss_file_name}_at_media`);
                if (fileBufferAtMedia) {
                    at_media_chunks.push(fileBufferAtMedia);
                }
            }
            else {
                let fileBufferAtMedia = transformMediaMax(fileBuffer, `${scss_file_name}_at_media_modifiers`);
                if (fileBufferAtMedia) {
                    at_media_modifiers_chunks.push(fileBufferAtMedia);
                }
            }

            let fileBufferPlatforms = transformMediaPlatform(fileBuffer, `${scss_file_name}_platforms`);
            if (fileBufferPlatforms) {
                platform_modifiers_chunks.push(fileBufferPlatforms);
            }
        }
    });

    let at_media_merged = at_media_chunks.reduce((accumulator, value) => {
        Object.keys(value).forEach((key) => {
            accumulator[key] = {...accumulator[key], ...value[key]};
        });
        return accumulator;
    }, {});
    if (at_media_chunks.length) {
        let at_media_merged_string = transformObjectToString(at_media_merged, 'at_media');
        fs.writeFileSync(fileTo(dirTo(path_to, `${main_folder}/at_media`),  `${at_media_file}.js`), at_media_merged_string);
    }

    let at_media_modifiers_merged = at_media_modifiers_chunks.reduce((accumulator, value) => {
        Object.keys(value).forEach((key) => {
            accumulator[key] = {...accumulator[key], ...value[key]};
        });
        return accumulator;
    }, {});
    if (at_media_modifiers_chunks.length) {
        let at_media_modifiers_merged_string = transformObjectToString(at_media_modifiers_merged, 'at_media_modifiers');
        fs.writeFileSync(fileTo(dirTo(path_to, `${main_folder}/at_media`),  `at_media_modifiers.js`), at_media_modifiers_merged_string);
    }

    let platform_modifiers_merged = platform_modifiers_chunks.reduce((accumulator, value) => {
        Object.keys(value).forEach((key) => {
            accumulator[key] = {...accumulator[key], ...value[key]};
        }, {});
        return accumulator;
    }, {});
    if (platform_modifiers_chunks.length) {
        let platform_modifiers_merged_string = transformObjectToString(platform_modifiers_merged, 'platform_modifiers');
        fs.writeFileSync(fileTo(dirTo(path_to, `${main_folder}/platform_modifiers`),  `${platform_modifiers_file}.js`), platform_modifiers_merged_string);
    }

    if (fs.existsSync(fileTo(dirTo(path_to, dir_styles), 'index.js'))) {
        fs.unlinkSync(fileTo(dirTo(path_to, dir_styles), 'index.js'));
    }
    let fileBufferIndexJs = '';
    css_files.forEach((css_file_name) => {
        fileBufferIndexJs += `import { ${css_file_name} } from './css/${css_file_name}';\n`;
    });

    if (at_media_merged) {
        fileBufferIndexJs += `import { ${at_media_file} } from './at_media/${at_media_file}';\n`;
    }

    if (platform_modifiers_merged) {
        fileBufferIndexJs += `import { at_media_modifiers } from './at_media/at_media_modifiers';\n`;
    }

    if (platform_modifiers_merged) {
        fileBufferIndexJs += `import { ${platform_modifiers_file} } from './platform_modifiers/${platform_modifiers_file}';\n`;
    }

    fileBufferIndexJs += `\nexport const styles = {`;
    css_files.forEach((css_file_name) => {
        if (css_file_name !== modifiers_file && css_file_name !== tags_file && css_file_name !== tags_mobile_file) {
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

    if (platform_modifiers_merged) {
        fileBufferIndexJs += `export const styles_at_media_modifiers = {`;
        fileBufferIndexJs += ` ...at_media_modifiers`;
        fileBufferIndexJs += ` };\n`;
    }

    if (modifiers_file) {
        fileBufferIndexJs += `export const styles_modifiers = {`;
        fileBufferIndexJs += ` ...${modifiers_file}`;
        fileBufferIndexJs += ` };\n`;
    }

    if (platform_modifiers_merged) {
        fileBufferIndexJs += `export const styles_platform_modifiers = {`;
        fileBufferIndexJs += ` ...${platform_modifiers_file}`;
        fileBufferIndexJs += ` };\n`;
    }

    if (tags_file) {
        fileBufferIndexJs += `export const styles_by_tags = {`;
        fileBufferIndexJs += ` ...${tags_file}`;
        fileBufferIndexJs += tags_mobile_file ? `, ...${tags_mobile_file}` : '';
        fileBufferIndexJs += ` };\n`;
    }

    if (fileBufferIndexJs) {
        fs.writeFileSync(fileTo(dirTo(path_to, `${main_folder}`),  'index.js'), fileBufferIndexJs);
    }
};

const startAppWebToNativeApp = () => {
    console.log('start copyMainApps');
    copyMainApps();
    console.log('start createAppFile');
    createAppFile();
    console.log('start transferStyles');
    transferStyles();
    console.log('transformation complete!');
    console.log('start prettier');
    doPrettier();
};

startAppWebToNativeApp();

module.exports = {
    startAppWebToNativeApp,
};
