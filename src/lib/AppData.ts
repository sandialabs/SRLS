import { SettingsManager } from "./SettingsManager";

export interface IAppData {
    apptitle: string;
    // settings: SettingsManager | null;
    // testsim: RPMSimulator | null;
    is_dev: boolean;
}

export let AppData: IAppData = {
    apptitle: "SRLS - Sandia RPM Lane Simulator",
    // settings: null,
    // testsim: null,//new RPMSimulator("127.0.0.1", 1600, "Test Simulator", new ProfileGenerator2()),
    // is_dev: process.env.NODE_ENV !== "production",
    is_dev: false,
};
