import React from 'react';

import {Glyphicon, Label} from 'react-bootstrap';


class Validator {
    label(state) {
        let icon = 'ok';
        let bsStyle = 'success';
        if (!state) {
            icon = 'flag';
            bsStyle = 'warning'
        }
        return <Label bsStyle={bsStyle}><Glyphicon glyph={icon} /></Label>
    }

    mapNodeColor(state) {
        if (!state) {
            return 'orange';
        }
        return null;
    }
    mapEdgeColor(state) {
        if (!state) {
            return 'orange';
        }
        return null;
    }

    fixtureVlanLabel(fixture) {
        return this.label(fixture.vlan !== null);
    }

    fixtureBwLabel(fixture) {
        return this.label(fixture.bwPreviouslySet);
    }


    fixtureState(fixture) {
        if (fixture.vlan === null || !fixture.bwPreviouslySet) {
            return false;
        }
        return true;
    }

    pipeState(pipe) {
        if (!pipe.bwPreviouslySet) {
            return false;
        }
        return true;
    }

    fixtureMapColor(fixture) {
        return this.mapNodeColor(this.fixtureState(fixture));
    }
    pipeMapColor(pipe) {
        return this.mapEdgeColor(this.pipeState(pipe));
    }

    fixtureLabel(fixture) {
        return this.label(this.fixtureState(fixture));
    }

    pipeLabel(pipe) {
        return this.label(this.pipeState(pipe));
    }
}
export default new Validator();
