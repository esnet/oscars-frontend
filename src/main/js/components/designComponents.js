import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import validator from '../lib/validation'
import {Panel, Glyphicon, Nav, NavItem, OverlayTrigger, Popover} from 'react-bootstrap';
import transformer from '../lib/transform';
import ToggleDisplay from 'react-toggle-display';

@inject('designStore', 'controlsStore')
@observer
export default class DesignComponents extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const design = this.props.designStore.design;


        let compHelp = <Popover id='help-designComponents' title='Help'>
            This list will auto-update to reflect changes to
            the design junctions, fixtures, and pipes as they are
            added, deleted, or updated.
            Click on any component to bring up its edit form.
            Any component with an orange flag needs attention from the user.
        </Popover>;

        let header = <p>Components
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={compHelp}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>


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
                                        this.props.controlsStore.openModal('editFixture');
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
                                        this.props.controlsStore.openModal('editJunction');
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

                                    this.props.controlsStore.openModal('editPipe');
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