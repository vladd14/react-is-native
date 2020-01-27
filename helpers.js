const fs = require('fs');

const makeStringTitled = (str) => {
    return str && typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};

const fileFrom = (from, filename) => {
    // return from + filename;
    return from.endsWith('/') ? from + filename : from + '/' + filename;
};

const fileTo = (to, filename) => {
    // return to + filename;
    return to.endsWith('/') ? to + filename : to + '/' + filename;
};

const dirFrom = (path_from, dirname) => {
    let dir = path_from.endsWith('/') ? path_from + dirname : path_from + '/' + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir
};

const dirTo = (path_to, dirname) => {
    let dir = path_to.endsWith('/') ? path_to + dirname : path_to + '/' + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir
};

const copyFile = (path_from, path_to, file_name,) => {
    if (!fs.existsSync(path_to)) {
        fs.mkdirSync(path_to, { recursive: true });
    }
    const file_from = fileFrom(path_from, file_name);
    const file_to = fileTo(path_to, file_name);
    fs.copyFileSync(file_from, file_to);
    console.log(`file ${file_from} copied to ${file_to}`);
};

const copyFilesFromDirectory = (path_from, path_to) => {
    const files_in_dir = fs.readdirSync(path_from, { withFileTypes: true, });
    files_in_dir.forEach((file_in_folder) => {

        if (!file_in_folder.isDirectory()) {
            copyFile(path_from, path_to, file_in_folder.name);
        } else {
            copyFilesFromDirectory(dirFrom(path_from, file_in_folder.name), dirTo(path_to, file_in_folder.name));
        }
    });
};

module.exports = {
    makeStringTitled,
    fileFrom,
    fileTo,
    dirFrom,
    dirTo,
    copyFile,
    copyFilesFromDirectory
};
