import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import ConnectionDrawing from "../components/connectionDrawing";
import {toJS} from 'mobx';
import {Row, Panel, Button} from 'react-bootstrap';


@inject('connsStore', 'commonStore')
@observer
export default class ConnectionDetails extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('list');
    }

    render() {
        let conn = this.props.connsStore.store.current;
        return (
            <Row>
                <ConnectionDrawing />
                <Panel collapsible={true} header='Connection data'>
                        <pre>
                        {JSON.stringify(toJS(conn), null, 2)}
                        </pre>
                </Panel>
            </Row>
        );
    }

}
