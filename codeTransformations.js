const { space_symbol, tab_symbol, flowTag, } = require('./constants');
const { makeStringTitled } = require('./helpers');
const {remove_blank_lines_regexp, function_flow_string, default_function_string} = require('./regexps');
const {cutImport, insertImport, addImportLine, addImportArray, initImports, deleteImportModule, addImportByModuleAndPath} = require('./imports');

const removeExcessFreeLines = (str) => {
    str = str.replace(remove_blank_lines_regexp, '');
    return str;
};

const placeTabHere = (n) => {
    n = n ? n : 1;
    let tab = '';
    for (let i = 0; i < n; i++) {
        tab += tab_symbol;
    }
    return tab;
};

const exportConnectionTransform = (str) => {
    const replacer = (match, p1, p2, p3) => {
        // console.log(match);
        // console.log(p1);
        // console.log(p2);
        p2 = p2.split('\n').map((item) => item.trim()).filter((item) => item).map((element, index, array ) => index && index < array.length -1 ? tab_symbol + element : element);
        p2 = p2.join('\n');
        if (p2.charAt(p2.length-1) === ',') {
            p2 = p2.slice(0, -1);
            p2 += ';'
        }
        // console.log(p2);
        return p2;
    };
    if (str) {
        let regExp = /(withRouter\s*\(\s*)(.[^;]+)(\s*\));/gi;
        str = str.replace(regExp, replacer);

    }
    // console.log(str);
    return str;
};

const historyToNavigationTransform = (str) => {
    const replacer2 = (match, p1, p2, p3) => {
        return p2;
    };

    const replacer = (match, p1, p2, p3) => {
        return p1 + 'navigation' + p3;
    };

    if (str) {
        let regExp = /([\[=]*\s*)(history)(\s*[,.=}:;)\]]\s*)/mig;
        str = str.replace(regExp, replacer);
        regExp = /(navigation:\s*)(history)(\s*})/mig;
        str = str.replace(regExp, replacer);

        regExp = /(\/\*\s*)(route:\s*route[,]*)(\s*\*\/)/ig;
        str = str.replace(regExp, replacer2);
    }
    return str;
};

const removeExcessTags = (str, tags_array) => {
    const replacer = (match, begins, p0, p1,) => {
        let arr = p1.split('\n');
        //removing excess tab;
        arr = arr.map((element) => {
            element = element.replace(/\s{4}/i,'');
            return element;
        });
        return arr.join('\n');
    };

    tags_array.forEach((element) => {
        let regExp = new RegExp(`(<\\s*${element}\\s*>)(\\s+)(<(\\w*\\s*.[^>]+>)+?)\\s+(<\\s*\/\\s*${element}\\s*>)`, 'i');
        str = str.replace(regExp, replacer);
    });
    return str;
};

const removeTagsWithBody = (str, tags_array) => {
    const replacer = (match, p1, p2, p3,) => {
        return '';
    };

    tags_array.forEach((element) => {
        // remove single elements first
        let regExp = new RegExp(`<\\s*${element}\\s*(.[^>]*)/>`, 'gi');
        str = str.replace(regExp, replacer);

        //Remove element with body next
        // let regExp = new RegExp(`(?<=(<${element}\\s*[^>]+>))(\\s.+)+(?=(</${element}>))`, 'i');
        regExp = new RegExp(`(<${element}\\s*[^>]+>)(\\s.+)+?(</${element}>)`, 'gi');
        str = str.replace(regExp, replacer);
    });
    return str;
};

const removeFunctionCall = (str, name) => {
    const replacer = (match, p1, p2) => {
        return '';
    };
    const regExp = new RegExp(`\\s*${name}\\((\\s*\\w*\\W[^)]*\\W[^;]*);`, 'ig');
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
        // console.log(match);
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

const addFlowTagsByFunctionName = (str, functionName) => {

    const replacer = (match, p1) => {
        return p1 + ': () => React$Node';
    };

    if (str) {
        str = flowTag + str;
        const regExp = new RegExp(`(const\\s+${functionName})(?=\\s*=\\s*\\()`, 'mig');
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

const addNavigationRouteProps = (str) => {
    const replacer = (match, p1, p2, p3, p4) => {
        // console.log('match', match);
        // console.log('p1', p1);
        // console.log('p2', p2);
        // console.log('p3', p3);
        // console.log('p3', p4);
        p2 = p2.replace(/history,/, 'navigation, route,');
        return p1 + p2 + p3 + p4;
    };

    // const regexp = new RegExp('(const\\s+\\w+\\s*=\\s*\\({)(.+)(}\\)\\s*.+{)(\\s*)', 'gi');
    // const regexp = new RegExp(default_function_string, 'gi');
    if (str) {
        const regexp = new RegExp(default_function_string, 'gi');
        str = str.replace(regexp, replacer);
    }
    // console.log(str);
    return str
};

const addScreenDimensionListener = (str, functionName) => {
    // initImports();
    const dimension_listener = `if (!appState.screen_data) {
        Screen({ appState, actions });
    }`;
    const import_line = `import { Screen } from '../platformTransforms';`;
    const replacer = (match, p1) => {
        // console.log(`match='${match}'`);
        match += dimension_listener + p1;
        return match;
    };

    if (str) {
        // str = cutImport(str);
        // const regExp = /const\s+PageHeader\s*=\s*\(.+\)\s*.+{(\s*)/ig;
        const regExp = new RegExp(`const\\s+${functionName}\\s*=\\s*\\(.+\\)\\s*.+{(\\s*)`, 'gi');
        str = str.replace(regExp, replacer);
        // Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');
        addImportLine(import_line);
        // str = insertImport(str);
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
    // initImports();
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
        // str = cutImport(str);

        str = str.replace(regExp, replacer);
        str = str.replace(remove_blank_lines_regexp, '');
        importsArray.forEach((element) => {
            addImportLine(element);
        });
        // str = insertImport(str);
    }
    return str;
};
const divTags = ['div', 'section', 'header', 'footer', 'li', 'hr' ];
const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'];
const linkTags = ['a'];
const inputsType = ['input', 'select'];
const listTags = ['ul', 'ol'];
const withoutTypeTag = ['redirect', 'Link', 'img', 'div'];
const WrapElementsFor = ['Input', 'Select'];

const replaceHtmlForWithFocus = (str) => {
    // initImports();
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
    let regExp = /htmlFor=\{(.[^}]+?)}(\s*)/mig;
    str = str.replace(regExp, getHtmlForIds);
    htmlForArray.forEach((element) => {
        // console.warn(`element='${element}'`);
        // regExp = new RegExp(`<(\\w+)(\\s*)(.[^>]+\\s+id=\\{.*${element.id}.*}\\s((.[^>]+\\s+)|(=>))+?)([/]*>)`, 'i');
        regExp = new RegExp(`<(\\w+)(\\s*)((.[^>]+\\s+id=\\{.*${element.id}.*})(\\s+.+?)+?\\s*)([^=]>)`, 'gi');
        // console.log(regExp);
        // str = str.replace(regExp, (match,p1, p2, rest, p3, p4, p5, end_tag) => {
        str = str.replace(regExp, (match,p1, p2, rest, p3, p4, end_tag, ) => {
            // return ;
            // console.log(`\n\np1=${p1}`);
            // console.log(`p2=${p2}`);
            // console.log(`rest=${rest}`);
            // console.log(`p3=${p3}`);
            // console.log(`p4=${p4}`);
            // console.log(`end_tag=${end_tag}\n\n`);

            // console.log(match);
            // console.log(p1);
            let regExpInner = /\s+ref=(\{.[^}]+})/gi;
            // console.log(regExpInner);
            if (match.search(regExpInner) === -1) {
                // console.warn('\nref not found and we go over\n');
                useStateObject.hook_using = !useStateObject.hook_using ? true : useStateObject.hook_using;
                // console.log('PPPPPPP1=', p1);
                const element_property = WrapElementsFor.includes(makeStringTitled(p1)) ? `Ref` : `ref`;
                const reference_string = `{(component) => {${p2+tab_symbol}${useStateObject.hook_name}[${element.id}] = component;${p2}}}`;
                p1 += `${p2}${element_property}=${reference_string}${p2}`;
                element.eventString = `onPress={(event) => {${p2.replace(tab_symbol, '')}${useStateObject.hook_name} && ${useStateObject.hook_name}[${element.id}] && ${useStateObject.hook_name}[${element.id}].focus${p2}? ${useStateObject.hook_name}[${element.id}].focus()${p2}: null;${p2.replace(tab_symbol+tab_symbol, '')}}}`;
            }
            // return '<' + p1 + rest + end_tag;
            return '<' + p1 + rest + end_tag;
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
    // str = insertImport(str);
    // console.warn(`str='${str}'`);
    return str;
};

const platformTransforms = (str, filename) => {
    // initImports();
    let tokens = [];
    const tokenModify = (match, start_tag, possible_tabs_start, token, possible_tabs, empty, empty2, attributes, end_tag) => {
        // console.log(`match='${match}'`);
        // console.log(`start_tag='${start_tag}'`);

        // console.log(`possible_tabs_start='${possible_tabs_start}'`);
        // console.log(`token='${token}'`);
        // console.log(`possible_tabs='${possible_tabs}'`);
        // console.log(`attributes='${attributes}'`);
        // console.log(`empty='${empty}'`);
        // console.log(`empty2='${empty2}'`);
        // console.log(`end_tag='${end_tag}'`);
        // return 0;
        possible_tabs_start = possible_tabs_start ? possible_tabs_start : '';
        possible_tabs = possible_tabs ? possible_tabs : space_symbol;
        const with_type_tag = withoutTypeTag.indexOf(token.toLowerCase()) === -1;
        let type = start_tag !== '</' && with_type_tag ? `${possible_tabs}tagType={'${token}'}` : '';

        if (divTags.indexOf(token.toLowerCase()) !== -1) {
            token = 'Div';
        } else if (textTags.indexOf(token.toLowerCase()) !== -1) {
            token = 'TextTag';
        } else if (linkTags.indexOf(token.toLowerCase()) !== -1) {
            token = 'Link';
        } else if (listTags.indexOf(token.toLowerCase()) !== -1) {
            token = 'List';
        } else if (inputsType.indexOf(token.toLowerCase()) !== -1) {
            token = makeStringTitled(token);
        }
        // token = token.charAt(0).toUpperCase() + token.slice(1);
        token = makeStringTitled(token);
        if (tokens.indexOf(token) === (-1)) {
            tokens.push({module: `{ ${token} }`, path: '../platformTransforms' });
        }
        if (token === 'Img') {
            attributes.replace(/src=\{\s*(.[^.}]+)[.}]*(.[^}]*)\s*}/gi, (match, module_name, property) => {
                if (property === 'src') {
                    type = `${possible_tabs}type={${module_name}.type}`;
                }
            });
        } else if (attributes && token === 'Link') {
            // attributes = attributes.replace(/href=\{\s*(.[^}]+)\s*}/gi, '');
            attributes = attributes.replace(/(href)(=)/g, (match, p1, p2) => {
                p1 = 'to';
                return p1 + p2;
            });
        }
        if (attributes && attributes.search(/(\s)ref=/g) !== -1) {
            // attributes = attributes.replace(/\s+ref=/g, '\\s+Ref=');
            attributes = attributes.replace(/(\s)(ref=)/g, (match, p1, p2) => {
                return p1 + makeStringTitled(p2);
            });
        }
        if (attributes && attributes.search(/(\s)visible=/g) !== -1) {
            // console.warn('Modal has searched');
            token = 'Modal';
            const import_line = `import { Modal } from 'react-native';`;
            addImportLine(import_line);
            attributes = attributes.replace(/\s*(className=[{]*.+([}`]))/gi, '');
        }
        // console.log(start_tag + token + type + (possible_tabs || '') + (attributes || '') + (end_tag || empty2));
        // return 0;
        let modified_tag = start_tag + possible_tabs_start + token + type + (attributes ? !with_type_tag ? possible_tabs + attributes : possible_tabs + attributes : '') + (end_tag || empty2);
        modified_tag = modified_tag.replace(/(\w+)( +)(\w+)/g, (match, tag, spaces, attributes) => {
            return tag + spaces.replace(/( )+/, ' ') + attributes;
        });
        // return start_tag + possible_tabs_start + token + type + (attributes ? type ? possible_tabs + attributes : attributes : '') + (end_tag || empty2);
        return modified_tag;
    };

    const urlsReplace = (match, p1, p2) => {
        const name_import = 'appUrl';
        if (tokens.indexOf(name_import) === (-1)) {
            // tokens.push(name_import);
            tokens.push({module: `{ ${name_import} }`, path: '../urls'});
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
            // tokens.push(name_import);
            tokens.push({module: `{ ${name_import} }`, path: '../urls'});
        }
        return 'navigation.navigate(';
    };

    if (str) {
        const htmlTokens = divTags.concat(textTags, inputsType, listTags, withoutTypeTag, linkTags);
        // console.log('htmlTokens=',htmlTokens);
        let regExp;
        htmlTokens.forEach((token) => {
            // regExp = new RegExp(`(<|<\\/)(\\s*)(${token})(\\s*)(?=(\\s+\\w*\\W[^>]*)|(\\s*>))`, 'mgi');
            // regExp = new RegExp(`(<[/]*)(\\s*)(${token})(\\s*)(([/]*>)|(.[^<]+))>`, 'gi');
            // regExp = new RegExp(`(<[/]*\\s*)(${token})(\\s*)(([/]*>)|(.[^</]+))([/]*>)`, 'g');
            // regExp = new RegExp(`(<[/]*)(\\s*)(${token})(\\s*)(([/]*>)|(.[^</]+)([/]*>))`, 'g');
            regExp = new RegExp(`(<[/]*)(\\s+\\n\\s+)*(${token})(\\s*)(([/]*>)|(.[^</]+)([/]*>))`, 'g');
            str = str.replace(regExp, tokenModify);
        });

        //str = str.replace(takeImportLineRegexp, addImport);
        // str = cutImport(str);

        //change the urls path to function that get name of App by it path;
        if (filename !== 'index.js') {
            regExp = /(\s*)(urls[.\[].+?[\]]*.path)/mig;
            str = str.replace(regExp, urlsReplace);
        }

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
                    // tokens.push('appUrlReversed');
                    tokens.push({module: '{ appUrlReversed }', path: '../urls'});
                }
            }
            return p2
        });

        //change onClick with onPress;
        regExp = /(onClick)(\s*[={}():,])/mig;
        str = str.replace(regExp, (match, p1, p2) => {return 'onPress' + p2});
        //Change onKeyDown with onChangeText;
        regExp = /<SimpleCustomField\s*(\w*\W[^={\/]*)(\W[^{\/]*(\w*\W[^}\/]*})+)\s*\/>/mig;
        str = str.replace(regExp, textInputOnChange);

        //Clean file of blanks lines
        str = str.replace(remove_blank_lines_regexp, '');
        if (tokens.length) {
            // addImportLine('import { ' + tokens.join(', ') + ' } from \'../platformTransforms\';');
            tokens.forEach((token) => addImportByModuleAndPath(token.module, token.path));
        }
        // str = insertImport(str);
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
    // console.log('apps=',apps);
    let str = placeTabHere(1) + '<Stack.Navigator\n';
    if (apps.hasOwnProperty('initialRouteName')) {
        str += placeTabHere(5) + `initialRouteName={${apps['initialRouteName']}}\n`;
        delete apps['initialRouteName'];
    }
    str += placeTabHere(5) + 'screenOptions={({ ...props }) => ({\n';
    str += placeTabHere(6) + 'title: \'\',\n';
    str += placeTabHere(6) + 'headerTintColor: colors.brand_color,\n';
    str += placeTabHere(6) + 'headerTranslucent: true,\n';
    str += placeTabHere(6) + 'headerRight: () => <PageHeader {...props} />,\n';
    str += placeTabHere(5) + '})}>\n';
    str += Object.keys(apps).reduce((accumulator, key) => {
        accumulator += `${placeTabHere(5)}<Stack.Screen name={'${key}'} component={${apps[key]}} />\n`;
        return accumulator
    }, '');
    str += placeTabHere(4) + '</Stack.Navigator>';

    return {
        text: str,
        imports: [
            'import PageHeader from \'./components/PageHeader\'',
            'import { colors } from \'./styles/colors\'',
            'import \'react-native-gesture-handler\';',
            'import { enableScreens } from \'react-native-screens\';',
            'import { createNativeStackNavigator } from \'@react-navigation/native-stack\'',
            'import { NavigationContainer } from \'@react-navigation/native\'',
        ],
    }
};

const createAppJs = (str) => {
    initImports();
    let apps = {};

    const getAppsFromRoute = (match, p1, p2, p3, p4, p5) => {

        console.log(`p3=${p3}`);
        console.log(`p4=${p4}`);
        console.log(`p5=${p5}`);

        apps[p3.toLowerCase()] = p5;
        if (p5.toLowerCase() === 'main') { //Index
            apps['initialRouteName'] = `'${p5.toLowerCase()}'`;
        }
        return '';
    };
    const cleanNavigation = (match, tab, p1, p2, p3, p4) => {

        p1 = tab + '<NavigationContainer>';
        p2 = tab + '@@STACK_NAVIGATOR_PLACEMENT@@';
        p4 = tab + '</NavigationContainer>';
        return p1 + p2 + p4;
    };
    if (str) {

        str = addFlowTagsByFunctionName(str, 'App');

        str = cutImport(str);

        const exceedModules = ['./index.scss', 'react-router-dom', './urls'];
        exceedModules.forEach((module) => deleteImportModule(module));

        let regExp = /<Route\s*path={((\w*)[.](\w*)[.](\w*\W*[^}])})+>\s*<(\w+)\s*\/>\s*<\/Route>/mig;
        str = str.replace(regExp, getAppsFromRoute);

        regExp = /(\s*)<(Navigation)>\s*(.\s*)+?(\s*)<\/(Navigation)>/mig;
        str = str.replace(regExp, cleanNavigation);

        // return str;
        // console.log('cleanNavigation=\n', str);

        str = `const Stack = createNativeStackNavigator();\n` + str;

        let { ...stackDependencies } = createRootStack(apps);
        str = str.replace('@@STACK_NAVIGATOR_PLACEMENT@@', stackDependencies.text );

        addImportArray(stackDependencies.imports);

        str = insertImport(str);

        str = str.replace(remove_blank_lines_regexp, '');

        str = addStringsAfterFlowFunction(str, 'App', 'enableScreens();');
    }

    console.log(str);
    return str;
};

const removeNativeComments = (str) => {
    if (str) {
        let regExp = /[{]*\/\*native\s*/gi;
        str = str.replace(regExp, '');
        regExp = /\s*native\*\/[}]*/gi;
        str = str.replace(regExp, '');
    }
    return str;
};

const changeNextTag = (str) => {
    const replacer = (match, p1, p2, p3, p4, p5) => {
        // console.log(`match='${match}'`);
        // console.log(`p1='${p1}'`);
        // console.log(`p2='${p2}'`);
        // console.log(`p3='${p3}'`);
        // console.log(`p4='${p4}'`);
        // console.log(`p5='${p5}'`);
        return p3 + 'Modal' + p5;
    };
    if (str) {
        // {/* changeNextTag </Modal> */}
        str = str.replace(/(\{\/\*\s*changeNextTag\s*<[\/](.+?)>\s+.+?\n)(\s+<\/)(div)(>)/gsi, replacer);
    }
    return str;
};

const changeWindowLocalStorage = (str) => {
    const replacer = (match) => {
        addImportLine('import AsyncStorage from \'@react-native-community/async-storage\';');
        return 'AsyncStorage';
    };
    if (str) {
        str = str.replace(/window\.localStorage/gi, replacer);
    }
    return str;
};

// actions.setLoginValue({
//     name: 'email',
//     value: event.target.value,
// });
addRunAfterInteractionsWrapper = (str) => {
    const replacer = (match, p1, p2, p3) => {
        if (match.startsWith('/')) {
            return  match
        }
        // console.log(`match='${match}'`);
        // console.log(`p1='${p1}'`);
        // console.log(`p2='${p2}'`);
        // console.log(`p3='${p3}'`);
        addImportLine('import { InteractionManager } from \'react-native\';');
        return `\nInteractionManager.runAfterInteractions(() => {\n${match}\n});`;
    };
    if (str) {
        str = str.replace(/(.[^\/\n']+(return\s*)*(actions\.\w+?\(.+?\);))+/gsi, replacer);
    }
    return str;
};

module.exports = {
    exportConnectionTransform,
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
    addNavigationRouteProps,
    removeTagsWithBody,
    removeExcessFreeLines,
    removeNativeComments,
    changeNextTag,
    changeWindowLocalStorage,
    addRunAfterInteractionsWrapper,
};
