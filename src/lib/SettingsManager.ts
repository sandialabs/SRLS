/// <reference path="../electron/types/global.d.ts" />

import { AppVersion } from "./Globals";
import { ICameraSettings } from "./ICameraSettings";
import { IRPMSettings, RPMSettings } from "./IRPMSettings";
import { ILaneSettings, LaneSettings } from "./ILaneSettings";
import { ISettings, Settings } from "./ISettings";

export class SettingsManager {
    private m_file_path: string = "";
    private Data: Settings;

    private static readonly s_rpm_template: IRPMSettings = {
        IPAddr: "",
        Port: 0,
        GammaBG: 0,
        NeutronBG: 0,
        GammaDistribution: [0.25, 0.25, 0.25, 0.25],
        NeutronDistribution: [0.25, 0.25, 0.25, 0.25],
        GammaNSigma: 0,
        NeutronThreshold: 0,
        GHThreshold: 0,
        GLThreshold: 0,
        NHThreshold: 0,
    };
    private static readonly s_camera_template: ICameraSettings = {
        Name: "",
        Enabled: false,
        Manufacturer: "",
        Model: "",
        IPAddr: "",
        Port: 0,
        URL: "",
        CameraSimulatorType: "canned",
    };

    constructor() {
        this.Data = Settings.default_settings();
    }

    async initialize(filepath: string) {
        console.log(`In SettingsManager.initialize: '${filepath}'`, window);

        if (window && filepath) {
            this.m_file_path = filepath;
            const exists: boolean = await window.electronAPI.existsAsync(filepath);

            if (exists) {
                console.log("File exists " + filepath);
                let json: string = await window.electronAPI.readFileAsync(filepath, "utf8");

                // This will reload the existing arrays within the Data object, which will
                // allow already-existing references to those arrays to keep working
                this.Data.load(JSON.parse(json));
                
                // upgrade older versions
                if (typeof this.Data.LogLevel == "undefined") this.Data.LogLevel = "warning";
                if (typeof this.Data.LogFilename == "undefined") this.Data.LogFilename = "";
                if (typeof this.Data.Version == "undefined") this.Data.Version = AppVersion;

                console.log("SettingsManager.initialize loaded", this.Data);
            } else {
                console.log(`File ${filepath} doesn't exist`);
                this.Data = Settings.default_settings();
                await this.save();
            }
        } else {
            this.Data = Settings.default_settings();
            //console.log("No file path specified");
        }
    }

    // get data(): ISettings {
    //     return this.Data;
    // }

    get lanes(): ILaneSettings[] {
        return this.Data.Lanes;0
    }

    get num_lanes(): number {
        return (this.Data) ? this.Data.Lanes.length : 0;
    }

    parse(json: string) {
        this.Data = JSON.parse(json);
    }

    to_string(): string {
        // clean out all the reactive crud
        let settings = SettingsManager.clone_settings(this.Data);
        //console.log("to_string", settings);
        let result = JSON.stringify(settings, null, 4);
        return result;
    }

    async serialize(to_path: string): Promise<void> {
        await window.electronAPI.writeFileAsync(to_path, this.to_string() + "\n");
    }

    async save(): Promise<void> {
        if (this.m_file_path) {
            console.log("Saving Settings to " + this.m_file_path);
            console.trace(this.m_file_path);

            await this.serialize(this.m_file_path);
        } else {
            console.log("Unable to save Settings - no file path");
        }
    }

    static copy_properties(from: any, to: any, ignore: string[]): void {
        for (let propname in to) {
            if (ignore.indexOf(propname) < 0) {
                to[propname] = from[propname];
            }
        }
    }

    static clone_rpm(settings: IRPMSettings): IRPMSettings {
        return new RPMSettings(settings);
    }

    static clone_lane(settings: ILaneSettings): ILaneSettings {
        return new LaneSettings(settings);
    }

    static clone_settings(settings: ISettings): ISettings {
        let result: ISettings = Settings.default_settings();
        SettingsManager.copy_properties(settings, result, ["Lanes"]);
        settings.Lanes.forEach((x: ILaneSettings) => {
            result.Lanes.push(SettingsManager.clone_lane(x));
        });
        return result;
    }

    equals(other: SettingsManager): boolean {
        return JSON.stringify(this.Data) === JSON.stringify(other.Data);
    }

    default_lane_settings(name: string, ipaddr: string, port: number): LaneSettings {
        let lane: LaneSettings = LaneSettings.default_settings();

        lane.LaneName = name;
        lane.RPM.IPAddr = ipaddr;
        lane.RPM.Port = port;

        return lane;
    }

    copy_default_to(to: ISettings) {
        this.copy_to(this.Data, to);
    }

    copy_to_default(from: ISettings) {
        this.copy_to(from, this.Data);
    }

    private copy_to(from: ISettings, to: ISettings): void {
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

    /** Only create a lane if there are none */
    public create_default_lane() {
        if (this.num_lanes === 0) {
            this.add_lane("Lane 1", "127.0.0.1", 1601);
            this.save();
        }
    }

    add_lane(name: string, ipaddr: string, port: number): ILaneSettings | null {
        // don't allow duplicate lane names
        let existing = this.Data.Lanes.filter(x => {
            return x.LaneName === name;
        });
        if (existing.length > 0)
            return null;

        let lane = this.default_lane_settings(name, ipaddr, port);
        const result = lane as ILaneSettings;
        this.Data.Lanes.push(result);
        return result;
    }

    add_new_lane(settings: ILaneSettings): [boolean, string] {
        // don't allow duplicate lane names
        let existing = this.Data.Lanes.filter(x => {
            return x.LaneName == settings.LaneName;
        });

        if (existing.length > 0) {
            return [false, `A lane named "${settings.LaneName}": already exists`];
        }

        let lane_settings = SettingsManager.clone_lane(settings); // make sure reactive stuff is removed
        lane_settings.LaneID = new Date().getTime();
        this.Data.Lanes.push(lane_settings);
        return [true, `Successfully added ${lane_settings.LaneName}`];
    }

    update_lane(settings: ILaneSettings): [boolean, string] {
        let lane_index = this.find_lane(settings.LaneID);
        if (lane_index >= 0) {
            this.Data.Lanes[lane_index] = SettingsManager.clone_lane(settings);
            return [true, `Successfully updated ${settings.LaneName}`];
        } else {
            return [false, `Error updating ${settings.LaneName}: invalid lane index`];
        }
    }

    locate_lane(name: string): number {
        for (let ix = 0; ix < this.Data.Lanes.length; ix++) {
            let lane = this.Data.Lanes[ix];
            if (lane.LaneName === name)
                return ix;
        }
        return -1;
    }

    find_lane(lane_id: number): number {
        for (let ix = 0; ix < this.Data.Lanes.length; ix++) {
            let lane = this.Data.Lanes[ix];
            if (lane.LaneID == lane_id)
                return ix;
        }
        return -1;
    }

    get_lane(lane_id: number): ILaneSettings | null {
        let laneSettings: ILaneSettings | null = null;
        let lanes = this.Data.Lanes.filter(x => {
            return x.LaneID == lane_id;
        });
        if (lanes.length > 0)
            laneSettings = lanes[0];
        return laneSettings;
    }

    private remove_lane(doomed_index: number): void {
        if (doomed_index < this.Data.Lanes.length) {
            this.Data.Lanes.splice(doomed_index, 1);
        }
    }

    remove_lane_by_id(lane_id: number): void {
        let ix = this.find_lane(lane_id);
        if (ix >= 0) {
            console.log("SettingsManager: removing " + this.Data.Lanes[ix].LaneName);
            this.remove_lane(ix);
            this.save();
        } else {
            console.log("Could not find a lane with LaneID = " + lane_id);
        }
    }

    remove_lane_by_name(name: string): void {
        let ix = this.locate_lane(name);
        if (ix >= 0)
            this.remove_lane(ix);
    }
}
