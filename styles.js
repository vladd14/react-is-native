const { space_symbol, tab_symbol, } = require('./constants')
const {variable_expression_regexp, variable_expression_string, change_dash_to_underscore, remove_excess_scss_directives,
    remove_excess_css_directives, class_name_regexp, class_name_string, style_expression_regexp, style_expression_string,
    property_expression_regexp, property_expression_string, media_expression_string, calc_expression_string,
    media_platform_string, } = require('./regexps');

const split_properties = ['border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'flex-flow',
    'padding', 'margin'];
const camel_case_properties = ['border-radius', 'border-color', 'background-color', 'flex-shrink', 'flex-grow',
    'max-height',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'z-index',
    'align-items', 'justify-content', 'min-height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'text-transform', 'font-size', 'line-height', 'font-weight', 'text-shadow', 'box-shadow', 'object-fit',
    'text-align', 'overflow-x'];
const complicated_properties = ['transition', 'text-shadow', 'box-shadow', 'text-decoration', ];
const rename_properties = {
    'text-decoration': 'textDecorationLine',
};
const unsupported_css_properties = ['objectFit', 'white_space', 'list_style', 'outline'];
const force_stringify_value = ['fontWeight'];
const not_round_properties = ['lineHeight'];

let variables = {};
const removeExcessCssDirectives = (str) => {
    str = str.replace(remove_excess_css_directives,'');
    return str;
};
const removeExcessScssDirectives = (str) => {
    str = str.replace(remove_excess_scss_directives,'');
    return str;
};
const changeDashToCamelCase = (str) => {
    str = str.replace(change_dash_to_underscore, (local_match, l1, l2, l3) => {
        l3 = l3 ? l3.charAt(0).toUpperCase() + l3.slice(1) : '';
        return l1 + l3.charAt(0).toUpperCase() + l3.slice(1);
    });
    return str
};
const changeDashToUnderscore = (str) => {
    str = str.replace(change_dash_to_underscore, (local_match, l1, l2, l3) => {
        return l1 + '_' + l3;
    });
    return str
};

let tabs = [];
const transformPropertyToString = (object) => {

    let return_value = '{';
    Object.keys(object).forEach((key) => {
        if (typeof object[key] !== "object" ) {
            return_value += `\n${tabs.join('')}${key}: ${object[key]},`;
        }
        else {
            return_value += `\n${tabs.join('')}${key}: ${transformPropertyToString(object[key], tabs.push(tab_symbol))}`;
        }
    });
    tabs.pop();
    return_value += tabs.length ? `\n${tabs.join('')}},` : ``;
    return return_value;
};

const transformObjectToString = (obj, name) => {

    let string_view = `export const ${name} = `;
    string_view += `${transformPropertyToString(obj, tabs.push(tab_symbol))}\n`;
    string_view += `};`;
    return string_view;
};
const replace_variable = (str) => {
    let found_keys = [];
    // console.log('str=', str);
    Object.keys(variables).forEach((key) => {
        if (str.includes(key)) {
            found_keys.push(key);
        }
    });
    let count_tries = 0;
    while (found_keys.length && count_tries < 10) {
        const key = found_keys.reduce((accumulator, value) => {
            return accumulator.length < value.length ? value : accumulator;
        });
        str = str.replace(key, variables[key]);
        found_keys.splice(found_keys.indexOf(key), 1);
        count_tries ++ ;
    }
    return str;
};
const stringifyValue = (value) => {
    value = typeof value !== "string" ? `'${value}'` : value;
    return value;
};
const splitVariable = (variable) => {
    const replacerVariable = (match, p1, p2) => {
        if (!match) {
            return match;
        }
        if (p2) {
            p2 = replace_variable(p2);
        }
        const expression = p1 && p2 ? eval(`${p1} * ${p2}`) : p1 || p2;
        return expression;
    };

    const regexp = /(\d*\.*\d*)(\w*)/gi;
    if (typeof variable === "string" && variable.search(regexp) !== -1) {
        variable = variable.replace(regexp, replacerVariable);
    }
    return variable;
};
const calcExpression = (expression) => {
    const replacer = (match, p1) => {
        if (p1) {
            p1 = splitVariable(p1);
            p1 = replace_variable(p1);
            p1 = eval(p1);
            return p1;
        }
        return match;
    };
    if (expression) {
        const regexp = new RegExp(calc_expression_string, 'gi');
        expression = expression.replace(regexp, replacer);
    }
    return expression;
};
const getVariableExpression = (filled_object, name_property, arg1, arg2) => {

    // check out for calc() expressions
    arg1 = calcExpression(arg1);
    arg2 = calcExpression(arg2);

    let not_expression = false;
    if (unsupported_css_properties.indexOf(name_property) !== -1) {
        return filled_object;
    }
    else if (arg2 && filled_object[arg2] ) {
        arg2 = replace_variable(arg2);
    }
    else if (arg2) {
        const arg2_replaced = replace_variable(arg2);
        if (arg2 === arg2_replaced) {
            not_expression = true;
        }
        else {
            arg2 = arg2_replaced;
        }
    }
    else {
        not_expression = true;
    }

    if (arg2 && arg2.indexOf('%') !== -1) {
        not_expression = true;
        arg2 = arg1+ arg2;
    }

    if (name_property && (!arg2 || not_expression) && !filled_object.hasOwnProperty(name_property)) {

        filled_object[name_property] = isNaN(Number(arg2 ? arg2 : arg1))
                ? arg2 ? `'${arg2.trim()}'`
                : arg1.trim() : Number(arg2 ? arg2 : arg1);

        if (!not_round_properties.includes(name_property) && typeof filled_object[name_property] === "number") {
            filled_object[name_property] = Math.round(filled_object[name_property]);
        }
        if (force_stringify_value.includes(name_property)) {
            filled_object[name_property] = stringifyValue(filled_object[name_property]);
        }
    }
    else if (arg1 !== undefined && arg1 !== null && arg2 && !not_expression) {
        const expression = eval(arg1 + '*' + arg2);
        filled_object[name_property] = expression;
        if (!not_round_properties.includes(name_property) && typeof filled_object[name_property] === "number") {
            filled_object[name_property] = Math.round(filled_object[name_property]);
        }
    }
    return filled_object;
};

const propertiesSplitter = (property, number_value, value_string) => {
    let exclusive_color;
    const replacer_rgb_color = (match, p1) => {
        exclusive_color = p1;
        return '';
    };

    let object = {};
    value_string = number_value ? number_value + value_string : value_string;
    value_string = calcExpression(value_string);
    if (property.indexOf('border') !== -1) {

        property = changeDashToCamelCase(property);

        value_string = value_string.replace(/\s+(rgb\w*\(.+\))/ig, replacer_rgb_color);

        let array = value_string.split(' ');

        if (array[0] === 'thin') {
            array[0] = '1px';
        }
        else if (array[0] === 'thick') {
            array[0] = '2px';
        }
        else if (array[0] === 'none') {
            array[0] = '0';
        }

        if (array.length === 3) {
            object[`${property}Width`] = splitVariable(array[0]); // variable 1px and etc or 0
            object[`borderStyle`] = array[1];
            object[`${property}Color`] = exclusive_color ? exclusive_color : array[2];
        }
        if (array.length === 2) {
            object[`${property}Width`] = splitVariable(array[0]); // variable 1px and etc or 0
            object[`borderStyle`] = array[1];
            object[`${property}Color`] = exclusive_color ? exclusive_color : 'black';
        }
        if (array.length === 1) {
            object[`${property}Width`] = splitVariable(array[0]); // variable 1px and etc or 0
        }
    }
    else if (property === 'flex-flow') {
        let array = value_string.split(' ');
        object.flexDirection = array[0];
        if (array.length > 1) {
            object.flexWrap = array[1];
        }
    }
    else if (property === 'padding' || property === 'margin') {
        let array = [];
        array = value_string.split(' ');
        // console.log(array);
        if (array.length === 4) {
            object[`${property}Top`] =  splitVariable(array[0]); // all properties are variables like 0.5rem and etc or 0
            object[`${property}Right`] = splitVariable(array[1]);
            object[`${property}Bottom`] = splitVariable(array[2]);
            object[`${property}Left`] = splitVariable(array[3]);
        }
        if (array.length === 2) {
            object[`${property}Vertical`] = splitVariable(array[0]);
            object[`${property}Horizontal`] = splitVariable(array[1]);
        }
        if (array.length === 1) {
            object[`${property}`] = splitVariable(array[0]);
        }
    }
    // console.log(object);
    return object;
};
const changeSecondsToMs = (str) => {
    const replacer = (match, p1, p2, p3, p4) => {
        // console.log('match=', match);
        // console.log('p1=', p1);
        // console.log('p2=', p2);
        // console.log('p3=', p3);
        // console.log('p4=', p4);
        p2 = p3.toLowerCase() === 's' ? p2 * 1000 : p2;
        return p1 + p2 + p4;
    };
    str = str.replace(/(\s+)(\d+\.*\d*)(s)(\s+)/gi, replacer);
    return str;
};
const propertiesInnerCorrections = (property, number_value, value_string) => {
    const replacer = (match) => {
        match = changeDashToCamelCase(match);
        return match;
    };
    value_string = number_value ? number_value + value_string : value_string;

    value_string = calcExpression(value_string);

    camel_case_properties.forEach((target_property) => {
        const regexp = new RegExp(`${target_property}`, 'gi');
        value_string = value_string.replace(regexp, replacer);
        value_string = changeSecondsToMs(value_string);
        value_string = splitVariable(value_string);
    });
    return value_string;
};
const getProperty = (str, object) => {
    // console.log(str);
    const replacer = (match, property, p2, p3, p4) => {
        //change '-' to '_' for getting variable with dot notation in JS
        // if (property.includes('overflow')) {
        //     console.log(property);
        // }

        if (rename_properties[property]) {
            property = rename_properties[property];
        }

        if (split_properties.indexOf(property) !== -1) {

            let new_properties_object = propertiesSplitter(property, p3, p4);

            p3 = p3 ? p3 : '1';
            if (camel_case_properties.indexOf(property) === -1) {
                property = changeDashToUnderscore(property);
            }
            else {
                property = changeDashToCamelCase(property);
            }
            Object.keys(new_properties_object).forEach((key) => {
                object = getVariableExpression(object, key, null, new_properties_object[key]);
            })
        }
        else if (complicated_properties.indexOf(property) !== -1) {
            if (camel_case_properties.indexOf(property) === -1) {
                property = changeDashToUnderscore(property);
            }
            else {
                property = changeDashToCamelCase(property);
            }
            p4 = propertiesInnerCorrections(property, p3, p4);
            object = getVariableExpression(object, property, p3, p4);
        }
        else {
            p3 = p3 ? p3 : '1';
            if (camel_case_properties.indexOf(property) === -1) {
                property = changeDashToUnderscore(property);
            }
            else {
                property = changeDashToCamelCase(property);
            }
            object = getVariableExpression(object, property, p3, p4);
        }
    };
    str.replace(property_expression_regexp, replacer);
};
const transformVariables = (str, variables_name) => {
    variables = {};
    const replacer = (match, p1, p2, p3, p4) => {

        //add px definition for parsing values from scss
        if (!variables.hasOwnProperty('px')) {
            variables['px'] = 1;
        }
        //add em definition for parsing values from scss
        if (!variables.hasOwnProperty('em')) {
            variables['em'] = '16';
        }
        //add rem definition for parsing values from scss
        if (!variables.hasOwnProperty('rem')) {
            variables['rem'] = '16';
        }

        p3 = p3 ? p3 : '1';

        //change '-' to '_' for getting variable with dot notation in JS
        p1 = changeDashToUnderscore(p1);
        p4 = changeDashToUnderscore(p4);
        p4 = removeExcessScssDirectives(p4);

        variables = getVariableExpression(variables, p1, p3, p4);
    };

    str.replace(variable_expression_regexp, replacer);
    // We don't need px definition for further operations, but rem and em we can use
    // for mobile layout adjustments
    // delete variables['px'];
    // console.log(variables);
    str = transformObjectToString(variables, variables_name);
    // console.log(str);
    return str;
};

const transformStylesToObj = (str) => {
    let style_object = {};
    // let main_property;
    const replacer = (match, p1, p2,) => {
        p2 = removeExcessCssDirectives(p2);
        let object;
        if (!style_object.hasOwnProperty(p1)) {
            // main_property = p1;
            object = style_object[p1] = {};
        }
        else {
            object = style_object[p1];
        }
        p2 = getProperty(p2, object);
    };
    let regexp = new RegExp(class_name_string + `\\s*((${style_expression_string})+)(\\s*)`, 'ig');
    str.replace(regexp, replacer);
    return style_object;
};

const transformStyles = (str, styles_name) => {

    // console.log(str);
    //delete all @media first
    let regexp = new RegExp(media_expression_string, 'gi');
    str = str.replace(regexp, '');
    // console.log(str);
    let style_object = transformStylesToObj(str);
    // console.log(`obj=`, obj);
    str = transformObjectToString(style_object, styles_name);

    return str;
};

const transformMediaMax = (str, styles_name) => {
    let style_object = {};
    const replacer = (match, p1, p2, p3, p4) => {
        if (!style_object.hasOwnProperty(p3)) {
            style_object[p3] = {};
            style_object[p3] = { ...transformStylesToObj(p4)};
        }
        else {
            style_object[p3] = { ...style_object[p3], ...transformStylesToObj(p4)};
        }
    };
    //get additional @media rules for single max-width/height expression notation with
    let regexp = new RegExp(media_expression_string, 'gi');
    str.replace(regexp, replacer);
    str = Object.keys(style_object).length ? style_object : null;

    return str;
};

const transformMediaPlatform = (str, styles_name) => {
    let style_object = {};
    const replacer = (match, platform, styles) => {
        if (!style_object.hasOwnProperty(platform)) {
            style_object[platform] = {};
            style_object[platform] = { ...transformStylesToObj(styles)};
        }
        else {
            style_object[platform] = { ...style_object[platform], ...transformStylesToObj(styles)};
        }
    };
    //get additional @media rules for single max-width/height expression notation with
    let regexp = new RegExp(media_platform_string, 'gi');
    str.replace(regexp, replacer);
    str = Object.keys(style_object).length ? style_object : null;

    return str;
};

module.exports = {
    transformVariables,
    transformStyles,
    transformMediaMax,
    transformObjectToString,
    transformMediaPlatform,
};
