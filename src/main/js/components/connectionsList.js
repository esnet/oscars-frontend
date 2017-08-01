import React, {Component} from 'react';
import {Panel, Table, Button} from 'react-bootstrap';
import Moment from 'moment';
import {toJS} from 'mobx';
import {observer, inject} from 'mobx-react';
import VisUtils from '../lib/vis';

import myClient from '../agents/client';

@inject('controlsStore', 'connsStore', 'mapStore', 'modalStore')
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

    showDetails = (connectionId) => {

        let c = this.props.connsStore.findConnection(connectionId);

        let coloredNodes = [];
        let coloredEdges = [];

        for (let junction of c.reserved.vlanFlow.junctions) {
            coloredNodes.push({
                id: junction.deviceUrn,
                color: 'green'
            });

        }
        for (let pipe of c.reserved.vlanFlow.mplsPipes) {
            let nodes = [pipe.aJunction.deviceUrn, pipe.zJunction.deviceUrn];
            let az = VisUtils.visFromERO(pipe.azERO);
            let za = VisUtils.visFromERO(pipe.zaERO);

            let edges = az.edges.concat(za.edges);
            nodes = nodes.concat(az.nodes).concat(za.nodes);

            for (let edgeId of edges) {
                coloredEdges.push({
                    id: edgeId,
                    color: 'green'
                });
            }
            for (let nodeId of nodes) {
                coloredNodes.push({
                    id: nodeId,
                    color: 'green'
                });
            }
        }

        this.props.mapStore.setColoredEdges(coloredEdges);
        this.props.mapStore.setColoredNodes(coloredNodes);
        this.props.mapStore.setZoomOnColored(true);


        this.props.connsStore.setCurrent(c);
        this.props.modalStore.openModal('connection');
    };


    render() {

        let rows = this.props.connsStore.store.conns.map((c) => {
            return (
                <tr key={c.connectionId} onClick={(e) => {
                    this.showDetails(c.connectionId)
                } }>
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
