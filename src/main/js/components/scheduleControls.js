import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {autorun, toJS} from 'mobx';
import ToggleDisplay from 'react-toggle-display';

import chrono from 'chrono-node';
import Moment from 'moment';
import jstz from 'jstz';
import {size} from 'lodash-es';
import FontAwesome from 'react-fontawesome';

import {
    FormFeedback, Form, FormText, Button,
    Card, CardHeader, CardBody,
    Modal, ModalBody, ModalHeader, ModalFooter,
    FormGroup, Input, Label,
    Popover, PopoverHeader, PopoverBody
} from 'reactstrap';

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
                    parsed: true,
                    readable: Moment(startAt).format(format),
                    validationState: 'success',
                    validationText: '',
                },
                end: {
                    at: endAt,
                    choice: 'in 1 year',
                    parsed: true,
                    readable: Moment(endAt).format(format),
                    validationState: 'success',
                    validationText: '',
                }
            }
        };
        this.props.controlsStore.setParamsForConnection(params);
        this.periodicCheck();
        this.setState({
            showHelp: false,
            unlockConfirmOpen: false
        });
    }

    periodicCheck() {
        let conn = this.props.controlsStore.connection;
        if (conn.schedule.locked) {
            const startSec = conn.schedule.start.at.getTime() / 1000;
            const endSec = conn.schedule.end.at.getTime() / 1000;
            this.props.topologyStore.loadAvailable(startSec, endSec);
        }

        /*
        if the schedule input is not acceptable after it's been changed etc, unlock all resources
         */
        if (!conn.schedule.acceptable) {
            this.props.designStore.unlockAll();
            return;
        }

        /*
        now check if we're past the start time
         */

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

        // now do this check again in 5 sec

        this.timeoutId = setTimeout(() => {
            this.periodicCheck()
        }, 5000);

    }

    disposeOfUpdateAvailable = autorun(() => {
        let conn = this.props.controlsStore.connection;
        if (conn.schedule.locked) {
            const startSec = conn.schedule.start.at.getTime() / 1000;
            const endSec = conn.schedule.end.at.getTime() / 1000;
            this.props.topologyStore.loadAvailable(startSec, endSec);
        }

    }, {delay: 1000});


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
                    parsed: false
                },
                end: {
                    validationState: conn.schedule.end.validationState,
                    validationText: conn.schedule.end.validationText,
                    parsed: conn.schedule.end.parsed

                }

            }
        };

        if (parsed !== null) {
            params.schedule.start.choice = expr;
            params.schedule.start.parsed = true;
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
                    validationState: conn.schedule.start.validationState,
                    validationText: conn.schedule.start.validationText,
                    parsed: conn.schedule.start.parsed

                },
                end: {
                    validationState: 'error',
                    validationText: '',
                    parsed: false
                }
            }
        };

        let parsed = chrono.parseDate(expr);
        if (parsed !== null) {
            params.schedule.start.choice = toJS(conn.schedule.start.choice);
            params.schedule.end.choice = expr;
            params.schedule.end.parsed = true;
            this.validateStartEnd(params);
        } else {
            params.schedule.end.validationText = 'Invalid date';
            params.schedule.acceptable = false;
        }
        this.props.controlsStore.setParamsForConnection(params);
    };

    validateStartEnd(params) {
//        console.log(toJS(params));
        if (!params.schedule.start.parsed || !params.schedule.end.parsed) {

            return;
        }

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
//        console.log(toJS(params));

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

    toggleHelp = () => {
        this.setState({showHelp: !this.state.showHelp});
    };

    toggleUnlockConfirm = () => {
        this.setState({
            unlockConfirmOpen: !this.state.unlockConfirmOpen
        });
    };

    render() {
        const conn = this.props.controlsStore.connection;
        const sched = conn.schedule;
        const timezone = jstz.determine();

        const schHelp =
            <span className='pull-right'>
                <FontAwesome
                    onClick={this.toggleHelp}
                    className='pull-right'
                    name='question'
                    id='schHelpIcon'
                />
                <Popover placement='right'
                         isOpen={this.state.showHelp}
                         target='schHelpIcon'
                         toggle={this.toggleHelp}>
                    <PopoverHeader>Schedule help</PopoverHeader>
                    <PopoverBody>
                        <p>Type in the desired date / time for your connection to start and end.
                            A start time either in the past or after the end time is not accepted.</p>
                        <p>Then, click "Lock schedule", so that the system can then
                            calculate resource availability.</p>
                        <p>Relative time expressions such as "in 10 minutes" are accepted,
                            but they are only evaluated when you type them in.
                            The resulting times will not change as time passes.</p>
                        <p>Unlocking the schedule will also unlock all other resources.</p>
                    </PopoverBody>
                </Popover>
        </span>;

        let unlockControl = <div>

            <Modal isOpen={this.state.unlockConfirmOpen} toggle={this.toggleUnlockConfirm}>
                <ModalHeader toggle={this.toggleUnlockConfirm}>Unlock schedule</ModalHeader>
                <ModalBody>
                    Unlocking the schedule will unlock all components and
                    release any held resources, including pipe and fixture bandwidths and VLANs.
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onClick={this.unlockSchedule}>Unlock</Button>{' '}
                    <Button color='secondary' onClick={this.toggleUnlockConfirm}>Never mind</Button>
                </ModalFooter>
            </Modal>
            {' '}
            <Button color='primary' onClick={this.toggleUnlockConfirm}>Delete</Button>
        </div>;

        if (size(this.props.designStore.design.fixtures) === 0) {
            unlockControl =
                <Button className='pull-right' onClick={this.unlockSchedule} color='primary'>Unlock</Button>;
        }


        return (
            <Card>
                <CardHeader>Schedule {schHelp}</CardHeader>
                <CardBody>
                    <Form>
                        <small>Timezone: {timezone.name()}</small>

                        <FormGroup >
                            <Label>Start:</Label>
                            <Input type='text'
                                   valid = {sched.start.validationState === 'success'}
                                   invalid = {sched.start.validationState === 'error'}
                                   defaultValue='in 15 minutes'
                                   disabled={sched.locked}
                                   onChange={this.onStartDateChange}/>
                            <FormFeedback>{sched.start.validationText}</FormFeedback>
                            <FormText>{sched.start.readable}</FormText>
                        </FormGroup>
                        {' '}
                        <FormGroup >
                            <Label>End:</Label>
                            <Input type='text'
                                   valid = {sched.end.validationState === 'success'}
                                   invalid = {sched.end.validationState === 'error'}
                                   disabled={sched.locked}
                                   defaultValue='in 1 year'
                                   onChange={this.onEndDateChange}/>
                            <FormFeedback>{sched.end.validationText}</FormFeedback>
                            <FormText>{sched.end.readable}</FormText>
                        </FormGroup>
                        <ToggleDisplay show={!sched.locked && sched.acceptable && conn.phase === 'HELD'}>

                            <Button color='primary' className='pull-right' onClick={this.lockSchedule}>Lock schedule</Button>
                        </ToggleDisplay>
                        <ToggleDisplay show={sched.locked && conn.phase === 'HELD'}>

                            {unlockControl}
                        </ToggleDisplay>

                    </Form>
                </CardBody>

            </Card>
        );
    }
}