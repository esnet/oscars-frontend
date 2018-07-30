import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorun, toJS} from 'mobx';
import Octicon from 'react-octicon'
import ToggleDisplay from 'react-toggle-display';
import {
    Alert,
    Form,
    Label,
    Button,
    Card, CardBody,
    FormGroup,
    Input
} from 'reactstrap';

import myClient from '../../agents/client';
import validator from '../../lib/validation';
import CommitButton from './commitButton';
import HelpPopover from '../helpPopover';

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
                            mode: 'AUTOMATIC'
                        };
                        this.props.controlsStore.setParamsForConnection(params);
                    }));
        }


    }


    // TODO: make sure you can't uncommit past start time


    disposeOfValidate = autorun(() => {
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


    }, {delay: 1000});

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

        const helpHeader = <span>Build mode help</span>;
        const helpBody = <span>
            <p>Auto: The connection will be configured on network devices ("built") on schedule at start time. No
                further action needed.</p>
            <p>Manual: The connection will <b>not</b> be built at start time. Once the connection has been committed,
                you can
                use the controls in the connection details page to build / dismantle it.</p>
            <p>Mode seleciton is not final. In the connection details page, you can switch between modes, as long as
                end time has not been reached.</p>
            <p>In either mode, once end time is reached the connection will be dismantled.</p>
        </span>;

        const help = <span className='float-right'>
            <HelpPopover header={helpHeader} body={helpBody} placement='right' popoverId='buildHelp'/>
        </span>;


        return (
            <Card>
                <CardBody>
                    <Form onSubmit={e => {
                        e.preventDefault();
                    }}>
                        <Alert color='info'>
                            <strong>Help me!
                                <span className='float-right'>
                                        <Octicon name='info' style={
                                            {height: '18px', width: '18px', cursor: 'pointer'}
                                        }
                                                 onClick={() => {
                                                     this.props.modalStore.openModal('designHelp')
                                                 }}
                                        />
                                </span>
                            </strong>
                            <div>Connection id: {this.props.controlsStore.connection.connectionId}</div>
                        </Alert>
                        <FormGroup>
                            {' '}
                            <Label>
                                Description:
                            </Label>
                            <Input type='text' placeholder='Type a description'
                                   valid={validator.descriptionControl(conn.description) === 'success'}
                                   defaultValue={conn.description}
                                   onChange={this.onDescriptionChange}/>
                        </FormGroup>
                        <FormGroup>
                            <Label>
                                Build Mode:
                            </Label>
                            {help}
                            {' '}
                            <Input type='select' onChange={this.onBuildModeChange}>
                                <option value='AUTOMATIC'>Scheduled</option>
                                <option value='MANUAL'>Manual</option>
                            </Input>
                        </FormGroup>


                        <FormGroup className='float-right'>
                            <ToggleDisplay show={!conn.validation.acceptable}>
                                <Button color='warning' className='float-right'
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
                </CardBody>
            </Card>
        );
    }
}
