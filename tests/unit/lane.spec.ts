import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import { RPMProfile } from "../../src/lib/RPMProfile";
import { LaneSimulator } from "../../src/lib/LaneSim";

let settings = {
    LaneID: 1557776006579,
    LaneName: "Lane 1",
    Enabled: false,
    ClientCount: "0",
    Status: "",
    OccupancyState: "",
    AutoGammaProbability: 0.05,
    AutoNeutronProbability: 0.05,
    AutoInterval: 30,
    RPM: {
        IPAddr: "127.0.0.1",
        Port: 1601,
        GammaBG: 256,
        NeutronBG: 3,
        GammaDistribution: [0.25, 0.25, 0.25, 0.25],
        NeutronDistribution: [0.25, 0.25, 0.25, 0.25],
        GammaNSigma: 9,
        NeutronThreshold: 7,
        GHThreshold: 300,
        GLThreshold: 100,
        NHThreshold: 7,
    },
    Cameras: [
        {
            Name: "Camera One",
            Enabled: false,
            Manufacturer: "unknown",
            Model: "unknown",
            IPAddr: "127.0.0.1",
            Port: 10101,
            URL: "",
            CameraSimulatorType: "canned",
        },
        {
            Name: "Camera Two",
            Enabled: false,
            Manufacturer: "unknown",
            Model: "unknown",
            IPAddr: "127.0.0.1",
            Port: 10102,
            URL: "",
            CameraSimulatorType: "canned",
        },
    ],
};

describe("RPM Occupancies", () => {
    const lane = new LaneSimulator(settings, null);

    it("Gamma Alarm", () => {
        let profile = lane.GenerateRPMData("GA", 10.0, false);
        //profile.Dump();
        expect(profile.Type).to.equal("ga");
    });
    it("Neutron Alarm", () => {
        let profile = lane.GenerateRPMData("NA", 10.0, false);
        //profile.Dump();
        expect(profile.Type).to.equal("na");
    });
    it("Neutron/Gamma Alarm", () => {
        let profile = lane.GenerateRPMData("NG", 10.0, false);
        //profile.Dump();
        expect(profile.Type).to.equal("ng");
    });
});
