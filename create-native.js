const fs = require('fs');
const { spawn } = require('child_process');
const { startAppWebToNativeApp } = require('./transformations');
const { fileFrom, fileTo, dirFrom, dirTo, copyFile, copyFilesFromDirectory, deleteFolder, copyFileSimple, deleteFile } = require('./helpers');
const {
    project_name,
    project_dir,
    project_folder_with_tools,
    project_folder_with_native_settings,
    react_native_apps_names,
} = require('./constants');

const copy_platform_dirs = ['platformTransforms', 'fonts', 'containers', 'elements', 'img'];

const yarn_modules = [
    'axios',
    'redux',
    'react-redux',
    '@reduxjs/toolkit',
    'react-native-svg',
    'react-native-svg-transformer',
    '@react-navigation/native',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'react-native-screens',
    'react-native-safe-area-context',
    'react-native-image-picker',
    '@react-native-community/masked-view',
    '@react-native-community/async-storage',
    '@react-native-community/picker',
    '@react-native-community/datetimepicker',
    'moment@2.24.0',
    'moment-timezone',
    'patch-package',
];

const iOSCopyIconAndLoadingScreen = () => {
    const copy_folders = [
        project_name,
        'insarmApp.xcodeproj',
        'insarmApp.xcworkspace',
    ];
    copy_folders.forEach((dir_name) => {
        deleteFolder(dirTo(`${project_dir}${project_name}/ios/`, dir_name));
    });

    copy_folders.splice(1, 2);

    copy_folders.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_native_settings}/ios/`, dir_name),
            dirTo(`${project_dir}${project_name}`, '/ios/'));
    });

    console.log(`iOS settings have been transfer`);

    // if (react_native_apps_names && react_native_apps_names.length) {
    //     // console.log('start splitting react native custom apps');
    //     // startAppsSplitting();
    //     console.log(`\nThat's it!`);
    // } else {
    //     console.log(`\nThat's it!`);
    // }
}

const copyWebStormProjectSettings = () => {
    const copy_files = [
        '.gitattributes',
        '.gitignore',
    ];
    const copy_folders = [
        '.git',
        '.idea',
    ];

    copy_files.forEach((file_name) => {
        if (fs.existsSync(fileFrom(`${project_dir}${project_folder_with_tools}`, file_name))) {
            copyFile(`${project_dir}${project_folder_with_tools}`, `${project_dir}${project_name}`, file_name );
        } else {
            console.warn(`file ${file_name} doesn't exit in directory ${project_dir}${project_folder_with_tools}`);
        }
    });

    copy_folders.forEach((dir_name) => {
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_tools}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));
    });

    console.log(`WebStorm settings have copied`);
    iOSCopyIconAndLoadingScreen();
};
let patches_exist = false;
const addPatchesToPackageJSON = () => {
    const tab = '  ';
    const add_lines = [
        `,\n${tab}${tab}"postinstall": "patch-package"`,
    ];
    let file = fileFrom(dirFrom(project_dir, project_name), 'package.json');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {

        file_buffer = file_buffer.replace(/("scripts":\s+\{)(.+?)(\s+})/gsi, (match, p1, p2, p3) => {
            return p1 + p2 + add_lines.join('\n') + p3;
        });

        fs.writeFileSync(file, file_buffer);
    }
}
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
            copyWebStormProjectSettings();
        }
        else {
            console.log(`Process registerFontAssetFile exited with code ${code}`);
        }
    });
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

        file_buffer = file_buffer.replace(/(})(\s+})/gi, (match, p1, p2) => {
            return p1 + add_lines.join('\n') + p2;
        });

        fs.writeFileSync(file, file_buffer);
    }

    console.log(`custom setting for prettier has added`);
    if (patches_exist) {
        addPatchesToPackageJSON();
    }
    // callback for successfully finish prettier process which while ends doesn't come here.
    // There for I pass callback which triggers when prettier done.
    const callback = registerFontAssetFile;
    startAppWebToNativeApp(callback);
};

const changeBundleToRam = () => {
    let file = fileFrom(dirFrom(`${project_dir}${project_name}`, 'node_modules/react-native/scripts/'), 'react-native-xcode.sh');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        //BUNDLE_COMMAND="bundle"
        file_buffer = file_buffer.replace(/(BUNDLE_COMMAND=["'`])(bundle)(["'`])/gi, (match, str_pre, bundle, str_after) => {
            return str_pre + 'ram-' + bundle + str_after;
        });
        fs.writeFileSync(file, file_buffer);
    }
    console.log(`type of bundle has changed`);
    addPrettierCustomSettings();
    // startAppWebToNativeApp();
    // registerFontAssetFile();
}

const addReactNavigationDependencies = () => {
    // it seems like that's not need anymore
    return changeBundleToRam();

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
    console.log(`start change bundle type to ram-bundle`);
    changeBundleToRam();
};

const copyPatches = () => {
    const dir_name = 'patches';
    patches_exist = false;
    if (fs.existsSync(fileFrom(`${project_dir}${project_folder_with_tools}`, dir_name))) {
        patches_exist = true;
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_tools}`, dir_name),
            dirTo(`${project_dir}${project_name}`, dir_name));

        const process = spawn('yarn', ['install'], { cwd: dirTo(project_dir, project_name) });
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            if (!code) {
                console.log(`yarn has installed patches`);
                // if was installed patches and all thing good then go father
                return addReactNavigationDependencies();
            }
            else {
                console.log(`Process install patches exited with code ${code}`);
            }
        });
    } else {
        addReactNavigationDependencies();
    }
}

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
    copyPatches();
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
