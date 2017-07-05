import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {FormGroup, FormControl, Checkbox, ControlLabel, Panel} from 'react-bootstrap';
import FixtureSelect from './fixtureSelect';


@inject('controlsStore', 'sandboxStore')
@observer
export default class BwSelect extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        symmetrical: true,
        showCheckbox: true,
        bwSelectMode: 'typeIn'
    };

    symmetricalCheckboxClicked = (e) => {
        const controlsStore = this.props.controlsStore;
        const fixture = controlsStore.fixture;

        const mustBecomeSymmetrical = e.target.checked;
        let newState = {
            symmetrical: mustBecomeSymmetrical,
        };
        if (mustBecomeSymmetrical) {
            controlsStore.disableControl('bw-egress');
        } else {
            controlsStore.enableControl('bw-egress');
        }


        const currentEgress = fixture.egress;
        const currentIngress = fixture.ingress;
        if (currentIngress !== currentEgress) {
            if (mustBecomeSymmetrical) {
                controlsStore.setEgress(currentIngress);
                controlsStore.disableControl('bw-egress');
                this.egressControl.value = currentIngress;
                this.props.setModified(true);
            }
        }
        this.setState(newState);
    };

    onIngressBwChange = (e) => {
        const newIngress = e.target.value;
        this.props.setModified(true);
        const controlsStore = this.props.controlsStore;

        if (this.state.symmetrical) {
            this.egressControl.value = newIngress;
            controlsStore.setEgress(newIngress);
        }
        controlsStore.setIngress(newIngress);
    };

    onEgressBwChange = (e) => {
        const newEgress = e.target.value;
        this.props.setModified(true);
        this.props.controlsStore.setEgress(newEgress);
    };

    otherFixtureSelected = (e) => {
        this.props.setModified(true);
        console.log(e.target.value);
        let otherFixture = JSON.parse(e.target.value);

        let newIngress = otherFixture.ingress;
        let newEgress = otherFixture.egress;

        if (this.state.bwSelectMode === 'oppositeOf') {
            newIngress = otherFixture.egress;
            newEgress = otherFixture.ingress;
        }
        let params = {
            ingress: newIngress,
            egress: newEgress,
            disable: ['bw-ingress', 'bw-egress'],
            enable: [],
            symmetrical: false,
            showCheckbox: false,
        };
        this.updateControls(params)
    };

    otherFixtures() {
        let thisFixtureId = this.props.controlsStore.fixture.id;

        // i can only choose to have the same / different bandwidth with another fixture
        let result = {};
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.id !== thisFixtureId) {
                result[f.id] = f
            }
        });
        return result;
    }

    setBwSelectMode = (mode) => {
        this.setState({
            bwSelectMode: mode
        });

    };

    updateControls = (params) => {
        const controlsStore = this.props.controlsStore;

        this.ingressControl.value = params.ingress;
        this.egressControl.value = params.egress;
        controlsStore.setIngress(params.ingress);
        controlsStore.setEgress(params.egress);
        params.disable.map((controlName) => {
            controlsStore.disableControl(controlName);
        });
        params.enable.map((controlName) => {
            controlsStore.enableControl(controlName);
        });

        this.setState({
            symmetrical: params.symmetrical,
            showCheckbox: params.showCheckbox
        });
    };

    componentWillMount() {
        const controlsStore = this.props.controlsStore;
        const fixture = controlsStore.fixture;

        if (fixture.ingress === fixture.egress) {
            this.setState({
                symmetrical: true,
            });
            controlsStore.disableControl('bw-egress');
        } else {
            this.setState({
                symmetrical: false,
            });
            controlsStore.enableControl('bw-egress');
        }
        controlsStore.enableControl('bw-ingress');
        this.props.controlsStore.setOtherFixtures(this.otherFixtures());

    }


    render() {
        const controlsStore = this.props.controlsStore;
        const fixture = controlsStore.fixture;


        let fixtureSelect = null;
        if (this.state.bwSelectMode === 'sameAs' || this.state.bwSelectMode === 'oppositeOf') {
            fixtureSelect = <FixtureSelect onChange={this.otherFixtureSelected}/>;
        }

        let symmetricalControl = null;
        if (this.state.showCheckbox) {
            symmetricalControl =
                <FormGroup controlId="symmetrical">
                    <Checkbox
                        defaultChecked={this.state.symmetrical} inline
                        onChange={this.symmetricalCheckboxClicked}>
                        Symmetrical
                    </Checkbox>
                </FormGroup>;
        }

        let header = <span>Bandwidth</span>;

        return (
            <Panel header={header}>
                <FormGroup controlId="bandwidth">
                    <BwSelectModeOptions setModified={this.props.setModified}
                                         updateControls={this.updateControls}
                                         setBwSelectMode={this.setBwSelectMode}
                                         otherFixtures={this.props.controlsStore.selection.otherFixtures}/>
                    {fixtureSelect}
                    {' '}

                    <FormGroup controlId="ingress">
                        <ControlLabel>Ingress:</ControlLabel>
                        <FormControl inputRef={ref => {
                            this.ingressControl = ref;
                        }}
                                     disabled={controlsStore.disabledControls['bw-ingress']}
                                     defaultValue={fixture.ingress}
                                     type="text" placeholder="0-100000"
                                     onChange={this.onIngressBwChange}/>
                    </FormGroup>
                    {symmetricalControl}
                    <FormGroup controlId="egress">
                        <ControlLabel>Egress:</ControlLabel>
                        <FormControl inputRef={ref => {
                            this.egressControl = ref;
                        }}
                                     disabled={controlsStore.disabledControls['bw-egress']}
                                     defaultValue={fixture.egress}
                                     onChange={this.onEgressBwChange}

                                     type="text" placeholder="0-10000"/>
                    </FormGroup>
                </FormGroup>
            </Panel>
        );

    }
}

class BwSelectModeOptions extends Component {
    onSelectModeChange = (e) => {
        const mode = e.target.value;
        this.props.setModified(true);
        this.props.setBwSelectMode(mode);
        const otherFixtures = this.props.otherFixtures;
        let firstFixture = null;

        Object.keys(otherFixtures).map((fixtureId) => {
            let fixture = otherFixtures[fixtureId];
            if (firstFixture === null) {
                firstFixture = fixture;
            }
        });
        if (e.target.value === 'sameAs' || e.target.value === 'oppositeOf') {
            let referredFixture = firstFixture;

            let newIngress = referredFixture.ingress;
            let newEgress = referredFixture.egress;

            if (e.target.value === 'oppositeOf') {
                newIngress = referredFixture.egress;
                newEgress = referredFixture.ingress;
            }
            this.props.updateControls({
                ingress: newIngress,
                egress: newEgress,
                disable: ['bw-ingress', 'bw-egress'],
                enable: [],
                symmetrical: false,
                showCheckbox: false
            });

        } else {
            this.props.updateControls({
                ingress: 0,
                egress: 0,
                enable: ['bw-ingress'],
                disable: ['bw-egress'],
                symmetrical: true,
                showCheckbox: true
            });
        }
    };


    render() {

        let bwSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];
        let otherFixtures = this.props.otherFixtures;

        if (Object.keys(otherFixtures).length > 0) {
            bwSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
            bwSelectModeOpts.push(
                {value: 'oppositeOf', label: 'Opposite of..'}
            )
        }

        return <FormControl componentClass="select" onChange={this.onSelectModeChange}>
            {
                bwSelectModeOpts.map((option, index) => {
                    return <option key={index} value={option.value}>{option.label}</option>
                })
            }
        </FormControl>;
    }
}