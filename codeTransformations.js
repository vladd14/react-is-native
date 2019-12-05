const { space_symbol, tab_symbol, flowTag, } = require('./constants');
const {remove_blank_lines_regexp, function_flow_string, default_function_string} = require('./regexps');
const {cutImport, insertImport, addImportLine, addImportArray, initImports} = require('./imports');

const exportConnectionTransform = (str) => {
    const replacer = (match, p1, p2, p3) => {
        // console.log(match);
        // console.log(p1);
        console.log(p2);

        p2 = p2.split('\n').map((item) => item.trim()).filter((item) => item).map((element, index, array ) => index && index < array.length -1 ? tab_symbol + element : element);

        p2 = p2.join('\n');
        if (p2.charAt(p2.length-1) === ',') {
            p2 = p2.slice(0, -1);
            p2 += ';'
        }
        console.log(p2);
        return p2;
    };
    if (str) {
        let regExp = /(withRouter\s*\(\s*)(.[^;]+)(\s*\));/gi;
        str = str.replace(regExp, replacer);

    }
    console.log(str);
    return str;
};

const checkReactRouterDomImports = (str) => {
    const replacer = (match, import_string, p1, module_name, from_str, from_module) => {
        if (module_name === 'deprecated withRouter') {
            module_name = 'withNavigation';
            from_module = 'react-navigation';
            return import_string + module_name + from_str + from_module + `';`;
        }
        return '';
    };
    if (str) {
        const regExp = /(import\s+{)(\s+(\w+)\W*)+(}\s*from\s+')(react-router-dom)';/mig;
        str = str.replace(regExp, replacer);
    }
    return str;
};

const historyToNavigationTransform = (str) => {

    const replacer = (match, p1, p2, p3) => {
        return p1 + 'navigation' + p3;
    };

    if (str) {
        let str_change =', navigation,';
        let regExp = /(,\s*)(history)([,)])/mig;
        str = str.replace(regExp, replacer);
    }
    return str;
};

const removeExcessTags = (str, tags_array) => {
    const replacer = (match, begins, p0, p1,) => {
        let arr = p1.split('\n');
        arr = arr.map((element) => { //removing excess tab;
            element = element.replace(/\s{4}/i,'');
            return element;
        });
        return arr.join('\n');
    };

    tags_array.forEach((element) => {
        const regExp = new RegExp(`(<\\s*${element}\\s*>)(\\s+)(<(\\w*\\s*.[^>]+>)+)\\s+(<\\s*\/\\s*${element}\\s*>)`, 'i');
        str = str.replace(regExp, replacer);
    });
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

const addStringsAfterFlowFunction = (str, functionName, additional_strings) => {
    const replacer = (match, p1) => {
        match += additional_strings + p1;
        return match;
    };
    const regExp = new RegExp(`const\\s+${functionName}:\\s*\\(\\s*\\)\\s*=>\\s*React\\$Node\\s*=\\s*\\(.*\\)\\s*.+{(\\s*)`, 'gi');
    str = str.replace(regExp, replacer);

    return str;
};

const addNavigationRoutePropIntoFlowFunction = (str) => {
    const replacer = (match, p1, p2, p3, p4) => {
        console.log('match', match);
        console.log('p1', p1);
        console.log('p2', p2);
        console.log('p3', p3);
        console.log('p3', p4);
        p2 = p2.replace(/history,/, 'navigation, route,');
        return p1 + p2 + p3 + p4;
    };

    // const regexp = new RegExp('(const\\s+\\w+\\s*=\\s*\\({)(.+)(}\\)\\s*.+{)(\\s*)', 'gi');
    const regexp = new RegExp(default_function_string, 'gi');
    str = str.replace(regexp, replacer);
    console.log(str);
    return str
};

const addScreenDimensionListener = (str, functionName) => {
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
        // const regExp = /const\s+PageHeader\s*=\s*\(.+\)\s*.+{(\s*)/ig;
        const regExp = new RegExp(`const\\s+${functionName}\\s*=\\s*\\(.+\\)\\s*.+{(\\s*)`, 'gi');
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
const WrapElementsFor = ['Input'];

const replaceHtmlForWithFocus = (str) => {
    initImports();
    const importsArray = [
        `import { useState } from 'react';`
    ];
    let useStateObject = {
        hook_name: 'References',
        hook_setter: 'addToReferences',
        hook_using: false,
    };
    const functionsArray = [
        `const [${useStateObject.hook_name}, ${useStateObject.hook_setter}] = useState({});`,
    ];
    let htmlForArray = [];
    const getHtmlForIds = (match, p1, p2) => {
        // p1 = p1.replace(/['"`]/ig, '');
        const replacer = `@@onFocus_${p1}_here@@`;
        const eventObject = {
            id: p1,
            replacer: replacer,
            eventString:'',
        };
        htmlForArray.push(eventObject);
        return match + replacer + p2;
    };
    str = cutImport(str);
    let regExp = /htmlFor=\{(.[^}]+)}(\s*)/mig;
    str = str.replace(regExp, getHtmlForIds);
    htmlForArray.forEach((element) => {
        regExp = new RegExp(`<(\\w+)(\\s*)(.[^>]+\\s+id=\\{.*${element.id}.*}\\s((.[^>]+\\s+)|(=>))+)/>`, 'i');
        // console.log(regExp);
        str = str.replace(regExp, (match,p1, p2, rest) => {
            // console.log(match);
            // console.log(p1);
            let regExpInner = /ref=(\{.[^}]+})/ig;
            // console.log(regExpInner);
            if (match.search(regExpInner) === -1) {
                // console.log('ref not found and we go over');
                useStateObject.hook_using = !useStateObject.hook_using ? true : useStateObject.hook_using;
                const element_property = WrapElementsFor.indexOf(p1) !== (-1) ? 'Ref' : 'ref';
                const reference_string = `{(component) => {${p2+tab_symbol}${useStateObject.hook_name}[${element.id}] = component;${p2}}}`;
                p1 += `${p2}${element_property}=${reference_string}${p2}`;
                element.eventString = `onPress={(event) => {${p2.replace(tab_symbol, '')}${useStateObject.hook_name} && ${useStateObject.hook_name}[${element.id}] && ${useStateObject.hook_name}[${element.id}].focus${p2}? ${useStateObject.hook_name}[${element.id}].focus()${p2}: null;${p2.replace(tab_symbol+tab_symbol, '')}}}`;
            }
            return '<' + p1 + rest +'/>';
        });
        str = str.replace(element.replacer, element.eventString);
    });
    if (useStateObject.hook_using) {
        const regExp = new RegExp(`(${function_flow_string})`, 'gim');
        if (str.search(regExp) !== -1) {
             str = str.replace(regExp, (match, p1, p2) => {
                match += functionsArray.join(p2) + p2;
                return match;
            });
        }
        importsArray.forEach((element) => {
            addImportLine(element);
        });
    }
    str = insertImport(str);
    return str;
};

const platformTransforms = (str) => {
    initImports();
    let tokens = [];
    const tokenModify = (match, p1, p2, p3, p4) => {
        let type = p1 !== '</' && withoutTypeTag.indexOf(p3.toLowerCase()) === -1 ? ` tagType={'${p3}'}` : '';

        if (divTags.indexOf(p3.toLowerCase()) !== -1) {
            p3 = 'Div';
        } else if (textTags.indexOf(p3.toLowerCase()) !== -1) {
            p3 = 'TextTag'
        } else if (inputsType.indexOf(p3.toLowerCase()) !== -1) {
            p3 = 'Input'
        }
        p3 = p3.charAt(0).toUpperCase() + p3.slice(1);
        if (tokens.indexOf(p3) === (-1)) {
            tokens.push(p3);
        }
        type = type ? type + p4 : '';
        return p1 + p3 + p4 + type;
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
        return 'navigation.navigate(';
    };

    // const extractEventString = (match, p1) => {
    //     let onFocus = '';
    //     console.log(`match='${match}'`);
    //     console.log(`p1='${p1}'`);
    //     match.replace(/onFocus=(\{.[^}]+})/ig, (match2, p1) => {
    //         console.log(match2);
    //         console.log(p1);
    //         onFocus = p1;
    //     });
    //     console.log('onFocus=', onFocus);
    // };
    // const addOnFocusEventToLabel = (match, p1) => {
    //     console.log(`match='${match}'`);
    //     console.log(`p1='${p1}'`);
    // };

    if (str) {
        const htmlTokens = divTags.concat(divTags, textTags, inputsType, withoutTypeTag);
        let regExp;
        htmlTokens.forEach((token) => {
            // regExp = new RegExp(`(<|<\\/)(\\s*)(` + token + `)(\\s*)(?=(\\s+\\w*\\W[^>]*)|(\\s*>))`, 'mig');
            regExp = new RegExp(`(<|<\\/)(\\s*)(${token})(\\s*)(?=(\\s+\\w*\\W[^>]*)|(\\s*>))`, 'mgi');
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
        str = str.replace(regExp, (match, p1, p2)=> {
            p2 = 'route.name';
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
    str += '\nlet Navigation = createAppContainer(RootStack);\n';

    return {
        text: str,
        imports: [
            'import { createAppContainer } from \'react-navigation\';',
            'import { createStackNavigator } from \'react-navigation-stack\';',
            'import { enableScreens } from \'react-native-screens\';',
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

        str = checkReactRouterDomImports(str,'');

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

        str = addStringsAfterFlowFunction(str, 'App', 'enableScreens();');
    }

    // console.log(str);
    return str;
};

module.exports = {
    exportConnectionTransform,
    checkReactRouterDomImports,
    historyToNavigationTransform,
    removeExcessTags,
    addFlowTags,
    platformTransforms,
    createAppJs,
    changePlatform,
    removeFunctionCall,
    changeTagName,
    addScreenDimensionListener,
    replaceStyleAfterFlowFunction,
    SimplifyEmptyTags,
    replaceHtmlForWithFocus,
    addNavigationRoutePropIntoFlowFunction,
};
