import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';

import ConfirmModal from '../confirmModal';
import {Button, ListGroup, ListGroupItem } from 'reactstrap';
import myClient from '../../agents/client';
import Moment from 'moment/moment';
import {autorun, action, toJS} from 'mobx';

import HelpPopover from '../helpPopover';


@inject('connsStore')
@observer
export default class DetailsButtons extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.updateControls();
    }
    componentWillUnmount() {
        this.controlsUpdateDispose();
    }

    build = () => {
        const conn = this.props.connsStore.store.current;
        this.props.connsStore.setControl('build', {
            text: 'Working..',
            'ok': false
        });
        this.props.connsStore.setControl('dismantle', {
            'ok': false
        });
        myClient.submitWithToken('GET', '/protected/pss/build/' + conn.connectionId, '')
            .then(action((response) => {
                this.props.connsStore.refreshCurrent();
            }));

    };
    dismantle = () => {
        const conn = this.props.connsStore.store.current;
        this.props.connsStore.setControl('build', {
            'ok': false
        });
        this.props.connsStore.setControl('dismantle', {
            text: 'Working..',
            'ok': false
        });
        myClient.submitWithToken('GET', '/protected/pss/dismantle/' + conn.connectionId, '')
            .then(action((response) => {
                this.props.connsStore.refreshCurrent();
            }));


    };

    changeBuildMode = () => {
        let conn = this.props.connsStore.store.current;
        let otherMode = 'MANUAL';
        if (conn.mode === 'MANUAL') {
            otherMode = 'AUTOMATIC';
        }
        this.props.connsStore.setControl('buildmode', {
            'text': 'Working...',
            'ok': false
        });
        this.props.connsStore.setControl('build', {
            'ok': false
        });
        this.props.connsStore.setControl('dismantle', {
            'ok': false
        });
        myClient.submitWithToken('POST', '/protected/conn/mode/' + conn.connectionId, otherMode)
            .then(action((response) => {
                this.props.connsStore.refreshCurrent();


            }));

    };


    doRelease = () => {
        let current = this.props.connsStore.store.current;
        this.props.connsStore.setControl('release', {
            'text': 'Releasing',
            'ok': false
        });
        this.props.connsStore.setControl('buildmode', {
            'ok': false
        });
        this.props.connsStore.setControl('build', {
            'ok': false
        });
        this.props.connsStore.setControl('dismantle', {
            'ok': false
        });

        myClient.submitWithToken('POST', '/protected/conn/cancel', current.connectionId)
            .then(action((response) => {
                this.props.connsStore.refreshCurrent();
            }));

        return false;
    };

    controlsUpdateDispose = autorun(() => {
        this.updateControls();
    });

    updateControls() {
        const conn = this.props.connsStore.store.current;
        if (conn == null || conn.archived == null) {
            return;
        }

        const beg = Moment(conn.archived.schedule.beginning * 1000);
        const end = Moment(conn.archived.schedule.ending * 1000);
        let inInterval = false;
        if (beg.isBefore(new Moment()) && end.isAfter(new Moment())) {
            inInterval = true
        }

        const isReserved = (conn.connectionId !== '' && conn.phase === 'RESERVED');
        if (isReserved) {
            this.props.connsStore.setControl('release', {
                'text': 'Release',
                'show': true,
                'ok': true
            });
            let otherMode = 'MANUAL';
            if (conn.mode === 'MANUAL') {
                otherMode = 'AUTOMATIC';
            }
            const buildmodeText = 'Set mode to ' + otherMode;
            this.props.connsStore.setControl('buildmode', {
                'text': buildmodeText,
                'show': true,
                'ok': true
            });

            this.setReleaseHelp();
            this.setBmHelp();
        } else {
            this.props.connsStore.setControl('release', {
                'show': false,
                'ok': false
            });
            this.props.connsStore.setControl('buildmode', {
                'show': false,
                'ok': false
            });
            this.props.connsStore.setControl('build', {
                'show': false,
                'ok': false
            });
            this.props.connsStore.setControl('dismantle', {
                'show': false,
                'ok': false
            });


        }
        const canBuild = (inInterval && isReserved && conn.mode === 'MANUAL' && conn.state === 'WAITING');
        const canDismantle = (inInterval && isReserved && conn.mode === 'MANUAL' && conn.state === 'ACTIVE');
        let buildText = 'Build';
        let dismantleText = 'Dismantle';

        this.props.connsStore.setControl('build', {
            'show': isReserved && inInterval,
            'text': buildText,
            'ok': canBuild
        });

        this.props.connsStore.setControl('dismantle', {
            'show': isReserved && inInterval,
            'text': dismantleText,
            'ok': canDismantle
        });
        this.setBuildDismantleHelp(canBuild, 'build');
        this.setBuildDismantleHelp(canDismantle, 'dismantle');

    }


    render() {
        const controls = this.props.connsStore.controls;

        const canChangeBuildMode = controls.buildmode.ok;
        const buildModeChangeText = controls.buildmode.text;

        let buildMode = null;
        if (controls.buildmode.show) {
            buildMode = <ListGroupItem>

                <Button color='primary' disabled={!canChangeBuildMode} onClick={this.changeBuildMode}
                        className='float-left'>{buildModeChangeText}</Button>
                {' '}
                {this.help('buildmode')}
            </ListGroupItem>
        }

        const canBuild = controls.build.ok;
        const buildText = controls.build.text;

        let build = null;
        if (controls.build.show) {
            build = <ListGroupItem><Button color='primary' disabled={!canBuild} onClick={this.build}
                                  className='float-left'>{buildText}</Button>
                {' '}
                {this.help('build')}
            </ListGroupItem>;
        }

        const canDismantle = controls.dismantle.ok;
        const dismantleText = controls.dismantle.text;
        let dismantle = null;
        if (controls.dismantle.show) {
            dismantle = <ListGroupItem>
                <Button color='primary' disabled={!canDismantle} onClick={this.dismantle}
                        className='float-left'>{dismantleText}</Button>
                {' '}
                {this.help('dismantle')}
            </ListGroupItem>;
        }

        const canRelease = controls.release.ok;
        const releaseText = controls.release.text;

        let release = null;
        if (controls.release.show) {
            release = <ListGroupItem>
                <Button color='info' disabled={true} className='float-left'>{releaseText}</Button>
                {' '}
                {this.help('release')}
            </ListGroupItem>;
            if (canRelease) {
                release = <ListGroupItem>
                    <ConfirmModal body='This will release all resources, and dismantle the reservation if it is built.'
                                  header='Release reservation'
                                  buttonText={releaseText}
                                  onConfirm={this.doRelease}/>
                    {' '}
                    {this.help('release')}
                </ListGroupItem>;
            }
        }

        let helpHeader = <span>Controls help</span>;
        let helpBody = <div>
            <p>This connection is archived, either because it's past its end time or
                because it has been released.</p>
            <p>The normal controls (Build, Dismantle, Release,etc)
                are not present.</p>
        </div>;
        let overallHelp =  <span className='float-right'>
            <HelpPopover header={helpHeader} body={helpBody} placement='right' popoverId='details-buttons-help'/>
        </span>;

        if (canRelease) {
            overallHelp = null;
        }


        return <ListGroup>
                <ListGroupItem active>Controls {overallHelp}</ListGroupItem>
                {buildMode}
                {build}
                {dismantle}
                {release}
            </ListGroup>;
    }


    help(key) {
        const controls = this.props.connsStore.controls;
        const header = controls.help[key].header;
        const body = controls.help[key].body;
        const id = 'details-controls-'+key + '-help';
        return <span className='float-right'>
            <HelpPopover header={header} body={body} placement='right' popoverId={id}/>
        </span>;

    }


    setReleaseHelp() {
        const helpHeader = <span>Release help</span>;
        const helpBody = <div>
            <p>Click this button to release this reservation. This will dismantle it if already built,
                and set it to ARCHIVED phase.</p>
        </div>;

        this.props.connsStore.setControlHelp('release', {
            header: helpHeader,
            body: helpBody
        });

    }

    setBmHelp() {

        const helpHeader = <span>Build mode help</span>;
        const helpBody = <div>
            <p>Auto: The connection will be configured on network devices ("built") at start time. No
                further action needed. </p>
            <p>Manual: The connection will <b>not</b> be configured automatically. Use the
                build / dismantle controls to set it up or bring it down.</p>
            <p>Build mode selection is not final. You can switch between modes, as long as
                the end time has not been reached.</p>
            <p>In either mode, once end time is reached the connection will be automatically
                dismantled (i.e. removed from network device configuration).</p>
        </div>;
        this.props.connsStore.setControlHelp('buildmode', {
            header: helpHeader,
            body: helpBody
        });

    }
    setBuildDismantleHelp(canPerform, key) {

        const helpHeader = <span>Build mode help</span>;
        let helpBody = <div>
            Click this button to perform the build / dismantle action.
        </div>;
        if (!canPerform) {
            helpBody = <div>This action is not available.</div>
        }
        this.props.connsStore.setControlHelp(key, {
            header: helpHeader,
            body: helpBody
        });

    }

}
