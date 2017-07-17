import sandboxStore from '../stores/designStore'
import controlsStore from '../stores/controlsStore'
import {toJS, action} from 'mobx';
import myClient from '../agents/client';


// execute Promises in serial

const promiseSerial = funcs =>
    funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([]));

class Picker {

    releaseDeleted(port, vlanId) {
        const conn = controlsStore.connection;

        const request = {
            'connectionId': conn.connectionId,
            'port': port,
            'vlanId': vlanId,
        };
        console.log(request);

        myClient.submit('POST', '/vlan/release', request)

    }

    release () {
        const ef = controlsStore.editFixture;
        const conn = controlsStore.connection;

        const request = {
            'connectionId': conn.connectionId,
            'port': ef.port,
            'vlanId': ef.vlan,
        };
//        console.log(request);

        myClient.submit('POST', '/vlan/release', request)
            .then(
                action(() => {
                    let label = sandboxStore.unsetFixtureVlan(ef.fixtureId);

                    const params = {
                        vlan: null,
                        showVlanPickButton: true,
                        showVlanPickControls: true,
                        showVlanReleaseControls: false,
                        label: label,
                    };
                    controlsStore.setParamsForEditFixture(params);
                }));
    }

    pick() {
        const ef = controlsStore.editFixture;
        const conn = controlsStore.connection;

        let requestExpression = ef.vlanExpression;

        if (ef.vlanSelectionMode === 'fromAvailable') {
            requestExpression = ef.availableVlans;
        } else if (ef.vlanSelectionMode === 'sameAs') {
            requestExpression = ef.copiedVlan;
        }

        const request = toJS({
            'connectionId': conn.connectionId,
            'port': ef.port,
            'vlanExpression': requestExpression,
            'startDate': conn.startAt,
            'endDate': conn.endAt,
        });

        myClient.submit('POST', '/vlan/pick', request)
            .then(
                action((response) => {
                    const parsed = JSON.parse(response);

                    let label = sandboxStore.setFixtureVlan(ef.fixtureId, parsed.vlanId);
                    const params = {
                        vlan: parsed.vlanId,
                        showVlanPickButton: false,
                        showVlanPickControls: false,
                        showVlanReleaseControls: true,
                        label: label,
                    };

                    controlsStore.setParamsForEditFixture(params);
                }));
    }

    releaseAll() {
        const conn = controlsStore.connection;

        const funcs = sandboxStore.design.fixtures.map(f => () => {
            const request = toJS({
                'connectionId': conn.connectionId,
                'port': f.port,
                'vlanId': f.vlan,
            });
            return myClient.submit('POST', '/vlan/release', request);

        });
        promiseSerial(funcs);
    }

    reserveAll() {
        const conn = controlsStore.connection;
        const funcs = sandboxStore.design.fixtures.map(f => () => {
            const request = toJS({
                'connectionId': conn.connectionId,
                'port': f.port,
                'vlanExpression': f.vlan,
                'startDate': conn.startAt,
                'endDate': conn.endAt,
            });
            return myClient.submit('POST', '/vlan/pick', request);

        });
        promiseSerial(funcs);

    }

}

export default new Picker();