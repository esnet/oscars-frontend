import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorun, toJS} from 'mobx';
import Moment from 'moment';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import ToggleDisplay from 'react-toggle-display';
import Confirm from 'react-confirm-bootstrap';

import {Panel, Button} from 'reactstrap';
import myClient from '../agents/client';


@inject('connsStore')
@observer
export default class DetailsGeneral extends Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeout);
    }

    componentWillMount() {
        this.refreshControls();
    }

    build = () => {
        const conn = this.props.connsStore.store.current;
        myClient.submitWithToken('GET', '/protected/pss/build/' + conn.connectionId, '')
            .then(action((response) => {
                this.props.connsStore.setControl('general', 'build', {
                    clicked: true,
                    display: false,
                    enabled: false,
                });
                this.props.connsStore.setControl('general', 'dismantle', {
                    clicked: false,
                    display: false,
                    enabled: false,
                });
            }));

    };
    dismantle = () => {
        const conn = this.props.connsStore.store.current;
        myClient.submitWithToken('GET', '/protected/pss/dismantle/' + conn.connectionId, '')
            .then(action((response) => {
                this.props.connsStore.setControl('general', 'dismantle', {
                    clicked: true,
                    display: false,
                    enabled: false,
                });
                this.props.connsStore.setControl('general', 'build', {
                    clicked: false,
                    display: false,
                    enabled: false,
                });
            }));


    };

    auto = () => {
        let current = this.props.connsStore.store.current;
        myClient.submitWithToken('POST', '/protected/conn/mode/' + current.connectionId, 'AUTOMATIC')
            .then(action((response) => {
                this.props.connsStore.setControl('general', 'auto', {
                    clicked: true,
                    display: false,
                    enabled: false,
                });
                this.props.connsStore.setControl('general', 'manual', {
                    clicked: false,
                    display: false,
                    enabled: false,
                });
            }));

    };

    manual = () => {
        let current = this.props.connsStore.store.current;
        myClient.submitWithToken('POST', '/protected/conn/mode/' + current.connectionId, 'MANUAL')
            .then(action((response) => {
                this.props.connsStore.setControl('general', 'manual', {
                    clicked: true,
                    display: false,
                    enabled: false,
                });
                this.props.connsStore.setControl('general', 'auto', {
                    clicked: false,
                    display: false,
                    enabled: false,
                });
            }));
    };

    cancel = () => {
        let current = this.props.connsStore.store.current;
        myClient.submitWithToken('POST', '/protected/conn/cancel', current.connectionId)
            .then(action((response) => {
                current.phase = response.replace(/"/g, '');
                this.props.connsStore.setControl('general', 'cancel', {
                    clicked: true,
                    display: false,
                    enabled: false,
                });

            }));

        return false;
    };

    // bleh
    refreshControls = () => {
        const conn = this.props.connsStore.store.current;
        const controls = this.props.connsStore.controls;

        const beg = Moment(conn.archived.schedule.beginning * 1000);
        const end = Moment(conn.archived.schedule.ending * 1000);
        let inInterval = false;
        if (beg.isBefore(new Moment()) && end.isAfter(new Moment())) {
            inInterval = true
        }

        const isReserved = (conn.connectionId !== '' && conn.phase === 'RESERVED');
        if (!controls.general.cancel.clicked) {
            this.props.connsStore.setControl('general', 'cancel', {
                clicked: false,
                display: isReserved,
                enabled: isReserved,
            });

        }
        const canBuild = (inInterval && isReserved && conn.mode === 'MANUAL' && conn.state === 'WAITING');
        const canDismantle = (inInterval && isReserved && conn.mode === 'MANUAL' && conn.state === 'ACTIVE');
        const canAuto = isReserved && conn.mode === 'MANUAL';
        const canManual = isReserved && conn.mode === 'AUTOMATIC';

        if (!controls.general.build.clicked) {
            this.props.connsStore.setControl('general', 'build', {
                clicked: false,
                display: canBuild,
                enabled: canBuild,
            });
        }
        if (!controls.general.dismantle.clicked) {
            this.props.connsStore.setControl('general', 'dismantle', {
                clicked: false,
                display: canDismantle,
                enabled: canDismantle,
            });
        }
        if (!controls.general.auto.clicked) {
            this.props.connsStore.setControl('general', 'auto', {
                clicked: false,
                display: canAuto,
                enabled: canAuto,
            });
        }
        if (!controls.general.manual.clicked) {
            this.props.connsStore.setControl('general', 'manual', {
                clicked: false,
                display: canManual,
                enabled: canManual,
            });
        }
        this.refreshTimeout = setTimeout(this.refreshControls, 5000); // update per 5 seconds


    };

    render() {
        const conn = this.props.connsStore.store.current;
        const controls = this.props.connsStore.controls;
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
                'k': 'Mode',
                'v': conn.mode
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
            <Panel>
                <Panel.Heading>
                    <div>Info</div>
                </Panel.Heading>


                <Panel.Body>
                    <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                        <TableHeaderColumn dataField='k' isKey={true}/>
                        <TableHeaderColumn dataField='v'/>
                    </BootstrapTable>
                    <ToggleDisplay show={controls.general.manual.display}>
                        <Button bsStyle='info' disabled={!controls.general.manual.enabled} onClick={this.manual}
                                className='pull-left'>Set mode to MANUAL</Button>
                    </ToggleDisplay>

                    <ToggleDisplay show={controls.general.auto.display}>
                        <Button bsStyle='info' disabled={!controls.general.auto.enabled} onClick={this.auto}
                                className='pull-left'>Set mode to AUTO</Button>
                    </ToggleDisplay>

                    <ToggleDisplay show={controls.general.build.display}>
                        <Button bsStyle='info' disabled={!controls.general.build.enabled} onClick={this.build}
                                className='pull-left'>Build</Button>
                    </ToggleDisplay>

                    <ToggleDisplay show={controls.general.dismantle.display}>
                        <Button bsStyle='info' disabled={!controls.general.dismantle.enabled} onClick={this.dismantle}
                                className='pull-left'>Dismantle</Button>
                    </ToggleDisplay>

                    <ToggleDisplay show={controls.general.cancel.display}>
                        <Confirm
                            onConfirm={this.cancel}
                            body="Cancelling will release all resources and dismantle the reservation if it is built."
                            confirmText="Confirm cancellation"
                            cancelText="Never mind"
                            title="Cancel connection">
                            <Button bsStyle='danger'
                                    disabled={!controls.general.cancel.enabled} className='pull-right'>Cancel</Button>

                        </Confirm>


                    </ToggleDisplay>
                </Panel.Body>


            </Panel>);

    }
}