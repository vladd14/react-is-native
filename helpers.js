const fs = require('fs');

const makeStringTitled = (str) => {
    return str && typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};

const fileFrom = (from, filename) => {
    // return from + filename;
    from = from.endsWith('/') ? from + filename : from + '/' + filename;
    return from.replace(/\/\//gi, '/');
};

const fileTo = (to, filename) => {
    // return to + filename;
    to = to.endsWith('/') ? to + filename : to + '/' + filename;
    return to.replace(/\/\//gi, '/');
};

const dirFrom = (path_from, dirname) => {
    let dir = path_from.endsWith('/') ? path_from + dirname : path_from + '/' + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir.replace(/\/\//gi, '/');
};

const dirTo = (path_to, dirname) => {
    let dir = path_to.endsWith('/') ? path_to + dirname : path_to + '/' + dirname;
    if (dir && !dir.endsWith('/')) {
        dir += '/';
    }
    return dir.replace(/\/\//gi, '/');
};

const deleteFile = (path) => {
    if (fs.existsSync(path) && !fs.lstatSync(path).isDirectory()) {
        fs.unlinkSync(path);
    }
}

const deleteFolder = (path) => {
    // const files_in_dir = fs.readdirSync(path, { withFileTypes: true, });
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        const files_in_dest_folder = fs.readdirSync(path, { withFileTypes: true, });
        files_in_dest_folder.forEach((dest_file) => {
            if (!dest_file.isDirectory()) {
                fs.unlinkSync(fileTo(path, dest_file.name));
            } else {
                deleteFolder(fileTo(path, dest_file.name));
            }
        });
    } else if (fs.existsSync(path) && !fs.lstatSync(path).isDirectory()) {
        fs.unlinkSync(path);
    }
    if (fs.existsSync(path)) {
        fs.rmdirSync(path);
    }
}

// const copyFileByStream = (path_from, path_to, file_name, options) => {
//     if (!fs.existsSync(path_to)) {
//         fs.mkdirSync(path_to, { recursive: true });
//     }
//     const file_from = fileFrom(path_from, file_name);
//     const file_to = fileTo(path_to, file_name);
//     let fileBuffer = fs.readFileSync(fileFrom(path_from, file_name), options);
//     if (fileBuffer) {
//         fs.writeFileSync(fileTo(path_to, file_name), fileBuffer,);
//     }
// };

// const copyFilesFromDirectoryByStream = (path_from, path_to) => {
//     if (fs.existsSync(path_from) && fs.lstatSync(path_from).isDirectory()) {
//         const files_in_dir = fs.readdirSync(path_from, {withFileTypes: true,});
//         files_in_dir.forEach((file_in_folder) => {
//             if (!file_in_folder.isDirectory()) {
//                 copyFileByStream(path_from, path_to, file_in_folder.name);
//             } else {
//                 copyFilesFromDirectoryByStream(dirFrom(path_from, file_in_folder.name), dirTo(path_to, file_in_folder.name));
//             }
//         });
//     } else if (fs.existsSync(path_from) && !fs.lstatSync(path_from).isDirectory()) {
//         copyFileSimple(path_from, path_to);
//     }
// };

const copyFileSimple = (path_from, path_to) => {
    if (!fs.existsSync(path_to)) {
        fs.mkdirSync(path_to, { recursive: true });
    }
    // const file_from = fileFrom(path_from, file_name);
    // const file_to = fileTo(path_to, file_name);
    fs.copyFileSync(path_from, path_to);
    console.log(`file ${path_from} copied to ${path_to}`);
};

const copyFile = (path_from, path_to, file_name,) => {
    if (!fs.existsSync(path_to)) {
        fs.mkdirSync(path_to, { recursive: true });
    }
    // if (!fs.existsSync(fileTo(path_to, file_name))) {
    //     fs.unlinkSync(fileTo(path_to, file_name));
    // }
    const file_from = fileFrom(path_from, file_name);
    const file_to = fileTo(path_to, file_name);
    fs.copyFileSync(file_from, file_to);
    console.log(`file ${file_from} copied to ${file_to}`);
};

const pathIncludesExcepts = (path, excepts) => {
    if (path && excepts && Array.isArray(excepts) && excepts.length) {
        return excepts.reduce((accumulator, item) => {
            accumulator += path.includes(item) ? 1 : 0;
            return accumulator;
        }, 0);
    }
    return false;
}

const copyFilesFromDirectory = (path_from, path_to, excepts) => {
    const files_in_dir = fs.readdirSync(path_from, { withFileTypes: true, });
    files_in_dir.forEach((file_in_folder) => {
        if (!file_in_folder.isDirectory() && (!excepts || (excepts && !excepts.includes(file_in_folder.name) && !pathIncludesExcepts(path_from, excepts)))) {
            copyFile(path_from, path_to, file_in_folder.name);
        } else {
            if (!excepts || (excepts && !excepts.includes(file_in_folder.name) && !pathIncludesExcepts(path_from, excepts))) {
                copyFilesFromDirectory(dirFrom(path_from, file_in_folder.name), dirTo(path_to, file_in_folder.name), excepts);
            }
        }
    });
};

const copyFileWithChangeBody = (path_from, path_to, file_name, change_body, path_includes) => {
    if (!fs.existsSync(path_to)) {
        fs.mkdirSync(path_to, { recursive: true });
    }
    let file_name_to = file_name;
    if (file_name.includes(change_body.name)) {
        const regexp = new RegExp(change_body.name, 'g');
        file_name_to = file_name_to.replace(regexp, change_body.change_name);
    }
    const file_from = fileFrom(path_from, file_name);
    const file_to = fileTo(path_to, file_name_to);

    let fileBuffer = fs.readFileSync(file_from, 'utf-8');
    if (fileBuffer.includes(change_body.name) && (!path_includes || path_from.includes(path_includes))) {
        const regexp = new RegExp(change_body.name, 'g');
        fileBuffer = fileBuffer.replace(regexp, change_body.change_name);
        fs.writeFileSync(file_to, fileBuffer,);
        console.log(`file ${file_from} was transformed and copied to ${file_to}`);
    } else {
        fs.copyFileSync(file_from, file_to);
        console.log(`file ${file_from} copied to ${file_to}`);
    }
};

const copyFilesFromDirectoryWithChangeName = (path_from, path_to, change_name, path_includes, excepts) => {
    if (path_from.includes(change_name.name) && (!path_includes || path_from.includes(path_includes))) {
        const regexp = new RegExp(change_name.name, 'g');
        path_to = path_to.replace(regexp, change_name.change_name);
    }
    const files_in_dir = fs.readdirSync(path_from, { withFileTypes: true, });
    files_in_dir.forEach((file_in_folder) => {
        if (!file_in_folder.isDirectory() && (!excepts || (excepts && !excepts.includes(file_in_folder.name) && !pathIncludesExcepts(path_from, excepts)))) {
            copyFileWithChangeBody(path_from, path_to, file_in_folder.name, change_name, path_includes);
        } else {
            if (!excepts || (excepts && !excepts.includes(file_in_folder.name) && !pathIncludesExcepts(path_from, excepts))) {
                copyFilesFromDirectoryWithChangeName(
                    dirFrom(path_from, file_in_folder.name),
                    dirTo(path_to, file_in_folder.name),
                    change_name,
                    path_includes,
                    excepts,
                );
            }
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
    copyFilesFromDirectory,
    // copyFileByStream,
    // copyFilesFromDirectoryByStream,
    deleteFolder,
    copyFilesFromDirectoryWithChangeName,
    copyFileSimple,
    deleteFile,
};
