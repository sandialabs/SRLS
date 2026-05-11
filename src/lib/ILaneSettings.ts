import { IRPMSettings } from "./IRPMSettings";

export interface ILaneSettings {
    LaneID: number; // a unique identifier
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: "simulated";

    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoInterval: number;

    RPM: IRPMSettings;

    // these will not be saved to the settings file
    Status: string;
    OccupancyState: string;
}

