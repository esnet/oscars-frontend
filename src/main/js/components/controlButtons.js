import React, {Component} from 'react';

import {action} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';


import myClient from '../agents/client';
import reservation from '../lib/reservation';

@inject('stateStore', 'mapStore')
export class PrecheckButton extends Component {
    constructor(props) {
        super(props);
    }

    preCheck = () => {
        this.props.stateStore.check();



        myClient.submit('POST', '/resv/advanced_precheck', reservation.reservation)
            .then(action((response) => {
                const parsed = JSON.parse(response);

                let coloredNodes = [];
                parsed['nodesToHighlight'].map((n) => {
                    coloredNodes.push({
                        id: n,
                        color: 'green'
                    })
                });

                let coloredEdges = [];
                parsed['linksToHighlight'].map((n) => {
                    coloredEdges.push({
                        id: n,
                        color: 'green'
                    })
                });



                this.props.mapStore.setColoredEdges(coloredEdges);
                this.props.mapStore.setColoredNodes(coloredNodes);
                this.props.mapStore.setZoomOnColored(true);
                this.props.stateStore.postCheck(true);

            }));

        return false;
    };


    render() {
        return <Button className='pull-right' bsStyle='info' onClick={this.preCheck}>Precheck</Button>
    }
}

@inject('stateStore')
export class HoldButton extends Component {
    constructor(props) {
        super(props);
    }

    hold = () => {
        this.props.stateStore.hold();



        myClient.submit('POST', '/resv/advanced_hold', reservation.reservation)
            .then(action((response) => {
                console.log(response);

                this.props.stateStore.postHold(true);

            }));

        return false;
    };


    render() {
        return <Button className='pull-right' bsStyle='primary'  onClick={this.hold}>Hold</Button>
    }
}

@inject('stateStore')
export class ReleaseButton extends Component {
    constructor(props) {
        super(props);
    }

    release = () => {
        this.props.stateStore.release();
        // TODO: implement this on backend

        this.props.stateStore.postRelease(true);
    };


    render() {
        return <Button className='pull-right' onClick={this.release}>Release</Button>
    }
}


@inject('stateStore')
export class CommitButton extends Component {
    constructor(props) {
        super(props);
    }

    commit = () => {
        this.props.stateStore.commit();

        myClient.submit('POST', '/resv/commit', reservation.reservation.connectionId)
            .then(action((response) => {
                console.log(response);

                this.props.stateStore.postCommit(true);

            }));

        return false;
    };


    render() {
        return <Button bsStyle='success' className='pull-right' onClick={this.commit}>Commit</Button>
    }
}