"use client";

import { Minus, Square, X, SwatchBook, PenTool } from "lucide-react";
import { useEffect, useState } from "react";


export default function Titlebar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onWindowMaximized(() => setIsMaximized(true));
        window.electronAPI.onWindowUnmaximized(() => setIsMaximized(false));
    }, []);

    return (
        <div
            className="h-10 w-full flex items-center justify-between px-3 bg-gray-100 border-b border-gray-300 select-none"
            style={{ WebkitAppRegion: "drag" }}
        >
            {/* Left: Logo + Name */}
            <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" }}>
                {/*   <div className="p-1.5 bg-gray-900 rounded-lg shadow-sm">
                    <PenTool className="w-4 h-4 text-white" />
                </div> */}
                <img src="./logo.svg" width="25" />
                {/*       <span className="text-sm text-gray-300">OneNote</span> */}
            </div>

            {/* Right: Window Controls */}
            <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" }}>
                <button
                    onClick={() => window.electronAPI.minimize()}
                    className="p-2 hover:bg-gray-700 rounded"
                >
                    <Minus size={14} className="text-gray-400" />
                </button>

                <button
                    onClick={() => window.electronAPI.maximize()}
                    className="p-2 hover:bg-gray-700 rounded"
                >
                    <Square size={12} className="text-gray-400" />
                </button>

                <button
                    onClick={() => window.electronAPI.close()}
                    className="p-2 hover:bg-red-600 rounded hover:text-white"
                >
                    <X size={14} className="text-gray-400" />
                </button>
            </div>
        </div>
    );
}
