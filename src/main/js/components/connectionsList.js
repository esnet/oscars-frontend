import React, {Component} from 'react';
import {Panel, Table, Button} from 'react-bootstrap';
import Moment from 'moment';

import {observer, inject} from 'mobx-react';

import myClient from '../agents/client';

@inject('controlsStore', 'connsStore')
@observer
export default class ConnectionsList extends Component {

    componentWillMount() {
        this.startListRefresh();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeout);
    }

    startListRefresh = () => {
        this.updateList();
        this.refreshTimeout = setTimeout(this.startRefresh, 30000); // we will update every 30 seconds
    };

    updateList = () => {
        let combinedFilter = {
            numFilters: 0,
            userNames: [],
            connectionIds: [],
            minBandwidths: [],
            maxBandwidths: [],
            startDates: [],
            endDates: [],
            resvStates: [],
            provStates: [],
            operStates: []
        };
        myClient.submit('POST', '/resv/list/filter', combinedFilter)
            .then(
                (successResponse) => {
                    let conns = JSON.parse(successResponse);
                    this.props.connsStore.updateList(conns);
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    };

    showDetails = (c) => {
        console.log(c);
        this.props.connsStore.setCurrent(c);
        this.props.controlsStore.openModal('connection');
    };


    render() {

        let rows = this.props.connsStore.store.conns.map((c) => {
            return (
                <tr key={c.connectionId} onClick={(e) => {this.showDetails(c)} }>
                    <td>{c.connectionId}</td>
                    <td>{c.specification.description}</td>
                    <td>
                        <div>{c.states.resv}</div>
                        <div>{c.states.prov}</div>
                        <div>{c.states.oper}</div>
                    </td>
                    <td>
                        <div>Submitted: {new Moment(c.schedule.submitted).fromNow()}</div>
                        <div>Setup: {new Moment(c.schedule.setup).fromNow()}</div>
                        <div>Teardown: {new Moment(c.schedule.teardown).fromNow()}</div>
                    </td>
                </tr>);
        });


        return <Panel>
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th>Connection Id</th>
                    <th>Description</th>
                    <th>States</th>
                    <th>Schedule</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>

        </Panel>


    }
}
