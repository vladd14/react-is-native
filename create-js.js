const fs = require('fs');
const { spawn } = require('child_process');
// const { startAppWebToNativeApp } = require('./transform');
const { fileFrom, dirFrom, dirTo, copyFile, copyFilesFromDirectory, copyFileByStream, copyFilesFromDirectoryByStream, deleteFolder } = require('./helpers');
const { project_name_js, project_folder_with_prettier, project_dir, project_folder_with_js_source_files, tools_folder, project_folder_with_tools, project_folder_with_custom_settings } = require('./constants');

const project_name = project_name_js;
// const project_dir = '/Users/admin/PycharmProjects/';
// const project_folder_with_tools = 'insarmApp/';

const copy_project_dirs = ['src', 'public'];
const copy_prettier_dirs = [
    '@react-native-community',
    'eslint-plugin-prettier',
    'prettier-linter-helpers',
    'fast-diff',
    'eslint-config-prettier',
    'prettier',
    'eslint-plugin-eslint-comments',
    'eslint-plugin-react-native',
    'eslint-plugin-react-native-globals',
];

const yarn_modules = [
    'axios',
    'redux',
    'react-redux',
    '@reduxjs/toolkit',
    'node-sass',
    'react-router',
    'react-router-dom',
    'react-router-config',
    'eslint',
    'prettier',
    '@react-native-community/eslint-config',
    '@babel/plugin-syntax-jsx',
    'yarn add node-sass@4.14.1',
    // '--dev eslint prettier @react-native-community/eslint-config',
    'moment@2.24.0',
    'moment-timezone',
    'react-datetime',
    'crypto-js@3.3.0',
];
const yarn_individual_modules = [
    // 'eslint prettier @react-native-community/eslint-config',
];

const copyWebStormProjectSettings = () => {
    const copy_files = [
        '.gitattributes',
        '.gitignore',
    ];
    const copy_folders = [
        '.idea',
        'scripts',
    ];

    copy_files.forEach((file_name) => {
        if (fs.existsSync(fileFrom(`${project_dir}${project_folder_with_js_source_files}`, file_name))) {
            copyFile(`${project_dir}${project_folder_with_js_source_files}`, `${project_dir}${project_name}`, file_name );
        } else {
            console.warn(`file ${file_name} doesn't exit in directory ${project_dir}${project_folder_with_js_source_files}`);
        }
    });

    copy_folders.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_js_source_files}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));
    });
    console.log(`WebStorm settings have copied`);
    console.log(`\nThat's it!`);
    // copyGitDirStream();
};

const copyGitDirStream = () => {
    const copy_folders = [
        '.git',
    ];
    copy_folders.forEach((dir_name) => {
        deleteFolder(dirTo(`${project_dir}${project_name}`, dir_name));
    });

    copy_folders.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_js_source_files}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));
    });
    console.log(`.Git settings have copied`);
    console.log(`Start to copy WebStorm settings files`);
    copyWebStormProjectSettings();
}

const addWebpackCustomLoader = () => {
    const tab = '  ';


    const add_lines = [
        `\n${tab}${tab}${tab}${tab}// custom loader for changing build type in time of compilation`,
        `${tab}${tab}${tab}${tab}{`,
        `${tab}${tab}${tab}${tab}${tab}test: /\\/settings\\/index\\.js$/,`,
        `${tab}${tab}${tab}${tab}${tab}use: [`,
        `${tab}${tab}${tab}${tab}${tab}${tab}{`,
        `${tab}${tab}${tab}${tab}${tab}${tab}${tab}loader: require.resolve('./buildTypeChangeLoader'),`,
        `${tab}${tab}${tab}${tab}${tab}${tab}${tab}${tab}options: {`,
        `${tab}${tab}${tab}${tab}${tab}${tab}${tab}${tab}${tab}isEnvProduction: isEnvProduction,`,
        `${tab}${tab}${tab}${tab}${tab}${tab}${tab}${tab}},`,
        `${tab}${tab}${tab}${tab}${tab}${tab}${tab}},`,
        `${tab}${tab}${tab}${tab}${tab}],`,
        `${tab}${tab}${tab}${tab}${tab}include: paths.appSrc,`,
        `${tab}${tab}${tab}${tab}},`,
    ];

    let file = fileFrom(dirFrom(project_dir, project_name_js), '/config/webpack.config.js');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        //{ parser: { requireEnsure: false } },
        file_buffer = file_buffer.replace(/\{\s*?parser:.+?requireEnsure:.+?},/gi, (match) => {
            return match + add_lines.join('\n');
        });

        fs.writeFileSync(file, file_buffer);
    }

    console.log(`webpack custom loader has added`);
    console.log(`start copy the Git folder`);
    copyGitDirStream();
};

const copyCustomWebPackLoaderFile = () => {
    copyFile(`${project_dir}${project_folder_with_custom_settings}web/config/`, `${project_dir}${project_name}/config/`, 'buildTypeChangeLoader.js' );

    console.log(`file copyCustomWebPackLoader.js have copied`);
    console.log(`start webpack.config.js transformation`);
    addWebpackCustomLoader();
};

const copyCustomScripts = () => {
    copyFile(`${project_dir}${project_folder_with_js_source_files}scripts/`, `${project_dir}${project_name}/scripts/`, 'build_scss.zsh' );

    console.log(`build_scss.zsh have copied`);
    console.log(`start copy the Git folder`);
    copyCustomWebPackLoaderFile();
};

const copyProjectFiles = () => {
    copy_project_dirs.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_js_source_files}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));
    });

    console.log(`Project files have copied`);
    console.log(`start copy custom scripts`);
    copyCustomScripts();
};

const removeJestLinks = () => {

    let file = fileFrom(dirFrom(`${project_dir}${project_name}`, 'node_modules/@react-native-community/eslint-config/'), 'index.js');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        file_buffer = file_buffer.replace(/(['"`]*jest)/gi, (match, line) => {
            return '// ' + line;
        });

        fs.writeFileSync(file, file_buffer);
    }
    copyProjectFiles();
};

const addPrettierCustomSettings = () => {
    const tab = '  ';
    const add_lines = [
        `,\n${tab}"eslintConfig": {`,
        `${tab}${tab}"root": true,`,
        `${tab}${tab}"extends": "@react-native-community"`,
        `${tab}},`,
        `${tab}"prettier": {`,
        `${tab}${tab}"bracketSpacing": true,`,
        `${tab}${tab}"jsxBracketSameLine": true,`,
        `${tab}${tab}"singleQuote": true,`,
        `${tab}${tab}"trailingComma": "all",`,
        `${tab}${tab}"tabWidth": 4,`,
        `${tab}${tab}"proseWrap": "never",`,
        `${tab}${tab}"printWidth": 120,`,
        `${tab}${tab}"arrowParens": "always"`,
        `${tab}}`,
    ];

    let file = fileFrom(dirFrom(project_dir, project_name), 'package.json');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        file_buffer = file_buffer.replace(/['"`]eslintConfig.+?}[,]\n*/gsi, '');
        file_buffer = file_buffer.replace(/(})(\s+})/gi, (match, p1, p2) => {
            return p1 + add_lines.join('\n') + p2;
        });

        fs.writeFileSync(file, file_buffer);
    }

    console.log(`custom setting for prettier has added`);
    console.log(`start coping project files`);
    removeJestLinks();
};

const copyNativePrettierFiles = () => {
    copy_prettier_dirs.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${tools_folder}${project_folder_with_prettier}`, dir_name),
            dirTo(`${project_dir}${project_name}/node_modules`, dir_name));
    });

    console.log(`Prettier files have copied`);
    console.log(`Start to creacte custom prettier settings`);
    addPrettierCustomSettings();
};

const runYarnUpgrade = () => {
    const process = spawn('yarn', ['upgrade'], { cwd: dirTo(project_dir, project_name) });
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`yarnUpgrade process exited with code ${code}`);
        if (!code) {
            console.log(`copy react_native prettier settings`);
            copyNativePrettierFiles();
        }
    });
}

let module_index = 0;
const addYarnIndividualModules = () => {
    const add = ['add', '--dev',];
    add.push(yarn_individual_modules[module_index]);

    const process = spawn('yarn', add, { cwd: dirTo(project_dir, project_name) });
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`yarn has added individual module ${yarn_individual_modules[module_index]}`);
            module_index++;
            if (yarn_individual_modules.length && yarn_individual_modules.length < module_index) {
                console.log(`installing next module`);
                addYarnIndividualModules();
            } else {
                console.log(`run yarn upgrade`);
                // copyNativePrettierFiles();
                runYarnUpgrade();
            }
        }
        else {
            console.log(`Process addYarnModules exited with code ${code}`);
        }
    });
}

const addYarnModules = () => {

    const process = spawn('yarn', ['add',].concat(yarn_modules), { cwd: dirTo(project_dir, project_name) });
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`yarn has added main modules`);
            console.log(`gooing to install individual yarn modules`);
            addYarnIndividualModules();
            // copyNativePrettierFiles();
        }
        else {
            console.log(`Process addYarnModules exited with code ${code}`);
        }
    });
};

const yarnEject = () => {

    const process = spawn('yarn', ['eject', 'yes'], { cwd: dirTo(project_dir, project_name) });
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        if (data.includes('y/N')) {
            process.stdin.setEncoding('utf-8');
            process.stdin.write('yes\n');
        } else if (data.includes('http://goo.gl/forms/Bi6CZjk1EqsdelXk1')) {
            addYarnModules();
        }
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`yarn was successfully ejected`);
            console.log(`Start to install yarn modules`);
            addYarnModules();
        }
        else {
            console.log(`Process addYarnModules exited with code ${code}`);
        }
    });
};

const reactJSProjectInit = () => {

    const process = spawn('npx', ['create-react-app', project_name_js], {cwd: project_dir});

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Process creating React JS project exited with code ${code}`);
        if (!code) {
            console.log(`start ejecting settings`);
            yarnEject();
        }
    });
};

const brewUpgrade = () => {
    const process = spawn('brew', ['upgrade']);
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`brewUpgrade process exited with code ${code}`);
        if (!code) {
            reactJSProjectInit();
        }
    });
};

const startCreatingProject = () => {
    brewUpgrade();
};

startCreatingProject();
