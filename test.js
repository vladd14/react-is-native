const { transformVariables, transformStyles, transformMediaMax, transformColors } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `

import React, { useEffect, useState } from 'react';
import { space_symbol } from '../helpers/constants';
import { Div, TextTag, Input } from '../platformTransforms';

const InputFieldStyled: () => React$Node = ({ className, value, type, id, placeholder, required, ...props }) => {
    const [References, addToReferences] = useState({});
    const { onChange, onFocus, onBlur, onKeyDown, additional_text_value, error_state } = props;
    const [state_class, setStateClass] = useState('');
    const [error_state_class, setErrorStateClass] = useState(error_state || '');

    useEffect(() => {
        if (error_state) {
            setErrorStateClass('state_error');
        }
        else {
            setErrorStateClass('');
        }
    }, [error_state]);

    const handleFocus: () => React$Node = (event) => {
        setStateClass('selected');
        if (onFocus) {
            onFocus(event);
        }
    };
    const handleBlur: () => React$Node = (event) => {
        if (!value) {
            setStateClass('');
        }
        if (onBlur) {
            onBlur(event);
        }
    };
    const handleValue: () => React$Node = (event) => {
        if (onChange) {
            onChange(event);
        }
    };
    const handleKeys: () => React$Node = (event) => {
        if (onKeyDown) {
            onKeyDown(event);
        }
    };
    return (
        <>
            <Div className={'form_group form_group_styled'}>
                <TextTag
                    tagType={'label'}
                    htmlFor={id}
                    onPress={(event) => {
                        References && References[id] && References[id].focus
                            ? References[id].focus()
                            : null;
                    }}
                    className={[
                        'form_group__label',
                        'input_styled_label',
                        \`label_{state_class}\`,
                        \`{error_state_class}\`,
                    ].join(space_symbol)}>
                    {placeholder}
                </TextTag>
                <Div
                    className={[
                        'form_group__control_container',
                        \`input_{state_class}\`,
                        \`input_{error_state_class}\`,
                        \`{error_state_class}\`,
                    ].join(space_symbol)}>
                    <Div
                        className={[
                            'form_group__control',
                            \`input_{state_class}\`,
                            \`input_{error_state_class}\`,
                        ].join(space_symbol)}>
                        <Input
                            Ref={(component) => {
                                References[id] = component;
                            }}
                            tagType={'input'}
                            id={id}
                            className={'form_group__input'}
                            type={type}
                            value={value}
                            required={required}
                            onKeyDown={(event) => handleKeys(event)}
                            onChange={(event) => handleValue(event)}
                            onFocus={(event) => handleFocus(event)}
                            onBlur={(event) => handleBlur(event)}
                        />
                    </Div>
                </Div>
                <TextTag tagType={'span'} className={[
                    'form_group__additional_text',
                    \`additional_text_{error_state_class}\`,
                ].join(space_symbol)}>
                    {additional_text_value}
                </TextTag>
            </Div>
        </>
    );
};

export default InputFieldStyled;

`;

const needs = `

const Stack = createNativeStackNavigator();

const App: () => React$Node = () => {
    enableScreens();
    return (
        <Provider store={store}>
            <NavigationNativeContainer>
                <Stack.Navigator
                    initialRouteName={'main'}
                    screenOptions={({ ...props }) => ({
                        headerTintColor: colors.brand_color,
                        headerTranslucent: true,
                        headerRight: () => <PageHeader {...props} />,
                    })}>
                    <Stack.Screen name={'main'} component={Main} />
                    <Stack.Screen name={'login'} component={Login} />
                </Stack.Navigator>
            </NavigationNativeContainer>
        </Provider>
    );
};

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
replaceHtmlForWithFocus(mainApp);

