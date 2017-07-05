import React, {Component} from 'react';
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';


export default class FixtureSelect extends Component {

    render() {

        return (
            <FormGroup controlId="fixtureSelect">
                <ControlLabel>Fixture:</ControlLabel>
                {' '}
                <FormControl componentClass="select"
                             onChange={this.props.onChange}
                             placeholder="select">{

                    Object.keys(this.props.fixtures).map((fixtureId) => {
                        const fixture = this.props.fixtures[fixtureId];
                        return <option key={fixtureId} value={fixture}>{fixture.label}</option>
                    })

                }
                </FormControl>
            </FormGroup>
        );

    }
}

