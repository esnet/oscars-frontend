import {observable, action, computed} from 'mobx';
import myClient from '../agents/client';

class MapStore {


    @observable network = {
        nodes: [],
        edges: [],
        coloredNodes: [],
        coloredEdges: [],
        initialized: false,
    }

    @action setNetwork(nodes, edges) {
        this.network.initialized = true;
        this.network.nodes = nodes;
        this.network.edges = edges;
    }
    @action setColoredNodes(nodes) {
        this.network.coloredNodes = nodes;
    }
    @action setColoredEdges(edges) {
        this.network.coloredEdges = edges;
    }
}

export default new MapStore();