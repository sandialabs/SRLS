//const http = require('http')
import * as fs from "fs";
import * as http from "http";
import { CameraSettings } from "../settings";
import { CameraSimulator } from "./CameraSimulator";
import { TruckGenerator } from "./TruckGenerator";
import { runInThisContext } from "vm";

export class AnimatedTruckSimulator extends CameraSimulator {
    m_canvas: HTMLCanvasElement;
    m_images: Uint8Array[];
    m_image_duration_ms: number; // how long to display each occupancy image
    m_image_width = 640;
    m_image_height = 480;
    m_last_image: Buffer;
    m_image_generator: TruckGenerator;

    public constructor(settings: CameraSettings, name: string, canvas: HTMLCanvasElement) {
        super(settings, name);
        console.log("Creating AnimatedTruckSimulator - canvas", canvas);
        this.m_canvas = canvas;
        this.m_image_generator = new TruckGenerator(this.m_canvas);
        this.LogAs("AnimatedTruckSimulator");
    }

    //############################################################
    //
    // METHODS THAT SUBCLASSES MUST OVERRIDE
    //
    //############################################################

    //------------------------------------------------------------
    //
    // Function:    Startup
    // Author:      Pete Humphrey
    // Description: Initialize prior to starting
    //
    //------------------------------------------------------------
    /** Initialize prior to starting */
    Startup(): void {}

    //------------------------------------------------------------
    //
    // Function:    Shutdown
    // Author:      Pete Humphrey
    // Description: Clean up after stopping
    //
    //------------------------------------------------------------
    /** Cleanup after stopping */
    Shutdown(): void {}

    //------------------------------------------------------------
    //
    // Function:    GetDefaultImage
    // Author:      Pete Humphrey
    // Description: Get an image of an empty lane
    //
    // return:      a Buffer object
    //
    //------------------------------------------------------------
    /** Get an image of an empty lane */
    GetDefaultImage(): Buffer {
        //console.log("In AnimatedTruckSimulator.GetDefaultImage");
        let image = this.m_image_generator.drawDefault(this.m_image_width, this.m_image_height);
        return Buffer.from(image as Buffer);
        // return this.m_last_image;
    }

    //------------------------------------------------------------
    //
    // Function:    PrepareOccupancy
    // Author:      Pete Humphrey
    // Description: Initialize for a new occupancy
    //
    // param duration_ms:      the duration of the occupancy (ms)
    // param container_number: the container number to show
    //
    //------------------------------------------------------------
    /** Initialize for a new occupancy */
    PrepareOccupancy(duration_ms: number, container_number: string): void {
        //this.LogDebug("    AnimatedTruckSimulator.PrepareOccupancy");
        let start_time = new Date().getTime();
        let generator = new TruckGenerator(this.m_canvas);
        this.m_images = generator.drawPicture(duration_ms / 1000.0, container_number, 640, 480);
        let available_image_count = this.m_images.length;
        this.m_image_duration_ms = duration_ms / available_image_count;
        let end_time = new Date().getTime();
        let delta = end_time - start_time;
        //this.LogDebug("    Image duration: " + this.m_image_duration_ms);
        this.LogDebug("Generating " + available_image_count + " images took " + delta + "ms");
    }

    //------------------------------------------------------------
    //
    // Function:    GetOccupancyImage
    // Author:      Pete Humphrey
    // Description: Generate an occupancy image
    //
    // param offset_ms: the time offset within the occupancy (ms)
    // return:          a Buffer object with image data
    //
    //------------------------------------------------------------
    /** Generate the next image from this camera */
    GetOccupancyImage(offset_ms: number): Buffer {
        //this.LogDebug("AnimatedTruckSimulator.GetOccupancyImage");
        let image_count = this.m_images.length;
        let imagenum = Math.min(image_count - 1, Math.round(offset_ms / this.m_image_duration_ms));
        let image = this.m_images[imagenum];
        //this.LogDebug("    GetOccupancyImage: returning image " + (1+imagenum) + " of " + image_count);
        let result = Buffer.from(image as Buffer);
        this.m_last_image = result;
        return result;
    }
}
