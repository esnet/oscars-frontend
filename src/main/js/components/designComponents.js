import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import validator from '../lib/validation'
import {Panel, Glyphicon, Nav, NavItem, OverlayTrigger, Popover} from 'react-bootstrap';
import transformer from '../lib/transform';
import ToggleDisplay from 'react-toggle-display';

@inject('designStore', 'controlsStore', 'modalStore')
@observer
export default class DesignComponents extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const design = this.props.designStore.design;


        let compHelp = <Popover id='help-designComponents' title='Component list'>
            <p>This displays the current design's junctions, fixtures, and pipes.
                It will auto-update as these are added, deleted, or updated.</p>

            <p>An orange flag icon indicates an unlocked component; a green checkmark means it is locked.
                All components must be locked before the connection can be committed.</p>
            <p>You may click on any component to bring up its edit form.</p>
        </Popover>;

        let header = <p>Components
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={compHelp}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (

            <Panel header={header} >
                <ToggleDisplay show={design.junctions.length > 0}>
                    <h5><u>Junctions & fixtures</u></h5>
                    {
                        design.junctions.map((junction) => {
                            let device = junction.id;
                            let fixtureNodes = design.fixtures.map((fixture) => {
                                if (fixture.device === device) {
                                    let key = fixture.id;
                                    let label = fixture.label;
                                    const validationLabel = validator.fixtureLabel(fixture);

                                    return <NavItem key={key} onClick={() => {
                                        const params = transformer.existingFixtureToEditParams(fixture);
                                        this.props.controlsStore.setParamsForEditFixture(params);
                                        this.props.modalStore.openModal('editFixture');
                                    }}>
                                        {validationLabel}
                                        {' '}
                                        {label}
                                    </NavItem>

                                }
                            });

                            return (
                                <Nav bsStyle='pills' stacked key={device + 'nav'}>
                                    <NavItem active={true} key={device} onClick={() => {
                                        this.props.controlsStore.setParamsForEditJunction({junction: device});
                                        this.props.modalStore.openModal('editJunction');
                                    }}
                                    ><b><u>{device}</u></b></NavItem>
                                    {fixtureNodes}

                                </Nav>
                            )

                        })
                    }
                </ToggleDisplay>
                <ToggleDisplay show={design.pipes.length > 0}>
                    <h5><u>Pipes</u></h5>
                    <Nav bsStyle='pills' stacked>
                        {
                            design.pipes.map((pipe) => {
                                const validationLabel = validator.pipeLabel(pipe);

                                return <NavItem key={pipe.id} onClick={() => {
                                    const params = transformer.existingPipeToEditParams(pipe);
                                    this.props.controlsStore.setParamsForEditPipe(params);

                                    this.props.modalStore.openModal('editPipe');
                                }}>{validationLabel}
                                    {' '}
                                    {pipe.a} --- {pipe.z}
                                </NavItem>
                            })
                        }
                    </Nav>
                </ToggleDisplay>
            </Panel>
        )
    };

};
