import {observable, action, computed} from 'mobx';
import myClient from '../agents/client';

class MapStore {

    @observable positions = observable.map({});

    @action loadPositions() {
        myClient.loadJSON({method: 'GET', url: '/api/positions'})
            .then(action((response) => {
                this.positions = JSON.parse(response);
            }));
    }

    @observable network = {
        nodes: [],
        edges: [],
        coloredNodes: [],
        coloredEdges: [],
        zoomedOnColored: false,
        initialized: false,
    };

    @action setNetwork(nodes, edges) {
        this.network.initialized = true;
        this.network.nodes = nodes;
        this.network.edges = edges;
    }

    @action addColoredNode(nodeId) {
        this.network.coloredNodes.push(nodeId);
    }

    @action deleteColoredNode(nodeId) {
        let idxToRemove = -1;
        this.network.coloredNodes.map((node, index) => {
            if (node.id === nodeId) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.network.coloredNodes.splice(idxToRemove, 1);
        }
    }

    @action clearColored() {
        this.setColoredNodes([]);
        this.setColoredEdges([]);
    }

    @action setColoredNodes(nodes) {
        this.network.coloredNodes = nodes;
    }

    @action setColoredEdges(edges) {
        this.network.coloredEdges = edges;
    }

    @action setZoomOnColored(val) {
        this.network.zoomedOnColored = val;

    }
}

export default new MapStore();