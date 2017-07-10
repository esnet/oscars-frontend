import {observable, action, computed} from 'mobx';
import myClient from '../agents/client';

class MapStore {


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