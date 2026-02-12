import Lane from "../components/Lane.vue";
import { CameraSettings, ICameraSettings } from "./ICameraSettings";
import { IRPMSettings, RPMSettings } from "./IRPMSettings";
import { ISettings, Settings } from "./ISettings";


export interface ILaneSettings {
    LaneID: number; // a unique identifier
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: "simulated";

    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoInterval: number;

    RPM: IRPMSettings;
    Cameras: ICameraSettings[];

    // these will not be saved to the settings file
    ClientCount: number;
    Status: string;
    OccupancyState: string;
}

export class LaneSettings implements ILaneSettings {
    LaneID: number;
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: "simulated";
    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoInterval: number;
    RPM: IRPMSettings;
    Cameras: ICameraSettings[];
    ClientCount: number;
    Status: string;
    OccupancyState: string;

    constructor(settings: ILaneSettings) {
        this.LaneID = LaneSettings.unique();
        this.LaneName = "";
        this.Enabled = false;
        this.RPMAlgorithm = "simulated";
        this.AutoGammaProbability = settings.AutoGammaProbability;
        this.AutoNeutronProbability = settings.AutoNeutronProbability;
        this.AutoInterval = settings.AutoInterval;
        this.RPM = new RPMSettings(settings.RPM);
        this.Cameras = settings.Cameras.map(c => new CameraSettings(c));
        this.ClientCount = 0;
        this.Status = "";
        this.OccupancyState = "";
    }

    clone(lane: LaneSettings): LaneSettings {
        return new LaneSettings(lane);
    }

    static unique(): number {
        const timestamp = Date.now(); // milliseconds since Jan 1, 1970
        const randomPart = Math.floor(Math.random() * 1000000); // 6-digit random number
        return Number(`${timestamp}${randomPart}`);
    }

    static default_settings(): LaneSettings {
        let settings: ISettings = Settings.default_settings();

        let laneSettings: ILaneSettings = {
            LaneID: LaneSettings.unique(),
            LaneName: "",
            Enabled: false,
            RPMAlgorithm: "simulated",
            AutoGammaProbability: settings.DefaultAutoGammaProbability,
            AutoNeutronProbability: settings.DefaultAutoNeutronProbability,
            AutoInterval: settings.DefaultAutoInterval,
            RPM: RPMSettings.default_settings(),
            Cameras: [],
            ClientCount: 0,
            Status: "",
            OccupancyState: "",
        };

        return new LaneSettings(laneSettings);
    }
}