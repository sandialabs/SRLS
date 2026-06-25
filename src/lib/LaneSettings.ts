import { ILaneSettings } from "./ILaneSettings";
import { RPMSettings } from "./RPMSettings";
import { IRPMSettings } from "./IRPMSettings";
import { ISettings } from "./ISettings";
import { Settings } from "./Settings";


export class LaneSettings implements ILaneSettings {
    LaneID: number;
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: "simulated";
    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoIntervalSeconds: number;
    AutoMinOccupancyDurationSeconds: number;
    AutoMaxOccupancyDurationSeconds: number;
    RPM: IRPMSettings;
    Status: string;
    OccupancyState: string;

    constructor(settings: ILaneSettings) {
        this.LaneID = settings.LaneID ?? LaneSettings.unique();
        this.LaneName = settings.LaneName;
        this.Enabled = settings.Enabled;
        this.RPMAlgorithm = "simulated";
        this.AutoGammaProbability = settings.AutoGammaProbability;
        this.AutoNeutronProbability = settings.AutoNeutronProbability;
        this.AutoIntervalSeconds = settings.AutoIntervalSeconds;
        this.AutoMinOccupancyDurationSeconds = settings.AutoMinOccupancyDurationSeconds ?? 10;
        this.AutoMaxOccupancyDurationSeconds = settings.AutoMaxOccupancyDurationSeconds ?? 20;
        // Make sure the max is at least 1 second more than the min
        this.AutoMaxOccupancyDurationSeconds = Math.max(this.AutoMinOccupancyDurationSeconds + 1, this.AutoMaxOccupancyDurationSeconds);
        this.RPM = new RPMSettings(settings.RPM);
        this.Status = "";
        this.OccupancyState = "";
    }

    public set_occupancy_range(min: number, max: number): void {
        this.AutoMinOccupancyDurationSeconds = min;
        this.AutoMaxOccupancyDurationSeconds = max;
        
        // Make sure the max is at least 1 second more than the min
        this.AutoMaxOccupancyDurationSeconds = Math.max(this.AutoMinOccupancyDurationSeconds + 1, this.AutoMaxOccupancyDurationSeconds);
    }

    static clone(lane: ILaneSettings): ILaneSettings {
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
            AutoIntervalSeconds: settings.DefaultAutoIntervalSeconds,
            AutoMinOccupancyDurationSeconds: settings.DefaultAutoMinOccupancyDurationSeconds,
            AutoMaxOccupancyDurationSeconds: settings.DefaultAutoMaxOccupancyDurationSeconds,
            RPM: RPMSettings.default_settings(),
            Status: "",
            OccupancyState: "",
        };

        return new LaneSettings(laneSettings);
    }
}
