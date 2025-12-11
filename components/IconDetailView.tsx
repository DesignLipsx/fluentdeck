import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { ResetIcon, CheckmarkIcon, HtmlIcon, SvgIcon, ReactIcon, VueIcon, EyedropperIcon } from "./Icons";
import { ThemeContext } from "../App";
import { IconStyleType, IconType } from "../types";
import { Tabs } from "./SegmentedControl";
import { getIconUrl, sanitizeSvg } from "../utils";
import { CollectionMenu } from './CollectionMenu';
import { DetailViewPanel } from './DetailViewPanel';
import { ActionRow } from './ActionRow';

// --- LAYOUT CONFIGURATION ---
const SECTION_WIDTHS = {
	preview: "340px",
	colorCustomization: "340px"
};
// ----------------------------

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

const GRADIENT_ID = "customGradientDetail";
const GRADIENT_REGEX = /^grad-([0-9a-fA-F]{6})-([0-9a-fA-F]{6})$/;

type Format = "svg" | "html" | "react" | "vue";

export const IconDetailView: React.FC<{
	icon: IconType;
	selectedStyle: IconStyleType;
	onClose: () => void;
	onStyleChange: (style: IconStyleType) => void;
	showCollectionControls?: boolean;
}> = ({ icon, selectedStyle, onClose, onStyleChange, showCollectionControls = true }) => {
	const [svgContent, setSvgContent] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [copiedFormat, setCopiedFormat] = useState<Format | null>(null);
	const [color, setColor] = useState("currentColor");
	const [customColor, setCustomColor] = useState("#FFFFFF");
	const [colorPaletteMode, setColorPaletteMode] = useState<'solid' | 'gradient'>('solid');

	const colorPickerRef = useRef<HTMLInputElement>(null);
	const themeContext = useContext(ThemeContext);

	if (!themeContext) throw new Error("Context missing");

	const { theme } = themeContext;

	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setIsDark(theme === "dark" || (theme === "system" && mq.matches));
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, [theme]);

	const iconFilenameBase = useMemo(() => {
		return (
			(selectedStyle === "Color" ? icon.filename : icon.svgFileName?.replace(".svg", "")) ||
			icon.name.replace(/\s+/g, "_")
		);
	}, [icon, selectedStyle]);

	useEffect(() => {
		setIsLoading(true);
		const url = getIconUrl(icon, selectedStyle);

		fetch(url)
			.then((res) => (res.ok ? res.text() : Promise.reject(res.statusText)))
			.then((text) => setSvgContent(text.startsWith("<svg") ? sanitizeSvg(text) : null))
			.catch(() => setSvgContent(null))
			.finally(() => setIsLoading(false));
	}, [icon, selectedStyle]);

	const getGradientDefinition = (startColor: string, endColor: string, id: string): string => {
		return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${startColor}"/><stop offset="100%" stop-color="${endColor}"/></linearGradient>`;
	};

	const applyColor = (svg: string | null, c: string): string => {
		if (!svg) return "";

		// Skip color modification for 'Color' style icons
		if (selectedStyle === 'Color') return svg;

		let processedSvg = svg;
		const gradientMatch = c.match(GRADIENT_REGEX);

		processedSvg = processedSvg.replace(/<defs>.*?<\/defs>/gs, "");

		if (gradientMatch) {
			const startColor = `#${gradientMatch[1]}`;
			const endColor = `#${gradientMatch[2]}`;

			const gradientDef = getGradientDefinition(startColor, endColor, GRADIENT_ID);
			processedSvg = processedSvg.replace(/<svg(.*?)>/, `<svg$1><defs>${gradientDef}</defs>`);

			const gradientUrl = `url(#${GRADIENT_ID})`;
			return processedSvg
				.replace(/fill="currentColor"/g, `fill="${gradientUrl}"`)
				.replace(/fill="#[0-9a-fA-F]+"/g, `fill="${gradientUrl}"`)
				.replace(/fill='#[0-9a-fA-F]+'/g, `fill='${gradientUrl}'`);
		} else {
			const final = c === "currentColor" ? (isDark ? "#fff" : "#000") : c;

			return processedSvg
				.replace(/fill="currentColor"/g, `fill="${final}"`)
				.replace(/fill="#[0-9a-fA-F]+"/g, `fill="${final}"`)
				.replace(/fill='#[0-9a-fA-F]+'/g, `fill='${final}'`);
		}
	};

	const getExportContent = (format: Format): string | null => {
		if (!svgContent) return null;
		const txt = applyColor(svgContent, color);
		switch (format) {
			case "svg":
				return txt;
			case "html":
				return `<img src="data:image/svg+xml;base64,${btoa(txt)}" alt="${iconFilenameBase}" />`;
			case "react":
				return `export function ${iconFilenameBase}Icon(props) { return (${txt.replace(/<svg (.*?)>/, `<svg $1 {...props}>`)}) }`;
			case "vue":
				return `<template>${txt}</template>`;
			default:
				return null;
		}
	};

	const handleCopy = async (format: Format) => {
		const content = getExportContent(format);
		if (!content) return;
		await navigator.clipboard.writeText(content);
		setCopiedFormat(format);
		setTimeout(() => setCopiedFormat(null), 2000);
	};

	const handleDownload = (format: Format) => {
		const content = getExportContent(format);
		if (!content) return;
		const extension = format === 'react' ? 'jsx' : format === 'vue' ? 'vue' : 'svg';
		const blob = new Blob([content], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.download = `${iconFilenameBase}.${extension}`; a.href = url; a.click(); URL.revokeObjectURL(url);
	};

	const isLight = (hex: string) => {
		const r = parseInt(hex.slice(1, 3), 16),
			g = parseInt(hex.slice(3, 5), 16),
			b = parseInt(hex.slice(5, 7), 16);
		return r * 0.299 + g * 0.587 + b * 0.114 > 186;
	};

	const setGradientColor = (start: string, end: string) => {
		const formattedColor = `grad-${start.substring(1)}-${end.substring(1)}`;
		setColor(formattedColor);
	};

	const isGradientSelected = !!color.match(GRADIENT_REGEX);

	const availableStyles = useMemo(() => Object.keys(icon.styles).map(s => ({ value: s, label: s })), [icon.styles]);
	const handleStyleChange = (v: string) => onStyleChange(v as IconStyleType);

	return (
		<DetailViewPanel
			title={icon.name}
			onClose={onClose}
			headerActions={
				showCollectionControls && (
					<CollectionMenu item={icon} selectedStyle={selectedStyle} itemType="icon" onCloseDetail={onClose} />
				)
			}
		>
			<div
				className="flex flex-col lg:flex-row gap-6 lg:gap-8"
				style={{
					"--preview-w": SECTION_WIDTHS.preview,
					"--color-w": SECTION_WIDTHS.colorCustomization
				} as React.CSSProperties}
			>
				{/* 1. Preview Section */}
				<div className="w-full lg:w-[var(--preview-w)] flex-shrink-0 space-y-4">
					<div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-bg-primary border border-gray-200 dark:border-border-primary h-64 lg:h-80 xl:h-80 relative flex-shrink-0 max-w-full">
						<div className="absolute inset-0 opacity-5 dark:opacity-100" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.02 }}></div>
						<div className="w-3/4 h-3/4 relative z-10 flex items-center justify-center text-gray-800 dark:text-text-primary object-contain">
							{isLoading ? (
								<div className="w-8 h-8 border-2 border-gray-200 dark:border-border-primary border-t-blue-500 dark:border-t-accent rounded-full animate-spin" />
							) : (
								svgContent && (
									<div
										className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
										dangerouslySetInnerHTML={{ __html: sanitizeSvg(applyColor(svgContent, color)) }}
									/>
								)
							)}
						</div>
					</div>
					{availableStyles.length > 1 && (
						<Tabs options={availableStyles} value={selectedStyle} onChange={handleStyleChange} />
					)}
				</div>

				{/* 2. Color Customization */}
				{selectedStyle !== "Color" && (
					<div className="w-full lg:w-[var(--color-w)] flex-shrink-0 space-y-4 h-[23.25rem]">
						<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">Customize Color</h3>
						<div className="p-3 rounded-lg border border-gray-90 dark:border-border-primary bg-gray-50 dark:bg-bg-primary h-[calc(100%-2rem)]">
							<div className="mb-5">
								<Tabs
									options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }]}
									value={colorPaletteMode}
									onChange={(v) => { const mode = v as 'solid' | 'gradient'; if (mode === 'solid' && isGradientSelected) setColor('currentColor'); setColorPaletteMode(mode); }}
								/>
							</div>
							{colorPaletteMode === 'solid' ? (
								<div className="grid grid-cols-4 gap-x-8 gap-y-7 justify-items-stretch">
									{presetColors.map((c) => (
										<button key={c} onClick={() => setColor(c)} className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105 " style={{ backgroundColor: c }}>
											{color === c && !isGradientSelected && <CheckmarkIcon className={`w-4 h-4 ${isLight(c) ? "text-black" : "text-white"}`} />}
										</button>
									))}
									<button onClick={() => colorPickerRef.current?.click()} className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105 relative" style={{ backgroundColor: color !== 'currentColor' && !isGradientSelected && !presetColors.includes(color) ? customColor : 'transparent' }}>
										{color === 'currentColor' || isGradientSelected || presetColors.includes(color) ? <EyedropperIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" /> : <CheckmarkIcon className={`w-4 h-4 ${isLight(customColor) ? "text-black" : "text-white"}`} />}
										<input ref={colorPickerRef} type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
									</button>
									<button onClick={() => setColor("currentColor")} className={`w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105 ${color === "currentColor" && !isGradientSelected ? "bg-gray-200 dark:bg-bg-active" : ""}`}>
										<ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
									</button>
								</div>
							) : (
								<div className="grid grid-cols-4 gap-x-8 gap-y-7 justify-items-stretch">
									{gradientPalettes.map((grad) => {
										const gradStr = `grad-${grad.start.substring(1)}-${grad.end.substring(1)}`;
										return (
											<button key={gradStr} onClick={() => setGradientColor(grad.start, grad.end)} className={`w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105`} style={{ backgroundImage: `linear-gradient(45deg, ${grad.start}, ${grad.end})` }}>
												{color === gradStr && <CheckmarkIcon className={`w-4 h-4 text-white drop-shadow-sm`} />}
											</button>
										);
									})}
									<button onClick={() => setColor("currentColor")} className={`w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105 ${color === "currentColor" ? "bg-gray-200 dark:bg-bg-active" : ""}`}>
										<ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 3. Export Options */}
				<div className="flex-1 min-w-0 flex flex-col space-y-4">
					<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">Export Options</h3>
					<div className="flex-1 flex flex-col justify-between space-y-3">
						<ActionRow title="SVG Code" description="Raw SVG markup" onCopy={() => handleCopy('svg')} onDownload={() => handleDownload('svg')} isCopied={copiedFormat === 'svg'} icon={<SvgIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="HTML" description="Copy as <img> tag" onCopy={() => handleCopy('html')} onDownload={() => handleDownload('html')} isDownloadDisabled={true} isCopied={copiedFormat === 'html'} icon={<HtmlIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="React Component" description="Copy as React JSX component" onCopy={() => handleCopy('react')} onDownload={() => handleDownload('react')} isCopied={copiedFormat === 'react'} icon={<ReactIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="Vue Component" description="Copy as Vue template" onCopy={() => handleCopy('vue')} onDownload={() => handleDownload('vue')} isCopied={copiedFormat === 'vue'} icon={<VueIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
					</div>
				</div>
			</div>
		</DetailViewPanel>
	);
};