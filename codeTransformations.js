const { space_symbol, tab_symbol, flowTag, initial_app_name } = require('./constants');
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

const withRouterDelete = (str) => {

    const replacer = (match, p1, p2, p3) => {
        p2 = p2.replace(/(\w+\))([,])/gi, (match, p1, p2) => {
            p1 = p1 + ';';
            return p1;
        });
        return p2;
    };
    if (str) {
        let regExp = /(withRouter\s*\()(.+?)(\);)/gsi;
        str = str.replace(regExp, replacer);

    }
    console.log(str);
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

const changeNavigationHooks = (str) => {
    if (str) {
        // const regexp = new RegExp(default_function_string, 'gi');
        //useHistory();

        str = str.replace(/(useHistory)(\(\).*)/gi, (match,p1, p2) => {
            const import_line = `import { useNavigation, useRoute } from '@react-navigation/native';`;
            addImportLine(import_line);
            p1 = 'useNavigation';
            return p1 + p2 + '\n' + 'const route = useRoute();';
        });
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
        // console.log(`match='${match}'`);
        // console.log(`p1='${p1}'`);
        // console.log(`p3='${p2}'`);
        p2 = 'mobile';
        return p1 + p2 + p3;
    };
    // const regExp = /(initialState:\s*{\s*platform:\s*')(\w+)('\s*,)/ig;
    // initial_state: {
    //     platform: 'web',
    //         language: 'RU',
    //         screen_errors: {
    //         all: [],
    //     },
    // },
    // const regExp = /(initialState:\s*{\s*.*platform:\s*['"`])(.+?)(['"`])/gsi;
    // const regExp = /(initial_state:.+?platform:\s*['"`])(.+?)(['"`])/gsi;
    const regExp = /(export\s+const\s+platform\s*=\s*['"`])(.+?)(['"`])/gi;
    str = str.replace(regExp, replacer);
    console.log(str);
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

const addPathDots = (level = 0) => {
    let path = '../';
    for (let i = 0; i < level; i++) {
        path += path;
    }
    return path;
}

const platformTransforms = (str, filename, nested_level) => {
    // initImports();
    let tokens = [];
    const tokenModify = (match, start_tag, token, attributes, end_tag) => {
        // possible_tabs_start = possible_tabs_start ? possible_tabs_start : '';
        // possible_tabs = possible_tabs ? possible_tabs : space_symbol;
        const with_type_tag = withoutTypeTag.indexOf(token.toLowerCase()) === -1;
        let type = start_tag !== '</' && with_type_tag ? ` tagType={'${token}'}` : '';

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
            // tokens.push({module: `{ ${token} }`, path: '../platformTransforms' });
            tokens.push({module: `{ ${token} }`, path: `${addPathDots(nested_level)}platformTransforms` });

        }
        if (token === 'Img') {
            attributes.replace(/src=\{\s*(.[^.}]+)[.}]*(.[^}]*)\s*}/gi, (match, module_name, property) => {
                if (property === 'src') {
                    type = ` type={${module_name}.type}`;
                }
            });
        } else if (attributes && token === 'Link') {
            // attributes = attributes.replace(/href=\{\s*(.[^}]+)\s*}/gi, '');
            attributes = attributes.replace(/(href)(=)/g, (match, p1, p2) => {
                p1 = 'to';
                return p1 + p2;
            });
        }
        if (attributes && attributes.search(/(\s*)ref=/g) !== -1) {
            // attributes = attributes.replace(/\s+ref=/g, '\\s+Ref=');
            attributes = attributes.replace(/(\s*)(ref=)/g, (match, p1, p2) => {
                return p1 + makeStringTitled(p2);
            });
        }

        let modified_tag = start_tag + token + type + ' ' + (attributes || '')  + (end_tag);
        modified_tag = modified_tag.replace(/(\w+)( +)(\w+)/g, (match, tag, spaces, attributes) => {
            return tag + spaces.replace(/( )+/, ' ') + attributes;
        });

        return modified_tag;
    };

    const urlsReplace = (match, p0, p1, p2) => {
        if (p0 === 'get') {
            return match;
        }
        const name_import = 'appUrl';
        if (tokens.indexOf(name_import) === (-1)) {
            tokens.push({module: `{ ${name_import} }`, path: `${addPathDots(nested_level)}urls`});
        }
        return p0 + p1 + `${name_import}.get(${p2})`;
    };
    const textInputOnChange = (match, p1,p2,p3,p4) => {
        match = match.replace(/(onChange=\{)/mig, 'onChangeText={');
        return match;
    };
    const changeHistoryToNavigate = (match, p1,p2,p3) => {
        // console.log(match);
        const name_import = 'appUrl';
        if (tokens.indexOf(name_import) === (-1)) {
            tokens.push({module: `{ ${name_import} }`, path: `${addPathDots(nested_level)}urls`});
        }
        return 'navigation.navigate(';
    };

    if (str) {
        const htmlTokens = divTags.concat(textTags, inputsType, listTags, withoutTypeTag, linkTags);
        console.log('htmlTokens=',htmlTokens);
        let regExp;
        htmlTokens.forEach((token) => {

            // regExp = new RegExp(`(<[/]*)(\\s+\\n\\s+)*(${token})(\\s*)(([/]*>)|(.[^</]+)([/]*>))`, 'g');

            // regExp = new RegExp(`(<[/]*)(${token})(\\s*)(([/]*>)|(.+?)([/]*>))`, 'g');
            // str = str.replace(regExp, tokenModify);

            regExp = new RegExp(`(<)(${token})()(>)`, 'gs');
            str = str.replace(regExp, tokenModify);
            regExp = new RegExp(`(<[/])(${token})()(>)`, 'gs');
            str = str.replace(regExp, tokenModify);
            regExp = new RegExp(`(<)(${token})\\s+(.+?)([^=\\w]>)`, 'gs');
            str = str.replace(regExp, tokenModify);
        });

        // str = str.replace(takeImportLineRegexp, addImport);
        // str = cutImport(str);

        //change the urls path to function that get name of App by it path;
        if (filename !== 'index.js') {
            regExp = /(\w+)(\()(urls[.\[].+?[\]]*.path)/mig;
            str = str.replace(regExp, urlsReplace);
        }

        //return history.push(appUrl.get(urls.login.path));
        // regExp = /\s*(history.push\(\s*)(\w*\W[^)]*)(\s*\);)/mig;
        regExp = /(history.push\()|(navigation.push\()/mig;
        str = str.replace(regExp, changeHistoryToNavigate);

        //history.location.pathname
        regExp = /(get\()*(history.location.pathname)/mig;
        str = str.replace(regExp, (match, p1, p2)=> {
            p2 = 'route.name';
            if (p1) {
                p2 = p1 + `appUrlReversed.get(${p2})`;
                if (tokens.indexOf('appUrlReversed') === (-1)) {
                    // tokens.push('appUrlReversed');
                    tokens.push({module: '{ appUrlReversed }', path: `${addPathDots(nested_level)}urls`});
                }
            }
            return p2;
        });

        //change onClick with onPress;
        regExp = /([^\w])(onClick)(\s*[&={}():,])/smig;
        str = str.replace(regExp, (match, p0, p1, p2) => {return p0 + 'onPress' + p2});
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
    str += placeTabHere(6) + 'headerShown: false,\n';
    // str += placeTabHere(6) + 'headerTranslucent: true,\n';
    // str += placeTabHere(6) + 'headerRight: () => <PageHeader {...props} />,\n';
    str += placeTabHere(5) + '})}>\n';

    // str += placeTabHere(5) + '>\n';
    str += Object.keys(apps).reduce((accumulator, key) => {
        accumulator += `${placeTabHere(5)}<Stack.Screen name={'${key}'} ${apps[key].params} component={${apps[key].component}} />\n`;
        return accumulator
    }, '');
    str += placeTabHere(4) + '</Stack.Navigator>';

    return {
        text: str,
        imports: [
            'import { colors } from \'./styles/colors\'',
            'import \'react-native-gesture-handler\';',
            'import { enableScreens } from \'react-native-screens\';',
            'import { createNativeStackNavigator } from \'react-native-screens/native-stack\'',
            'import { NavigationContainer } from \'@react-navigation/native\'',
        ],
    }
};

const createAppJs = (str) => {
    initImports();
    let apps = {};

    const getAppsFromRoute = (match, path_name, url_name, component_name, params, p5) => {
        // console.log('match=', match);
        // console.log(`path_name=${path_name}`);
        // console.log(`url_name=${url_name}`);
        // console.log(`component_name=${component_name}`);
        // console.log(`params=${params}`);
        // console.log(`p4=${p4}`);
        // console.log(`p5=${p5}`);

        // apps[p3.toLowerCase()] = p5;
        // if (p5.toLowerCase() === 'main') { //Index
        //     apps['initialRouteName'] = initial_app_name ? `'${initial_app_name}'` : `'${p5.toLowerCase()}'`;
        // }
        if (component_name.toLowerCase() === 'main') { //Index
            apps['initialRouteName'] = initial_app_name ? `'${initial_app_name}'` : `'${component_name.toLowerCase()}'`;
        }
        apps[url_name.toLowerCase()] = {
            component: component_name,
            params: params,
        };
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

        // <Route path={urls.login.path}>
        //     <Main screen_name={'login'} />
        // </Route>
        // let regExp = /<Route\s*path={((\w*)[.](\w*)[.](\w*\W*[^}])})+>\s*<(\w+)\s*\/>\s*<\/Route>/mig;
        let regExp = /<Route\s*path=\{(\w+.(\w+).\w+)}\s*>\s*<(\w+)\s*(.+?)\s*\/>\s*<\/Route>/ig;
        str = str.replace(regExp, getAppsFromRoute);

        regExp = /(\s*)<(Navigation)>\s*(.\s*)+?(\s*)<\/(Navigation)>/mig;
        str = str.replace(regExp, cleanNavigation);

        // return str;
        // console.log('cleanNavigation=\n', str);

        str = `enableScreens();\nconst Stack = createNativeStackNavigator();\n` + str;

        let { ...stackDependencies } = createRootStack(apps);
        str = str.replace('@@STACK_NAVIGATOR_PLACEMENT@@', stackDependencies.text );

        addImportArray(stackDependencies.imports);

        str = insertImport(str);

        str = str.replace(remove_blank_lines_regexp, '');

        // str = addStringsAfterFlowFunction(str, 'App', 'enableScreens();');
    }

    // console.log(str);
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
const addRunAfterInteractionsWrapper = (str) => {
    // const replacer = (match, p1, p2, p3) => {
    //     if (match.startsWith('/')) {
    //         return  match
    //     }
    //     // console.log(`match='${match}'`);
    //     // console.log(`p1='${p1}'`);
    //     // console.log(`p2='${p2}'`);
    //     // console.log(`p3='${p3}'`);
    //     addImportLine('import { InteractionManager } from \'react-native\';');
    //     return `\nInteractionManager.runAfterInteractions(() => {\n${match}\n});`;
    // };
    // if (str) {
    //     str = str.replace(/(.[^\/\n']+(return\s*)*(actions\.\w+?\(.+?\);))+/gsi, replacer);
    // }
    return str;
};

addStatusBarConnection = (str) => {
const status_bar_connection_function = `
export const StatusBarConnected = screens_prototype.reduce((accumulator, item) => {
    if (item.name === 'status_bar') {
        const extra_reducers = item.hasOwnProperty('extra_reducers') ? item.extra_reducers : {};
        accumulator[\`\${item.screen}_\${item.name}\`] = connect(
            (state) => ({
                storeState: state[\`\${item.screen}_\${item.name}\`],
                ...{
                    ...Object.keys(extra_reducers).reduce((acc, property) => {
                        acc[property] = state[extra_reducers[property]];
                        return acc;
                    }, {}),
                },
            }),
            mapDispatchToProps,
        )(StatusBar);
    }
    return accumulator;
}, {});
`;

if (str) {
    str += status_bar_connection_function
}
return str;
};

const transformModalToNative = (str) => {
    const replacer = (match, p1) => {
        let modal_class_name;
        let class_was_found = false;
        const class_replacer = (match, tagName, className, restProps) => {
            class_was_found = true;
            modal_class_name = className;
            const str = `<Modal ${restProps}>\n${tagName} ${className}>`
            return str;
        }

        match = match.replace(/(<.+?)(className=[{]*[`].+?[`][}]*)(.+?[^=])>/si, class_replacer);
        if (!class_was_found) {
            match = match.replace(/(<.+?)(className=[{]*['"].+?["'][}]*)(.+?[^=])>/si, class_replacer);
        }
        // match = match.replace(/(<.+?)(className=[{]*['"`].+?[`"'][}]*)(.+?[^=])>/si, (match, tagName, className, restProps) => {
        //     modal_class_name = className;
        //     const str = `<Modal ${restProps}>\n${tagName} ${className}>`
        //     return str;
        // });
        return match + '\n</Modal>';
    };

    if (str && str.search(/<.+?modal_window=\{/gsi) !== -1) {
        str = str.replace(/modal_window=\{.+?}\s*/gi, '');
        const pos = str.search(/<div.[^\n]+?modal_window__view(.+?)[^=]>/gsi);
        let cut_str;
        let found = false;
        let step=0;
        // console.log(str.substring(pos, 10));
        while (!found && pos !== -1) {
            cut_str = str.substring(pos, pos + step++);
            if (cut_str) {
                let div =0;
                let close_div=0;
                cut_str.replace(/<div/gi, () => {
                    div++;
                })
                cut_str.replace(/<\/div>/gi, () => {
                    close_div++;
                })
                if (div && close_div && div === close_div) {
                    found = true;
                    break;
                }
            }
        }
        if (cut_str) {
            const new_str = replacer(cut_str);
            if (new_str) {
                addImportLine('import { Modal } from \'react-native\';');
                str = str.replace(cut_str, new_str);
                console.log('new_str=', new_str);
            }
        }
    }
    // console.log('str=', str);
    return str;
}

const addKeyboardAvoidingViewWrapper = (str) => {

    const KeyboardAvoidingView = '<KeyboardAvoidingView behavior={\'padding\'} style={{flex: 1}}>'
    const replacer = (match) => {
        return KeyboardAvoidingView + '\n' + match + '\n' + '</KeyboardAvoidingView>\n';
    };

    // console.log(str);

    //keyboard_avoiding_view={'keyboard_avoiding_view'}
    const regexp = new RegExp('<\\s*?.+?keyboard_avoiding_view=\\{', 'gsi');
    if (str && str.search(regexp) !== -1) {
        // str = str.replace(/modal_window=\{.+?}\s*/gi, '');
        const pos = str.search(regexp);

        // str = str.replace(regexp, (match) => (console.log('match=', match)));
        // return ;
        console.log('pos=', pos);
        let cut_str;
        let found = false;
        let step=1;
        cut_str = str.substring(pos, pos + 100);
        // console.log('\n\n', cut_str);
        // return ;
        // console.log(str.substring(pos, 10));
        while (!found && pos && pos !== -1) {
            cut_str = str.substring(pos, pos + step);

            // console.log('\n\n cut_str=', cut_str);
            if (cut_str) {
                let div =0;
                let close_div=0;
                cut_str.replace(/<(ul|li|div)/gi, (match) => {
                    // console.log('match=', match);
                    div++;
                })
                cut_str.replace(/<\/(ul|li|div)>/gi, () => {
                    close_div++;
                })
                if (div && close_div && div === close_div) {
                    console.log('found true');
                    found = true;
                    break;
                }
            }
            step++;
        }
        if (cut_str) {
            // console.log(cut_str);
            const new_str = replacer(cut_str);
            if (new_str) {
                addImportLine('import { KeyboardAvoidingView } from \'react-native\';');
                str = str.replace(cut_str, new_str);
            }
        }
    }
    console.log('str=', str);
    return str;
}

const deleteJSRequires = (str, array_of_modules) => {
    if (str) {
        array_of_modules.forEach((module) => {
            const regexp = new RegExp(`\\s*require.+?${module}.+?\\n`, 'gi');
            str = str.replace(regexp, '');
        });
    }
    return str;
};

// const testHtmlTokens = (str) => {
//     // const tokenModify = (match, start_tag, token, attributes, end_tag) => {
//     const tokenModify2 = (match, start_tag, token, attributes, end_tag) => {
//         console.log(`match='${match}'`);
//         console.log(`start_tag='${start_tag}'`);
//         console.log(`token='${token}'`);
//         console.log(`attributes='${attributes}'`);
//         console.log(`end_tag='${end_tag}'`);
//     }
//     if (str) {
//         const htmlTokens = divTags.concat(textTags, inputsType, listTags, withoutTypeTag, linkTags);
//         // console.log('htmlTokens=', htmlTokens);
//         let regExp;
//         htmlTokens.forEach((token) => {
//             console.log('token=', token);
//             // regExp = new RegExp(`(<[/]*)(\\s+\\n\\s+)*(${token})(\\s*)(([/]*>)|(.[^</]+)([/]*>))`, 'g');
//             // regExp = new RegExp(`(<[/]*)(\\s+\\n\\s+)*(${token})(\\s*)(([/]*>)|(.[^<>]+?)([/]*>))`, 'g');
//             // regExp = new RegExp(`(<)(${token})(.*?)(([^=]>)|([/]>))|<[/]${token}>|<${token}>`, 'gs');
//             // regExp = new RegExp(`((<)(${token})(>))|((<[/])(${token})(>))|((<)(${token})(.+?)([^=]>))`, 'gs');
//
//             regExp = new RegExp(`(<)(${token})()(>)`, 'gs');
//             str = str.replace(regExp, tokenModify2);
//             regExp = new RegExp(`(<[/])(${token})()(>)`, 'gs');
//             str = str.replace(regExp, tokenModify2);
//             regExp = new RegExp(`(<)(${token})(.+?)([^=\\w]>)`, 'gs');
//             str = str.replace(regExp, tokenModify2);
//         });
//     }
//     return str;
// }

module.exports = {
    withRouterDelete,
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
    changeNavigationHooks,
    removeTagsWithBody,
    removeExcessFreeLines,
    removeNativeComments,
    changeNextTag,
    changeWindowLocalStorage,
    addRunAfterInteractionsWrapper,
    addStatusBarConnection,
    transformModalToNative,
    deleteJSRequires,
    // testHtmlTokens,
    addKeyboardAvoidingViewWrapper,
};
