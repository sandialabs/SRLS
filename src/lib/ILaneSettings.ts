import { ICameraSettings } from "./ICameraSettings";
import { IRPMSettings } from "./IRPMSettings";
import { LaneSimulator } from "./LaneSim";


export interface ILaneSettings {
    LaneID: number; // a unique identifier
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: string;

    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoInterval: number;

    RPM: IRPMSettings;
    //Camera1: CameraSettings;
    //Camera2: CameraSettings;
    Cameras: ICameraSettings[];

    // these will not be saved to the settings file
    ClientCount: number;
    Status: string;
    OccupancyState: string;

    // Simulator: LaneSimulator | undefined;
}
