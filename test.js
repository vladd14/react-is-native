const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper, transformModalToNative
} = require('./codeTransformations');

let mainApp = `
        <div
            className={'modal_window__container {additional_class}'}
            onClick={(event) => closeModalWindow({ event: event })}>
            <div
                className={\'card modal_window__view modal_window_search {modal_view_class} {additional_view_class}\'}
                /*native visible={modal_visibility} native*/
                /*native animationType={\'{animation_type\'} native*/
                /*native onRequestClose={(event) => closeModalWindow({ event: event, on_dismiss: true })} native*/
                /*native onDismiss={(event) => closeModalWindow({ event: event, on_dismiss: true })} native*/
                /*native presentationStyle={\'{presentation_style}\'} native*/
                /*native {...dynamic_props} native*/
            >
                <div className={'modal_window__content search_content justify_content_between flex_grow'}>
                    <span className={'close_rect'} onClick={(event) => closeModalWindow({ event: event })}>
                        ×
                    </span>
                    <div className={''}>
                        <InputFieldStyled
                            id={'modal_search_id'}
                            value={state.search.value}
                            placeholder={'ФИО'}
                            additional_text_value={state.search.additional_text}
                            error_state={Boolean(state.search.additional_text)}
                            required={'required'}
                            onChange={(event) => searchInput(event, 'search')}
                        />
                    </div>
                    {screen_name && searchState.results.length ? (
                        <>
                            <ColumnView
                                {...{
                                    render_item: RenderItem,
                                    screen_name: screen_name,
                                    data_type: data_type,
                                    primary_key: 'pk',
                                    fist_container_class: 'container container__view search_results',
                                    second_container_class: 'container__unlimited',
                                    item_class: 'search_contact',
                                    current_data_type: data_type,
                                    onClick: onClickItemInList,
                                    // history: history,
                                }}
                            />
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                {app_state.platform !== 'web' ? <OverMenu history={history} /> : <></>}
            </div>
        </div>
        </div>
        </div>
        </div>
`;

const second_str = `
<div className={\`modal_window__container {additional_class}\`} onClick={(event) => closeModalWindow(event)}>
    <div
        className={\`card modal_window__view modal_window_notify {modal_view_class} {additional_view_class}\`}
        /*native visible={modal_visibility} native*/
        /*native animationType={\`{animation_type}\`} native*/
        /*native onRequestClose={(event) => closeModalWindow(event)} native*/
        /*native onDismiss={(event) => closeModalWindow(event)} native*/
        /*native presentationStyle={\`{presentation_style}\`} native*/
        /*native {...dynamic_props} native*/
    >
        <div className={'modal_window__content justify_content_between flex_grow'}>
            <span className={'close_rect'} onClick={(event) => closeModalWindow(event)}>
                ×
            </span>
            <div>
                {type === 'user_actions' ? (
                    <div className={'logo justify_content_center'}>
                        <Avatar to={avatar_url} src={avatar} type={avatar_type} alt={avatar_alt} />
                    </div>
                ) : (
                    <></>
                )}
            </div>
            <div>
                <p className={'text_centered text_weight_500'}>{message}</p>
            </div>
            <div className={'text_centered margin_bottom_st_x2'}>
                <SimpleButton
                    title={translator('OK', app_state.language)}
                    additional_class={'small size-changing blue'}
                    onClick={(event) => closeModalWindow(event)}
                />
            </div>
        </div>
    </div>
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
transformModalToNative(mainApp);

