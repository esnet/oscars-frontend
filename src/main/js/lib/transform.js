import React from 'react';
import {toJS} from 'mobx';



class Transformer {
    existingFixtureToEditParams(fixture) {
//        console.log('existing fixture');
//        console.log(toJS(fixture));
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,
            vlan: fixture.vlan,
            ingress: fixture.ingress,
            egress: fixture.egress,
            bwLocked: fixture.bwLocked,

            availableVlans: '',
            vlanExpression: '',
            vlanLocked: fixture.vlanLocked,

            copiedVlan: '',
            showCopiedVlan: false,
            vlanSelectionMode: 'fromAvailable',
            vlanSelectionModeOptions: [],
            vlanCopyFromOptions: [],
            vlanChoice: fixture.vlan,
            vlanChoiceValidationState: 'success',
            vlanChoiceValidationText: '',


            bwLocked: fixture.bwLocked,
            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,
            ingressValidationState: 'success',
            ingressValidationText: '',
            egressValidationState: 'success',
            egressValidationText: '',

        };

        if (fixture.vlanLocked) {
            editParams.showVlanLockButton = false;
        } else {
            editParams.vlanLockText = 'Choose and lock';
            editParams.showVlanLockButton = true;
        }

        if (fixture.bwLocked) {
            editParams.showBwLockButton = false;
        } else {
            editParams.showBwLockButton = true;

        }

        return editParams;

    }

    newFixtureToEditParams(fixture) {
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,

            vlan: null,
            vlanChoice: '',
            vlanLocked: false,
            showVlanLockButton: true,
            vlanLockText: 'Choose and lock',
            vlanSelectionMode: 'fromAvailable',
            vlanChoiceValidationState: 'error',
            vlanChoiceValidationText: 'empty input',



            ingress: 0,
            egress: 0,
            bwLocked: false,
            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,

            showBwLockButton: true,
            ingressValidationState: 'success',
            ingressValidationText: '',
            egressValidationState: 'success',
            egressValidationText: '',


        };


        return editParams;

    }

    existingPipeToEditParams(pipe) {
        return {
            pipeId: pipe.id,
            a: pipe.a,
            z: pipe.z,
            azBw: pipe.azBw,
            zaBw: pipe.zaBw,
            lockedEro: true
        };

    }

    fromBackend(cmp) {
        let result = {
            junctions: [],
            fixtures: [],
            pipes: []
        };

        let { junctions, fixtures, pipes} = cmp;

        if (typeof junctions !== 'undefined') {
            junctions.map((dj) => {
                let entry = {
                    id: dj.deviceUrn
                };
                result.junctions.push(entry);
            });
        }
        if (typeof fixtures !== 'undefined') {
            fixtures.map((df) => {
                let entry = {
                    id: df.portUrn + ':' + df.vlan.vlanId,
                    port: df.portUrn,
                    device: df.junction,
                    ingress: df.ingressBandwidth,
                    egress: df.egressBandwidth,
                    vlan: df.vlan.vlanId,
                    label: df.portUrn + ':' + df.vlan.vlanId,
                    bwLocked: true,
                    vlanLocked: true
                };
                result.fixtures.push(entry);
            });
        }
        if (typeof pipes !== 'undefined') {
            pipes.map((dp) => {
                let entry = {
                    id: dp.a + ' -- ' + dp.z,
                    a: dp.a,
                    z: dp.z,
                    azBw: dp.azBandwidth,
                    zaBw: dp.zaBandwidth,
                    bwLocked: true,
                    ero: []

                };
                result.pipes.push(entry);
            });
        }

        return result;
    }

    toBackend(design) {
        let { junctions, pipes, fixtures } = design;
        let cmp = {
            junctions: [],
            pipes: [],
            fixtures: []
        };
        junctions.map((j) => {
            let entry = {
                refId: j.id,
                deviceUrn: j.id,
            };
            cmp.junctions.push(entry);
        });
        if (typeof pipes !== 'undefined') {
            pipes.map((p) => {
                let entry = {
                    a: p.a,
                    z: p.z,
                    azBandwidth: p.azBw,
                    zaBandwidth: p.zaBw,

                };
                cmp.pipes.push(entry);
            });
        }
        fixtures.map((f) => {
            let entry = {
                junction: f.device,
                ingressBandwidth: f.ingress,
                egressBandwidth: f.egress,
                portUrn: f.port,
                vlan: {
                    vlanId: f.vlan
                }
            };
            cmp.fixtures.push(entry);
        });
        return cmp;
    }

}
export default new Transformer();
