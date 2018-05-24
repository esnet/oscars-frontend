import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Moment from 'moment';
import IdleTimer from 'react-idle-timer';
import { Card, CardBody } from 'reactstrap';
import {withRouter} from 'react-router-dom';

import myClient from '../../agents/client';
import Transformer from '../../lib/transform';
import {autorun, toJS, action} from 'mobx';

@inject('controlsStore', 'designStore', 'topologyStore')
@observer
class HoldTimer extends Component {


    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setToFifteenMins();
        this.refreshTimer();
        this.extendHold();
        this.refreshAvailable();
    }

    componentWillUnmount() {
        this.cleanupTasks();
    }

    cleanupTasks() {
        this.heldUpdateDispose();
        clearTimeout(this.extendHoldTimeout);
        clearTimeout(this.refreshTimerTimeout);
        clearTimeout(this.availableTimeout);

    }

    setToFifteenMins() {
        const untilDt = new Date();
        untilDt.setTime(untilDt.getTime() + 15 * 60 * 1000 + 500);
        const until = Moment(untilDt);
        this.props.controlsStore.setParamsForConnection({
            held: {
                idle: false,
                remaining: '15:00',
                until: until
            }
        });
    }

    refreshTimer = () => {
//        console.log('refreshing our timer');
        const conn = this.props.controlsStore.connection;
        let now = Moment();


        let startAt = Moment(conn.schedule.start.at);
        let secsAfterNow = Moment.duration(startAt.diff(now));
        let sec = Math.round(secsAfterNow.asSeconds());

        // console.log(sec)
        this.props.controlsStore.setParamsForConnection({
            schedule: {start: {secsAfterNow: sec}}
        });


        if (this.props.designStore.design.junctions.length === 0) {
            this.setToFifteenMins();
            this.refreshTimerTimeout = setTimeout(this.refreshTimer, 1000); // we will update every second
            return;
        }


        let until = conn.held.until;
        let remaining = Moment.duration(until.diff(now));

        if (remaining.asSeconds() < 0) {
            this.idledOut();

        } else {
            this.updateTimer();
            this.refreshTimerTimeout = setTimeout(this.refreshTimer, 1000); // we will update every second
        }

    };

    updateTimer = () => {
        const conn = this.props.controlsStore.connection;

        let now = Moment();


        let until = conn.held.until;
        let remaining = Moment.duration(until.diff(now));
        let sec = remaining.seconds();
        let secStr = sec;
        if (sec < 10) {
            secStr = '0' + sec;
        }
        let min = remaining.minutes();
        this.props.controlsStore.setParamsForConnection({
            held: {remaining: min + ':' + secStr}
        });

    };

    refreshAvailable = () => {
        let delay = 5000;
        let conn = this.props.controlsStore.connection;

        if (conn.held.idle) {
            // don't bug the server if idle
            this.availableTimeout = setTimeout(this.refreshAvailable, delay);
            return;
        }
        // do not extend if schedule isn't locked; everything is released at that point anyway
        if (!conn.schedule.locked) {
            // don't bug the server if schedule unlocked
            this.availableTimeout = setTimeout(this.refreshAvailable, delay);
            return;
        }
        const startSec = conn.schedule.start.at.getTime() / 1000;
        const endSec = conn.schedule.end.at.getTime() / 1000;
        this.props.topologyStore.loadAvailable(startSec, endSec);
        this.availableTimeout = setTimeout(this.refreshAvailable, delay);

    };

    idledOut = () => {
        this.cleanupTasks();

        this.props.controlsStore.setParamsForConnection({
            schedule: {
                locked: false
            }
        });
        this.props.designStore.clear();

        this.props.history.push('/pages/timeout');

    };


    extendHold = () => {
        // extend our hold every 10 seconds
        let delay = 10000;

        let conn = this.props.controlsStore.connection;
        // do not extend if user is idle; check again later in case they become un-idle
        if (conn.held.idle) {
//            console.log('not extending hold for idle');
            this.extendHoldTimeout = setTimeout(this.extendHold, delay);
            return;
        }
        // do not extend if schedule isn't locked; everything is released at that point anyway
        if (!conn.schedule.locked) {
//            console.log('not extending hold for unlocked schedule');
            this.extendHoldTimeout = setTimeout(this.extendHold, delay); // check again next sec
            return;
        }
        // we should be at HELD phase; that means there's a hold that we should be extending
        if (conn.phase === 'HELD') {
            myClient.submitWithToken('GET', '/protected/extend_hold/' + conn.connectionId)
                .then(
                    action((response) => {
                        this.props.controlsStore.setParamsForConnection({
                            held: {
                                until: Moment.unix(response + 100)
                            }
                        });
                        this.props.controlsStore.saveToSessionStorage();
                        this.props.designStore.saveToSessionStorage();

                    }));
        } else {
            console.log('unexpected state encountered while extending hold');
        }

        this.extendHoldTimeout = setTimeout(this.extendHold, delay);

    };

    // this autorun will submit our hold changes to the server
    // when there's a change in the data
    heldUpdateDispose = autorun(() => {
        let conn = this.props.controlsStore.connection;

        if (!conn.schedule.locked) {
            return;
        }
        if (typeof conn.connectionId === 'undefined' || conn.connectionId === null || conn.connectionId === '') {
            console.log('no connectionId; will try again later');
            return;
        }


        let cmp = Transformer.toBackend(this.props.designStore.design);

        // TODO: handle tags
        let connection = {
            connectionId: conn.connectionId,
            mode: conn.mode,
            description: conn.description,
            username: '',
            phase: 'HELD',
            state: 'WAITING',
            begin: conn.schedule.start.at.getTime() / 1000,
            end: conn.schedule.end.at.getTime() / 1000,
            tags: [],
            pipes: cmp.pipes,
            junctions: cmp.junctions,
            fixtures: cmp.fixtures
        };
        // console.log(connection);

        myClient.submitWithToken('POST', '/protected/hold', connection)
            .then(
                action((response) => {
                    // console.log(response);
                    this.props.controlsStore.setParamsForConnection({
                        held: {
                            until: Moment.unix(response.heldUntil)
                        }
                    });
                    this.props.controlsStore.saveToSessionStorage();
                    this.props.designStore.saveToSessionStorage();

                    const startSec = conn.schedule.start.at.getTime() / 1000;
                    const endSec = conn.schedule.end.at.getTime() / 1000;
                    // this.props.topologyStore.loadAvailable(startSec, endSec);
                }));


    }, {delay: 1000});

    render() {
        const fiveSec = 5000;
        const fiveMin = 5 * 60 * 1000;
        const fifteenMin = 10 * 60 * 1000;

        const conn = this.props.controlsStore.connection;


        let notify = '';
        const empty = this.props.designStore.design.junctions.length === 0;


        if (conn.held.idle && !empty) {
            notify = <Card>
                <CardBody>
                    User idle; will keep holding resources for: {conn.held.remaining}
                </CardBody>

            </Card>
        }

        let secsAfterNow = conn.schedule.start.secsAfterNow;
        // console.log(secsAfterNow);
        if (conn.schedule.locked && secsAfterNow > 0) {
            if (secsAfterNow <= 180) {
                notify = <Card>
                    <CardBody>
                        <strong>Approaching reservation start time; {secsAfterNow} seconds left.</strong>
                    </CardBody>
                </Card>

            }
        }


        return (
            <div>

                <IdleTimer
                    activeAction={() => {
                        this.props.controlsStore.setParamsForConnection({
                            held: {
                                idle: false
                            }
                        });
                    }}
                    idleAction={() => {
                        this.props.controlsStore.setParamsForConnection({
                            held: {
                                idle: true
                            }
                        });
                    }}
                    timeout={fiveMin} />

                <IdleTimer
                    idleAction={() => {
                        this.idledOut();
                    }}
                    timeout={fifteenMin} />


                {notify}
            </div>

        );
    }
}

export default withRouter(HoldTimer);