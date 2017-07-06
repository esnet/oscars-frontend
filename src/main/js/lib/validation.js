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

    fixtureLabel(fixture) {
        return this.label(this.fixtureState(fixture));
    }

    pipeLabel(pipe) {
        return this.label(this.pipeState(pipe));
    }
}
export default new Validator();
