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

    validatePrecheck(params){
        let result = {
            ok: true,
            errors: [],
        };
        const junctions = params.junctions;
        const pipes = params.pipes;
        const fixtures = params.fixtures;
        const connection = params.connection;

        if (connection.description === '') {
            result.ok = false;
            result.errors.push('description not set.');
        }
        if (connection.connectionId === '') {
            result.ok = false;
            result.errors.push('connectionId not set.');
        }
        const now = Date.now();
        if (connection.startAt < now || connection.endAt < now) {
            result.ok = false;
            result.errors.push('start or end time set in the past.');
        }
        if (connection.startAt > connection.endAt) {
            result.ok = false;
            result.errors.push('end time set before start time .');
        }

        if (junctions.length < 1) {
            result.ok = false;
            result.errors.push('not enough junctions - need at least 1.');
        }

        if (fixtures.length < 2) {
            result.ok = false;
            result.errors.push('not enough fixtures - need at least 2.');
        }
        fixtures.map((f) => {
            if (f.vlan === null) {
                result.ok = false;
                result.errors.push('fixture '+f.label+' vlan not set');
            }
            if (!f.bwPreviouslySet) {
                result.ok = false;
                result.errors.push('fixture '+f.label+' bandwidth not set');
            }
        });
        pipes.map((p) => {
            if (!p.bwPreviouslySet) {
                result.ok = false;
                result.errors.push('pipe '+p.id+' bandwidth not set');
            }
        });

        return result;

    }

}
export default new Validator();
