import React, { useState, useRef } from 'react';
import { CheckmarkIcon, EyedropperIcon, ResetIcon } from './Icons';
import { Tabs } from './SegmentedControl';

const presetColors = [
	"#000000", "#333333", "#666666", "#999999", "#CCCCCC",
	"#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4",
	"#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E"
];

const gradientPalettes = [
	{ start: "#FF5F6D", end: "#FFC371" },
	{ start: "#36D1DC", end: "#5B86E5" },
	{ start: "#43E97B", end: "#38F9D7" },
	{ start: "#F857A6", end: "#FF5858" },
	{ start: "#A8EDEA", end: "#FED6E3" },
	{ start: "#9C6CFE", end: "#7A41DC" },
	{ start: "#FFA17F", end: "#00223E" },
	{ start: "#4ECDC4", end: "#556270" },
	{ start: "#ff7c10", end: "#be8329" },
	{ start: "#909b2a", end: "#bcf289" },
	{ start: "#5AD86A", end: "#1F7F84" },
	{ start: "#FF70A2", end: "#6B3FB8" },
	{ start: "#2BD3E8", end: "#0177D8" },
	{ start: "#0CA4F0", end: "#C015C8" },
	{ start: "#5A667F", end: "#313d55" }
];

const GRADIENT_REGEX = /^grad-([0-9a-fA-F]{6})-([0-9a-fA-F]{6})$/;

interface ColorCustomizationPanelProps {
    color: string;
    onColorChange: (color: string) => void;
    isDark: boolean;
}

export const ColorCustomizationPanel: React.FC<ColorCustomizationPanelProps> = ({ color, onColorChange, isDark }) => {
    const [colorPaletteMode, setColorPaletteMode] = useState<'solid' | 'gradient'>('solid');
    const [customColor, setCustomColor] = useState("#FFFFFF");
    const colorPickerRef = useRef<HTMLInputElement>(null);

    return (
        <>
            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide mb-4">
                Customize Color
            </h3>

            {/* Color Palette */}
            <div className="p-3 rounded-lg border border-gray-90 dark:border-border-primary bg-gray-50 dark:bg-bg-primary h-[calc(100%-2rem)]">
                {colorPaletteMode === 'solid' ? (
                    <div className="h-full flex flex-col justify-center">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-10 justify-items-center justify-center">
                            {presetColors.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => onColorChange(c)}
                                    className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
                                    style={{ backgroundColor: c }}
                                >
                                    {color === c && (
                                        <CheckmarkIcon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => colorPickerRef.current?.click()}
                                className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105 relative"
                                style={{ backgroundColor: customColor }}
                            >
                                <EyedropperIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
                                <input
                                    ref={colorPickerRef}
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => {
                                        setCustomColor(e.target.value);
                                        onColorChange(e.target.value);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </button>
                            <button
                                onClick={() => onColorChange("currentColor")}
                                className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
                            >
                                <ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-10 justify-items-center justify-center">
                            {gradientPalettes.map((g) => {
                                const gradStr = `grad-${g.start.substring(1)}-${g.end.substring(1)}`;
                                return (
                                    <button
                                        key={gradStr}
                                        onClick={() => onColorChange(gradStr)}
                                        className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
                                        style={{ backgroundImage: `linear-gradient(45deg, ${g.start}, ${g.end})` }}
                                    >
                                        {color === gradStr && (
                                            <CheckmarkIcon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
                                        )}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => onColorChange("currentColor")}
                                className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
                            >
                                <ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* SOLID / GRADIENT TABS */}
            <div className="mt-4">
                <Tabs
                    options={[
                        { value: 'solid', label: 'Solid' },
                        { value: 'gradient', label: 'Gradient' }
                    ]}
                    value={colorPaletteMode}
                    onChange={(mode) => {
                        const m = mode as 'solid' | 'gradient';
                        if (m === 'solid' && color.match(GRADIENT_REGEX)) {
                            onColorChange("currentColor");
                        }
                        setColorPaletteMode(m);
                    }}
                />
            </div>
        </>
    );
};
