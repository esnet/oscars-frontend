import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorun, toJS} from 'mobx';
import FontAwesome from 'react-fontawesome';
import ToggleDisplay from 'react-toggle-display';
import {
    Alert,
    Form,
    Label,
    Button,
    Card, CardBody, CardHeader,
    FormGroup,
    Input,
    Popover, PopoverBody, PopoverHeader
} from 'reactstrap';

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

        this.setState({
            showHelp: false
        })

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

    toggleHelp = () => {
        this.setState({
            showHelp: !this.state.showHelp
        });
    };

    render() {
        const conn = this.props.controlsStore.connection;
        const buildHelp =
            <span className='pull-right'>
                <FontAwesome
                    onClick={this.toggleHelp}
                    className='pull-right'
                    name='question'
                    id='buildHelpIcon'
                />
                <Popover placement='right'
                         isOpen={this.state.showHelp}
                         target='buildHelpIcon'
                         toggle={this.toggleHelp}>
                    <PopoverHeader>Build mode help</PopoverHeader>
                    <PopoverBody>
                        <p>Auto: The connection will be configured on network devices ("built") on schedule at start time. No
                            further action needed.</p>
                        <p>Manual: The connection will <b>not</b> be built at start time. Once the connection has been committed,
                            you can
                            use the controls in the connection details page to build / dismantle it.</p>
                        <p>Mode seleciton is not final. In the connection details page, you can switch between modes, as long as
                            end time has not been reached.</p>
                        <p>In either mode, once end time is reached the connection will be dismantled.</p>
                    </PopoverBody>
                </Popover>
        </span>;


        return (
            <Card>
                <CardBody>
                    <Form onSubmit={e => {
                        e.preventDefault();
                    }}>
                        <Alert color='info' onClick={() => {
                            this.props.modalStore.openModal('designHelp')
                        }}>
                            <strong>Help me! <FontAwesome className='pull-right' name='question'/></strong>
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
                            {buildHelp}
                            {' '}
                            <Input type='select' onChange={this.onBuildModeChange}>
                                <option value='AUTOMATIC'>Auto</option>
                                <option value='MANUAL'>Manual</option>
                            </Input>
                        </FormGroup>


                        <FormGroup className='pull-right'>
                            <ToggleDisplay show={!conn.validation.acceptable}>
                                <Button color='warning' className='pull-right'
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
