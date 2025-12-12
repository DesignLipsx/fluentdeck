import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { 
	ResetIcon, CheckmarkIcon, HtmlIcon, SvgIcon, ReactIcon, 
	VueIcon, EyedropperIcon, ShareIcon 
} from "./Icons";
import { ThemeContext } from "../App";
import { IconStyleType, IconType } from "../types";
import { Tabs } from "./SegmentedControl";
import { getIconUrl, sanitizeSvg } from "../utils";
import { CollectionMenu } from './CollectionMenu';
import { DetailViewPanel } from './DetailViewPanel';
import { ActionRow } from './ActionRow';
import { useToast } from "../contexts/ToastContext";

// --- LAYOUT CONFIGURATION ---
const SECTION_WIDTHS = {
	preview: "340px",
	colorCustomization: "340px"
};

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

	// ------------------------------------------------
	//     SHARE URL (ID LOOKUP) — SAME AS EMOJI VIEW
	// ------------------------------------------------
	const [iconIdMap, setIconIdMap] = useState<{ name: string; id: string }[]>([]);
	const { addToast } = useToast();

	useEffect(() => {
		fetch("/hooks/icon_url.json")
			.then(res => res.json())
			.then(data => setIconIdMap(data))
			.catch(() => console.error("Failed to load icon_url.json"));
	}, []);

	const getIconId = (name: string): string | null => {
		const entry = iconIdMap.find(e => e.name === name);
		return entry?.id ?? null;
	};

	const handleShareUrl = () => {
		const id = getIconId(icon.name);

		if (!id) {
			addToast("No sharable ID found for this icon.", "error");
			return;
		}

		const shareUrl = `${window.location.origin}/icons/${id}?style=${encodeURIComponent(selectedStyle)}`;
		navigator.clipboard.writeText(shareUrl);

		addToast("Icon link copied!", "success");
	};

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
			(selectedStyle === "Color"
				? icon.filename
				: icon.svgFileName?.replace(".svg", "")) ||
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
		return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="${startColor}"/>
					<stop offset="100%" stop-color="${endColor}"/>
				</linearGradient>`;
	};

	const applyColor = (svg: string | null, c: string): string => {
		if (!svg) return "";
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
			case "svg": return txt;
			case "html": return `<img src="data:image/svg+xml;base64,${btoa(txt)}" alt="${iconFilenameBase}" />`;
			case "react": return `export function ${iconFilenameBase}Icon(props) { return (${txt.replace(/<svg (.*?)>/, `<svg $1 {...props}>`)}) }`;
			case "vue": return `<template>${txt}</template>`;
			default: return null;
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
		const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");

		a.download = `${iconFilenameBase}.${extension}`;
		a.href = url;
		a.click();

		URL.revokeObjectURL(url);
	};

	// --------------------------------
	//           RENDER
	// --------------------------------
	return (
		<DetailViewPanel
			title={icon.name}
			onClose={onClose}
			headerActions={
				<div className="flex items-center gap-2">

					{/* SHARE BUTTON */}
					<button
						onClick={handleShareUrl}
						className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-active transition"
						title="Copy share URL"
					>
						<ShareIcon className="w-5 h-5" />
					</button>

					{showCollectionControls && (
						<CollectionMenu
							item={icon}
							selectedStyle={selectedStyle}
							itemType="icon"
							onCloseDetail={onClose}
						/>
					)}
				</div>
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
					<div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-bg-primary border border-gray-200 dark:border-border-primary h-64 lg:h-80 relative flex-shrink-0 max-w-full">
						<div className="absolute inset-0 opacity-5 dark:opacity-100"
							style={{
								backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
								backgroundSize: "10px 10px",
								opacity: 0.02
							}}
						/>
						<div className="w-3/4 h-3/4 relative z-10 flex items-center justify-center text-gray-800 dark:text-text-primary object-contain">
							{isLoading ? (
								<div className="w-8 h-8 border-2 border-gray-200 dark:border-border-primary border-t-blue-500 dark:border-t-accent rounded-full animate-spin" />
							) : (
								svgContent && (
									<div
										className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
										dangerouslySetInnerHTML={{
											__html: sanitizeSvg(applyColor(svgContent, color))
										}}
									/>
								)
							)}
						</div>
					</div>

					{Object.keys(icon.styles).length > 1 && (
						<Tabs
							options={Object.keys(icon.styles).map(s => ({ value: s, label: s }))}
							value={selectedStyle}
							onChange={(v) => onStyleChange(v as IconStyleType)}
						/>
					)}
				</div>

				{/* 2. Color Customization */}
				{selectedStyle !== "Color" && (
					<div className="w-full lg:w-[var(--color-w)] flex-shrink-0 space-y-4 h-[23.25rem]">
						<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">
							Customize Color
						</h3>

						<div className="p-3 rounded-lg border border-gray-90 dark:border-border-primary bg-gray-50 dark:bg-bg-primary h-[calc(100%-2rem)]">

							{/* SOLID / GRADIENT TABS */}
							<div className="mb-5">
								<Tabs
									options={[
										{ value: 'solid', label: 'Solid' },
										{ value: 'gradient', label: 'Gradient' }
									]}
									value={colorPaletteMode}
									onChange={(mode) => {
										const m = mode as 'solid' | 'gradient';
										if (m === 'solid' && color.match(GRADIENT_REGEX)) {
											setColor("currentColor");
										}
										setColorPaletteMode(m);
									}}
								/>
							</div>

							{/* SOLID COLORS */}
							{colorPaletteMode === 'solid' ? (
								<div className="grid grid-cols-4 gap-x-8 gap-y-7 justify-items-stretch">
									{presetColors.map((c) => (
										<button
											key={c}
											onClick={() => setColor(c)}
											className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
											style={{ backgroundColor: c }}
										>
											{color === c && (
												<CheckmarkIcon
													className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`}
												/>
											)}
										</button>
									))}

									{/* CUSTOM COLOR PICKER */}
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
												setColor(e.target.value);
											}}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										/>
									</button>

									{/* RESET */}
									<button
										onClick={() => setColor("currentColor")}
										className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary flex items-center justify-center hover:scale-105"
									>
										<ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
									</button>
								</div>

							) : (
								/* GRADIENT COLORS */
								<div className="grid grid-cols-4 gap-x-8 gap-y-7 justify-items-stretch">
									{gradientPalettes.map((g) => {
										const gradStr = `grad-${g.start.substring(1)}-${g.end.substring(1)}`;
										return (
											<button
												key={gradStr}
												onClick={() => setColor(gradStr)}
												className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary hover:scale-105"
												style={{ backgroundImage: `linear-gradient(45deg, ${g.start}, ${g.end})` }}
											>
												{color === gradStr && (
													<CheckmarkIcon className="w-4 h-4 text-white" />
												)}
											</button>
										);
									})}

									{/* RESET */}
									<button
										onClick={() => setColor("currentColor")}
										className="w-full aspect-square max-w-[2.5rem] mx-auto rounded-full border border-gray-300 dark:border-border-primary hover:scale-105"
									>
										<ResetIcon className="w-4 h-4 text-gray-500 dark:text-text-secondary" />
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 3. EXPORT OPTIONS */}
				<div className="flex-1 min-w-0 flex flex-col space-y-4">
					<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">
						Export Options
					</h3>

					<div className="flex-1 flex flex-col justify-between space-y-3">
						<ActionRow
							title="SVG Code"
							description="Raw SVG markup"
							onCopy={() => handleCopy('svg')}
							onDownload={() => handleDownload('svg')}
							isCopied={copiedFormat === 'svg'}
							icon={<SvgIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="HTML"
							description="Copy as <img> tag"
							onCopy={() => handleCopy('html')}
							isDownloadDisabled={true}
							isCopied={copiedFormat === 'html'}
							icon={<HtmlIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="React Component"
							description="Copy as React JSX component"
							onCopy={() => handleCopy('react')}
							onDownload={() => handleDownload('react')}
							isCopied={copiedFormat === 'react'}
							icon={<ReactIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="Vue Component"
							description="Copy as Vue template"
							onCopy={() => handleCopy('vue')}
							onDownload={() => handleDownload('vue')}
							isCopied={copiedFormat === 'vue'}
							icon={<VueIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>
					</div>
				</div>
			</div>
		</DetailViewPanel>
	);
};