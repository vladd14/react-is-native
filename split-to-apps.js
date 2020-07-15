const fs = require('fs');
const { spawn } = require('child_process');
const { startAppWebToNativeApp } = require('./transformations');
const { fileFrom, dirFrom, dirTo, copyFile, copyFilesFromDirectory, deleteFolder, copyFilesFromDirectoryWithChangeName } = require('./helpers');
const {
    project_name,
    project_name_js,
    project_dir,
    project_folder_with_tools,
    project_folder_with_native_settings,
    react_native_apps_names,
    tools_folder,
} = require('./constants');

// const react_native_apps_names = ['vladilen'];

const copyWebStormProjectSettings = (app_name) => {
    const copy_files = [
        '.gitignore',
    ];
    const copy_folders = [
        '.git',
    ];

    copy_files.forEach((file_name) => {
        if (fs.existsSync(fileFrom(`${project_dir}${tools_folder}/${app_name}`, file_name))) {
            copyFile(`${project_dir}${tools_folder}/${app_name}`, `${project_dir}${app_name}`, file_name );
        } else {
            console.warn(`file ${file_name} doesn't exit in directory ${project_dir}${project_folder_with_tools}`);
        }
    });

    copy_folders.forEach((dir_name) => {
        if (fs.existsSync(dirFrom(`${project_dir}${tools_folder}/${app_name}`, dir_name)) && fs.lstatSync(dirFrom(`${project_dir}${tools_folder}/${app_name}`, dir_name)).isDirectory()) {
            copyFilesFromDirectory(
                dirFrom(`${project_dir}${tools_folder}/${app_name}`, dir_name),
                dirTo(`${project_dir}${app_name}`, dir_name)
            );
        } else {
            console.warn(`directory ${dirFrom(`${project_dir}${tools_folder}/${app_name}`, dir_name)} doesn't exist`);
        }
    });

    console.log(`WebStorm settings have copied`);
};

const changeNamesProjectSettings = (app_name, react_app_path) => {
    let file = fileFrom(dirFrom(project_dir, react_app_path), '/settings/index.js');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        file_buffer = file_buffer.replace(/(project_name\s*=\s*['"`])(.+?)(["'`])/g, (match, p1, p2, p3) => {
            return p1 + app_name + p3;
        });
        file_buffer = file_buffer.replace(/("displayName":\s+")(.+?)(")/g, (match, p1, p2, p3) => {
            return p1 + app_name + p3;
        });

        fs.writeFileSync(file, file_buffer);
    }
}

const changeNamesInAppJSON = (app_name) => {
    let file = fileFrom(dirFrom(project_dir, app_name), 'app.json');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        file_buffer = file_buffer.replace(/("name":\s+")(.+?)(")/g, (match, p1, p2, p3) => {
            return p1 + app_name + p3;
        });
        file_buffer = file_buffer.replace(/("displayName":\s+")(.+?)(")/g, (match, p1, p2, p3) => {
            return p1 + app_name + p3;
        });

        fs.writeFileSync(file, file_buffer);
    }
}

const changeNameInPackageJSON = (app_name) => {
    let file = fileFrom(dirFrom(project_dir, app_name), 'package.json');
    let file_buffer = fs.readFileSync(file, 'utf-8');
    if (file_buffer) {
        file_buffer = file_buffer.replace(/("name":\s+")(.+?)(")/g, (match, p1, p2, p3) => {
            return p1 + app_name + p3;
        });

        fs.writeFileSync(file, file_buffer);
    }
}

const startAppsSplitting = () => {
    react_native_apps_names.forEach((app_name) => {

        if (fs.existsSync(fileFrom(`${project_dir}`, app_name.project_name))) {
            deleteFolder(dirTo(`${project_dir}`, app_name.project_name));
        }

        copyFilesFromDirectory(
            dirFrom(`${project_dir}`, project_name_js),
            dirTo(`${project_dir}`, app_name.project_name),
            ['.git', '.gitignore'],
        );

        //changing project names in project settings,
        console.log('start changeNameInPackageJSON');
        changeNameInPackageJSON(app_name.project_name);
        console.log('start changeNamesInProjectSettings');
        changeNamesProjectSettings(app_name.project_name, `${app_name.project_name}/src/`);
        console.log('start git settings copy');
        copyWebStormProjectSettings(app_name.project_name);

        // doing native copy and transforms
        if (fs.existsSync(fileFrom(`${project_dir}`, app_name.react_native_app_name))) {
            deleteFolder(dirTo(`${project_dir}`, app_name.react_native_app_name));
        }

        copyFilesFromDirectoryWithChangeName(
            dirFrom(`${project_dir}`, project_name),
            dirTo(`${project_dir}`, app_name.react_native_app_name),
            { name: project_name, change_name: app_name.react_native_app_name },
            'ios',
            ['.git', '.gitignore'],
        );

        console.log('here we going with transformation functions');

        if (fs.existsSync(fileFrom(`${project_dir}${app_name.react_native_app_name}/ios/`, app_name.react_native_app_name))) {
            deleteFolder(dirTo(`${project_dir}${app_name.react_native_app_name}/ios/`, app_name.react_native_app_name));
        }
        copyFilesFromDirectory(
            dirFrom(`${project_dir}${project_folder_with_native_settings}/ios/`, app_name.react_native_app_name),
            dirTo(`${project_dir}${app_name.react_native_app_name}`, '/ios/')
        );

        //changing project names in project settings,
        console.log('start changeNameInPackageJSON');
        changeNameInPackageJSON(app_name.react_native_app_name);
        console.log('start changeNamesInAppJSON');
        changeNamesInAppJSON(app_name.react_native_app_name);
        console.log('start changeNamesInProjectSettings');
        changeNamesProjectSettings(app_name.project_name, app_name.react_native_app_name);
        console.log('start git settings copy');
        copyWebStormProjectSettings(app_name.react_native_app_name);

        console.log('start pod install in created project');
        const process = spawn('pod', ['install',], { cwd: dirTo(dirTo(project_dir, app_name.react_native_app_name), 'ios') });

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            if (!code) {
                console.log(`all pods have installed`);
            }
            else {
                console.log(`Process podInstall exited with code ${code}`);
            }
        });
    });

    console.log(`Project was split to custom apps`);
    console.log(`\nThat's it!`);
}

startAppsSplitting();

module.exports = {
    startAppsSplitting,
};
