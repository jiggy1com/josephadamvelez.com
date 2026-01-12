import {fontPoiretOne} from "@/utils/fonts";
import React from "react";

export function H1({children}: { children: React.ReactNode }) {
    return (
        <h1 className={fontPoiretOne.className}>
            {children}
        </h1>
    )
}