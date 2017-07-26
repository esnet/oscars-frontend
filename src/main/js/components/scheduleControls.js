import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS, whyRun} from 'mobx';
import ToggleDisplay from 'react-toggle-display';

import chrono from 'chrono-node';
import Moment from 'moment';

import {HelpBlock, Form, Button, Panel, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

const format = 'Y/MM/DD HH:mm';

@inject('controlsStore', 'stateStore', 'designStore', 'topologyStore')
@observer
export default class ScheduleControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let startAt = new Date();
        startAt.setTime(startAt.getTime() + 5 * 60 * 1000);

        let endAt = new Date();
        endAt.setDate(endAt.getDate());
        endAt.setTime(endAt.getTime() + 20 * 60 * 1000);

        let params = {
            startAt: startAt,
            startAtInput: 'in 5 minutes',
            startAtValidation: 'success',
            startAtReadable: Moment(startAt).format(format),
            endAt: endAt,
            endAtInput: 'in 20 minutes',
            endAtValidation: 'success',
            endAtReadable: Moment(endAt).format(format),

        };
        this.props.controlsStore.setParamsForConnection(params);

    }


    disposeOfUpdateAvailable = autorunAsync('updateAvailable', () => {
        let conn = this.props.controlsStore.connection;
        this.props.topologyStore.loadAvailable(conn.startAt.getTime() / 1000, conn.endAt.getTime() / 1000);

    }, 1000);


    componentWillUnmount() {
        this.disposeOfUpdateAvailable();
    }

    onStartDateChange = (e) => {
        let expr = e.target.value;

        let parsed = chrono.parseDate(expr);
        let params = {
            startAtValidation: 'error',
            startAtValidationText: '',
            endAtValidationText: ''
        };

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
            endAtValidationText: '',
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
        let startAtReadable = Moment(startAt).format(format);
        let endAtReadable = Moment(endAt).format(format);


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
            params.startAtReadable = startAtReadable;
            params.startAt = startAt;
        }
        if (!endError) {
            params.endAtReadable = endAtReadable;
            params.endAt = endAt;
        }

    }

    lockSchedule = () => {
        this.props.controlsStore.setParamsForConnection({
            scheduleLocked: true
        });

    };
    unlockSchedule = () => {
        let params = {};

        params.startAtInput = toJS(this.props.controlsStore.connection.startAtInput);
        params.endAtInput = toJS(this.props.controlsStore.connection.endAtInput);
        params.scheduleLocked = false;
        this.validateStartEnd(params);

        this.props.controlsStore.setParamsForConnection(params);

    };


    render() {
        const conn = this.props.controlsStore.connection;


        return (
            <Panel>
                <Form>

                    <FormGroup validationState={conn.startAtValidation}>
                        <ControlLabel>Start:</ControlLabel>
                        <FormControl type='text'
                                     defaultValue='in 5 minutes'
                                     disabled={conn.scheduleLocked}
                                     onChange={this.onStartDateChange}/>
                        <HelpBlock>
                            <p>{conn.startAtReadable}</p><p>{conn.startAtValidationText}</p>
                        </HelpBlock>
                    </FormGroup>
                    {' '}
                    <FormGroup validationState={conn.endAtValidation}>
                        <ControlLabel>End:</ControlLabel>
                        <FormControl type='text'
                                     disabled={conn.scheduleLocked}
                                     defaultValue='in 20 minutes'
                                     onChange={this.onEndDateChange}/>
                        <HelpBlock>
                            <p>{conn.endAtReadable}</p><p>{conn.endAtValidationText}</p>
                        </HelpBlock>
                    </FormGroup>
                    <ToggleDisplay show={!conn.scheduleLocked}>
                        <Button className='pull-right' bsStyle='primary' onClick={this.lockSchedule}>Lock
                            schedule</Button>
                    </ToggleDisplay>
                    <ToggleDisplay show={conn.scheduleLocked}>
                        <Button className='pull-right' bsStyle='warning' onClick={this.unlockSchedule}>Unlock</Button>
                    </ToggleDisplay>
                </Form>


            </Panel>
        );
    }
}