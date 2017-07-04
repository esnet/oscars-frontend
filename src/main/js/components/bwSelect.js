import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {FormGroup, FormControl, Checkbox, ControlLabel} from 'react-bootstrap';
import FixtureSelect from './fixtureSelect';


@inject('sandboxStore')
@observer
export default class BwSelect extends Component {
    constructor(props) {
        super(props);
        this.setSymmetrical = this.setSymmetrical.bind(this);
        this.onIngressBwChange = this.onIngressBwChange.bind(this);
        this.onEgressBwChange = this.onEgressBwChange.bind(this);
        this.fixtureSelected = this.fixtureSelected.bind(this);


    }

    state = {
        symmetrical: true,
        showSymmetrical: true,
        disableIngress: false,
        disableEgress: true,
        currentIngress: '',
        currentEgress: '',
        fixtureIdToCopy: '',
        bwSelectMode: 'typeIn'
    };

    setSymmetrical(e) {
        let newSymmetrical = e.target.checked;

        this.setState({
            symmetrical: newSymmetrical,
            disableEgress: newSymmetrical
        });
        if (newSymmetrical) {
            this.setState({
                currentEgress: this.state.currentIngress
            });
            this.props.sandboxStore.selection.egress = this.state.currentIngress;
            this.egressControl.value = this.state.currentIngress;
        }
    }

    onIngressBwChange(e) {
        this.props.setModified(true);
        if (this.state.symmetrical) {
            this.egressControl.value = e.target.value;
            this.props.sandboxStore.selection.egress = e.target.value;
        }
        this.props.sandboxStore.selection.ingress = e.target.value;
    }

    onEgressBwChange(e) {
        this.props.setModified(true);
        this.props.sandboxStore.selection.egress = e.target.value;
    }

    fixtureSelected(e) {
        this.props.setModified(true);
        let fixtureId = e.target.value;
        this.setState({
            fixtureIdToCopy: e.target.value
        });

        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.id === fixtureId) {
                let ingress = f.ingress;
                let egress = f.egress;

                if (this.state.bwSelectMode === 'oppositeOf') {
                    ingress = f.egress;
                    egress = f.ingress;
                }
                this.egressControl.value = egress;
                this.ingressControl.value = ingress;

                this.props.sandboxStore.selection.ingress = ingress;
                this.props.sandboxStore.selection.egress = egress;
            }

        });

    }

    otherFixtures(modal) {
        if (modal === 'port') {
            // in the 'port' modal we are adding a new fixture
            return this.props.sandboxStore.sandbox.fixtures;

        } else if (modal === 'fixture') {
            // in the 'fixture' modal we can choose any modal except the selected one
            let selectedFixture = this.props.sandboxStore.selection.fixture;

            // i can only choose to have the same / different bandwidth with another fixture
            let result = [];
            this.props.sandboxStore.sandbox.fixtures.map((f) => {
                if (f.id !== selectedFixture) {
                    result.push(f);
                }
            });
            return result;
        }
        return [];
    }

    componentWillMount() {
        if (this.props.modal === 'fixture') {
            this.setState({
                'currentIngress': this.props.sandboxStore.selection.ingress,
                'currentEgress': this.props.sandboxStore.selection.egress
            });

            if (this.props.sandboxStore.selection.ingress === this.props.sandboxStore.selection.egress) {
                this.setState({
                    symmetrical: true,
                    disableEgress: true
                });
            } else {
                this.setState({
                    symmetrical: false,
                    disableEgress: false
                });
            }
        }
    }


    render() {

        let bwSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];
        let otherFixtures = this.otherFixtures(this.props.modal);

        if (otherFixtures.length > 0) {
            bwSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
            bwSelectModeOpts.push(
                {value: 'oppositeOf', label: 'Opposite of..'}
            )
        }


        let bwSelectOptions =
            <FormControl componentClass="select" onChange={(e) => {
                this.props.setModified(true);
                this.setState({
                    bwSelectMode: e.target.value,
                });
                if (e.target.value === 'sameAs' || e.target.value === 'oppositeOf') {
                    let referredFixture = otherFixtures[0];
                    if (this.state.fixtureIdToCopy !== '') {
                        referredFixture = this.props.sandboxStore.findFixture(this.state.fixtureIdToCopy);
                    }
                    let newIngress = referredFixture.ingress;
                    let newEgress = referredFixture.egress;

                    if (e.target.value === 'oppositeOf') {
                        newIngress = referredFixture.egress;
                        newEgress = referredFixture.ingress;
                    }
                    this.ingressControl.value = newIngress;
                    this.egressControl.value = newEgress;

                    this.setState({
                        showSymmetrical: false,
                        disableIngress: true,
                        disableEgress: true,
                        currentIngress: this.props.sandboxStore.sandbox.fixtures[0].ingress,
                        currentEgress: this.props.sandboxStore.sandbox.fixtures[0].egress,
                    });


                } else {
                    this.egressControl.value = 0;
                    this.ingressControl.value = 0;
                    this.setState({
                        showSymmetrical: true,
                        disableIngress: false,
                        disableEgress: false,
                        symmetrical: true,
                        currentIngress: 0,
                        currentEgress: 0,
                    });

                }
            }
            }>
                {
                    bwSelectModeOpts.map((option, index) => {
                        return <option key={index} value={option.value}>{option.label}</option>
                    })
                }
            </FormControl>;

        let fixtureSelect = <FixtureSelect fixtures={otherFixtures} onChange={this.fixtureSelected}/>;

        let bwControl = null;
        if (this.state.bwSelectMode === 'sameAs') {
            bwControl = fixtureSelect;
        } else if (this.state.bwSelectMode === 'oppositeOf') {
            bwControl = fixtureSelect;
        }
        let symmetricalControl = null;
        if (this.state.showSymmetrical) {
            symmetricalControl =
                <FormGroup controlId="symmetrical">
                    <Checkbox
                        defaultChecked={this.state.symmetrical} inline
                        onChange={this.setSymmetrical}>

                        Symmetrical
                    </Checkbox>
                </FormGroup>;
        }


        return (
            <FormGroup controlId="bandwidth">
                <ControlLabel>Bandwidth selection:</ControlLabel>
                {bwSelectOptions}
                {bwControl}
                <FormGroup controlId="ingress">
                    <ControlLabel>Ingress:</ControlLabel>
                    <FormControl inputRef={ref => {
                        this.ingressControl = ref;
                    }}
                                 disabled={this.state.disableIngress}
                                 defaultValue={this.state.currentIngress}
                                 type="text" placeholder="0-100000"
                                 onChange={this.onIngressBwChange}/>
                </FormGroup>
                {symmetricalControl}
                <FormGroup controlId="egress">
                    <ControlLabel>Egress:</ControlLabel>
                    <FormControl inputRef={ref => {
                        this.egressControl = ref;
                    }}
                                 disabled={this.state.disableEgress}
                                 defaultValue={this.state.currentEgress}
                                 onChange={this.onEgressBwChange}

                                 type="text" placeholder="0-10000"/>
                </FormGroup>
            </FormGroup>
        );

    }
}