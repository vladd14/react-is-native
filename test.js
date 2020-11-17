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
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { store, store_actions } from '../../reducers';
import { getObjectValueByDotsProperties, isItemHasObjectShape, makeFunctionalNameString } from '../../helpers/tools';
import { getValueFromStorageItem } from '../../helpers/helpers';
import { platform } from '../../settings';
import * as messenger from '../../helpers/messenger';
import { Div, Input } from '../../platformTransforms';

const InputMessageField = ({ storeState, userState, ...props }) => {
    const { screen_name, data_type, container_class } = props;

    const getContexts = () => {
        let store_state = store.getState();
        const contexts = {};
        if (
            userState.settings_public &&
            userState.settings_public.messenger &&
            userState.settings_public.messenger.context_id
        ) {
            contexts[userState.settings_public.messenger.context_id] = true;
        }

        if (screen_name === 'person_app' && data_type === 'messages') {
            const store_name = \`{screen_name}_settings\`;
            const { messenger: person_messenger_settings } = getObjectValueByDotsProperties(
                store_state,
                \`{store_name}.settings_public\`,
            )
                ? getObjectValueByDotsProperties(store_state, \`{store_name}.settings_public\`)
                : {};

            if (person_messenger_settings && person_messenger_settings.context_id) {
                if (!Object.keys(contexts).length || !contexts[person_messenger_settings.context_id]) {
                    contexts[person_messenger_settings.context_id] = true;
                }
            }
        }
        return contexts;
    };

    const onKeyDown = ({ event }) => {
        const { key, ctrlKey, altKey } = event ?? {};
        if (!ctrlKey && !altKey && key === 'Enter') {
            event.preventDefault();
            sendMessage();
        } else if ((ctrlKey || altKey) && key === 'Enter') {
            const { ...message } = getObjectValueByDotsProperties(storeState, 'message');
            message.value += '\\r\\n';
            store.dispatch(
                store_actions[\`set{makeFunctionalNameString(storeState.name)}DataPath\`]({
                    path: 'message',
                    ...message,
                }),
            );
        }
    };
    const onChange = ({ event }) => {
        const store_name = storeState && storeState.name ? storeState.name : '';

        const message = {
            value: event.target.value,
        };
        const store_state = store.getState();
        const input_message_field_ref = getObjectValueByDotsProperties(
            store_state,
            'app_storage.input_message_field_ref',
        );

        if (input_message_field_ref) {
            const min_height = storeState.default_message_input_height;
            store.dispatch(
                store_actions[\`set{makeFunctionalNameString(store_name)}Data\`]({
                    calculated_message_input_height: min_height,
                }),
            );
        }

        if (store_name) {
            store.dispatch(
                store_actions[\`set{makeFunctionalNameString(store_name)}DataPath\`]({
                    path: 'message',
                    ...message,
                }),
            );
        }
    };
    const sendMessage = () => {
        const { ...message } = getObjectValueByDotsProperties(storeState, 'message');
        if (isItemHasObjectShape(message) && message.value) {
            const contexts = getContexts();
            console.log('sendMessage contexts', contexts);
            const store_name = \`{screen_name}_{data_type}\`;
            messenger.send({
                type: 'dead-end',
                data: { message: message.value, from_store_name: store_name },
                contexts: contexts,
            });
            if (storeState.name) {
                const store_state = store.getState();
                const input_message_field_ref = getObjectValueByDotsProperties(
                    store_state,
                    'app_storage.input_message_field_ref',
                );

                if (input_message_field_ref) {
                    const min_height = storeState.default_message_input_height;
                    store.dispatch(
                        store_actions[\`set{makeFunctionalNameString(storeState.name)}Data\`]({
                            calculated_message_input_height: min_height,
                        }),
                    );
                }
                message.value = '';
                store.dispatch(
                    store_actions[\`set{makeFunctionalNameString(storeState.name)}DataPath\`]({
                        path: 'message',
                        ...message,
                    }),
                );
            }
        }
    };
    const input_message_styles =
        platform === 'web'
            ? {
                  style: {
                      height: storeState.calculated_message_input_height
                          ? storeState.calculated_message_input_height
                          : storeState.default_message_input_height,
                  },
              }
            : {};

    useEffect(() => {
        let is_cancelled = false;
        if (!is_cancelled) {
            const store_name = storeState && storeState.name ? storeState.name : '';
            const store_state = store.getState();
            const input_message_field_ref = getObjectValueByDotsProperties(
                store_state,
                'app_storage.input_message_field_ref',
            );

            if (input_message_field_ref && store_name) {
                const height = input_message_field_ref.scrollHeight;
                store.dispatch(
                    store_actions[\`set{makeFunctionalNameString(store_name)}Data\`]({
                        calculated_message_input_height: height,
                    }),
                );
            }
        }
        return () => {
            is_cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeState.calculated_message_input_height]);

    useEffect(() => {
        let is_cancelled = false;
        let store_state = store.getState();
        const store_name = \`{screen_name}_{data_type}\`;
        const { messenger_update } = getObjectValueByDotsProperties(store_state, \`{store_name}\`);
        const { initialized } = getObjectValueByDotsProperties(store_state, \`{store_name}\`);
        const [...messages] = getObjectValueByDotsProperties(store_state, \`{store_name}.results\`)
            ? getObjectValueByDotsProperties(store_state, \`{store_name}.results\`)
            : [];

        let context_id = '';
        const user_context_id = getObjectValueByDotsProperties(
            store_state,
            'user_settings.settings_public.messenger.context_id',
        );
        const person_context_id = getObjectValueByDotsProperties(
            store_state,
            'person_app_settings.settings_public.messenger.context_id',
        );

        if (screen_name === 'main') {
            context_id = user_context_id;
        } else if (screen_name === 'person_app') {
            context_id = person_context_id;
        }

        console.log('useEffect screen_name=', screen_name);
        console.log('useEffect context_id=', context_id);
        console.log('useEffect messenger_update=', messenger_update);

        if (!is_cancelled && context_id && (!initialized || messenger_update)) {
            const contexts = getContexts();
            if (contexts && Object.keys(contexts).length && messenger.getState() === 'open') {
                const data = { from_store_name: store_name };

                const last_message = messages.length ? messages[messages.length - 1] : null;
                const criteria =
                    last_message && last_message.context
                        ? [
                              {
                                  created: {
                                      gt: new Date(String(last_message.context.created)).toISOString(),
                                      criteria_type: 'date',
                                  },
                              },
                          ]
                        : user_context_id === person_context_id
                        ? [
                              {
                                  parent: {
                                      eq: user_context_id,
                                      criteria_type: 'ObjectId',
                                  },
                              },
                          ]
                        : null;
                if (criteria) {
                    console.log('criteria=', criteria);
                    data.criteria = criteria;
                    if (user_context_id === person_context_id) {
                        data.match_context = true;
                    }
                }

                store.dispatch(
                    store_actions[\`set{makeFunctionalNameString(store_name)}Data\`]({
                        initialized: true,
                        messenger_update: false,
                    }),
                );
                messenger.send({
                    action: 'get',
                    data: data,
                    contexts: contexts,
                });
            } else if (contexts && Object.keys(contexts).length && messenger.getState() !== 'open') {
                console.log('messenger.getState()=', messenger.getState());
            }
        }

        return () => {
            is_cancelled = true;
        };
    });

    return (
        <Div className={\`input__message_container {container_class ?? ''}\`}>
            <textarea
                {...input_message_styles}
                ref={(component) => {
                    const store_name = 'app_storage';
                    if (store_name && component) {
                        store.dispatch(
                            store_actions[\`set{makeFunctionalNameString(store_name)}Data\`]({
                                input_message_field_ref: component,
                            }),
                        );
                    }
                }}
                className={'input__message'}
                value={storeState && storeState.message ? getValueFromStorageItem(storeState.message, true) : ''}
                onChange={(event) => onChange({ event: event })}
                onKeyDown={(event) => onKeyDown({ event: event })}
            />
        </Div>
    );
};

const mapStateToProps = (state) => ({
    storeState: state.messenger_settings,
    userState: state.user_settings,
    personState: state.person_app_settings,
    // userMessagesState: state.main_messages,
    // personMessagesState: state.person_app_messages,
});
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({ ...store_actions }, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(InputMessageField);
`


str = changeTagName(mainApp, 'textarea', {textarea: 'Input'});

// console.log(str);
