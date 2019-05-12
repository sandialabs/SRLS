import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import * as RPMProfile from '../../src/lib/RPMProfile'
import * as ProfileGenerator from '../../src/lib/ProfileGenerator2'
import { RPMSimulator } from '@/lib/RPMSimulator';
import * as Net from 'net';



describe('Profile Generator', () => {
    const generator = new ProfileGenerator.ProfileGenerator2();
    const params = {
        duration: 10,
        stddev: 10,
        humps: 1,
        shift: 0
    };

    it('Parameterized profile generation', () => {
        // generate an array of [ id, count ]
        const profile = generator.generate_profile(params);
        console.log("      10-second profile length is: " + profile.length);
        expect(profile.length).to.equal(51);
    });

    it('Random profile generation', () => {
        // generate an array of [ id, count ]
        const profile = generator.generate_random_profile();
        console.log("      Random profile length is: " + profile.length);
        expect(profile.length).to.be.greaterThan(10);
    });

});

let sim: RPMSimulator;
let generator = new ProfileGenerator.ProfileGenerator2();
let client: Net.Socket;
let have_data = false;

describe('RPM Simulator Initialization', function () {

    this.timeout(2000);

    beforeEach(function (done) {
        setTimeout(function () {
            done();
        }, 500);
    });


    it('Constructor', () => {
        sim = new RPMSimulator("127.0.0.1", 1601, "Test RPM", generator);
        expect(sim).instanceOf(RPMSimulator);
    });

    it('Startup', () => {
        sim.Start();
        //sim.DumpSettings();
        expect(sim.m_listener).is.not.null;
    });

    it('Can connect', function () {
        client = new Net.Socket();
        client.on('data', function (data) {
            have_data = true;
        })
        let connected = false;
        client.connect(1601, '127.0.0.1', () => {
            connected = true;
            expect(connected).is.true;
        });
    })
});

describe('RPM Simulator Transmitting', function () {

    this.timeout(20000);

    before(function (done) {
        setTimeout(function () {
            done();
        }, 5000);
    });

    it('Transmits data', function () {
        expect(have_data).to.be.true;
        client.destroy();
    });

    it('Shuts down', function () {
        sim.Stop();
    })

});
