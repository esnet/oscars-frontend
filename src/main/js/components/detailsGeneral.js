import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';
import Moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import {Panel } from 'react-bootstrap';


@inject('connsStore')
@observer
export default class DetailsGeneral extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const conn = this.props.connsStore.store.current;
        const header = <div>Info</div>;
        const format = 'Y/MM/DD HH:mm';
        const beg = Moment(conn.archived.schedule.beginning * 1000);
        const end = Moment(conn.archived.schedule.ending * 1000);
        const beginning = beg.format(format) + ' (' + beg.fromNow() + ')';
        const ending = end.format(format) + ' (' + end.fromNow() + ')';
        const info = [
            {
                'k': 'Description',
                'v': conn.description
            },
            {
                'k': 'Username',
                'v': conn.username
            },
            {
                'k': 'Phase',
                'v': conn.phase
            },
            {
                'k': 'State',
                'v': conn.state
            },
            {
                'k': 'Begins',
                'v': beginning
            },
            {
                'k': 'Ending',
                'v': ending
            },
        ];

        return (
            <Panel header={header}>
                <BootstrapTable tableHeaderClass={'hidden'} data={ info } bordered={ false }>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>

            </Panel>);

    }
}