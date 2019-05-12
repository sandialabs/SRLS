// note: run tsc -w at a command prompt in the RPMSimulator directory to compile typescript files whenever they are saved
import * as fs from "fs";

export class DetectorValues {
    m_type: string;
    m_time_offset: number; // offset, in ms, from some reference time
    m_msg_time: number; // the absolute time for this message to be sent
    m_values: number[]; // four count (master upper, master lower, slave upper, slave lower)

    get TimeOffset(): number {
        return this.m_time_offset;
    }
    get Counts(): number[] {
        return this.m_values;
    }

    public TotalCounts(): number {
        return this.m_values.reduce((x, y) => x + y);
    }

    constructor(typename: string, time_offset: number, values: number[]) {
        this.m_type = typename;
        this.m_time_offset = time_offset;
        this.m_msg_time = 0;
        this.m_values = values;
    }

    public ToString(): string {
        if (this.m_type == "SP") return "SP,0.2249,03.032,004.88,000000";
        let parts: string[] = [];
        parts.push(this.m_type);
        for (let count of this.m_values) parts.push(this.pad_number(count, 6));
        return parts.join(",");
    }

    private pad_number(x: number, len: number): string {
        let str = String(x);
        while (str.length < len) str = "0" + str;
        return str;
    }
}

export class RPMProfile {
    m_counts: DetectorValues[] = [];
    m_gamma_counts: DetectorValues[] = [];
    m_neutron_counts: DetectorValues[] = [];
    m_re = /^(\d+)-(\d+)-(\d+)\.(\d+)\s*$/;
    m_cursor = 0;

    Type: string = "oc";

    get Counts(): DetectorValues[] {
        return this.m_counts;
    }
    get GammaCounts(): DetectorValues[] {
        return this.m_gamma_counts;
    }
    get NeutronCounts(): DetectorValues[] {
        return this.m_neutron_counts;
    }

    public InitializeFromFile(path: string, callback: (rc: boolean) => void): void {
        fs.readFile(path, "utf8", (err, text) => {
            let lines = text.split("\n");
            let start_time = -1;
            //console.log("Read " + lines.length + " lines from " + path);
            for (let line of lines) {
                line = line.trim();
                //console.log("    Line", line);
                let parts = line.split(",");
                if (parts.length == 6) {
                    let msgtype = parts[0];
                    if (["GS", "NS", "GA", "NA", "GX", "SP"].indexOf(msgtype) >= 0) {
                        let counts = [];
                        //console.log("    Parts", parts);
                        for (let i = 1; i < 5; i++) counts.push(parseFloat(parts[i]));
                        let time_offset = this.ParseTimestamp(parts[5]);
                        if (start_time < 0) {
                            start_time = time_offset;
                        }
                        time_offset -= start_time;
                        let dv = new DetectorValues(msgtype, time_offset, counts);
                        this.m_counts.push(dv);
                    }
                }
            }
            callback(true);
        });
    }

    public AddSample(vals: DetectorValues): void {
        this.m_counts.push(vals);
        //console.log(vals);
        if (vals.m_type == "GA" || vals.m_type == "GS") this.m_gamma_counts.push(vals);
        if (vals.m_type == "NA" || vals.m_type == "NS") this.m_neutron_counts.push(vals);
        if (vals.m_type == "GA") {
            if (this.Type == "na" || this.Type == "ng") this.Type = "ng";
            else this.Type = "ga";
        }
        if (vals.m_type == "NA") {
            if (this.Type == "ga" || this.Type == "ng") this.Type = "ng";
            else this.Type = "na";
        }
        //console.log("RPMProfile.AddSample " + vals.m_type + ' => ' + this.Type);
    }

    public AddGX(counter: number): void {
        let last_count = this.m_counts[this.m_counts.length - 1];
        let ts = last_count.m_msg_time;
        let dv = new DetectorValues("GX", ts, [counter, counter * 10, 0, 0]);
        this.m_counts.push(dv);
    }

    public AddTimeOffset(offset: number): void {
        for (let p of this.m_counts) {
            p.m_msg_time = offset + p.m_time_offset;
        }
        this.m_cursor = 0;
    }

    public IsEOF(): boolean {
        return this.m_counts == null || this.m_cursor >= this.m_counts.length;
    }

    public GetNextMessage(now: number): DetectorValues {
        let result: DetectorValues = null;
        if (this.m_counts != null && this.m_counts.length > this.m_cursor) {
            let dv = this.m_counts[this.m_cursor];
            if (now >= dv.m_msg_time) {
                result = dv;
                this.m_cursor += 1;
            }
        }
        return result;
    }

    public Smooth(): RPMProfile {
        let result = new RPMProfile();
        let gamma_values = [];
        let buffer = [];
        for (let sample of this.m_counts) {
            if (sample.m_type == "GA" || sample.m_type == "GS") {
                buffer.unshift(sample); // push new sample onto front of buffer
                let len = buffer.length;
                if (len > 5) {
                    let detector_values = new DetectorValues(
                        buffer[0].m_type,
                        buffer[0].m_time_offset,
                        [0, 0, 0, 0]
                    );
                    for (let i = 0; i < 5; i++) {
                        for (let detector = 0; detector < 4; detector++) {
                            detector_values.m_values[detector] += buffer[i].m_values[detector];
                        }
                    }
                    result.AddSample(detector_values);
                }
            } else {
                result.AddSample(sample);
            }
        }
        return result;
    }

    private ParseTimestamp(timestamp: string): number {
        let m = this.m_re.exec(timestamp);
        if (m) {
            return Math.trunc(
                1000 *
                    (3600 * parseInt(m[1]) +
                        60 * parseInt(m[2]) +
                        parseInt(m[3]) +
                        parseFloat(m[4]) / 1000.0)
            );
        } else {
            console.error("Can't parse RPM message timestamp: " + timestamp);
            return 0;
        }
    }
}
