const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `
import React, { useEffect, useState } from 'react';
import { space_symbol } from '../helpers/constants';

const SelectFieldStyled = ({ className, value, type, id, placeholder, required, ...props }) => {
    const { onChange, onFocus, onBlur, onKeyDown, additional_text_value, error_state, options } = props;
    const [state_class, setStateClass] = useState('');
    const [error_state_class, setErrorStateClass] = useState(error_state || '');
    const { trace } = props;

    useEffect(() => {
        if (error_state) {
            setErrorStateClass('state_error');
        } else {
            setErrorStateClass('');
        }
    }, [error_state]);

    useEffect(() => {
        if (value) {
            setStateClass('selected');
        } else {
            setStateClass('');
        }
    }, [value]);

    const handleFocus = (event) => {
        setStateClass('selected');
        if (onFocus) {
            onFocus(event);
        }
    };
    const handleBlur = (event) => {
        //don't touch this if statement
        if (!value) {
            setStateClass('');
        }
        if (onBlur) {
            onBlur(event);
        }
    };
    const handleValue = (event) => {
        if (onChange) {
            onChange(event);
        }
    };
    const handleKeys = (event) => {
        if (onKeyDown) {
            onKeyDown(event);
        }
    };
    return (
        <>
            <div className={'form_group'}>
                <div className={'form_group_styled'}>
                    <label
                        htmlFor={id}
                        className={[
                            'form_group__label',
                            'input_styled_label',
                            \`label_\`,
                            \`\`,
                        ].join(space_symbol)}>
                        {placeholder}
                    </label>
                    <div
                        className={[
                            'form_group__control_container',
                        ].join(space_symbol)}>
                        <div
                            className={[
                                'form_group__control',
                            ].join(space_symbol)}>
                            {options && options.length ? (
                                <select
                                    id={id}
                                    className={'form_group__input'}
                                    type={type}
                                    value={value}
                                    required={required}
                                    onKeyDown={(event) => handleKeys(event)}
                                    onChange={(event) => handleValue(event)}
                                    onFocus={(event) => handleFocus(event)}
                                    onBlur={(event) => handleBlur(event)}
                                    trace={trace}
                                >
                                    {options.map((item) => <option value={item.value}>{item.name}</option>)}
                                </select>
                            ) : (
                                <input
                                    id={id}
                                    className={'form_group__input'}
                                    type={type}
                                    value={value}
                                    required={required}
                                    onKeyDown={(event) => handleKeys(event)}
                                    onChange={(event) => handleValue(event)}
                                    onFocus={(event) => handleFocus(event)}
                                    onBlur={(event) => handleBlur(event)}
                                    trace={trace}
                                />
                                )
                            }
                        </div>
                    </div>
                </div>
                <span className={[
                    'form_group__additional_text',
                    \`additional_text_${error_state_class}\`,
                ].join(space_symbol)}>
                    {additional_text_value}
                </span>
            </div>
        </>
    );
};

export default SelectFieldStyled;

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
platformTransforms(mainApp);

