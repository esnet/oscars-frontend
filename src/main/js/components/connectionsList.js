import React, {Component} from 'react';
import {Card, CardBody, ListGroupItem, ListGroup} from 'reactstrap';
import Moment from 'moment';
import {toJS, autorun} from 'mobx';
import {observer, inject} from 'mobx-react';
import transformer from '../lib/transform';
import {withRouter, Link} from 'react-router-dom';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import filterFactory, {textFilter, selectFilter} from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import myClient from '../agents/client';

@inject('controlsStore', 'connsStore', 'mapStore', 'modalStore', 'commonStore')
@observer
class ConnectionsList extends Component {

    componentWillMount() {
        /*
        this.props.connsStore.setFilter({
            criteria: ['phase'],
            phase: 'RESERVED'
        });
        */

        this.updateList();
    }

    componentWillUnmount() {
        this.disposeOfUpdateList();
    }

    disposeOfUpdateList = autorun(() => {
        this.updateList();
    }, {delay: 1000});

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
                        message: failResponse.status + ' ' + failResponse.statusText
                    });

                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );

    };

    hrefIdFormatter = (cell, row) => {
        const href = '/pages/details/' + row.connectionId;
        return <Link to={href}>{row.connectionId}</Link>;

    };

    fixtureFormatter = (cell, row) => {
        let result = row.fixtures.map((f) => {
            let key = row.connectionId+':'+f.portUrn + '#' + f.vlan.vlanId;
            return <ListGroupItem className='m-1 p-1' key={key}><small>{f.portUrn + '#' + f.vlan.vlanId}</small></ListGroupItem>
        });
        return <ListGroup className='m-0 p-0'>{result}</ListGroup>
    };

    render() {
        const format = 'Y/MM/DD HH:mm';
        const phaseOptions = {
            'RESERVED': 'Reserved',
            'ARCHIVED': 'Archived'

        };
        const columns = [
            {
                text: 'Connection ID',
                dataField: 'connectionId',
                filter: textFilter({delay: 100}),
                formatter: this.hrefIdFormatter

            },
            {
                dataField: 'description',
                text: 'Description',
                filter: textFilter({delay: 100})
            },
            {
                dataField: 'phase',
                text: 'Phase',
                filter: selectFilter({options: phaseOptions, defaultValue: 'RESERVED'})
            },

            {
                dataField: 'username',
                text: 'User',
                filter: textFilter({delay: 100})
            },
            {
                dataField: 'fixtureString',
                text: 'Fixtures',
                formatter: this.fixtureFormatter,
                filter: textFilter({delay: 100})
            },
        ];

        let rows = [];

        this.props.connsStore.store.conns.map((c) => {
            const beg = Moment(c.archived.schedule.beginning * 1000);
            const end = Moment(c.archived.schedule.ending * 1000);

            let beginning = beg.format(format) + ' (' + beg.fromNow() + ')';
            let ending = end.format(format) + ' (' + end.fromNow() + ')';
            let fixtures = [];
            let fixtureBits = [];
            c.archived.cmp.fixtures.map((f) => {
                fixtures.push(f);
                const fixtureBit = f.portUrn + '#'+f.vlan.vlanId;
                fixtureBits.push(fixtureBit);
            });
            let fixtureString = fixtureBits.join(' ');

            let row = {
                connectionId: c.connectionId,
                description: c.description,
                phase: c.phase,
                state: c.state,
                username: c.username,
                fixtures: fixtures,
                fixtureString: fixtureString,
                beginning: beginning,
                ending: ending
            };
            rows.push(row);
        });
        console.log(rows);

        return <Card>
            <CardBody>
                <BootstrapTable keyField='connectionId' data={rows} columns={columns}
                                pagination={paginationFactory()}
                                filter={filterFactory()}/>

            </CardBody>


        </Card>


    }
}

export default withRouter(ConnectionsList);