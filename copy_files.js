const fs = require('fs');

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

const directories = ['helpers', 'settings', 'reducers', 'apps', 'components', 'urls', 'requirements'];

const copyFilesFromDir = () => {
};

