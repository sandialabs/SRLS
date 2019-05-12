import $ from "jquery";

//------------------------------------------------------------
//
// Function:    clone_object
// Author:      Pete Humphrey
// Description: Make a copy of a javascript object
//
// @param obj (any)       the object to clone
// @param deep (boolean)  true to perform a deep copy
// return:                a copy of the object
//
//------------------------------------------------------------
/** Make a copy of the scaler settings in my m_settings */
export function clone_object(obj: any, deep: boolean): any {
    if (deep) return $.extend(true, {}, obj);
    else return $.extend({}, obj);
}

export function banner(lines: string[]): void {
    let sep =
        "########################################################################";
    console.log(" ");
    console.log(sep);
    console.log("#");
    for (let line of lines) {
        console.log("# " + line);
    }
    console.log("#");
    console.log(sep);
    console.log(" ");
}
