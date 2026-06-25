import { AppVersion } from "./Globals";
import { ILaneSettings } from "./ILaneSettings";
import { ISettings } from "./ISettings";


export class Settings implements ISettings {
    Version: string;
    DefaultGammaBG: number;
    DefaultNeutronBG: number;
    DefaultGammaDistribution: number[];
    DefaultNeutronDistribution: number[];
    DefaultGammaNSigma: number;
    DefaultNeutronThreshold: number;
    DefaultGHThreshold: number;
    DefaultGLThreshold: number;
    DefaultNHThreshold: number;
    DefaultAutoGammaProbability: number;
    DefaultAutoNeutronProbability: number;
    DefaultAutoIntervalSeconds: number;
    DefaultAutoMinOccupancyDurationSeconds: number;
    DefaultAutoMaxOccupancyDurationSeconds: number;
    LogLevel: string;
    LogFilename: string;
    Lanes: ILaneSettings[];

    constructor(settings: ISettings) {
        this.Version = settings.Version;
        this.DefaultGammaBG = settings.DefaultGammaBG;
        this.DefaultNeutronBG = settings.DefaultNeutronBG;
        this.DefaultGammaDistribution = [...settings.DefaultGammaDistribution];
        this.DefaultNeutronDistribution = [...settings.DefaultNeutronDistribution];
        this.DefaultGammaNSigma = settings.DefaultGammaNSigma;
        this.DefaultNeutronThreshold = settings.DefaultNeutronThreshold;
        this.DefaultGHThreshold = settings.DefaultGHThreshold;
        this.DefaultGLThreshold = settings.DefaultGLThreshold;
        this.DefaultNHThreshold = settings.DefaultNHThreshold;
        this.DefaultAutoGammaProbability = settings.DefaultAutoGammaProbability;
        this.DefaultAutoNeutronProbability = settings.DefaultAutoNeutronProbability;
        this.DefaultAutoIntervalSeconds = settings.DefaultAutoIntervalSeconds;
        this.DefaultAutoMinOccupancyDurationSeconds = settings.DefaultAutoMinOccupancyDurationSeconds;
        this.DefaultAutoMaxOccupancyDurationSeconds = settings.DefaultAutoMaxOccupancyDurationSeconds;
        // Make sure the max is at least 1 second more than the min
        this.DefaultAutoMaxOccupancyDurationSeconds = Math.max(this.DefaultAutoMinOccupancyDurationSeconds + 1, this.DefaultAutoMaxOccupancyDurationSeconds);
        this.LogLevel = settings.LogLevel;
        this.LogFilename = settings.LogFilename;
        this.Lanes = [...settings.Lanes];
    }

    load(settings: ISettings): void {
        this.Version = settings.Version;
        this.DefaultGammaBG = settings.DefaultGammaBG;
        this.DefaultNeutronBG = settings.DefaultNeutronBG;
        this.DefaultGammaDistribution.splice(0, this.DefaultGammaDistribution.length, ...settings.DefaultGammaDistribution);
        this.DefaultNeutronDistribution.splice(0, this.DefaultNeutronDistribution.length, ...settings.DefaultNeutronDistribution);
        this.DefaultGammaNSigma = settings.DefaultGammaNSigma;
        this.DefaultNeutronThreshold = settings.DefaultNeutronThreshold;
        this.DefaultGHThreshold = settings.DefaultGHThreshold;
        this.DefaultGLThreshold = settings.DefaultGLThreshold;
        this.DefaultNHThreshold = settings.DefaultNHThreshold;
        this.DefaultAutoGammaProbability = settings.DefaultAutoGammaProbability;
        this.DefaultAutoNeutronProbability = settings.DefaultAutoNeutronProbability;
        this.DefaultAutoIntervalSeconds = settings.DefaultAutoIntervalSeconds;
        this.DefaultAutoMinOccupancyDurationSeconds = settings.DefaultAutoMinOccupancyDurationSeconds;
        this.DefaultAutoMaxOccupancyDurationSeconds = settings.DefaultAutoMaxOccupancyDurationSeconds;
        // Make sure the max is at least 1 second more than the min
        this.DefaultAutoMaxOccupancyDurationSeconds = Math.max(this.DefaultAutoMinOccupancyDurationSeconds + 1, this.DefaultAutoMaxOccupancyDurationSeconds);
        this.LogLevel = settings.LogLevel;
        this.LogLevel = settings.LogLevel;
        this.LogFilename = settings.LogFilename;
        this.Lanes.splice(0, this.Lanes.length, ...settings.Lanes);
    }

    to_string(): string {
        return JSON.stringify(this);
    }

    static default_settings(): Settings {
        let settings: ISettings = {
            Version: AppVersion,
            DefaultGammaBG: 256,
            DefaultNeutronBG: 3,
            DefaultGammaDistribution: [0.25, 0.25, 0.25, 0.25],
            DefaultNeutronDistribution: [0.25, 0.25, 0.25, 0.25],
            DefaultGammaNSigma: 7,
            DefaultNeutronThreshold: 7,
            DefaultGHThreshold: 300,
            DefaultGLThreshold: 100,
            DefaultNHThreshold: 7,
            DefaultAutoGammaProbability: 0.05,
            DefaultAutoNeutronProbability: 0.05,
            DefaultAutoIntervalSeconds: 30.0,
            DefaultAutoMinOccupancyDurationSeconds: 10.0,
            DefaultAutoMaxOccupancyDurationSeconds: 20.0,
            LogLevel: "warning",
            LogFilename: "",
            Lanes: [],
        };

        return new Settings(settings);
    }
}
