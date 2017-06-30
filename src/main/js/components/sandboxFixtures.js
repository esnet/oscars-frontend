import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import FixtureList from "./fixtures";

@inject('sandboxStore')
@observer
export default class SandboxFixtures extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let fixtures = this.props.sandboxStore.sandbox.fixtures;
        console.log(toJS(fixtures));

        return <div>
            <p>Reservation fixtures:</p>

            <FixtureList fixtures={fixtures} onFixtureClick={() => {}}/>
        </div>

    };
};

