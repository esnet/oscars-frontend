import React, {Component} from 'react';

import {action} from 'mobx';
import {observer, inject} from 'mobx-react';

import {Button} from 'react-bootstrap';


import myClient from '../agents/client';
import reservation from '../lib/reservation';
import picker from '../lib/picking';

@inject('stateStore', 'mapStore')
@observer
export default class PrecheckButton extends Component {
    constructor(props) {
        super(props);
    }

    preCheck = () => {
        this.props.stateStore.check();


        // release all temporary holds
        picker.releaseAll();

        myClient.submit('POST', '/resv/advanced_precheck', reservation.reservation)
            .then(action((response) => {
                const parsed = JSON.parse(response);

                let coloredNodes = [];
                parsed.nodesToHighlight.map((n, idx) => {
                    coloredNodes.push({
                        id: n,
                        color: 'green'
                    })
                });

                let coloredEdges = [];
                parsed.linksToHighlight.map((n) => {
                    coloredEdges.push({
                        id: n,
                        color: 'green'
                    })
                });

                picker.reserveAll();

                this.props.mapStore.setColoredEdges(coloredEdges);
                this.props.mapStore.setColoredNodes(coloredNodes);
                this.props.stateStore.postCheck(true);

            }));

        return false;
    };


    render() {
        return <Button disabled={this.props.disabled} onClick={this.preCheck}>Precheck</Button>
    }
}