import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';

import chrono from 'chrono-node';
import Moment from 'moment';

import ToggleDisplay from 'react-toggle-display';
import {HelpBlock, Form, Button, Panel, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import myClient from '../agents/client';
import validator from '../lib/validation';
import {PrecheckButton, HoldButton, ReleaseButton, CommitButton} from './controlButtons';


@inject('controlsStore', 'stateStore', 'designStore')
@observer
export default class SandboxControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let startAt = new Date();
        startAt.setTime(startAt.getTime() + 5 * 60 * 1000);

        let endAt = new Date();
        endAt.setDate(endAt.getDate());
        endAt.setTime(endAt.getTime() + 20 * 60 * 1000);

        myClient.loadJSON({method: 'GET', url: '/resv/newConnectionId'})
            .then(
                action((response) => {
                    let connId = JSON.parse(response)['connectionId'];
                    let params = {
                        startAt: startAt,
                        startAtInput: 'in 5 minutes',
                        endAt: endAt,
                        endAtInput: 'in 20 minutes',
                        description: '',
                        connectionId: connId
                    };
                    this.props.controlsStore.setParamsForConnection(params);
                }));

    }

    isDisabled = (what) => {
        let connState = this.props.stateStore.st.connState;
        if (what === 'validate') {
            return connState !== 'INITIAL';
        }
        if (what === 'precheck') {
            return connState !== 'VALIDATE_OK';
        }
        if (what === 'hold') {
            return connState !== 'CHECK_OK';

        }
        if (what === 'release') {
            return true;
            // TODO: implement release, then
            // return connState !== 'HOLD_OK';
        }
        if (what === 'commit') {
            return connState !== 'HOLD_OK';
        }
    };

    disposeOfValidate = autorunAsync('validate', () => {
        let validationParams = {
            connection: this.props.controlsStore.connection,
            junctions: this.props.designStore.design.junctions,
            fixtures: this.props.designStore.design.fixtures,
            pipes: this.props.designStore.design.pipes,
        };
        const result = validator.validatePrecheck(validationParams);
        setTimeout(() => {
            this.props.stateStore.validate();
            this.props.stateStore.postValidate(result.ok, result.errors);
        }, 15);


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

    onStartDateChange = (e) => {
        let expr = e.target.value;

        let parsed = chrono.parseDate(expr);
        let params = {
            startAtValidation: 'error',
            startAtValidationText: 'Set new value',
            endAtValidationText: ''
        }
        if (parsed !== null) {
            params.startAtInput = expr;
            params.endAtInput = toJS(this.props.controlsStore.connection.endAtInput);
            this.validateStartEnd(params);
        } else {
            params.startAtValidationText = 'Invalid date';
        }
        this.props.controlsStore.setParamsForConnection(params);
    };

    onEndDateChange = (e) => {
        let expr = e.target.value;
        let params = {
            startAtValidationText: '',
            endAtValidation: 'error',
            endAtValidationText: 'Set new value',
        };

        let parsed = chrono.parseDate(expr);
        if (parsed !== null) {
            params.startAtInput = toJS(this.props.controlsStore.connection.startAtInput);
            params.endAtInput = expr;
            this.validateStartEnd(params);
        } else {
            params.endAtValidationText = 'Invalid date.';
        }
        this.props.controlsStore.setParamsForConnection(params);
    };

    validateStartEnd(params) {
        params.startAtValidation = 'success';
        params.endAtValidation = 'success';

        let startAt = chrono.parseDate(params.startAtInput);
        let endAt = chrono.parseDate(params.endAtInput);
        let startError = false;
        let endError = false;

        if (startAt < new Date()) {
            params.startAtValidation = 'error';
            params.startAtValidationText = 'Start time is before now.';
            startError = true;
        }
        if (endAt < new Date()) {
            params.endAtValidation = 'error';
            params.endAtValidationText = 'End time is before now.';
            endError = true;
        }

        if (startAt > endAt) {
            params.startAtValidation = 'error';
            params.endAtValidation = 'error';
            params.startAtValidationText = 'Start time before end time.';
            params.endAtValidationText = 'Start time before end time.';
            startError = true;
            endError = true;
        }
        if (!startError) {
            params.startAt = startAt;
        }
        if (!endError) {
            params.endAt = endAt;
        }

    }


    render() {
        const conn = this.props.controlsStore.connection;
        const header = <span>Connection id: {conn.connectionId}</span>;
        const format = 'Y/MM/DD HH:mm';

        return (
            <Panel header={header}>
                <Form >
                    <FormGroup validationState={validator.descriptionControl(conn.description)}>
                        {' '}
                        <FormControl type='text' placeholder='description'
                                     defaultValue={conn.description}
                                     onChange={this.onDescriptionChange}/>
                    </FormGroup>
                    {' '}
                    <FormGroup validationState={conn.startAtValidation}>
                        <ControlLabel>Start:</ControlLabel>
                        <FormControl type='text'
                                     defaultValue='in 5 minutes'
                                     onChange={this.onStartDateChange}/>

                        <HelpBlock><p>{Moment(conn.startAt).format(format)}</p><p>{conn.startAtValidationText}</p>
                        </HelpBlock>
                    </FormGroup>
                    {' '}
                    <FormGroup validationState={conn.endAtValidation}>
                        <ControlLabel>End:</ControlLabel>
                        <FormControl type='text'
                                     defaultValue='in 20 minutes'
                                     onChange={this.onEndDateChange}/>
                        <HelpBlock><p>{Moment(conn.endAt).format(format)}</p><p>{conn.endAtValidationText}</p>
                        </HelpBlock>
                    </FormGroup>
                    {' '}
                    <FormGroup className='pull-right'>
                        <ToggleDisplay show={this.props.stateStore.st.errors.length > 0}>
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={() => {
                                        this.props.controlsStore.openModal('displayErrors');
                                    }}>Display errors</Button>{' '}
                        </ToggleDisplay>
                        <ToggleDisplay show={!this.isDisabled('precheck')}>
                            <PrecheckButton />{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('hold')}>
                            <HoldButton />{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('release')}>
                            <ReleaseButton />{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('commit')}>
                            <CommitButton />{' '}
                        </ToggleDisplay>
                    </FormGroup>


                </Form>
            </ Panel >
        );
    }
}