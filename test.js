const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `
<>
    <div className={\`card calculation \`} ref={(component) => (state.reference = component)}>
        <div className={['calculation__header', \`calculation_\`].join(space_symbol)}>
            <div className={'header_title'}>
                <img
                    className={['header_title__logo', \`logo_\`].join(space_symbol)}
                    src={logo_file.src}
                    alt={translator('Логотип СК', appState.language)}
                />
            </div>
            <div className={'header_title header_title__period'}>
                <span>{\` - \`}</span>
            </div>
        </div>
        <div className={['product__container', \`product_\`].join(space_symbol)}>
            <div className={'product_describes_container'}>
                <div className={'product_describes'}>
                    {secondary_bso ? (
                        <span className={'product_minor_info'}>{secondary_bso.channel.name}</span>
                    ) : (
                        <></>
                    )}
                    <span className={'product_name'}>
                        {secondary_bso
                            ? \`\`
                            : \`\`}
                    </span>
                </div>
            </div>
            <div className={'product_indicators'}>
                <span className={'insarm_icon product_indicators__indicator'}>
                    {insarm_icons.drivers_licenses_2}
                </span>
                <span className={'insarm_icon product_indicators__indicator'}>
                    {insarm_icons.underwriting}
                </span>
            </div>
        </div>
        <div className={'calculation__body'}>
            <div className={'calculation__car_review'}>
                <span
                    className={'text_uppercase text_weight_400 justify_content_center align_items_center'}>
                    Infiniti
                    <img className={'image_inline'} src={chevron_right_file.src} alt={'arrow delimiter'} />
                </span>
                <span className={'text_weight_300 justify_content_center align_items_center'}>
                    QX50
                    <img className={'image_inline'} src={chevron_right_file.src} alt={'arrow delimiter'} />
                </span>
                <span className={'text_weight_200'}>2018</span>
            </div>
            <div className={'calculation__parameters_list'}>
                <span className={'calculation_parameter'}>
                    Категория B
                    <img className={'list_dot_delimiter'} src={dot_delimiter.src} alt={'dot delimiter'} />
                </span>
                <span className={'calculation_parameter'}>
                    249.00 л.с.
                    <img className={'list_dot_delimiter'} src={dot_delimiter.src} alt={'dot delimiter'} />
                </span>
                <span className={'calculation_parameter'}>
                    К472МТ799
                    <img className={'list_dot_delimiter'} src={dot_delimiter.src} alt={'dot delimiter'} />
                </span>
                <span className={'calculation_parameter'}>3PCMANJ55Z0550849</span>
            </div>
            <hr />
            <div className={'calculation_inner_section'}>
                <div className={'calculation_insurer'}>
                    <span
                        className={[
                            'product_minor_info',
                            'text_uppercase',
                            'text_smaller_p40',
                            'text_weight_400',
                            'margin_bottom_st',
                        ].join(space_symbol)}>
                        {insurer_title}
                    </span>
                    <div className={'client__container'}>
                        <Avatar
                            to={insurer.url}
                            alt={\`\`}
                            classNameContainer={'client__avatar_container'}
                            {...{
                                src: insurer.avatar_url,
                                type: insurer.avatar_is_default ? 'svg' : '',
                            }}
                        />
                        <span>
                            {insurer.surname} {insurer.name} {insurer.middle_name}
                        </span>
                    </div>
                </div>
                {insurer.pk !== beneficiary.pk ? (
                    <div className={'calculation_insurer'}>
                        <span
                            className={[
                                'product_minor_info',
                                'text_uppercase',
                                'text_smaller_p40',
                                'text_weight_400',
                                'margin_bottom_st',
                            ].join(space_symbol)}>
                            {'Выгодоприобретатель'}
                        </span>
                        <div className={'client__container'}>
                            <Avatar
                                to={beneficiary.url}
                                alt={\`\`}
                                classNameContainer={'client__avatar_container'}
                                {...{
                                    src: beneficiary.avatar_url,
                                    type: beneficiary.avatar_is_default ? 'svg' : '',
                                }}
                            />
                            <span>
                                {beneficiary.surname} {beneficiary.name} {beneficiary.middle_name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
        {primary_bso ? (
            <div className={['product__container', \`product_\`].join(space_symbol)}>
                <div className={'product_describes_container'}>
                    <div className={'product_describes'}>
                        <span className={'product_minor_info'}>{'Наличные'}</span>
                        <span className={'product_name text_bigger_p40'}>{'8 000,00'}</span>
                        <span className={'product_minor_info'}>{'Указанное кассиром АВ: 28.50 %'}</span>
                        <span className={'product_minor_info text_smaller_p15'}>
                            {\`\`}
                        </span>
                    </div>
                </div>
                <div className={'product_indicators'}>
                    <span className={'insarm_icon product_indicators__indicator'}>
                        {insarm_icons.drivers_licenses_2}
                    </span>
                    <span className={'insarm_icon product_indicators__indicator'}>
                        {insarm_icons.underwriting}
                    </span>
                </div>
            </div>
        ) : (
            <></>
        )}
        <div className={['calculation__footer', \`calculation_\`].join(space_symbol)}>
            <div className={'header_title'}>{space_symbol}</div>
        </div>
    </div>
</>
`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
platformTransforms(mainApp);

