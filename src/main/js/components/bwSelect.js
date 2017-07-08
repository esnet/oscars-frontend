import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {FormGroup, FormControl, Checkbox, ControlLabel, Panel, Button, Well} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';
import FixtureSelect from './fixtureSelect';
import validator from '../lib/validation'


@inject('controlsStore', 'sandboxStore')
@observer
export default class BwSelect extends Component {
    constructor(props) {
        super(props);
    }


    symmetricalCheckboxClicked = (e) => {
        const ef = this.props.controlsStore.editFixture;

        const mustBecomeSymmetrical = e.target.checked;
        let params = {
            symmetrical: mustBecomeSymmetrical,

        };
        if (mustBecomeSymmetrical) {
            params.egress = ef.ingress;
            this.egressControl.value = ef.ingress;
        }
        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onIngressBwChange = (e) => {
        const newIngress = e.target.value;
        let params = {
            ingress: newIngress,
        };
        if (this.props.controlsStore.editFixture.symmetrical) {
            params.egress = newIngress;
            this.egressControl.value = newIngress;
        }
        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onEgressBwChange = (e) => {
        const newEgress = e.target.value;
        this.props.controlsStore.setParamsForEditFixture({
            egress: newEgress,
        });
    };

    otherFixtureSelected = (e) => {
        const ef = this.props.controlsStore.editFixture;
        let params = {};
        if (e.target.value !== 'choose') {
            let otherFixture = JSON.parse(e.target.value);

            params.copiedIngress = otherFixture.ingress;
            params.copiedEgress = otherFixture.egress;
            if (ef.bwSelectionMode === 'oppositeOf') {
                params.copiedIngress = otherFixture.egress;
                params.copiedEgress = otherFixture.ingress;
            }
            params.showBwSetButton = true;
        } else {
            params.copiedEgress = '-';
            params.copiedIngress = '-';
            params.showBwSetButton = false;
        }


        this.props.controlsStore.setParamsForEditFixture(params);
    };

    otherFixtures() {
        const ef = this.props.controlsStore.editFixture;

        // can only choose to have the same / different bandwidth with some other fixture
        let result = {};
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.id !== ef.fixtureId && f.bwPreviouslySet) {
                result[f.id] = {
                    id: f.id,
                    label: f.label,
                    device: f.device,
                    ingress: f.ingress,
                    egress: f.egress,
                };
            }
        });
        return result;
    }


    setFixtureBw = () => {
        const ef = this.props.controlsStore.editFixture;
        let newIngress = ef.ingress;
        let newEgress = ef.egress;
        if (ef.showCopiedBw) {
            newIngress = ef.copiedIngress;
            newEgress = ef.copiedEgress;
        }
        let sbParams = {
            ingress: newIngress,
            egress: newEgress,
        };

        this.props.sandboxStore.setFixtureBandwidth(ef.fixtureId, sbParams);
        let efParams = {
            ingress: newIngress,
            egress: newEgress,
            showBwSetButton: false,
            bwBeingEdited: false,
            bwPreviouslySet: true,
        };

        this.props.controlsStore.setParamsForEditFixture(efParams);
    };

    unsetFixtureBw = () => {
        const fixtureId = this.props.controlsStore.editFixture.fixtureId;
        this.props.sandboxStore.unsetFixtureBandwidth(fixtureId);
        this.props.controlsStore.setParamsForEditFixture({
            showBwSetButton: true,
            bwBeingEdited: true,
            bwPreviouslySet: false,

        });

    };


    componentWillMount() {
        this.props.controlsStore.setParamsForEditFixture({
            bwCopyFromOptions: this.otherFixtures()
        });
    }


    onSelectModeChange = (e) => {

        const mode = e.target.value;

        let params = {
            bwSelectionMode: mode,
            showCopiedBw: (mode === 'sameAs' || mode === 'oppositeOf')
        };

        if (mode === 'oppositeOf' || mode === 'sameAs') {
            params.showBwSetButton = false;
            params.copiedEgress = '-';
            params.copiedIngress = '-';

            this.fixtureSelect.clearSelection()
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };


    render() {
        const ef = this.props.controlsStore.editFixture;
        let showFixtureSelect = ef.bwSelectionMode === 'sameAs' || ef.bwSelectionMode === 'oppositeOf';

        const validationLabel = validator.fixtureBwLabel(ef);
        const header = <span>Bandwidth <span className='pull-right'>{validationLabel}</span></span>;

        return (
            <Panel header={header}>
                <ToggleDisplay show={ef.bwBeingEdited}>
                    <BwSelectModeOptions onSelectModeChange={this.onSelectModeChange}/>
                    { ' ' }
                    <ToggleDisplay show={showFixtureSelect}>
                        <FixtureSelect mode='bw' onRef={ref => {
                            this.fixtureSelect = ref
                        }} onChange={this.otherFixtureSelected}/>
                        <ToggleDisplay show={ef.showCopiedBw}>
                            <Well>New ingress: {ef.copiedIngress}</Well>
                            {' '}
                            <Well>New egress: {ef.copiedEgress}</Well>
                        </ToggleDisplay>
                    </ToggleDisplay>
                    <ToggleDisplay show={!showFixtureSelect}>
                        <FormGroup controlId="ingress">
                            <ControlLabel>Ingress:</ControlLabel>
                            <FormControl defaultValue={ef.ingress}
                                         type="text" placeholder="0-100000"
                                         onChange={this.onIngressBwChange}/>
                        </FormGroup>
                        <FormGroup controlId="egress">
                            <ControlLabel>Egress:</ControlLabel>
                            <FormControl defaultValue={ef.egress}
                                         disabled={ef.symmetrical}
                                         inputRef={ref => {
                                             this.egressControl = ref;
                                         }}
                                         onChange={this.onEgressBwChange}
                                         type="text" placeholder="0-10000"/>
                        </FormGroup>
                        <FormGroup controlId="symmetrical">
                            <Checkbox defaultChecked={ef.symmetrical} inline
                                      onChange={this.symmetricalCheckboxClicked}>Symmetrical
                            </Checkbox>

                        </FormGroup>
                    </ToggleDisplay>
                </ToggleDisplay>
                <ToggleDisplay show={!ef.bwBeingEdited}>
                    <Well>Set ingress: {ef.ingress}</Well>
                    <Well>Set egress: {ef.egress}</Well>
                </ToggleDisplay>

                <ToggleDisplay show={ef.showBwSetButton}>
                    <Button bsStyle='primary' className='pull-right' onClick={this.setFixtureBw}>Set bandwidth</Button>
                </ToggleDisplay>
                <ToggleDisplay show={!ef.bwBeingEdited}>
                    <Button bsStyle='warning' className='pull-right' onClick={this.unsetFixtureBw}>Edit</Button>
                </ToggleDisplay>
            </Panel>);
    }
}

@inject('controlsStore')
@observer
class BwSelectModeOptions extends Component {
    render() {

        let bwSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];
        let fixtures = this.props.controlsStore.editFixture.bwCopyFromOptions;

        if (Object.keys(fixtures).length > 0) {
            bwSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
            bwSelectModeOpts.push(
                {value: 'oppositeOf', label: 'Opposite of..'}
            )
        }

        return <FormControl componentClass="select" onChange={this.props.onSelectModeChange}>
            {
                bwSelectModeOpts.map((option, index) => {
                    return <option key={index} value={option.value}>{option.label}</option>
                })
            }
        </FormControl>;
    }
}

BwSelectModeOptions.propTypes = {
    onSelectModeChange: React.PropTypes.func.isRequired
};
