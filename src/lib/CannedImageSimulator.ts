//const http = require('http')
import * as fs from "fs";
import * as http from "http";
import { CameraSettings } from "./settings";
import { CameraSimulator } from "./CameraSimulator";
//import { TruckGenerator } from '../RPMLib/TruckGenerator';
import { runInThisContext } from "vm";

function dataURItoBlob(dataURI: any) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    //write the ArrayBuffer to a blob, and you're done
    var blob = Buffer.from(ab);
    return blob;
}

function data_url_to_buffer(dataurl: any) {
    var regex = /^data:.+\/(.+);base64,(.*)$/;

    var m = dataurl.match(regex);
    if (m) {
        var ext = m[1];
        var data = m[2];
        var buffer = new Buffer(data, "base64");
        console.log("data_url_to_buffer:", buffer);
        return buffer;
    } else return null;
}

export class CannedImageSimulator extends CameraSimulator {
    m_imagedir: string;
    m_container_files: string[];
    m_empty: string;
    m_empty_image: Buffer = null;
    m_occupancy_images: HTMLImageElement[];
    m_occupancy_cursor: number = 0;
    m_image_duration_ms: number; // how long to display each occupancy image

    constructor(settings: CameraSettings, name: string, imagedir: string) {
        super(settings, name);
        this.LogAs("CannedImageSimulator");
        this.LogInfo("Creating CannedImageSimulator for " + name);
        this.LogInfo("Image directory is " + imagedir);
        this.m_imagedir = imagedir;
        this.m_container_files = [];
    }

    //############################################################
    //
    // METHOD OVERRIDES
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
        this.read_image_filenames();
    }

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
        //this.LogDebug("In CannedImageSimulator.GetDefaultImage");
        return this.m_empty_image;
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
        let available_image_count = this.m_container_files.length;
        this.m_image_duration_ms = duration_ms / available_image_count;
        //this.LogDebug("    Image duration: " + this.m_image_duration_ms);
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
        //this.LogDebug("CannedImageSimulator.GetOccupancyImage");
        let filecount = this.m_container_files.length;
        if (filecount == 0) {
            this.LogError(
                "    CannedImageSimulator.GetOccupancyImage: ERROR - no container images"
            );
            return this.m_empty_image;
        } else {
            let imagenum = Math.round(offset_ms / this.m_image_duration_ms);
            if (imagenum >= filecount) imagenum = filecount - 1;
            let filename = this.m_container_files[imagenum];
            //this.LogDebug("    CannedImageSimulator.GetOccupancyImage: returning image " + imagenum + ": " + filename);
            return this.read_image_file(filename);
        }
    }

    public GetNextImage(): Buffer {
        return super.GetNextImage();
    }

    //############################################################
    //
    // UTILITY FUNCTIONS
    //
    //############################################################

    private read_image_filenames(): void {
        this.LogDebug("        In read_image_files");
        if (!fs.existsSync(this.m_imagedir)) {
            this.LogError("Error: " + this.m_imagedir + " does not exist");
            return;
        }
        if (this.m_container_files.length == 0) {
            this.m_container_files = [];
            this.LogDebug("        " + this.m_name + ": reading " + this.m_imagedir);
            try {
                this.LogDebug("    Reading " + this.m_imagedir);
                fs.readdir(this.m_imagedir, (err, items) => {
                    this.LogDebug(this.m_name + ": Image files read: " + items.length);
                    if (err) {
                        this.LogError("    Error reading camera images: " + err);
                    } else {
                        for (var i = 0; i < items.length; i++) {
                            let f = items[i];
                            if (f.endsWith(".jpg")) {
                                if (f.indexOf("empty") >= 0) this.m_empty = f;
                                else this.m_container_files.push(f);
                            }
                        }
                        if (this.m_empty) {
                            this.m_empty_image = this.read_image_file(this.m_empty);
                        } else
                            this.LogError(
                                "    CannedImageSimulator: ERROR no empty image was found"
                            );
                        this.LogDebug(
                            "    CannedImageSimulator - read " +
                                this.m_container_files.length +
                                " images from " +
                                this.m_imagedir
                        );
                    }
                });
            } catch (err) {
                this.LogError(err.message);
            }
        }
    }

    read_image_file(name: string): Buffer {
        let result = fs.readFileSync(this.m_imagedir + "/" + name);
        return result;
    }

    /* CODE TO USE GENERATED IMAGES 
    foo(request, response) {
        this.LogDebug("CameraSimulator: have request:", request);
        this.LogDebug("Simulator instance:", this);
        if (this.m_occupancy_images && this.m_occupancy_cursor < this.m_occupancy_images.length) {
            let img = this.m_occupancy_images[this.m_occupancy_cursor];
            this.LogDebug("CameraSimulator cursor is " + this.m_occupancy_cursor + " of " + this.m_occupancy_images.length);
            this.LogDebug("CameraSimulator image ", img);
            this.m_occupancy_cursor = (this.m_occupancy_cursor + 1) % this.m_occupancy_images.length;
            if (this.m_occupancy_cursor == 111111) {
                response.writeHead(200, { 'Content-Type': 'image/png' });
                response.end(img.src.replace(/^data:image\/(png|jpg);base64,/, ""));
                response.end(img, 'binary');
            }
            if (this.m_occupancy_cursor == 222222) {
                this.LogDebug("Generating with fetch")
                fetch(img.src).then(res => res.blob()).then(blob => response.end(blob));
            }
            if (this.m_occupancy_cursor == 333333) {
                let blob = dataURItoBlob(img.src);
                this.LogDebug("Image data:", blob);
                response.writeHead(200, {'Content-Type': 'image/png' });
                response.write(blob, 'binary');
                response.end();
            }
            if (this.m_occupancy_cursor == 555555) {
                var imagedata = fs.readFileSync('./Assets/check.png');
                this.LogDebug("Image data: ", imagedata);
                response.writeHead(200, {'Content-Type': 'image/png' });
                response.end(imagedata, 'binary');
            }
            if (this.m_occupancy_cursor < 555555) {
                var buf = data_url_to_buffer(img.src);
                this.LogDebug("Buffer: ", buf);
                response.writeHead(200, {'Content-Type': 'image/png',  'Content-Length': buf.length });
                response.end(buf, 'binary');
            }
        }
}


    foo_generate_occupancy_images(duration: number, container_number: string) {
        let canvas = document.getElementById('render-canvas');
        this.LogDebug("Render canvas: ", canvas);
        let generator = new TruckGenerator(canvas as HTMLCanvasElement);
        this.m_occupancy_images = generator.drawPicture(10, container_number);
        this.m_occupancy_cursor = 0;
    }

    */
}
