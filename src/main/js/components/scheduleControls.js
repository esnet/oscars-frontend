import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS, whyRun} from 'mobx';
import ToggleDisplay from 'react-toggle-display';
import Confirm from 'react-confirm-bootstrap';

import chrono from 'chrono-node';
import Moment from 'moment';
import jstz from 'jstz';

import {
    HelpBlock, Form, Button, Panel, FormGroup,
    FormControl, ControlLabel, Popover, Glyphicon, OverlayTrigger
} from 'react-bootstrap';

const format = 'Y/MM/DD HH:mm:ss';

@inject('controlsStore', 'designStore', 'topologyStore')
@observer
export default class ScheduleControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let startAt = new Date();
        startAt.setTime(startAt.getTime() + 15 * 60 * 1000);

        let endAt = new Date();
        endAt.setDate(endAt.getDate() + 365);
        endAt.setTime(endAt.getTime());

        let params = {
            schedule: {
                acceptable: true,
                locked: true,
                start: {
                    at: startAt,
                    choice: 'in 15 minutes',
                    readable: Moment(startAt).format(format),
                    validationState: 'success',
                    validationText: '',
                },
                end: {
                    at: endAt,
                    choice: 'in 1 year',
                    readable: Moment(endAt).format(format),
                    validationState: 'success',
                    validationText: '',
                }
            }
        };
        this.props.controlsStore.setParamsForConnection(params);
        this.periodicCheck();

    }

    periodicCheck() {
        let conn = this.props.controlsStore.connection;
        if (conn.schedule.locked) {
            const startSec = conn.schedule.start.at.getTime() / 1000;
            const endSec = conn.schedule.end.at.getTime() / 1000;
            this.props.topologyStore.loadAvailable(startSec, endSec);
        }

        if (!conn.schedule.locked) {
            let params = {
                schedule: {
                    start: {
                        choice: conn.schedule.start.choice
                    },
                    end: {
                        choice: conn.schedule.end.choice
                    }

                }
            };

            this.validateStartEnd(params);
            this.props.controlsStore.setParamsForConnection(params);

        }

        if (conn.schedule.start.at < new Date()) {
            this.props.controlsStore.setParamsForConnection({
                schedule: {
                    locked: false,
                    acceptable: false,
                    start: {
                        validationState: 'error',
                        validationText: 'Start time is before now.'
                    }
                }
            });
            this.props.designStore.unlockAll();
        }

        if (conn.schedule.end.at < new Date()) {
            this.props.controlsStore.setParamsForConnection({
                schedule: {
                    locked: false,
                    acceptable: false,
                    end: {
                        validationState: 'error',
                        validationText: 'End time is before now.'
                    }
                }
            });
            this.props.designStore.unlockAll();
        }

        this.timeoutId = setTimeout(() => {
            this.periodicCheck()
        }, 5000);

    }

    disposeOfUpdateAvailable = autorunAsync('updateAvailable', () => {
        let conn = this.props.controlsStore.connection;
        if (conn.schedule.locked) {
            const startSec = conn.schedule.start.at.getTime() / 1000;
            const endSec = conn.schedule.end.at.getTime() / 1000;
            this.props.topologyStore.loadAvailable(startSec, endSec);
        }

    }, 1000);


    componentWillUnmount() {
        this.disposeOfUpdateAvailable();
        clearTimeout(this.timeoutId);
        this.props.controlsStore.setParamsForConnection({schedule: {locked: false}});
    }

    onStartDateChange = (e) => {
        let expr = e.target.value;
        let conn = this.props.controlsStore.connection;

        let parsed = chrono.parseDate(expr);
        let params = {
            schedule: {
                start: {
                    validationState: 'error',
                    validationText: '',
                },
                end: {
                    validationText: '',

                }
            }
        };

        if (parsed !== null) {
            params.schedule.start.choice = expr;
            params.schedule.end.choice = toJS(conn.schedule.end.choice);
            this.validateStartEnd(params);
        } else {
            params.schedule.start.validationText = 'Invalid date';
            params.schedule.acceptable = false;
        }
        this.props.controlsStore.setParamsForConnection(params);

    };

    onEndDateChange = (e) => {
        let expr = e.target.value;
        let conn = this.props.controlsStore.connection;

        let params = {
            schedule: {
                start: {
                    validationText: '',
                },
                end: {
                    validationState: 'error',
                    validationText: '',
                }
            }
        };

        let parsed = chrono.parseDate(expr);
        if (parsed !== null) {
            params.schedule.start.choice = toJS(conn.schedule.start.choice);
            params.schedule.end.choice = expr;
            this.validateStartEnd(params);
        } else {
            params.schedule.end.validationText = 'Invalid date';
            params.schedule.acceptable = false;
        }
        this.props.controlsStore.setParamsForConnection(params);
    };

    validateStartEnd(params) {
        params.schedule.start.validationState = 'success';
        params.schedule.end.validationState = 'success';

        let startAt = chrono.parseDate(params.schedule.start.choice);
        let endAt = chrono.parseDate(params.schedule.end.choice);

        let startError = false;
        let endError = false;
        let startAtReadable = Moment(startAt).format(format);
        let endAtReadable = Moment(endAt).format(format);

        if (startAt < new Date()) {
            params.schedule.start.validationState = 'error';
            params.schedule.start.validationText = 'Start time is before now.';
            startError = true;
        }
        if (endAt < new Date()) {
            params.schedule.end.validationState = 'error';
            params.schedule.end.validationText = 'End time is before now.';
            endError = true;
        }

        if (startAt > endAt) {
            params.schedule.start.validationState = 'error';
            params.schedule.end.validationState = 'error';
            params.schedule.end.validationText = 'Start time before end time.';
            params.schedule.start.validationText = 'Start time before end time.';
            startError = true;
            endError = true;
        }
        if (!startError) {
            params.schedule.start.readable = startAtReadable;
            params.schedule.start.at = startAt;
        }
        if (!endError) {
            params.schedule.end.readable = endAtReadable;
            params.schedule.end.at = endAt;
        }

        params.schedule.acceptable = !(startError || endError);
        console.log(toJS(params));

    }

    lockSchedule = () => {
        let conn = this.props.controlsStore.connection;
        let params = {
            schedule: {
                start: {
                    choice: toJS(conn.schedule.start.choice)
                },
                end: {
                    choice: toJS(conn.schedule.end.choice)
                }
            }
        };

        this.validateStartEnd(params);
        if (params.schedule.start.validationState === 'error' ||
            params.schedule.end.validationState === 'error') {
            // do not lock
        } else {
            params.schedule.locked = true;
        }
        this.props.controlsStore.setParamsForConnection(params);
    };

    unlockSchedule = () => {
        let conn = this.props.controlsStore.connection;
        let params = {
            schedule: {
                locked: false,
                start: {
                    choice: toJS(conn.schedule.start.choice)
                },
                end: {
                    choice: toJS(conn.schedule.end.choice)
                }
            }
        };

        this.validateStartEnd(params);
        this.props.controlsStore.setParamsForConnection(params);
        this.props.designStore.unlockAll();
    };


    render() {
        const conn = this.props.controlsStore.connection;
        const sched = conn.schedule;
        const timezone = jstz.determine();


        let help = <Popover id='help-schedule' title='Schedule help'>
            <p>Type in the desired date / time for your connection to start and end.
                A start time either in the past or after the end time is not accepted.</p>
            <p>Then, click "Lock schedule", so that the system can then
                calculate resource availability.</p>
            <p>Relative time expressions such as "in 10 minutes" are accepted,
                but they are only evaluated when you type them in.
                The resulting times will not change as time passes.</p>
            <p>Unlocking the schedule will also unlock all other resources.</p>
        </Popover>;


        return (
            <Panel>
                <Panel.Heading>
                    <span>Schedule
                        <OverlayTrigger
                            defaultOverlayShown={false} trigger='click' rootClose placement='right' overlay={help}>
                            <Glyphicon className='pull-right' glyph='question-sign'/>
                        </OverlayTrigger>
                    </span>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <p>Timezone: {timezone.name()}</p>

                        <FormGroup validationState={sched.start.validationState}>
                            <ControlLabel>Start:</ControlLabel>
                            <FormControl type='text'
                                         defaultValue='in 15 minutes'
                                         disabled={sched.locked}
                                         onChange={this.onStartDateChange}/>
                            <HelpBlock>
                                <p>{sched.start.readable}</p><p>{sched.start.validationText}</p>
                            </HelpBlock>
                        </FormGroup>
                        {' '}
                        <FormGroup validationState={sched.end.validationState}>
                            <ControlLabel>End:</ControlLabel>
                            <FormControl type='text'
                                         disabled={sched.locked}
                                         defaultValue='in 1 year'
                                         onChange={this.onEndDateChange}/>
                            <HelpBlock>
                                <p>{sched.end.readable}</p><p>{sched.end.validationText}</p>
                            </HelpBlock>
                        </FormGroup>
                        <ToggleDisplay show={!sched.locked && sched.acceptable && conn.phase === 'HELD'}>

                            <Button bsStyle='primary' onClick={this.lockSchedule}>Lock schedule</Button>
                        </ToggleDisplay>
                        <ToggleDisplay show={sched.locked && conn.phase === 'HELD'}>
                            <Confirm
                                onConfirm={this.unlockSchedule}
                                body="Unlocking the schedule will unlock all components and release all resources, including pipe and fixture bandwidths and VLANs."
                                confirmText="Confirm"
                                title="Unlock Schedule">
                                <Button className='pull-right' bsStyle='warning'>Unlock</Button>
                            </Confirm>


                        </ToggleDisplay>
                    </Form>
                </Panel.Body>

            </Panel>
        );
    }
}