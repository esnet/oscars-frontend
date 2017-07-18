import React from 'react';



class Transformer {
    existingFixtureToEditParams(fixture) {
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,
            vlan: fixture.vlan,
            ingress: fixture.ingress,
            egress: fixture.egress,
            bwPreviouslySet: fixture.bwPreviouslySet,

            availableVlans: '',
            vlanExpression: '',
            retrievingAvailVlans: false,

            copiedVlan: '',
            showCopiedVlan: false,
            vlanSelectionMode: 'fromAvailable',
            vlanSelectionModeOptions: [],
            vlanCopyFromOptions: [],

            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,

        };

        if (fixture.vlan !== null) {
            editParams.showVlanReleaseControls = true;
            editParams.showVlanPickButton = false;
            editParams.showVlanPickControls = false;
        } else {
            editParams.showVlanReleaseControls = false;
            editParams.showVlanPickButton = true;
            editParams.showVlanPickControls = true;
        }

        if (fixture.bwPreviouslySet) {
            editParams.bwBeingEdited = false;
            editParams.showBwSetButton = false;
        } else {
            editParams.bwBeingEdited = true;
            editParams.showBwSetButton = true;

        }

        return editParams;

    }

    newFixtureToEditParams(fixture) {
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,
            vlan: fixture.vlan,
            ingress: 0,
            egress: 0,
            bwPreviouslySet: false,

            vlanExpression: '',
            showVlanExpression: true,

            vlanSelectionMode: 'fromAvailable',
            copiedVlan: '',
            showCopiedVlan: false,

            showVlanReleaseControls: false,
            showVlanPickButton: true,
            showVlanPickControls: true,
            retrievingAvailVlans: false,

            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,
            bwBeingEdited: true,
            showBwSetButton: true,
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
            showUpdateButton: !pipe.bwPreviouslySet
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
                    bwPreviouslySet: true
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
                    azBw: p.azBandwidth,
                    zaBw: p.zaBandwidth,

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
