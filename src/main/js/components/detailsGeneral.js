import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';
import Moment from 'moment';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import {Panel, Button} from 'react-bootstrap';
import myClient from '../agents/client';


@inject('connsStore')
@observer
export default class DetailsGeneral extends Component {
    constructor(props) {
        super(props);
    }


    cancel = () => {
        let current = this.props.connsStore.store.current;
        myClient.submitWithToken('POST', '/protected/conn/cancel', current.connectionId)
            .then(action((response) => {
                current.phase = response.replace(/"/g, '');

            }));

        return false;
    };

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
        let cancelAllowed = false;

        if (conn.connectionId !== '' && conn.phase === 'RESERVED') {
            cancelAllowed = true;
        }

        return (
            <Panel header={header}>
                <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>
                <Button bsStyle='danger' disabled={!cancelAllowed} onClick={this.cancel}
                        className='pull-right'>Cancel</Button>

            </Panel>);

    }
}