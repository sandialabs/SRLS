import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import * as LOG from "../../src/lib/Logger";

function check(returned: string, expected: string) {
    //console.log(`Returned: "${returned}"`);
    expect(returned).to.equal(expected);
}

describe("Logging Functions", () => {
    LOG.Logger.UseTheseEmitters(new LOG.NullEmitter());
    const log1 = new LOG.Logger("TEST", LOG.ELogLevel.LOG_ALL);
    const log2 = new LOG.Logger("TEST", LOG.ELogLevel.LOG_DEBUG);
    const log3 = new LOG.Logger("TEST", LOG.ELogLevel.LOG_INFO);
    const log4 = new LOG.Logger("TEST", LOG.ELogLevel.LOG_WARNING);
    const log5 = new LOG.Logger("TEST", LOG.ELogLevel.LOG_ERROR);

    it("verbose level", () => {
        // generate an array of [ id, count ]
        expect(log1.Error("error")).to.equal("[TEST][E] error");
        expect(log1.Warning("warning")).to.equal("[TEST][W] warning");
        expect(log1.Info("info")).to.equal("[TEST][I] info");
        expect(log1.Debug("debug")).to.equal("[TEST][D] debug");
        expect(log1.Verbose("always")).to.equal("[TEST][A] always");
    });

    it("debug level", () => {
        // generate an array of [ id, count ]
        expect(log2.Error("error")).to.equal("[TEST][E] error");
        expect(log2.Warning("warning")).to.equal("[TEST][W] warning");
        expect(log2.Info("info")).to.equal("[TEST][I] info");
        expect(log2.Debug("debug")).to.equal("[TEST][D] debug");
        expect(log2.Verbose("always")).to.equal("");
    });

    it("info level", () => {
        // generate an array of [ id, count ]
        expect(log3.Error("error")).to.equal("[TEST][E] error");
        expect(log3.Warning("warning")).to.equal("[TEST][W] warning");
        expect(log3.Info("info")).to.equal("[TEST][I] info");
        expect(log3.Debug("debug")).to.equal("");
        expect(log3.Verbose("always")).to.equal("");
    });

    it("warning level", () => {
        // generate an array of [ id, count ]
        check(log4.Error("error"), "[TEST][E] error");
        check(log4.Warning("warning"), "[TEST][W] warning");
        check(log4.Info("info"), "");
        check(log4.Debug("debug"), "");
        check(log4.Verbose("always"), "");
    });

    it("error level", () => {
        // generate an array of [ id, count ]
        check(log5.Error("error"), "[TEST][E] error");
        check(log5.Warning("warning"), "");
        check(log5.Info("info"), "");
        check(log5.Debug("debug"), "");
        check(log5.Verbose("always"), "");
    });
});
