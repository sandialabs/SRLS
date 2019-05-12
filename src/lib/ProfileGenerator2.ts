import { Logger, ELogLevel } from './Logger';

export class ProfileGenerator2 {
    m_logger: Logger;

    public constructor(debug: boolean = false) {
        if (debug) this.m_logger = new Logger("ProfileGenerator2", ELogLevel.LOG_DEBUG);
        else this.m_logger = new Logger("ProfileGenerator2", ELogLevel.LOG_ERROR);
    }

    generate_profile(params: any): any[] {
        let duration = this.to_float(params.duration, 10.0);
        let stddev = this.to_float(params.stddev, duration / 2.0);
        let time_increment = this.to_int(params.time_increment, 1);
        let humps = this.to_int(params.humps, 1);
        let shift = this.to_float(params.shift, 0);
        let x_values = this.generate_x_values(0, duration * 5, time_increment * 1);
        let y_values = [];
        if (humps > 1) {
            this.m_logger.Debug("Duration: " + duration + "  Stddev: " + stddev + "  Humps: " + humps + "  Shifts: " + -shift + " and " + shift);
            y_values = this.profile(stddev, x_values, -shift);
            this.add_profile(x_values, y_values, stddev, shift);
        }
        else {
            this.m_logger.Debug("Duration: " + duration + "  Stddev: " + stddev + "  Humps: " + humps + "  Shift " + shift);
            y_values = this.profile(stddev, x_values, shift);
        }
        let result = [];
        for (let i = 0; i < x_values.length; i++) {
            let x = x_values[i];
            let y = y_values[i];
            result.push([x, y]);
        }
        return (result);
    }

    generate_random_profile(): any[] {
        let stddev = Math.random() * 8 + 4;
        let duration = Math.random() * 10 + 7;
        let humps = Math.random() > 0.5 ? 2 : 1;
        let params = {
            duration: Math.random() * 10 + 7,
            stddev: Math.random() * 8 + 4,
            humps: Math.random() > 0.5 ? 2 : 1,
            shift: Math.random() * 1.0
        }
        return this.generate_profile(params);
    }

    normal(x: number, mean: number, stdev: number): number {
        let variance = stdev * stdev;
        let denom = Math.sqrt(2 * Math.PI * variance);
        let num = Math.exp(-((x - mean) ** 2) / (2 * variance));
        return num / denom;
    }

    generate_x_values(start: number, end: number, increment: number): number[] {
        let result = [];
        this.m_logger.Debug("Generate x values from " + start + " to " + end + ", incrementing by " + increment);
        let x = start;
        while (x <= end) {
            result.push(x);
            x += increment;
        }
        return result;
    }

    generate_y_values(x_values: number[], mean: number, stddev: number): number[] {
        let result = [];
        let start = x_values[0];
        let end = x_values[x_values.length - 1];

        let max_y = 0;
        for (let x of x_values) {
            let y = this.normal(x, mean, stddev);
            max_y = Math.max(y, max_y);
            result.push(y);
        }
        for (let i = 0; i < result.length; i++) {
            result[i] = result[i] / max_y;
        }
        return result;
    }

    profile(stddev: number, x_values: number[], shift: number = 0): number[] {
        let xmin = x_values[0];
        let xmax = x_values[x_values.length - 1];

        //console.log("x range is " + xmin + " to " + xmax);
        let mean = (xmin + xmax) / 2;
        //console.log("shift is " + shift, typeof shift);
        let shift_val = 1.0 + shift;
        let shifted_mean = mean * shift_val;
        //console.log("mean is " + mean);
        //console.log("shifted mean is " + mean + ' * ' + shift_val + ' = ' + shifted_mean);
        //console.log("Generating profile with mean " + shifted_mean + " and stddev " + stddev + " using shift = " + shift);
        let y_values = this.generate_y_values(x_values, shifted_mean, stddev);
        //console.log("x_values:", x_values);
        //console.log("y_values:", y_values);
        return y_values;
    }

    add_profile(x_values: number[], y_values: number[], stddev: number, shift: number): void {
        let yv = this.profile(stddev, x_values, shift);
        for (let i = 0; i < yv.length; i++) {
            y_values[i] += yv[i];
        }
    }

    to_float(val: any, default_value: number): number {
        if (val) return parseFloat(val);
        else return default_value;
    }

    to_int(val: any, default_value: number): number {
        if (val) return parseInt(val);
        else return default_value;
    }

}



