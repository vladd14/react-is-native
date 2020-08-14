const fs = require('fs');
const { spawn } = require('child_process');
// const { startAppWebToNativeApp } = require('./transform');
const { fileFrom, dirFrom, dirTo, copyFile, copyFilesFromDirectory, copyFileByStream, copyFilesFromDirectoryByStream, deleteFolder } = require('./helpers');
const { project_name_js, project_folder_with_prettier, project_dir, project_folder_with_js_source_files, tools_folder, project_folder_with_tools, } = require('./constants');

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
    'react-router-dom',
    'prettier',
    'moment@2.24.0',
    'moment-timezone',
    'react-datetime',
    'modify-source-webpack-plugin',
];

// const copyGitDirStream = () => {
//     const copy_folders = [
//         '.git',
//     ];
//     copy_folders.forEach((dir_name) => {
//         copyFilesFromDirectoryByStream(
//             dirFrom(`${project_dir}${project_folder_with_js_source_files}`, dir_name),
//             dirTo(`${project_dir}${project_name}`, dir_name));
//     });
//     console.log(`.Git settings have copied`);
//     console.log(`\nThat's it!`);
// }

const copyWebStormProjectSettings = () => {
    const copy_files = [
        '.gitattributes',
    //     '.gitignore',
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

const copyCustomScripts = () => {
    copyFile(`${project_dir}${project_folder_with_js_source_files}scripts/`, `${project_dir}${project_name}/scripts/`, 'build_scss.zsh' );

    console.log(`build_scss.zsh have copied`);
    console.log(`start copy the Git folder`);
    copyGitDirStream();
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
            console.log(`yarn has added modules`);
            console.log(`copy react_native prettier settings`);
            copyNativePrettierFiles();
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
        }
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`yarn was successfully ejected`);
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
