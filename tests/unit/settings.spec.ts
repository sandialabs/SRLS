import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { clone_object } from '../../src/lib/Utility'
import { RPMSettings, CameraSettings, LaneSettings, SettingsManager } from '../../src/lib/settings'
import { settings } from 'cluster';


describe('Settings', () => {
    let settings_manager = new SettingsManager();
    let lane = settings_manager.default_lane_settings('Test Lane', 'undefined', 0);
    let rpm = lane.RPM;
    let cam = lane.Cameras[0];

    it('Clone RPM', () => {
        let my_rpm = SettingsManager.clone_rpm(rpm);
        my_rpm.IPAddr = "1.1.1.1";
        my_rpm.Port = 1111;
        my_rpm.GHThreshold = 2222;
        my_rpm.GLThreshold = 3333;

        // check that changed values are different from original
        expect(rpm.IPAddr).to.not.equal(my_rpm.IPAddr);
        expect(rpm.GHThreshold).to.not.equal(my_rpm.GHThreshold);
        expect(rpm.GLThreshold).to.not.equal(my_rpm.GLThreshold);
        // check that unchanged values are the same as original
        expect(rpm.NeutronThreshold).to.equal(my_rpm.NeutronThreshold);
        expect(rpm.NHThreshold).to.equal(my_rpm.NHThreshold);
        expect(rpm.GammaNSigma).to.equal(my_rpm.GammaNSigma);
    });

    it('Clone Camera', () => {
        let my_cam = SettingsManager.clone_camera(cam);
        my_cam.Name = "MYCAM";
        my_cam.IPAddr = "1.1.1.1";
        my_cam.Port = 1111;
        my_cam.Manufacturer = 'SONY';
        my_cam.Model = 'SNC';

        // check that changed values are different from original
        expect(cam.Name).to.not.equal(my_cam.Name);
        expect(cam.IPAddr).to.not.equal(my_cam.IPAddr);
        expect(cam.Port).to.not.equal(my_cam.Port);
        expect(cam.Manufacturer).to.not.equal(my_cam.Manufacturer);
        expect(cam.Model).to.not.equal(my_cam.Model);
        // check that unchanged values are the same as original
        expect(cam.URL).to.equal(my_cam.URL);
        expect(cam.Enabled).to.equal(my_cam.Enabled);
    });

    it('Clone Lane', () => {
        let my_lane = SettingsManager.clone_lane(lane);

        expect(lane.Enabled).to.equal(my_lane.Enabled);
        expect(lane.AutoGammaProbability).to.equal(my_lane.AutoGammaProbability);
        expect(lane.AutoInterval).to.equal(my_lane.AutoInterval);
        expect(lane.RPM.IPAddr).to.equal(my_lane.RPM.IPAddr);
        expect(lane.Cameras[0].Name).to.equal(my_lane.Cameras[0].Name);
        expect(lane.Cameras[1].Name).to.equal(my_lane.Cameras[1].Name);

        my_lane.Enabled = true;
        my_lane.AutoGammaProbability = 0.9999;
        my_lane.AutoInterval = 999;
        my_lane.RPM.IPAddr = "UNIQUE";
        my_lane.Cameras[0].Name = "MY CAMERA 1";
        my_lane.Cameras[1].Name = "MY CAMERA 2";

        expect(lane.Enabled).to.not.equal(my_lane.Enabled);
        expect(lane.AutoGammaProbability).to.not.equal(my_lane.AutoGammaProbability);
        expect(lane.AutoInterval).to.not.equal(my_lane.AutoInterval);
        expect(lane.RPM.IPAddr).to.not.equal(my_lane.RPM.IPAddr);
        expect(lane.Cameras[0].Name).to.not.equal(my_lane.Cameras[0].Name);
        expect(lane.Cameras[1].Name).to.not.equal(my_lane.Cameras[1].Name);
    });

    it("Add/Remove Lanes", () => {
        expect(settings_manager.Data.Lanes.length).to.equal(0);

        settings_manager.add_lane("Lane 1", "192.168.0.21", 1601);
        expect(settings_manager.Data.Lanes.length).to.equal(1);
        expect(settings_manager.Data.Lanes[0].LaneName).to.equal("Lane 1");
        expect(settings_manager.Data.Lanes[0].RPM.IPAddr).to.equal("192.168.0.21");
        expect(settings_manager.Data.Lanes[0].RPM.Port).to.equal(1601);

        settings_manager.add_lane("Lane 2", "192.168.0.22", 1602);
        expect(settings_manager.Data.Lanes.length).to.equal(2);

        settings_manager.add_lane("Lane 3", "192.168.0.23", 1603);
        expect(settings_manager.Data.Lanes.length).to.equal(3);

        settings_manager.remove_lane_by_name("Lane 2");
        expect(settings_manager.Data.Lanes.length).to.equal(2);
        expect(settings_manager.Data.Lanes[0].LaneName).to.equal("Lane 1");
        expect(settings_manager.Data.Lanes[1].LaneName).to.equal("Lane 3");
    });

    it("Save/Restore Settings", () => {

    });
});
