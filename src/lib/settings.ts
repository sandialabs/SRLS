// import fs = require('fs');

import * as fs from "fs";
import { clone_object } from "./Utility";

export interface RPMSettings {
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

export interface CameraSettings {
    Name: string;
    Enabled: boolean;
    Manufacturer: string;
    Model: string;
    IPAddr: string;
    Port: number;
    URL: string;
    CameraSimulatorType: string;
}

export interface LaneSettings {
    LaneID: number; // a unique identifier
    LaneName: string;
    Enabled: boolean;
    RPMAlgorithm: string;

    AutoGammaProbability: number;
    AutoNeutronProbability: number;
    AutoInterval: number;

    RPM: RPMSettings;
    //Camera1: CameraSettings;
    //Camera2: CameraSettings;
    Cameras: CameraSettings[];

    // these will not be saved to the settings file
    ClientCount: string;
    Status: string;
    OccupancyState: string;
}

export interface Settings {
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

    Lanes: LaneSettings[];
}

export class SettingsManager {
    m_file_path: string;
    Data: Settings;
    static s_rpm_template: RPMSettings = {
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
    static s_camera_template: CameraSettings = {
        Name: "",
        Enabled: false,
        Manufacturer: "",
        Model: "",
        IPAddr: "",
        Port: 0,
        URL: "",
        CameraSimulatorType: "",
    };

    constructor(filepath: string = "") {
        console.log('In SettingsManager constructor: "' + filepath + '"');
        if (filepath) {
            this.m_file_path = filepath;
            if (fs.existsSync(filepath)) {
                //console.log("File exists " + filepath);
                let json: string = fs.readFileSync(filepath, "UTF8");
                this.Data = JSON.parse(json);
            } else {
                this.Data = this.default_settings();
                this.save();
            }
        } else {
            this.Data = this.default_settings();
            //console.log("No file path specified");
        }
        //console.log("Utility test:", clone_object(this.Data, true));
    }

    default_settings(): Settings {
        let result: Settings = {
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
            DefaultAutoInterval: 30.0,
            Lanes: [],
        };
        return result;
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

    serialize(to_path: string = "settings.json"): void {
        fs.writeFileSync(to_path, this.to_string() + "\n");
    }

    save(): void {
        if (this.m_file_path) {
            console.log("Saving Settings to " + this.m_file_path);
            this.serialize(this.m_file_path);
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

    static clone_rpm(settings: RPMSettings): RPMSettings {
        let result = {
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
        SettingsManager.copy_properties(settings, result, []);
        return result;
    }

    static clone_camera(settings: CameraSettings): CameraSettings {
        let result = {
            Name: "Camera One",
            Enabled: false,
            Manufacturer: "unknown",
            Model: "unknown",
            IPAddr: "127.0.0.1",
            Port: 10101,
            URL: "",
            CameraSimulatorType: "canned",
        };
        SettingsManager.copy_properties(settings, result, []);
        return result;
    }

    static clone_lane(settings: LaneSettings): LaneSettings {
        let result = {
            LaneID: 0,
            LaneName: "",
            Enabled: false,
            ClientCount: "0",
            Status: "",
            OccupancyState: "",
            RPMAlgorithm: settings.RPMAlgorithm,
            AutoGammaProbability: 0,
            AutoNeutronProbability: 0,
            AutoInterval: 0,
            RPM: this.clone_rpm(settings.RPM),
            Cameras: [
                this.clone_camera(settings.Cameras[0]),
                this.clone_camera(settings.Cameras[1]),
            ],
        };
        SettingsManager.copy_properties(settings, result, [
            "RPM",
            "Cameras",
            "ClientCount",
            "Status",
            "RPMAlgorithm",
        ]);
        return result;
    }

    static clone_settings(settings: Settings) {
        let result = {
            DefaultGammaBG: 0,
            DefaultNeutronBG: 0,
            DefaultGammaDistribution: [0.25, 0.25, 0.25, 0.25],
            DefaultNeutronDistribution: [0.25, 0.25, 0.25, 0.25],

            DefaultGammaNSigma: 0,
            DefaultNeutronThreshold: 0,
            DefaultGHThreshold: 0,
            DefaultGLThreshold: 0,
            DefaultNHThreshold: 0,

            DefaultAutoGammaProbability: 0,
            DefaultAutoNeutronProbability: 0,
            DefaultAutoInterval: 0,

            Lanes: [],
        };
        SettingsManager.copy_properties(settings, result, ["Lanes"]);
        settings.Lanes.forEach(x => {
            result.Lanes.push(SettingsManager.clone_lane(x));
        });
        return result;
    }

    equals(other: SettingsManager): boolean {
        return JSON.stringify(this.Data) == JSON.stringify(other.Data);
    }

    default_lane_settings(name: string, ipaddr: string, port: number): LaneSettings {
        let lane = {
            LaneID: new Date().getTime(),
            LaneName: name,
            Enabled: false,
            RPMAlgorithm: "simulated",
            ClientCount: "0",
            Status: "",
            OccupancyState: "",
            AutoGammaProbability: this.Data.DefaultAutoGammaProbability,
            AutoNeutronProbability: this.Data.DefaultAutoNeutronProbability,
            AutoInterval: this.Data.DefaultAutoInterval,
            RPM: {
                IPAddr: ipaddr,
                Port: port,
                GammaBG: this.Data.DefaultGammaBG,
                NeutronBG: this.Data.DefaultNeutronBG,
                GammaDistribution: this.Data.DefaultGammaDistribution,
                NeutronDistribution: this.Data.DefaultNeutronDistribution,
                GammaNSigma: this.Data.DefaultGammaNSigma,
                NeutronThreshold: this.Data.DefaultNeutronThreshold,
                GHThreshold: this.Data.DefaultGHThreshold,
                GLThreshold: this.Data.DefaultGLThreshold,
                NHThreshold: this.Data.DefaultNHThreshold,
            },
            Cameras: [
                {
                    Name: "Camera One",
                    Enabled: false,
                    Manufacturer: "unknown",
                    Model: "unknown",
                    IPAddr: "127.0.0.1",
                    Port: 10101,
                    URL: "",
                    CameraSimulatorType: "canned",
                },
                {
                    Name: "Camera Two",
                    Enabled: false,
                    Manufacturer: "unknown",
                    Model: "unknown",
                    IPAddr: "127.0.0.1",
                    Port: 10102,
                    URL: "",
                    CameraSimulatorType: "canned",
                },
            ],
        };
        return lane;
    }

    add_lane(name: string, ipaddr: string, port: number): LaneSettings {
        // don't allow duplicate lane names
        let existing = this.Data.Lanes.filter(x => {
            return x.LaneName == name;
        });
        if (existing.length > 0) return null;

        let lane = this.default_lane_settings(name, ipaddr, port);
        const result = lane as LaneSettings;
        this.Data.Lanes.push(result);
        return result;
    }

    add_new_lane(settings: LaneSettings): any {
        // don't allow duplicate lane names
        let existing = this.Data.Lanes.filter(x => {
            return x.LaneName == settings.LaneName;
        });

        if (existing.length > 0) {
            return {
                success: false,
                message: 'A lane named "' + settings.LaneName + ": already exists",
            };
        }

        let lane_settings = SettingsManager.clone_lane(settings); // make sure reactive stuff is removed
        lane_settings.LaneID = new Date().getTime();
        this.Data.Lanes.push(lane_settings);
        return {
            success: true,
            message: "Successfully added " + lane_settings.LaneName,
        };
    }

    update_lane(settings: LaneSettings): any {
        let lane_index = this.find_lane(settings.LaneID);
        if (lane_index >= 0) {
            this.Data.Lanes[lane_index] = SettingsManager.clone_lane(settings);
            return {
                success: true,
                message: "Successfully updated " + settings.LaneName,
            };
        } else {
            return {
                success: false,
                message: "Error updating " + settings.LaneName + ": invalid lane index",
            };
        }
    }

    locate_lane(name: string): number {
        for (let ix = 0; ix < this.Data.Lanes.length; ix++) {
            let lane = this.Data.Lanes[ix];
            if (lane.LaneName == name) return ix;
        }
        return -1;
    }
    find_lane(lane_id: number): number {
        for (let ix = 0; ix < this.Data.Lanes.length; ix++) {
            let lane = this.Data.Lanes[ix];
            if (lane.LaneID == lane_id) return ix;
        }
        return -1;
    }

    get_lane(lane_id: number): LaneSettings {
        return this.Data.Lanes.filter(x => {
            return x.LaneID == lane_id;
        })[0];
    }

    remove_lane(doomed_index: number): void {
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
        if (ix >= 0) this.remove_lane(ix);
    }
}
