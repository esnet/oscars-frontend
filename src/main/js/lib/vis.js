export default class VisUtils {
    static visFromERO(ero) {
        let triplets = Math.floor(ero.length / 3);
        let edges = [];
        let nodes = [];

        if (triplets === 0) {
            edges.push(ero[0] + ' -- ' + ero[1]);

        } else {
            for (let i = 0; i < triplets; i++) {
                let offset = 3 * i;
                nodes.push(ero[offset + 2]);
                edges.push(ero[offset] + ' -- ' + ero[offset + 1]);
            }
        }
        return {
            edges: edges,
            nodes: nodes
        }
    }
}


