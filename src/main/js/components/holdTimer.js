import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS, whyRun} from 'mobx';
import Moment from 'moment';
import Transformer from '../lib/transform';


import {OverlayTrigger, Glyphicon, Popover, Panel} from 'react-bootstrap';

import myClient from '../agents/client';


@inject('controlsStore', 'designStore', 'topologyStore')
@observer
export default class HoldTimer extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let untilDt = new Date();
        untilDt.setTime(untilDt.getTime() + 15 * 60 * 1000);
        let until = Moment(untilDt);

        this.props.controlsStore.setParamsForConnection({
            held: { until: until }
        });

        this.refreshTimer();
    }

    componentWillUnmount() {
        this.disposeOfHeldUpdate();
        clearTimeout(this.refreshTimeout);
    }


    refreshTimer = () => {
        const conn = this.props.controlsStore.connection;
        let now = Moment();
        let until = conn.held.until;
        let remaining = Moment.duration(until.diff(now));
        if (remaining.asSeconds() < 0) {
            this.props.controlsStore.setParamsForConnection({
                schedule: {
                    locked: false
                }
            });
            this.props.designStore.unlockAll();

        } else {
            this.updateTimer();
            this.refreshTimeout = setTimeout(this.refreshTimer, 1000); // we will update every second
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

    disposeOfHeldUpdate = autorunAsync('held update', () => {
        let conn = this.props.controlsStore.connection;
        if (!conn.schedule.locked) {
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

        myClient.submitWithToken('POST', "/protected/held/" + held.connectionId, held)
            .then(
                action((response) => {
//                    console.log(response);
                    this.props.controlsStore.setParamsForConnection({
                        held: {until: Moment.unix(response)}
                    });

                    const startSec = conn.schedule.start.at.getTime() / 1000;
                    const endSec = conn.schedule.end.at.getTime() / 1000;
                    this.props.topologyStore.loadAvailable(startSec, endSec);
                }));



    }, 1000);


    render() {
        const conn = this.props.controlsStore.connection;

        let help = <Popover id='help-timer' title='Timer help'>
            <p>This shows the remaining time until your locked resources are automatically
                released on the server. Any modification to the design or the schedule will
                reset the timer.</p>
        </Popover>;


        return (
            <Panel>
                <span>Held for: {conn.held.remaining}
                    <OverlayTrigger trigger='click' rootClose placement='left' overlay={help}>
                        <Glyphicon className='pull-right' glyph='question-sign'/>
                    </OverlayTrigger>
                </span>
            </Panel>
        );
    }
}