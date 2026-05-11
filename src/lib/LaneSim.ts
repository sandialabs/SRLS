import { RPMProfile } from "./RPMProfile";
import { ProfileGenerator2 } from "./ProfileGenerator2";
import { RPMSimulator } from "./RPMSimulator";
import { ISettings } from "./ISettings";
import { ILaneSettings } from "./ILaneSettings";
import { Logger, ELogLevel } from "./Logger";

var NextLaneID = 1;

export class LaneSimulator {
    m_is_paused: boolean = false;

    Settings: ILaneSettings;
    Name: string;
    IsEnabled: boolean = false;
    IsRunning: boolean = false;
    OccupancyState: string = "normal";
    IsInAutoMode: boolean = false;
    RPM: RPMSimulator | null;
    LaneID: number = 0;
    Status: string = "new";
    CanvasElement: HTMLCanvasElement;
    Log: Logger;

    get IsPaused(): boolean {
        return this.m_is_paused;
    }
    set IsPaused(val: boolean) {
        console.log("Setting paused state of " + this.Name + " to " + val);
        this.m_is_paused = val;
        if (this.RPM)
            this.RPM.IsPaused = val;
    }

    constructor(settings: ILaneSettings, canvas: HTMLCanvasElement) {
        this.Log = new Logger(settings.LaneName, ELogLevel.LOG_INFO);
        console.log("Creating LaneSimulator", settings);
        this.Settings = settings;
        this.CanvasElement = canvas;
        this.LaneID = NextLaneID;
        NextLaneID += 1;
        this.Name = settings.LaneName;
        this.IsEnabled = settings.Enabled;
        this.RPM = null;
        this.create_rpm(settings);
    }

    public Clone() {
        let result = new LaneSimulator(this.Settings, this.CanvasElement);
        return result;
    }

    public static CreateLanes(settings: ISettings, canvas: HTMLCanvasElement): LaneSimulator[] {
        let result: LaneSimulator[] = [];
        for (let lanedef of settings.Lanes) {
            let lane = new LaneSimulator(lanedef, canvas);
            result.push(lane);
        }
        return result;
    }

    // public UpdateGlobalSettings(global_settings: Settings) {
    //     console.log("LaneSim.UpdateGlobalSettings: ", global_settings);
    //     this.RPM.UpdateGlobalSettings(global_settings.GammaBG, global_settings.NeutronBG, global_settings.GammaNSigma, global_settings.NeutronThreshold);
    // }

    public Start(): void {
        console.log(
            "Starting lane simulator " +
            this.Name +
            ": IsEnabled = " +
            this.IsEnabled +
            ", Status = " +
            this.Status
        );
        try {
            console.log("LaneSim.Start", this);

            this.RPM?.Start();
            this.Settings.Status = "running";
        }
        catch (err) {
            console.log("Error starting lane simulator " + err);
        }

    }

    public Stop(): void {
        console.log("Stopping " + this.Name);
        this.RPM?.Stop();
        this.Settings.Status = "stopped";
    }

    public GenerateRPMData(
        alarmtype: string,
        duration: number,
        save: boolean,
        algorithm: string = "computed"
    ): RPMProfile {
        let result: RPMProfile = new RPMProfile();
        if (this.RPM) {
            let gamma_nsigma = 0;
            let neutron_amplitude = 0;
            if (alarmtype == "GA" || alarmtype == "NG")
                gamma_nsigma = this.RPM.m_gamma_nsigma + Math.random() * this.RPM.m_gamma_nsigma;
            if (alarmtype == "NA" || alarmtype == "NG")
                neutron_amplitude =
                    this.RPM.m_neutron_threshold + Math.random() * this.RPM.m_neutron_threshold;
            //console.log("RPM n-sigma: " + this.RPM.m_gamma_nsigma);
            //console.log("Model n-sigma: " + gamma_nsigma);
            this.Log.Debug(
                "Generating " + alarmtype + " alarm in " + this.Name + " with duration " + duration
            );
            let model = {
                type: alarmtype,
                duration: duration,
                stddev: Math.random() * duration * 1.0,
                time_increment: 1,
                humps: 1,
                xshift: 1.0 - Math.random() * 2.0,
                shift: 0.5 - Math.random(),
                gamma_nsigma: gamma_nsigma,
                neutron_amplitude: neutron_amplitude,
            };
            result = this.RPM.GenerateFromModel(model, save);
        }
        return result;
    }

    public GenerateAlarm(alarmtype: string, algorithm: string = "computed"): void {
        if (this.RPM) {
            let duration = 7.0 + Math.random() * 10; // 7 to 17 second duration
            // this.Log.Debug("Checking " + this.Cameras.length + " cameras");
            if (algorithm == "files") this.RPM.GenerateFromFile(alarmtype);
            else this.GenerateRPMData(alarmtype, duration, true, algorithm);
        } else {
            console.log(this.Name + " is not active");
        }
    }

    public Poll(): void {
        let result = false;
        this.OccupancyState = this.RPM ? this.RPM.OccupancyState() : "";
        this.Settings.OccupancyState = this.OccupancyState;
        // if (this.RPM && this.RPM.m_clients.length > 0) {
        //     this.Settings.ClientCount = this.RPM.m_clients.length;
        // } else {
        //     this.Settings.ClientCount = 0;
        // }
    }

    public SetAutoMode(val: boolean): void {
        if (this.IsEnabled) {
            this.IsInAutoMode = val;
            if (val) {
                this.Log.Debug("Starting auto mode");
                this.RPM?.StartAutoMode();
            } else {
                this.Log.Debug("Stopping auto mode");
                this.RPM?.StopAutoMode();
            }
        }
    }

    public ToggleAutoMode(): void {
        if (this.IsEnabled) {
            this.SetAutoMode(!this.IsInAutoMode);
        }
    }

    private create_rpm(settings: ILaneSettings): void {
        console.log("LaneSim--create_rpm", settings);

        this.RPM?.Stop();
        this.RPM = new RPMSimulator(
            settings.RPM.IPAddr,
            settings.RPM.Port,
            settings.LaneName + " RPM",
            new ProfileGenerator2(),
            this
        );
        this.RPM.UpdateFromSettings(settings);
    }
}
