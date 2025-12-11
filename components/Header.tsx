import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
	HeartIcon, MenuIcon, AppsIcon, EmojiIcon, FluentIconsIcon,
	ContributeIcon, HistoryIcon, HomeIcon, XIcon, GitHubIcon
} from './Icons';
import { ThemeSwitch } from './ThemeSwitch';

const Header: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
		return () => { document.body.style.overflow = 'unset'; };
	}, [isMobileMenuOpen]);

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
		`px-3 py-2 text-sm relative ${isActive
			? 'text-gray-900 dark:text-text-primary after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-gray-800 dark:after:bg-accent after:rounded-full'
			: 'text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary'
		}`;

	const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
		`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${isActive
			? 'bg-gray-100 dark:bg-bg-active text-gray-900 dark:text-text-primary'
			: 'text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-bg-active/50 hover:text-gray-900 dark:hover:text-text-primary'
		}`;

	return (
		<>
			{/* HEADER */}
			<header className="fixed top-0 w-full bg-white dark:bg-bg-secondary z-40 border-b border-gray-200 dark:border-border-primary">
				<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

					{/* LEFT: Mobile Menu + Logo */}
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setIsMobileMenuOpen(true)}
							className="md:hidden -ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-bg-active text-gray-500 dark:text-text-secondary focus:outline-none"
							aria-label="Open navigation menu"
							aria-expanded={isMobileMenuOpen}
							aria-controls="mobile-menu"
						>
							<MenuIcon className="h-6 w-6" aria-hidden="true" />
						</button>

						<NavLink to="/" className="flex items-center space-x-4 flex-shrink-0" aria-label="Fluent Deck Home">
							<img
								src="/assets/logo.webp"
								alt=""
								width="32"
								height="32"
								className="w-8 h-8 select-none"
								aria-hidden="true"
							/>
							<span className="font-semibold text-gray-900 dark:text-text-primary whitespace-nowrap">
								Fluent Deck
							</span>
						</NavLink>
					</div>

					{/* DESKTOP NAVIGATION */}
					<nav className="hidden md:flex items-center space-x-2" aria-label="Main navigation">
						<NavLink to="/" className={navLinkClasses}>Home</NavLink>
						<NavLink to="/apps" className={navLinkClasses}>Apps</NavLink>
						<NavLink to="/emoji" className={navLinkClasses}>Emoji</NavLink>
						<NavLink to="/icons" className={navLinkClasses}>Icons</NavLink>
						<NavLink to="/contribute" className={navLinkClasses}>Contribute</NavLink>
						<NavLink to="/changelog" className={navLinkClasses}>Changelog</NavLink>
					</nav>

					{/* RIGHT SIDE: Collections + Theme + GITHUB */}
					<div className="flex items-center space-x-2">
						<NavLink
							to="/collections"
							className={({ isActive }) =>
								`relative p-2 rounded-full ${isActive
									? 'bg-gray-100 dark:bg-bg-active text-gray-900 dark:text-text-primary'
									: 'hover:bg-gray-100 dark:hover:bg-bg-active text-gray-500 dark:text-text-secondary'
								} focus:outline-none focus:ring-2 focus:ring-blue-500`
							}
							aria-label="View collections"
						>
							<HeartIcon className="h-5 w-5" aria-hidden="true" />
						</NavLink>

						<ThemeSwitch />

						{/* DESKTOP GITHUB BUTTON - Simplified DOM */}
						<a
							href="https://github.com/DesignLipsx/fluentdeck"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden md:flex items-center gap-1.5 py-1.5 px-4 pl-2 rounded-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="View Fluent Deck on GitHub"
						>
							<GitHubIcon className="h-5 w-5" aria-hidden="true" />
							<span className="hidden sm:flex text-sm ml-1">Github</span>
						</a>
					</div>
				</div>
			</header>

			{/* MOBILE SIDEBAR */}
			{isMobileMenuOpen && (
				<div
					id="mobile-menu"
					role="dialog"
					aria-modal="true"
					aria-label="Mobile navigation menu"
					className="fixed inset-0 z-[60] md:hidden"
				>
					<div
						className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
						onClick={closeMobileMenu}
						aria-hidden="true"
					/>

					<div className="absolute top-0 left-0 h-full w-72 bg-white dark:bg-bg-secondary shadow-2xl flex flex-col animate-slide-in">
						<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border-primary">
							<div className="flex items-center space-x-3">
								<img src="/assets/logo.webp" alt="" width="24" height="24" className="w-6 h-6" aria-hidden="true" />
								<span className="font-semibold text-gray-900 dark:text-text-primary">Fluent Deck</span>
							</div>

							<button
								onClick={closeMobileMenu}
								className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-bg-active focus:outline-none focus:ring-2 focus:ring-blue-500"
								aria-label="Close navigation menu"
							>
								<XIcon className="h-5 w-5" aria-hidden="true" />
							</button>
						</div>

						{/* MOBILE NAV LINKS */}
						<nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1" aria-label="Mobile navigation">
							<NavLink to="/" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<HomeIcon className="w-5 h-5" aria-hidden="true" /> Home
							</NavLink>
							<NavLink to="/apps" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<AppsIcon className="w-5 h-5" aria-hidden="true" /> Apps
							</NavLink>
							<NavLink to="/emoji" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<EmojiIcon className="w-5 h-5" aria-hidden="true" /> Emoji
							</NavLink>
							<NavLink to="/icons" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<FluentIconsIcon className="w-5 h-5" aria-hidden="true" /> Icons
							</NavLink>
							<NavLink to="/contribute" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<ContributeIcon className="w-5 h-5" aria-hidden="true" /> Contribute
							</NavLink>
							<NavLink to="/changelog" className={({ isActive }) => mobileNavLinkClasses({ isActive })} onClick={closeMobileMenu}>
								<HistoryIcon className="w-5 h-5" aria-hidden="true" /> Changelog
							</NavLink>
						</nav>

						<div className="p-4 border-t border-gray-200 dark:border-border-primary text-xs text-gray-500 dark:text-text-secondary flex items-center justify-between">
							<span>© {new Date().getFullYear()} Fluent Deck</span>

							{/* MOBILE GITHUB BUTTON */}
							<a
								href="https://github.com/DesignLipsx/fluentdeck"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-bg-active/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
								aria-label="View Fluent Deck on GitHub"
							>
								<GitHubIcon className="w-5 h-5" aria-hidden="true" />
							</a>
						</div>
					</div>
				</div>
			)}

			<style dangerouslySetInnerHTML={{
				__html: `
				@keyframes slide-in {
					from { transform: translateX(-100%); }
					to { transform: translateX(0); }
				}
				.animate-slide-in {
					animation: slide-in 0.3s ease-out;
				}
			`}} />
		</>
	);
};

export default Header;