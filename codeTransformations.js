const { space_symbol, tab_symbol, } = require('./constants');
const {remove_blank_lines_regexp, function_flow_string} = require('./regexps');
const {cutImport, insertImport, cutImportAndGetArray, addImportLine, addImportArray, initImports} = require('./imports');

// const remove_blank_lines_regexp = /^\n+/mig; //Clean file of blanks lines
// const takeImportLineRegexp =  /(^\s*import\s*\w*\W*[^;]*;)/mig; //Get imports lines;

const flowTag = `/**
 * @format
 * @flow
 */
`;
// const remove_blank_lines_regexp = /^\n+/mig; //Clean file of blanks lines
// const takeImportLineRegexp =  /(^\s*import\s*\w*\W*[^;]*;)/mig; //Get imports lines;

const exportConnectionTransform = (str) => {
    if (str) {
        let str_change ='withNavigation(';
        let regExp = /withRouter\((?=\s*connect)/mig;
        str = str.replace(regExp, 'withNavigation(');
    }
    return str;
};

const importNotRequired = (str, replace_string) => {
    if (str) {
        // const regExp = /import\s+{(\s+\w+\D\s+)+}\s+from\s+'react-router-dom';/mig;
        const regExp = /import\s+{(\s+\w+\W*)+(}\s*from\s+'react-router-dom';)/mig;
        // str = str.replace(regExp, 'import { withNavigation } from \'react-navigation\';');
        str = str.replace(regExp, replace_string);
    }
    return str;
};

const historyToNavigationTransform = (str) => {

    const replacer = (match, p1, p2, p3) => {
        // match
        // console.log('match=',match);
        // console.log('p1=',p1);
        // console.log('p2=',p2);
        // console.log('p3=',p3);
        return p1 + 'navigation' + p3;
    };

    if (str) {
        let str_change =', navigation,';
        let regExp = /(,\s*)(history)([,)])/mig;
        str = str.replace(regExp, replacer);
    }
    return str;
};

const removeFormTags = (str, tags_array) => {
    const replacer = (match, p1, p2) => {
        let arr = p1.split('\n');

        arr = arr.map((element) => { //removing excess tab;
            element = element.replace(/\s{4}/i,'');
            return element;
        });

        return arr.join('\n');

    };
    if (str && Array.isArray(tags_array) && tags_array.length) {
        let regExp;
        for (let a=0; a<tags_array.length; a++) {
            regExp = new RegExp(`<${tags_array[a]}>\\s*(\\s*<\\W*(\\w*\\s*\\W[^>]*>)+)(\\s*\\W*${tags_array[a]}>)`, 'mig');
            str = str.replace(regExp, replacer);
        }
    }
    return str;
};

const removeFunctionCall = (str, name) => {
    const replacer = (match, p1, p2) => {
        return '';
    };
    const regExp = new RegExp(`\\s*${name}\\((\\s*\\w*\\W[^)]*\\W[^;]*);`, 'mig');
    str = str.replace(regExp, replacer);

    return str;
};

const changeTagName = (str, name, attr_to_replace) => {
    // console.log(name);
    const replacer = (match, p1, p2) => {
        // console.log(match);

        Object.keys(attr_to_replace).forEach((key) => {
            match = match.replace(key, attr_to_replace[key]);
        });
        console.log(match);
        return match;
    };
    //<img className={''} src={avatar} alt={'Avatar'} />
    // const regExp = /<\s*(img)\s+(\s*(\w*)=\w*\W[^>]*)*\/>/mig;
    const regExp = new RegExp( `<\\s*(${name})\\s+(\\s*(\\w*)=\\w*\\W[^>]*)*\/>`, 'mig');

    str = str.replace(regExp, replacer);
    return str;
};

const SimplifyEmptyTags = (str) => {
    const replacer = (match, p1, p2) => {
        console.log(match);
        console.log('p1=', p1);
        console.log('p2=', p2);
        return `${p1} />`
    };
    str = str.replace(/(<\s*.[^/>]+)\s*>(<\/\s*.[^/>]+>)/gi, replacer);

    return str;
};

const addFlowTags = (str) => {

    const replacer = (match, p1) => {
        return p1 + ': () => React$Node';
    };

    if (str) {
        str = flowTag + str;
        const regExp = /(const\s+\w+)(?=\s*=\s*\({)/mig;
        str = str.replace(regExp, replacer);
    }
    return str;
};
const addScreenDimensionListener = (str) => {
    initImports();
    const dimension_listener = `if (!appState.screen_data) {
        Screen({ appState, userState, loginState, actions });
    }`;
    const import_line = `import { Screen } from '../platformTransforms';`;
    const replacer = (match, p1) => {
        // console.log(`match='${match}'`);
        match += dimension_listener + p1;
        return match;
    };

    if (str) {
        str = cutImport(str);
        const regExp = /const\s+PageHeader\s*=\s*\(.+\)\s*.+{(\s*)/ig;
        str = str.replace(regExp, replacer);
        // Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');
        addImportLine(import_line);
        str = insertImport(str);
    }
    // console.log(str);
    return str;
};
const addStatusBarHeight = (str) => {
    initImports();
    const dimension_listener = `if (!appState.status_bar_height) {
        const { StatusBarManager } = NativeModules;
        StatusBarManager.getHeight(({ height }) => actions.setStatusBarHeight(height));
    }`;
    const import_line = `import { NativeModules } from 'react-native';`;
    const replacer = (match, p1) => {
        // console.log(`match='${match}'`);
        match += dimension_listener + p1;
        return match;
    };

    if (str) {
        str = cutImport(str);
        const regExp = /const\s+PageHeader\s*=\s*\(.+\)\s*.+{(\s*)/ig;
        str = str.replace(regExp, replacer);
        // Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');
        addImportLine(import_line);
        str = insertImport(str);
    }
    // console.log(str);
    return str;
};
const changePlatform = (str) => {
    const replacer = (match, p1, p2, p3) => {
        return p1 + 'mobile' + p3;
    };
    const regExp = /(initialState:\s*{\s*platform:\s*')(\w+)('\s*,)/ig;
    str = str.replace(regExp, replacer);
    return str;
};

const replaceStyleAfterFlowFunction = (str) => {
    initImports();
    const importsArray = [
        'import { variables } from \'../styles/variables\';',
        'import { styles, styles_media, styles_modifiers } from \'../styles\';',
        'import { getStylesByBem, getStylesAtMediaByBem } from \'../helpers/helpers\';'
    ];
    const functionsArray = [
        'const style = getStylesByBem(className, styles);',
        'const style_at_media = getStylesAtMediaByBem(className, styles_media, variables, appState.screen_data.width);',
        'const style_modifiers = getStylesByBem(className, styles_modifiers);',
        'let merged_styles = { ...style, ...style_at_media, ...style_modifiers };',
    ];
    const replacer = (match, p1, p2, p3, p4) => {
        // console.log(`match='${match}'`);
        // console.log(`p1='${p1}'`);
        // console.log(`p3='${p3}'`);

        functionsArray[0] = p2 + functionsArray[0];
        const return_array = functionsArray.map((element) => {
            element = element.replace('className', p4);
            return element;
        });
        return p1 + return_array.join(p2);
    };
    const regExp = new RegExp(`(${function_flow_string})` + `(const|let|var)\\s+style\\w*\\W*\\s*=\\s*(.+);`, 'gim');
    if (str.search(regExp) !== -1) {
        str = cutImport(str);

        str = str.replace(regExp, replacer);
        str = str.replace(remove_blank_lines_regexp, '');
        importsArray.forEach((element) => {
            addImportLine(element);
        });
        str = insertImport(str);
    }
    return str;
};
const divTags = ['div', 'section', 'header', 'footer', 'li', 'ul', ];
const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'label'];
const inputsType = ['input'];
const withoutTypeTag = ['redirect', 'link', 'img', 'div'];
const platformTransforms = (str) => {
    initImports();
    let tokens = [];
    const tokenModify = (match, p1, p2, p3) => {
        // const divTags = ['li', 'ul', 'header', 'section', 'footer'];
        // const withoutTagType = ['redirect', 'link', 'img'];
        const type = p1 !== '</' && withoutTypeTag.indexOf(p2.toLowerCase()) === -1 ? ` tagType={'${p2}'}` : '';

        if (divTags.indexOf(p2.toLowerCase()) !== -1) {
            p2 = 'Div';
        } else if (textTags.indexOf(p2.toLowerCase()) !== -1) {
            p2 = 'TextTag'
        } else if (inputsType.indexOf(p2.toLowerCase()) !== -1) {
            p2 = 'Input'
        }
        p2 = p2.charAt(0).toUpperCase() + p2.slice(1);
        if (tokens.indexOf(p2) === (-1)) {
            tokens.push(p2);
        }
        return p1 + p2 + type;
    };

    const urlsReplace = (match, p1, p2) => {
        const name_import = 'appUrl';
        if (tokens.indexOf(name_import) === (-1)) {
            tokens.push(name_import);
        }
        return p1 + `${name_import}.get(${p2})`;
    };
    const textInputOnChange = (match, p1,p2,p3,p4) => {
        // console.log('match=', match);
        match = match.replace(/(onChange=\{)/mig, 'onChangeText={');
        // console.log(match);
        return match;
    };
    const changeHistoryToNavigate = (match, p1,p2,p3) => {
        // console.log(match);
        const name_import = 'appUrl';
        if (tokens.indexOf(name_import) === (-1)) {
            tokens.push(name_import);
        }
        return 'navigation.push(';
    };

    if (str) {
        // const htmlTokens = ['div', 'img', 'section', 'header', 'footer', 'li', 'redirect', 'link', 'h1', 'h2', 'h3',
        //     'span', 'p', 'li', 'ul', 'label'];
        const htmlTokens = divTags.concat(divTags, textTags, inputsType, withoutTypeTag);
        let regExp;
        htmlTokens.forEach((token) => {
            regExp = new RegExp(`(<|<\\/)(\\s*` + token + `)(?=(\\s+\\w*\\W[^>]*)|(\\s*>))`, 'mig');
            str = str.replace(regExp, tokenModify);
        });

        //str = str.replace(takeImportLineRegexp, addImport);
        str = cutImport(str);

        //change the urls path to functon that get name of App by it path;
        regExp = /(\s*)(urls.\w+.path)/mig;
        str = str.replace(regExp, urlsReplace);

        //return history.push(appUrl.get(urls.login.path));
        // regExp = /\s*(history.push\(\s*)(\w*\W[^)]*)(\s*\);)/mig;
        regExp = /(history.push\()/mig;
        str = str.replace(regExp, changeHistoryToNavigate);

        //history.location.pathname
        regExp = /(get\()*(history.location.pathname)/mig;
        // str = str.replace(regExp, 'navigation.state.routeName');
        str = str.replace(regExp, (match, p1, p2)=> {
            p2 = 'navigation.state.routeName';
            if (p1) {
                p2 = p1 + `appUrlReversed.get(${p2})`;
                if (tokens.indexOf('appUrlReversed') === (-1)) {
                    tokens.push('appUrlReversed');
                }
            }
            return p2
        });

        //change onClick with onPress;
        regExp = /(onClick={)/mig;
        str = str.replace(regExp, 'onPress={');
        //Change onKeyDown with onChangeText;
        regExp = /<SimpleCustomField\s*(\w*\W[^={\/]*)(\W[^{\/]*(\w*\W[^}\/]*})+)\s*\/>/mig;
        str = str.replace(regExp, textInputOnChange);

        //Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');
        if (tokens.length) {
            addImportLine('import { ' + tokens.join(', ') + ' } from \'../platformTransforms\';');
        }
        str = insertImport(str);
    }
    // console.log('str=', str);
    return str;
};
const stack_navigator_settings = [{
    setting: 'headerMode',
    param: `'none'`,
},];
const createRootStack = (apps) => {
    const createObjectStr = (key, value) => {
        let str = `${key}: ${value},`;
        return str
    };

    let str = `const RootStack = createStackNavigator(\n${tab_symbol}{`;
    Object.keys(apps).forEach((key) => {
        str += key !== 'initialRouteName'
            ? `\n${tab_symbol}${tab_symbol}` + createObjectStr(key, apps[key])
            : `\n${tab_symbol}},\n${tab_symbol}{\n${tab_symbol}${tab_symbol}` + createObjectStr(key, apps[key]);
    });

    stack_navigator_settings.forEach((item) => {
        str += `\n${tab_symbol}${tab_symbol}` + createObjectStr(item.setting, item.param) + `\n${tab_symbol}`
    });
    str += '},';

    str += '\n);';
    str += '\nlet Navigation = createAppContainer(RootStack);';

    return {
        text: str,
        imports: [
            'import { createAppContainer } from \'react-navigation\';',
            'import { createStackNavigator } from \'react-navigation-stack\';'
        ],
    }
};

const createAppJs = (str) => {
    initImports();
    let apps = {};
    const replacer = (match, p1) => {
        return p1 + ': () => React$Node';
    };
    const getAppsFromRoute = (match, p1, p2, p3, p4, p5) => {
        apps[p5.toLowerCase()] = p5;
        if (p5.toLowerCase() === 'main') { //Index
            apps['initialRouteName'] = `'${p5.toLowerCase()}'`;
        }
        return '';
    };
    const cleanNavigation = (match, p1, p2) => {
        p1 = p1.replace(/>/, ' \/>');
        return p1;
    };
    if (str) {

        let regExp = /(const\s*App)(?=\s*=\s*\()/mig;
        str = str.replace(regExp, replacer);

        str = importNotRequired(str,'');

        //`import './index.scss';`
        regExp = /(import\s+\W*)(index.scss';)/mig;
        str = str.replace(regExp, '');

        // let { text, imports } = cutImportAndGetArray(str);
        str = cutImport(str);

        // str = text;

        // regExp = /<Route\s+path='(\/\w*\W*)+'>\s*<(\w+)\/>\s*<\/Route>/mig;
        //<Route path={urls.login.path}>
        regExp = /<Route\s*path={((\w*)[.](\w*)[.](\w*\W*[^}])})+>\s*<(\w+)\/>\s*<\/Route>/mig;

        str = str.replace(regExp, getAppsFromRoute);

        regExp = /(<Navigation>)\s*(\W+\w+\W+\s*)+<\/Navigation>/mig;

        str = str.replace(regExp, cleanNavigation);

        // console.log(str);

        let { ...stackDependencies } = createRootStack(apps);
        str = stackDependencies.text + str;
        // imports = imports.concat(stackDependencies.imports);
        addImportArray(stackDependencies.imports);

        // str = imports.join('\n') +'\n\n' + str;
        str = insertImport(str);

        //Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');

        str = addFlowTags(str);
    }

    // console.log(str);
    return str;
};


module.exports = {
    exportConnectionTransform,
    importNotRequired,
    historyToNavigationTransform,
    removeFormTags,
    addFlowTags,
    platformTransforms,
    createAppJs,
    changePlatform,
    removeFunctionCall,
    changeTagName,
    addScreenDimensionListener,
    replaceStyleAfterFlowFunction,
    addStatusBarHeight,
    SimplifyEmptyTags,
};
