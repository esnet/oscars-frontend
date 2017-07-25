import React from 'react';

import {Glyphicon, Label} from 'react-bootstrap';
import {Button, ListGroupItem} from 'react-bootstrap';

import controlsStore from '../stores/controlsStore';
import transformer from './transform';

class Validator {
    label(state) {
        let icon = 'ok';
        let bsStyle = 'success';
        if (!state) {
            icon = 'flag';
            bsStyle = 'warning'
        }
        return <Label bsStyle={bsStyle}><Glyphicon glyph={icon}/></Label>
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


    fixtureState(fixture) {
        if (fixture.vlan === null || !fixture.bwLocked || !fixture.vlanLocked) {
            return false;
        }
        return true;
    }

    pipeState(pipe) {
        if (!pipe.bwLocked) {
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

    validateDesign(cmp) {
        let result = {
            ok: true,
            errors: [],
        };

        const junctions = cmp.junctions;
        const pipes = cmp.pipes;
        const fixtures = cmp.fixtures;

        if (typeof junctions === 'undefined') {
            console.log('undefined junctions ');
            result.ok = false;
            result.errors.push(<ListGroupItem key='nej'>Not enough junctions - at least 1 required.
                Add more fixtures.</ListGroupItem>);

        } else if (junctions.length < 1) {
            result.ok = false;
            result.errors.push(<ListGroupItem key='nej'>Not enough junctions - at least 1 required.
                Add more fixtures.</ListGroupItem>);
        }

        if (typeof fixtures === 'undefined') {
            result.ok = false;
            result.errors.push(<ListGroupItem key='nef'>Not enough fixtures - at least 2 required.
                Add more fixtures.</ListGroupItem>);
        } else if (fixtures.length < 2) {
            result.ok = false;
            result.errors.push(<ListGroupItem key='nef'>Not enough fixtures - at least 2 required.
                Add more fixtures.</ListGroupItem>);
        }

        if (typeof fixtures !== 'undefined') {

            for (let f of fixtures) {
                let onClick = () => {
                    const params = transformer.existingFixtureToEditParams(f);
                    controlsStore.setParamsForEditFixture(params);
                    controlsStore.openModal('editFixture');
                };

                if (!f.vlanLocked) {
                    result.ok = false;
                    result.errors.push(<ListGroupItem key={f.id + 'vlan'}>Fixture {f.label}: VLAN not locked.
                        <Button bsSize='xsmall' bsStyle='warning' onClick={onClick}
                                key={f.id + ' vlanfix'}
                                className='pull-right'>Fix</Button></ListGroupItem>);
                }
                if (!f.bwLocked) {
                    result.ok = false;
                    result.errors.push(<ListGroupItem key={f.id + 'bw'}>Fixture {f.label}: Bandwidth not set.
                        <Button bsSize='xsmall' bsStyle='warning' onClick={onClick}
                                key={f.id + ' bwfix'}
                                className='pull-right'>Fix</Button></ListGroupItem>);
                }
            }
        } else {
            console.log('undefined fixtures');

        }
        if (typeof pipes !== 'undefined') {
            for (let p of pipes) {
                if (!p.bwLocked) {
                    result.ok = false;
                    let onClick = () => {
                        const params = transformer.existingPipeToEditParams(p);
                        controlsStore.setParamsForEditPipe(params);
                        controlsStore.openModal('editPipe');
                    };

                    result.errors.push(<ListGroupItem key={p.id + 'bw'}>Pipe {p.id}: Bandwidth not set.
                        <Button bsSize='xsmall' bsStyle='warning' onClick={onClick}
                                key={p.id + ' bwfix'}
                                className='pull-right'>Fix</Button></ListGroupItem>);
                }
            }
        } else {
            console.log('undefined pipes');
        }
        return result;

    }

    validateConnection(params) {
        let result = {
            ok: true,
            errors: [],
        };
        const connection = params.connection;

        if (connection.description === '') {
            result.ok = false;
            result.errors.push(<ListGroupItem key='baddesc'>Description not set.</ListGroupItem>);
        }
        if (connection.connectionId === '') {
            result.ok = false;
            result.errors.push(<ListGroupItem key='badconn'>Connection id missing!</ListGroupItem>);
        }

        if (!connection.scheduleLocked) {
            result.ok = false;
            result.errors.push(<ListGroupItem key='lck'>Schedule not locked.</ListGroupItem>);
        }

        const now = Date.now();
        if (connection.startAt < now || connection.endAt < now) {
            result.ok = false;
            result.errors.push(<ListGroupItem key='past'>Start or end time set in the past!</ListGroupItem>);
        }
        if (connection.startAt > connection.endAt) {
            result.ok = false;
            result.errors.push(<ListGroupItem key='inv'>End time set before start time.</ListGroupItem>);
        }

        let designErrors = this.validateDesign(params);
        if (!designErrors.ok) {
            result.ok = false;
            designErrors.errors.map( (err) => {
                result.errors.push(err);
            });
        }
        return result;

    }

    descriptionControl(val) {
        if (val === '') {
            return 'error';
        }
        return 'success';
    }

}

export default new Validator();
