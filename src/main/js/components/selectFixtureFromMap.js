import React, {Component} from 'react';
import {inject} from 'mobx-react';
import {action} from 'mobx';
import vis from 'vis';

import myClient from '../agents/client';
import FixtureParamsModal from "./fixtureParamsModal";
import DeviceFixturesModal from "./deviceFixturesModal";

@inject('sandboxStore', 'topologyStore')
export default class SelectFixtureFromMap extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.topologyStore.loadPortsForFixtures();
    }


    componentDidMount() {
        myClient.loadJSON({method: "GET", url: "/viz/topology/multilayer"})
            .then(
                action((response) => {
                        let topology = JSON.parse(response);
                        let options = {
                            height: '450px',
                            interaction: {
                                hover: false,
                                navigationButtons: false,
                                zoomView: true,
                                dragView: true
                            },
                            physics: {
                                stabilization: true
                            },
                            nodes: {
                                shape: 'dot',
                                color: {background: "white"}
                            }
                        };

                        let network = new vis.Network(this.mapRef, topology, options);
                        network.on("click", (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                this.props.sandboxStore.selectDevice(nodeId);
                            }
                        });
                    }
                )
            );

    }

    render() {

        return (
            <div>
                <FixtureParamsModal />
                <DeviceFixturesModal />

                <div ref={(ref) => {
                    this.mapRef = ref;
                }}
                     className="col-md-10">

                </div>
            </div>
        );
    }
}