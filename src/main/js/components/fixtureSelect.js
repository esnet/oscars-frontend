import React, {Component} from 'react';

import ReactDOM from 'react-dom';
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';


@inject('controlsStore')
@observer
export default class FixtureSelect extends Component {

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    clearSelection() {
        ReactDOM.findDOMNode(this.selectControl).value = 'choose';
    }


    render() {
        const ef = this.props.controlsStore.editFixture;

        let fixtures = ef.vlan.copyFrom.options;
        if (this.props.mode === 'bw') {
            if (ef.bwSelectionMode === 'sameAs') {
                fixtures = ef.bw.copyFrom.sameAsOptions;
            } else if (ef.bwSelectionMode === 'oppositeOf') {
                fixtures = ef.bw.copyFrom.oppositeOfOptions;
            }
        }


        return (
            <FormGroup controlId="fixtureSelect">
                <ControlLabel>Fixture:</ControlLabel>
                {' '}
                <FormControl inputRef={ref => {this.selectControl = ref;}}
                             componentClass="select"
                             onChange={this.props.onChange} >
                    <option value='choose'>Choose..</option>
                    {

                    Object.keys(fixtures).map((fixtureId) => {
                        const fixture = fixtures[fixtureId];
                        const fixtureJSON = JSON.stringify(fixture);

                        return <option key={fixtureId} value={fixtureJSON}>{fixture.device} {fixture.label}</option>
                    })

                }
                </FormControl>
            </FormGroup>
        );

    }
}

FixtureSelect.propTypes = {
    onRef: PropTypes.func.isRequired,
};
