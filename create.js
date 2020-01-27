const fs = require('fs');
const { spawn } = require('child_process');
const { startAppWebToNativeApp } = require('./transform');
const { fileFrom, dirFrom, dirTo, copyFile, copyFilesFromDirectory } = require('./helpers');
const { project_name, project_dir, project_folder_with_tools, } = require('./constants');

// const project_name = 'AwesomeProject';
// const project_dir = '/Users/admin/PycharmProjects/';
// const project_folder_with_tools = 'insarmApp/';

const copy_platform_dirs = ['platformTransforms', 'fonts', 'containers', 'elements', 'img'];

const yarn_modules = [
    'axios',
    'redux',
    'react-redux',
    '@reduxjs/toolkit',
    'react-native-svg',
    'react-native-svg-transformer',
    'react-navigation',
    '@react-navigation/native@next',
    '@react-navigation/native-stack@next',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'react-native-screens',
    'react-native-safe-area-context',
    '@react-native-community/masked-view',
];

const addPrettierCustomSettings = () => {
    const tab = '  ';
    const add_lines = [
        `,\n${tab}"prettier": {`,
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

        file_buffer = file_buffer.replace(/(})(\s+})/gi, (match, p1, p2) => {
            return p1 + add_lines.join('\n') + p2;
        });

        fs.writeFileSync(file, file_buffer);
    }

    console.log(`custom setting for prettier has added`);
    console.log(`\nThat's it!`);
};

const registerFontAssetFile = () => {
    const add_lines = [
        '/**',
        ' * Add fonts directory for React Native',
        ' *',
        ' * @format',
        ' */\n\n',
        'module.exports = {',
        '    assets: [\'./fonts\'],',
        '};\n',
    ];
    let file = fileFrom(dirFrom(project_dir, project_name), 'react-native.config.js');
    fs.writeFileSync(file, add_lines.join('\n'));
    const process = spawn('react-native', ['link',], { cwd: dirTo(project_dir, project_name) });

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`custom font directory has registered`);
            addPrettierCustomSettings();
        }
        else {
            console.log(`Process registerFontAssetFile exited with code ${code}`);
        }
    });
};

const addReactNavigationDependencies = () => {
    // https://reactnavigation.org/docs/en/next/getting-started.html
    // To finalize installation of react-native-screens for Android,
    // add the following two lines to dependencies section in android/app/build.gradle:
    let file = fileFrom(dirFrom(`${project_dir}${project_name}`, 'android/app/'), 'build.gradle');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {

        file_buffer = file_buffer.replace(/(dependencies\s+)\{(\s+)/gi, (match, p1, spaces) => {
            const add_lines = [
                'implementation \'androidx.appcompat:appcompat:1.1.0-rc01\'',
                'implementation \'androidx.appcompat:appcompat:1.1.0-rc01\'',
            ];
            return p1 + spaces + add_lines.join(spaces);
        });

        fs.writeFileSync(file, file_buffer);
    }
    // To finalize installation of react-native-gesture-handler for Android,
    // make the following modifications to MainActivity.java:
    file = fileFrom(dirFrom(`${project_dir}${project_name}`,`android/app/src/main/java/com/${project_name.toLowerCase()}`), 'MainActivity.java');
    file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {

        file_buffer = file_buffer.replace(/(ReactActivity;)/gi, (match, p1) => {
            const add_lines = [
                'import com.facebook.react.ReactActivityDelegate;',
                'import com.facebook.react.ReactRootView;',
                'import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;',
            ];
            return p1 + '\n' + add_lines.join('\n');
        });

        const regexp = new RegExp(`(\\W${project_name}\\W;\\s+})`, 'g');
        file_buffer = file_buffer.replace(regexp, (match, p1) => {
            const tab = '  ';
            const add_lines = [
                `${tab}@Override`,
                `${tab}protected ReactActivityDelegate createReactActivityDelegate() {`,
                `${tab}${tab}return new ReactActivityDelegate(this, getMainComponentName()) {`,
                `${tab}${tab}${tab}@Override`,
                `${tab}${tab}${tab}protected ReactRootView createRootView() {`,
                `${tab}${tab}${tab}${tab}return new RNGestureHandlerEnabledRootView(MainActivity.this);`,
                `${tab}${tab}${tab}}`,
                `${tab}${tab}};`,
                `${tab}}`,
            ];
            return p1 + '\n\n' + add_lines.join('\n');
        });

        fs.writeFileSync(file, file_buffer);
    }
    console.log(`React Navigation has added`);
    startAppWebToNativeApp();
    registerFontAssetFile();
};

const copyPlatformTools = () => {
    copy_platform_dirs.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_tools}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));
    });

    if (fs.existsSync(fileFrom(`${project_dir}${project_name}`, 'metro.config.js'))) {
        fs.unlinkSync(fileFrom(`${project_dir}${project_name}`, 'metro.config.js'));
        console.log(`default metro.config.js was deleted`);
    }
    copyFile(`${project_dir}${project_folder_with_tools}`, `${project_dir}${project_name}`, 'metro.config.js' );

    console.log(`copyPlatformTools have copied`);
    addReactNavigationDependencies();
};

const podInstall = () => {
    const process = spawn('pod', ['install',], { cwd: dirTo(dirTo(project_dir, project_name), 'ios') });

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (!code) {
            console.log(`all pods have installed`);
            copyPlatformTools();
        }
        else {
            console.log(`Process podInstall exited with code ${code}`);
        }
    });
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
            console.log(`call pod install`);
            podInstall();
        }
        else {
            console.log(`Process addYarnModules exited with code ${code}`);
        }
    });
};

const reactNativeProjectInit = () => {

    const process = spawn('npx', ['react-native', 'init', project_name], {cwd: project_dir});

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Process creating React Native project exited with code ${code}`);
        if (!code) {
            console.log(`copy project directory from temp to destination`);
            addYarnModules();
            // copyCreatedProjectToDestination();
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
            reactNativeProjectInit();
        }
    });
};

const startCreatingProject = () => {
    brewUpgrade();
};

startCreatingProject();
