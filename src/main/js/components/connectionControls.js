import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';


import ToggleDisplay from 'react-toggle-display';
import {
    Form,
    Glyphicon,
    ControlLabel,
    Button,
    Panel,
    FormGroup,
    FormControl,
    Well,
    Popover,
    OverlayTrigger
} from 'react-bootstrap';

import myClient from '../agents/client';
import validator from '../lib/validation';
import CommitButton from './commitButton';

@inject('controlsStore', 'designStore', 'modalStore')
@observer
export default class ConnectionControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

        if (this.props.controlsStore.connection.connectionId === '') {

            myClient.submitWithToken('GET', '/protected/conn/generateId')
                .then(
                    action((response) => {
                        let params = {
                            description: '',
                            phase: 'HELD',
                            connectionId: response,
                            mode: 'MANUAL'
                        };
                        this.props.controlsStore.setParamsForConnection(params);
                    }));
        }


    }


    // TODO: make sure you can't uncommit past start time


    disposeOfValidate = autorunAsync('validate', () => {
        let validationParams = {
            connection: this.props.controlsStore.connection,
            junctions: this.props.designStore.design.junctions,
            pipes: this.props.designStore.design.pipes,
            fixtures: this.props.designStore.design.fixtures,
        };


        const result = validator.validateConnection(validationParams);
        this.props.controlsStore.setParamsForConnection({
            validation: {
                errors: result.errors,
                acceptable: result.ok
            }
        });


    }, 1000);

    componentWillUnmount() {
        this.disposeOfValidate();
    }

    onDescriptionChange = (e) => {
        const params = {
            description: e.target.value
        };
        this.props.controlsStore.setParamsForConnection(params);
    };

    onBuildModeChange = (e) => {
        const params = {
            mode: e.target.value
        };
        this.props.controlsStore.setParamsForConnection(params);

    };

    render() {
        const conn = this.props.controlsStore.connection;


        let helpPopover = <Popover id='help-buildMode' title='Build Mode Help'>
            <p>Auto: The connection will be configured on network devices ("built") on schedule at start time. No
                further action needed.</p>
            <p>Manual: The connection will <b>not</b> be built at start time. Once the connection has been committed,
                you can
                use the controls in the connection details page to build / dismantle it.</p>
            <p>Mode seleciton is not final. In the connection details page, you can switch between modes, as long as
                end time has not been reached.</p>
            <p>In either mode, once end time is reached the connection will be dismantled.</p>
        </Popover>;

        return (
            <Panel>
                <Panel.Body>
                    <Form onSubmit={e => {
                        e.preventDefault();
                    }}>
                        <Well bsSize='small' onClick={() => {
                            this.props.modalStore.openModal('designHelp')
                        }}>
                            <h3>Help me! <Glyphicon className='pull-right' glyph='question-sign'/></h3>
                            <p>Connection id: {this.props.controlsStore.connection.connectionId}</p>
                        </Well>
                        <FormGroup validationState={validator.descriptionControl(conn.description)}>
                            {' '}
                            <ControlLabel>
                                Description:
                            </ControlLabel>
                            <FormControl type='text' placeholder='Type a description'
                                         defaultValue={conn.description}

                                         onChange={this.onDescriptionChange}/>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>
                                Build Mode:
                            </ControlLabel>
                            <OverlayTrigger trigger='click' rootClose placement='right' overlay={helpPopover}>
                                <Glyphicon className='pull-right' glyph='question-sign'/>
                            </OverlayTrigger>
                            {' '}
                            <FormControl componentClass="select"
                                         onChange={this.onBuildModeChange}>
                                <option value='AUTOMATIC'>Auto</option>
                                <option value='MANUAL'>Manual</option>
                            </FormControl>
                        </FormGroup>


                        <FormGroup className='pull-right'>
                            <ToggleDisplay show={!conn.validation.acceptable}>
                                <Button bsStyle='warning' className='pull-right'
                                        onClick={() => {
                                            this.props.modalStore.openModal('connectionErrors');
                                        }}>Display errors</Button>{' '}
                            </ToggleDisplay>
                            {/*
                            <ToggleDisplay show={conn.phase === 'RESERVED' && conn.schedule.start.at > new Date()}>
                                <UncommitButton/>{' '}
                            </ToggleDisplay>
                            */
                            }

                            <ToggleDisplay show={conn.validation.acceptable && conn.phase === 'HELD'}>
                                <CommitButton/>
                            </ToggleDisplay>
                        </FormGroup>
                    </Form>
                </Panel.Body>
            </ Panel>
        );
    }
}
