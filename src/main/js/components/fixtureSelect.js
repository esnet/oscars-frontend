import React, {Component} from 'react';
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';


@inject('controlsStore')
@observer
export default class FixtureSelect extends Component {

    render() {
        let fixtures = this.props.controlsStore.selection.otherFixtures;
        return (
            <FormGroup controlId="fixtureSelect">
                <ControlLabel>Fixture:</ControlLabel>
                {' '}
                <FormControl componentClass="select"
                             onChange={this.props.onChange}
                             placeholder="select">
                    <option value='choose'>Choose..</option>
                    {

                    Object.keys(fixtures).map((fixtureId) => {
                        const fixture = fixtures[fixtureId];
                        const fixtureJSON = JSON.stringify(fixture);

                        return <option key={fixtureId} value={fixtureJSON}>{fixture.label}</option>
                    })

                }
                </FormControl>
            </FormGroup>
        );

    }
}

