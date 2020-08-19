const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper, transformModalToNative, deleteJSRequires, addKeyboardAvoidingViewWrapper,
} = require('./codeTransformations');

let mainApp = `
<div
    keyboard_avoiding_view={{ behavior: 'padding', keyboardVerticalOffset: 54 }}
    {...close_on_outside_properties}
    {...scroll_view_props}
    className={modal_window__content {modal_content_class ?? ''} {
        modal_window_props.transparent ? 'modal_window_transparent' : ''
    }}>
    {hide_close_button === false ? (
        <div className={close_rect_container {close_rect_container_class ?? ''}}>
            <span
                className={close_rect {close_rect_class}}
                onClick={(event) => closeModalWindow({ event: event })}>
                {app_state.platform === 'web' ? '×' : translator('Закрыть', app_state.language)}
            </span>
            {app_state.platform !== 'web' ? (
                <span className={'modal_card_label'}>{title ?? space_symbol}</span>
            ) : (
                <></>
            )}
        </div>
    ) : (
        <></>
    )}
    {Render ? (
        <div
            className={modal_scrollable_content {
                propagateSwipe || scrollable ? 'scroll_view' : 'max_height_100'
            } {modal_window_props.transparent ? 'modal_scrollable_content_overflowed' : ''}}>
            <Render
                onClick={(event) => {
                    const { action } = event;
                    if (action === 'close') {
                        closeModalWindow({ event: event });
                    }
                }}
                {...{
                    ...render_component_properties,
                    screen_name: render_component_screen_name,
                    data_type: render_component_data_type,
                }}
            />
        </div>
    ) : (
        <></>
    )}
</div>
`

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
// findCloseModalTag(mainApp);
// transformModalToNative(mainApp);
// addKeyboardAvoidingViewWrapper(mainApp);

const tab = '  ';
const add_lines = [
    `,\n{tab}{`,
    `{tab}{tab}test: /\\/settings\\/build_settings\\.js$/,`,
    `{tab}{tab}use: [`,
    `{tab}{`,
    `{tab}loader: require.resolve('./buildTypeChangeLoader'),`,
    `{tab}{tab}options: {`,
    `{tab}{tab}isEnvProduction: isEnvProduction,`,
    `{tab}{tab}},`,
    `{tab}{tab}},`,
    `{tab}{tab}],`,
    `{tab}{tab}include: paths.appSrc,`,
    `{tab}{tab}},`,
];

let tag_name;
let keyboard_settings;

let modified_str = mainApp.replace(/(<)(\w+)(.*?)keyboard_avoiding_view=\{(.+?})}(.*?)/gsi,
    (match, tag_open, tag, some_attributes, keyboard_attributes, rest) => {
        console.log('match=', match);
        console.log('tag_open=', tag_open);
        console.log('tag=', tag);
        console.log('some_attributes=', some_attributes);
        console.log('keyboard_attributes=', keyboard_attributes);
        console.log('rest=', rest);
        tag_name = tag;
        keyboard_settings = keyboard_attributes;
        return tag_open + tag + some_attributes + rest;
    }
);

console.log(modified_str);
