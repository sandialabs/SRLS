import { ILaneSettings } from "./ILaneSettings";


export interface ISettings {
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
}
