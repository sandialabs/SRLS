import { AppVersion } from "./Globals";
import { ISettings } from "./ISettings";

export class Settings implements ISettings {
    Version: string; // version of app that created this file
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
    DefaultAutoInterval: number;

    LogLevel: string;
    LogFilename: string;

    Lanes: ILaneSettings[];

    constructor(settings?: ISettings) {
        if(settings) {

        }
    }

    static default(): ISettings {
        let settings: ISettings = {
            Version: AppVersion,
            DefaultGammaBG: 0,
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
            DefaultAutoInterval: 30.0,
            LogLevel: "warning",
            LogFilename: "",
            Lanes: []
        }

        return settings;
    }

    static copy(from: ISettings, to: ISettings): void {
        to.Version = from.Version;
        to.DefaultGammaBG = from.DefaultGammaBG;
        to.DefaultNeutronBG = from.DefaultNeutronBG;
        to.DefaultGammaDistribution = from.DefaultGammaDistribution.slice(0);
        to.DefaultNeutronDistribution = from.DefaultNeutronDistribution.slice(0);
        to.DefaultGammaNSigma = from.DefaultGammaNSigma;
        to.DefaultNeutronThreshold = from.DefaultNeutronThreshold;
        to.DefaultGHThreshold = from.DefaultGHThreshold;
        to.DefaultGLThreshold = from.DefaultGLThreshold;
        to.DefaultNHThreshold = from.DefaultNHThreshold;
        to.DefaultAutoGammaProbability = from.DefaultAutoGammaProbability;
        to.DefaultAutoNeutronProbability = from.DefaultAutoNeutronProbability;
        to.DefaultAutoInterval = from.DefaultAutoInterval;
        to.LogLevel = from.LogLevel;
        to.LogFilename = from.LogFilename;
        to.Lanes = from.Lanes.slice(0);
    }
}