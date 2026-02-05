import { ISettings, Settings } from "./ISettings";

export interface IRPMSettings {
    IPAddr: string;
    Port: number;
    GammaBG: number;
    NeutronBG: number;
    GammaDistribution: number[];
    NeutronDistribution: number[];
    GammaNSigma: number;
    NeutronThreshold: number;
    GHThreshold: number;
    GLThreshold: number;
    NHThreshold: number;
}

export class RPMSettings implements IRPMSettings {
    IPAddr: string;
    Port: number;
    GammaBG: number;
    NeutronBG: number;
    GammaDistribution: number[];
    NeutronDistribution: number[];
    GammaNSigma: number;
    NeutronThreshold: number;
    GHThreshold: number;
    GLThreshold: number;
    NHThreshold: number;

    constructor(settings: IRPMSettings) {
        this.IPAddr = settings.IPAddr;
        this.Port = settings.Port;

        this.GammaBG = settings.GammaBG;
        this.NeutronBG = settings.NeutronBG;
        this.GammaDistribution = settings.GammaDistribution;
        this.NeutronDistribution = settings.NeutronDistribution;
        this.GammaNSigma = settings.GammaNSigma;
        this.NeutronThreshold = settings.NeutronThreshold;
        this.GHThreshold = settings.GHThreshold;
        this.GLThreshold = settings.GLThreshold;
        this.NHThreshold = settings.NHThreshold;
    }

    static default_settings(): RPMSettings {
        let defaultSettings: ISettings = Settings.default_settings();

        let settings: IRPMSettings = {
            IPAddr: "127.0.0.1",
            Port: 9999,
            GammaBG: defaultSettings.DefaultGammaBG,
            NeutronBG: defaultSettings.DefaultNeutronBG,
            GammaDistribution: defaultSettings.DefaultGammaDistribution,
            NeutronDistribution: defaultSettings.DefaultNeutronDistribution,
            GammaNSigma: defaultSettings.DefaultGammaNSigma,
            NeutronThreshold: defaultSettings.DefaultNeutronThreshold,
            GHThreshold: defaultSettings.DefaultGHThreshold,
            GLThreshold: defaultSettings.DefaultGLThreshold,
            NHThreshold: defaultSettings.DefaultNHThreshold,
        }

        return new RPMSettings(settings);
    }
}