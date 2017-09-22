import React, {Component} from 'react';
import {Panel, Table, Form, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import Moment from 'moment';
import {toJS, autorunAsync} from 'mobx';
import {observer, inject} from 'mobx-react';
import transformer from '../lib/transform';
import {withRouter, Link} from 'react-router-dom'

import myClient from '../agents/client';

@inject('controlsStore', 'connsStore', 'mapStore', 'modalStore', 'commonStore')
@observer
class ConnectionsList extends Component {

    componentWillMount() {
        this.props.connsStore.setFilter({
            criteria: ['phase'],
            phase: 'RESERVED'
        });

        this.updateList();
    }

    componentWillUnmount() {
        this.disposeOfUpdateList();
    }

    disposeOfUpdateList = autorunAsync('updateList', () => {
        this.updateList();
    }, 1000);

    updateList = () => {
        let filter = {};
        this.props.connsStore.filter.criteria.map((c) => {
            filter[c] = this.props.connsStore.filter[c];
        });

        myClient.submit('POST', '/api/conn/list', filter)
            .then(
                (successResponse) => {
                    let conns = JSON.parse(successResponse);
                    conns.map((conn) => {
                        transformer.fixSerialization(conn);
                    });
                    this.props.connsStore.updateList(conns);
                }
                ,
                (failResponse) => {
                    this.props.commonStore.addAlert({
                        id: (new Date()).getTime(),
                        type: 'danger',
                        headline: 'Error loading connection list',
                        message: failResponse.status + ' ' +failResponse.statusText
                    });

                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );

    };

    selectedPhaseChanged = (e) => {
        let phase = e.target.value;
        this.props.connsStore.setFilter({
            criteria: ['phase'],
            phase: phase
        });

    };

    render() {
        const format = 'Y/MM/DD HH:mm';


        let rows = this.props.connsStore.store.conns.map((c) => {
            const beg = Moment(c.archived.schedule.beginning * 1000);
            const end = Moment(c.archived.schedule.ending * 1000);

            let beginning = beg.format(format) + ' (' + beg.fromNow() + ')';
            let ending = end.format(format) + ' (' + end.fromNow() + ')';

            return (
                <tr key={c.connectionId}>
                    <td><Link to={'/pages/details/'+c.connectionId}>{c.connectionId}</Link></td>
                    <td>
                        <div>{c.description}</div>
                        <div>{c.username}</div>
                    </td>
                    <td>
                        {
                            c.archived.cmp.fixtures.map((f) => {
                                return <div
                                    key={f.portUrn + ':' + f.vlan.vlanId}>{f.portUrn + ':' + f.vlan.vlanId}</div>
                            })
                        }
                    </td>
                    <td>
                        <div>{c.phase}</div>
                        <div>{c.state}</div>
                    </td>
                    <td>
                        <div>Beginning: {beginning}</div>
                        <div>Ending: {ending}</div>
                    </td>
                </tr>);
        });


        return <Panel>
            <h3>Filters:</h3>
            <FormGroup>
                <ControlLabel>Phase:</ControlLabel>
                <FormControl componentClass="select" onChange={this.selectedPhaseChanged}>
                    <option key='RESERVED' value='RESERVED'>Reserved</option>
                    <option key='ARCHIVED' value='ARCHIVED'>Archived</option>

                </FormControl>
            </FormGroup>
            <h3>Connections</h3>
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th>Connection Id</th>
                    <th>Description / Username</th>
                    <th>Fixtures</th>
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

export default withRouter(ConnectionsList);