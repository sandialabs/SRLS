import * as moment from 'moment';

/**********************************************************************************
 * GENERATE IMAGES
 * 
 * This class will create a byte array containing either an animation of a truck 
 * passing, or a blank image containing a timestamp with the current time. The 
 * duration of the occupancy, the canvas dimensions and the container number are set 
 * externally. The functions in this class work best with resolutions that have an 
 * aspect ratio of 4:3. 
 **********************************************************************************/
export class TruckGenerator {
    private readonly ctx: CanvasRenderingContext2D
    private c: HTMLCanvasElement;
    private m_bg_color = 255;  // used to generate background, e.g. 255,255,255

    constructor(private readonly canvas: HTMLCanvasElement){
        this.ctx = this.canvas.getContext('2d');
        this.c = canvas;
    }

    /*******************************************************************************
     * GENERATE TRUCK ANIMATION
     * 
     * This function will generate an animation of a truck passing. This function 
     * works best with resolutions that have an aspect ratio of 4:3.
     * 
     * INPUTS
     * -----------------------------------------------------------------------------
     * duration: number         Duration of occupancy in seconds
     * container: string        Container number of truck 
     * canvasWidth: number      Width of video in pixels
     * canvasHeight: number     Height of video in pixels
     * 
     * OUTPUT
     * -----------------------------------------------------------------------------
     * img: Uint8Array[]        Byte array containing data of truck animation
     * 
     *******************************************************************************/
    public drawPicture(duration: number, container: string, canvasWidth: number, canvasHeight: number) : Uint8Array[] {
        this.c.width = canvasWidth;                    //Canvas width 
        this.c.height = canvasHeight;                  //Canvas height
        var num;                                       //Text size in pixels
        var fillertext;                                //Placeholder for text size string
        var x_start = -1 * (0.806923 * this.c.width);  //Beginning position of truck
        var x_end = 0.9675 * this.c.width;             //Ending position of truck
        var positionDiff = x_end - x_start;            //Beginning and ending position difference of truck
        var duration_ms = duration * 1000;             //Duration of occupancy in ms
        var instances = duration_ms / 200;             //Amount of elements within image array
        var incrementor = positionDiff / instances;    //Amount to increment truck position
        var dataURL;                                   //Variable containing data URL
        var img = new Array();                         //Image array returned from function
        var time = moment();                           //Time recorded of truck passing through
        var x = x_start;                               //Truck position on canvas

        for (var i = 0; i <= instances; i++) {
            //Set background color to white
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.c.width, this.c.height);
            //Code for drawing container
            this.ctx.rect((0.05 * this.c.width) + x, 0.1155 * this.c.height, (0.53 * this.c.width), 0.5256 * this.c.height);
            this.ctx.rect((0.58 * this.c.width) + x, 0.3064 * this.c.height, (0.28 * this.c.width), 0.3346 * this.c.height);
            this.ctx.stroke();
            //Code for drawing container wheels
            this.ctx.beginPath();
            this.ctx.arc((0.7251 * this.c.width) + x, (0.7336 * this.c.height), (0.08547 * this.c.height), 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc((0.18846 * this.c.width) + x, (0.7336 * this.c.height), (0.08547 * this.c.height), 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.beginPath();

            //Code to display container number
            this.ctx.fillStyle = '#000000'; //Set text color to black
            num = 0.14423 * this.c.width;
            fillertext = num.toString();
            this.ctx.font = fillertext + "px Arial";
            this.ctx.fillText(container, (0.08241 * this.c.width) + x, (0.26915 * this.c.height), 0.46058 * this.c.width);
            //Code for timestamp. This does not move
            num = 0.045 * this.c.width;
            fillertext = num.toString();
            this.ctx.font = fillertext + "px Arial";
            this.ctx.fillText(moment(time).format('hh:mm:ss:SSSS'), (0.69481 * this.c.width), (0.98291 * this.c.height));
            //Acquire data URL of canvas image
            dataURL = this.c.toDataURL('image/jpeg', 1.0);
            dataURL = dataURL.replace('data:image/jpeg;base64,', '');
            //Load image array with data URI
            img[i] = dataURL;
            //Convert data URI to byte array
            img[i] = this._base64ToByteArray(img[i]);
            //Advance truck position
            x += incrementor;
            //Increment timestamp
            time = moment(time).add(200, 'ms');
            //Clear canvas
            this.ctx.clearRect(0, 0, 300, 300);
        }
        return img;
    }

    /******************************************************************************
     * GENERATE DEFAULT IMAGE 
     * 
     * This function will generate a blank image with a timestamp showing the 
     * current time. This function can be called to an image when there is no 
     * occupancy within the portal. 
     * 
     * INPUTS
     * ----------------------------------------------------------------------------- 
     * canvasWidth: number      Width of image in pixels
     * canvasHeight: number     Height of image in pixels
     * 
     * OUTPUT
     * -----------------------------------------------------------------------------
     * img: Uint8Array          Byte array containing data of image
     * 
     *******************************************************************************/
    public drawDefault(canvasWidth: number, canvasHeight: number) : Uint8Array {
        this.c.width = canvasWidth;                    //Canvas width 
        this.c.height = canvasHeight;                  //Canvas height
        var num;                                       //Text size in pixels
        var fillertext;                                //Placeholder for text size string
        var dataURL;                                   //Variable containing data URL
        var img: any;                                  //Image array returned from function
        var time = moment();                           //Time recorded of truck passing through

        //console.log("In TruckGenerator.drawDefault: width = " + canvasWidth + ", height = " + canvasHeight);
        //Set background color of canvas to a varying shade of gray
        let rgb0 = this.to_hex(this.m_bg_color);
        let fill_color = '#' + rgb0 + rgb0 + rgb0;
        //console.log("Fill color: " + fill_color);
        this.ctx.fillStyle = fill_color;
        this.ctx.fillRect(0, 0, this.c.width, this.c.height);
        this.m_bg_color = this.m_bg_color - 4;
        if (this.m_bg_color < 128) this.m_bg_color = 255;

        //Code for timestamp
        num = 0.045 * this.c.width;
        fillertext = num.toString();
        this.ctx.font = fillertext + "px Arial";
        let timestr = moment(time).format('hh:mm:ss:SSSS');
        //console.log("Time: " + timestr);
        let x = 0.69481 * this.c.width;
        let y = 0.98291 * this.c.height;
        //console.log("Displaying text at " + x + ", " + y);
        this.ctx.fillStyle = '#000000'; //Set text color to black
        this.ctx.fillText(timestr, x, y);
        //this.ctx.fillText(timestr, 0,0);
        //Acquire data URL of canvas image
        dataURL = this.c.toDataURL('image/jpeg', 1.0);
        dataURL = dataURL.replace('data:image/jpeg;base64,', '');
        //Load image array with data URI
        img = dataURL;
        //Convert data URI to byte array
        img = this._base64ToByteArray(img);
        //Clear canvas
        this.ctx.clearRect(0, 0, 300, 300);
        
        return img;
    }

    /**********************************************************************************
     * CONVERT BASE64 DATA URI TO BYTE ARRAY
     * 
     * This function will convert a base64 data URI to a byte array.
     **********************************************************************************/
    public _base64ToByteArray(base64: any) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    private to_hex(value: number) : string {
        let result = value.toString(16)
        if (result.length == 1) return('0' + result);
        else return result;
    }
}