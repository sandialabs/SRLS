import { ICameraSettings, CameraSettings } from "./ICameraSettings";
import { ILaneSettings } from "./ILaneSettings";
import { IRPMSettings, RPMSettings } from "./IRPMSettings";
import { ISettings } from "./ISettings";
import { Settings } from "./Settings";


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
    Status: string;
    OccupancyState: string;

    constructor(settings: ILaneSettings) {
        this.LaneID = settings.LaneID ?? LaneSettings.unique();
        this.LaneName = settings.LaneName;
        this.Enabled = settings.Enabled;
        this.RPMAlgorithm = "simulated";
        this.AutoGammaProbability = settings.AutoGammaProbability;
        this.AutoNeutronProbability = settings.AutoNeutronProbability;
        this.AutoInterval = settings.AutoInterval;
        this.RPM = new RPMSettings(settings.RPM);
        this.Cameras = settings.Cameras.map(c => new CameraSettings(c));
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
            Status: "",
            OccupancyState: "",
        };

        return new LaneSettings(laneSettings);
    }
}
