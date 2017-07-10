import React, {Component} from 'react';
import {Modal, Panel, Button} from 'react-bootstrap';

import {observer, inject} from 'mobx-react';
import TopologyMap from "./topologyMap";
import {toJS} from 'mobx';

const modalName = 'connection';

@inject('controlsStore', 'connsStore')
@observer
export default class ConnectionModal extends Component {

    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);
        if (!showModal) {
            return (<div />);
        }
        let conn = this.props.connsStore.store.current;

//        console.log(toJS(conn));

        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{conn.connectionId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TopologyMap deviceSelect={() => {}}/>
                    <Panel collapsible={true} header='Connection data'>
                        <pre>
                        {JSON.stringify(toJS(conn), null, 2)}
                        </pre>
                    </Panel>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
