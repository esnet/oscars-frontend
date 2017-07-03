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
                this.props.fixtures.map((fixture, index) => {
                    return <option key={index} value={fixture.id}>{fixture.id}</option>
                })
            }
            </FormControl>
        </FormGroup>
    );

    }
}