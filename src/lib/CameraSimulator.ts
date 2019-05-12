//const http = require('http')
import * as fs from 'fs';
import * as http from "http"
import { Component } from './Component';
import { CameraSettings } from './settings';
//import * as mjpegserver from "mjpeg-server";
//import { TruckGenerator } from '../RPMLib/TruckGenerator';
import { runInThisContext } from 'vm';
//import { url } from 'inspector';
import * as url from 'url';
import { ELogLevel } from './Logger';
import { Server } from 'net';

// http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4
// https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6


//############################################################
//
// CameraSimulator class
//
// This is the base class for camera simulators.  It takes 
// care of creating a mini web server to listen for client
// connections and transmit images in response.  It must
// be overridden in a subclass to generate the images that
// it will send.
//
// Subclasses must override the following two methods.
//     GetDefaultImage(): Buffer;
//     PrepareOccupancy(duration_ms: number) : void;
//     GetOccupancyImage(time_offset_ms: number): Buffer;
//
// GetDefaultImage:   return the empty lane image
// PrepareOccupancy:  initialize a new set of occupancy
//                    for the given occupancy duration.
// GetOccupancyImage: return an image for the given time
//                    offset relative to the start of the
//                    occupancy
// 
//
//############################################################
export class CameraSimulator extends Component {
    m_settings: CameraSettings;
    m_is_enabled = false;
    m_name: string;
    m_server: http.Server;
    //m_canvas: HTMLCanvasElement;
    m_occupancy_start_time = 0;
    //m_image_duration_ms = 0;
    m_occupancy_end_time = 0;
    m_ipaddr: string = '127.0.0.1';
    m_port: number = 80;
    m_mjpeg_fps = 5;

    m_mjpeg_config_urls = ['/camera.cgi', '/inquiry.cgi', 'mpeg/video.cgi'];
    m_mjpeg_request_urls = ['/image1'];
    m_oneshot_request_urls = ['oneshotimage.jpg', 'now.jpg'];


    constructor(settings: CameraSettings, name: string) {
        super('CameraSimulator');
        this.m_logger.Level = ELogLevel.LOG_DEBUG;
        this.m_settings = settings;
        this.m_is_enabled = settings.Enabled;
        this.m_name = name;
        this.m_ipaddr = settings.IPAddr;
        this.m_port = settings.Port;
        this.LogDebug("    Creating camera simulator " + name + " on port " + this.m_port + ": IsEnabled=" + this.m_is_enabled);
    }

    public Start(): void {
        if (!this.m_server) {
            this.LogInfo("    Starting camera simulator " + this.m_name);
            this.Startup();
            this.m_server = http.createServer((request: any, response: any) => {
                let parsed_url = url.parse(request.url, true);
                let url_path = parsed_url.pathname.toLocaleLowerCase();
                let query = parsed_url.query;
                console.log("CameraSimulator: have request", url_path, query);

                // handle end of request events
                request.on('close', () => {
                    let clientdata = request["MJPEG_SERVER"];
                    let timer_id = request["TIMER_ID"];
                    console.log("Request closed", clientdata, timer_id);
                    if (clientdata) {
                        clearInterval(timer_id);
                        let image = this.GetNextImage();
                        request["MJPEG_SERVER"] = undefined;
                        request["TIMER_ID"] = undefined;
                    }
                });
                request.on('end', () => {
                    let clientdata = request["MJPEG_SERVER"];
                    let timer_id = request["TIMER_ID"];
                    console.log("Request ended normally", clientdata, timer_id);
                    if (clientdata) {
                        clearInterval(timer_id);
                        request["MJPEG_SERVER"] = undefined;
                        request["TIMER_ID"] = undefined;
                    }
                });

                if (url_path.indexOf('favicon') < 0) {
                    // get the next jpg image into Buffer
                    let buffer: Buffer = this.GetNextImage();
                    if (buffer) {
                        //this.LogDebug("Buffer: ", buffer);
                        if (this.is_mjpeg_config_url(url_path)) {
                            console.log("Request for motion jpeg config: " + request.url);
                            let frame_rate_keys = ['JpFrameRate', 'FrameRate1', 'fps'];
                            for (let key of frame_rate_keys) {
                                if (query[key]) {
                                    this.m_mjpeg_fps = parseInt(query[key] as string);
                                    console.log("Setting MJPEG frame rate to " + this.m_mjpeg_fps);
                                }
                            }
                            response.statusCode = 204;
                            response.end();
                        }
                        else if (this.is_mjpeg_request_url(url_path)) {
                            console.log("Request is for motion jpeg: ", request.url);
                            let interval = 1000 / this.m_mjpeg_fps;
                            console.log("Frame rate: " + this.m_mjpeg_fps + "  interval: " + interval);
                            let image_request_handler = "FIXME"; //mjpegserver.createReqHandler(request, response);
                            request["MJPEG_SERVER"] = image_request_handler;
                            // TODO: image_request_handler.write(this.GetNextImage(), false);
                            let timer_id = setInterval(() => {
                                //console.log("Sending next MJPEG image");
                                let image = this.GetNextImage();
                                // TODO: image_request_handler.write(image, false);
                            }, interval);
                            request["TIMER_ID"] = timer_id;
                            console.log("Created image request handler: ", image_request_handler, timer_id);
                        }
                        else {
                            console.log("Request is for single image: ", request.url);
                            response.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': buffer.length });
                            response.end(buffer, 'binary');
                        }
                    }
                    else this.LogError("CameraSimulator - no available image");
                }
            });

            this.m_server.on('error', (e) => {
                this.LogError("Error on HTTP Server: " + e.message);
            });

            this.m_server.listen(this.m_port, this.m_ipaddr, () => {
                this.LogInfo("CameraSimulator is listening on port " + this.m_port);
            });
        }
    }

    public Stop(): void {
        if (this.m_server) {
            this.Shutdown();
            this.m_server.close();
            this.m_server = undefined;
        }
    }

    public GenerateOccupancy(duration_seconds: number, container_number: string): void {
        let now = new Date().getTime();
        let duration_ms = duration_seconds * 1000;
        this.m_occupancy_start_time = now;
        this.m_occupancy_end_time = now + duration_ms;
        this.PrepareOccupancy(duration_ms, container_number);
    }

    public GetNextImage() {
        let buffer: Buffer = null;
        //console.log("In CameraSimulator.GetNextImage");
        if (this.m_occupancy_start_time > 0) {
            // we are in an occupancy
            let now = new Date().getTime();   // milliseconds since whenever
            if (this.m_occupancy_end_time >= now) {
                let offset_ms = now - this.m_occupancy_start_time;
                //this.LogDebug(this.m_name + ": requesting occupancy image for offset " + offset_ms);
                buffer = this.GetOccupancyImage(offset_ms);
            }
            else {
                //this.LogDebug(this.m_name + ": occupancy expired - sending default image");
                this.m_occupancy_start_time = 0;
                buffer = this.GetDefaultImage();
            }
        }
        else {
            //this.LogDebug(this.m_name + ": requesting default_image ");
            buffer = this.GetDefaultImage();
        }
        if (buffer == null) buffer = this.GetDefaultImage();
        return buffer;
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
    Startup(): void {
    }

    //------------------------------------------------------------
    //
    // Function:    Shutdown
    // Author:      Pete Humphrey
    // Description: Clean up after stopping
    //
    //------------------------------------------------------------
    /** Cleanup after stopping */
    Shutdown(): void {
    }



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
        return null;
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
        return null;
    }

    //############################################################
    //
    // UTILITY FUNCTIONS
    //
    //############################################################


    private string_contains(str: string, part: string): boolean {
        return str.indexOf(part) >= 0;
    }

    private list_contains(str: string, parts: string[]): boolean {
        return parts.reduce((answer, val, ix, arr) => (answer || this.string_contains(str, val)), false);
    }

    private is_mjpeg_config_url(url: string): boolean {
        return this.list_contains(url, this.m_mjpeg_config_urls);
    }

    private is_mjpeg_request_url(url: string): boolean {
        return this.list_contains(url, this.m_mjpeg_request_urls);
    }

    private is_onshot_request_url(url: string): boolean {
        return this.list_contains(url, this.m_oneshot_request_urls);
    }
}
