import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import Moment from 'moment';
import Transformer from '../lib/transform';
import IdleTimer from 'react-idle-timer';

import { Panel} from 'reactstrap';

import myClient from '../agents/client';
import {withRouter} from 'react-router-dom';


@inject('controlsStore', 'designStore', 'topologyStore')
@observer
class HoldTimer extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setToFifteenMins();
        this.refreshTimer();
        this.refreshHeld();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshHeldTimeout);
        clearTimeout(this.refreshTimerTimeout);
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
        const conn = this.props.controlsStore.connection;

        if (this.props.designStore.design.junctions.length === 0) {
            this.setToFifteenMins();
            this.refreshTimerTimeout = setTimeout(this.refreshTimer, 1000); // we will update every second
            return;
        }


        let now = Moment();
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



    idledOut = () => {
        clearTimeout(this.refreshHeldTimeout);
        clearTimeout(this.refreshTimerTimeout);

        this.props.controlsStore.setParamsForConnection({
            schedule: {
                locked: false
            }
        });
        this.props.designStore.clear();

        this.props.history.push('/pages/timeout');

    };


    refreshHeld = () => {

        let conn = this.props.controlsStore.connection;
        if (conn.held.idle) {
            this.refreshHeldTimeout = setTimeout(this.refreshHeld, 1000);
            return;
        }

        if (!conn.schedule.locked) {
            this.refreshHeldTimeout = setTimeout(this.refreshHeld, 1000); // check again next sec
            return;
        }
        if (typeof conn.connectionId === 'undefined' || conn.connectionId === null || conn.connectionId === '') {
            console.log('no connectionId!');
            this.refreshHeldTimeout = setTimeout(this.refreshHeld, 1000);
            return;
        }


        let held = {};
        let scheduleRef = conn.connectionId + '-HELD';

        let cmp = Transformer.toBackend(this.props.designStore.design, scheduleRef);

        held.connectionId = conn.connectionId;

        held.schedule = {
            beginning: conn.schedule.start.at.getTime() / 1000,
            ending: conn.schedule.end.at.getTime() / 1000,
            connectionId: conn.connectionId,
            phase: 'HELD',
            refId: scheduleRef
        };
        //  just needs to not be null
        held.expiration = new Date().getTime() / 1000;
        held.cmp = cmp;
//        console.log(held);
//        whyRun();

        let connection = {
            connectionId: conn.connectionId,
            mode: conn.mode,
            held: held,
            description: conn.description,
            username: '',
            phase: 'HELD',
            state: 'WAITING',
        };

        myClient.submitWithToken('POST', '/protected/held/' + conn.connectionId, connection)
            .then(
                action((response) => {
//                    console.log(response);
                    this.props.controlsStore.setParamsForConnection({
                        held: {
                            until: Moment.unix(response + 100)
                        }
                    });
                    this.props.controlsStore.saveToSessionStorage();
                    this.props.designStore.saveToSessionStorage();

                    const startSec = conn.schedule.start.at.getTime() / 1000;
                    const endSec = conn.schedule.end.at.getTime() / 1000;
                    this.props.topologyStore.loadAvailable(startSec, endSec);
                }));


        this.refreshHeldTimeout = setTimeout(this.refreshHeld, 5000);

    };


    render() {

        const oneMin = 5 * 60 * 1000;
        const fifteenMins = 10 * 60 * 1000;

        const conn = this.props.controlsStore.connection;


        let notify = '';
        const empty = this.props.designStore.design.junctions.length === 0;


        if (conn.held.idle && !empty) {
            notify = <Panel>
                <Panel.Body>
                    User idle; will keep holding for: {conn.held.remaining}
                </Panel.Body>

            </Panel>
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
                    timeout={oneMin} />

                <IdleTimer
                    idleAction={() => {
                        this.idledOut();
                    }}
                    timeout={fifteenMins} />


                {notify}
            </div>

        );
    }
}

export default withRouter(HoldTimer);