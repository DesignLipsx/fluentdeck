import React from 'react';
import { ContributeIcon, AddIcon, CoffeeIcon } from '@/components/Icons';
import { NEW_PULL_REQUEST_URL, BUY_ME_A_COFFEE_URL } from '@/constants';
import Seo from '@/components/Seo';

// Moved constants outside to avoid re-creating on each render
const designTags = [
	{ tag: 'WD', desc: 'App follows the WinUI 3 design language.' },
	{ tag: 'WDM', desc: 'App features Mica material.' },
	{ tag: 'WDA', desc: 'App features Acrylic material.' },
];

const otherTags = [
	{ tag: 'FOSS', desc: 'Free and Open Source Software.', mono: true },
	{ tag: '💰', desc: 'Paid Apps!', mono: false },
	{ tag: '🎨', desc: 'Theme!', mono: false },
	{ tag: '📆', desc: 'Planned: Apps that are in development.', mono: false },
	{ tag: '❎', desc: 'Discontinued: App is paused indefinitely.', mono: false },
];

const ContributePage: React.FC = () => {
	return (
		<>
			<Seo
				title="Contribute to Fluent Deck"
				description="Add your WinUI 3 app to our showcase, suggest new features, or support the project. Learn how to contribute via GitHub and help grow the Fluent Design community."
				keywords="Contribute, Open Source, WinUI, Fluent Design, GitHub, Add App"
				canonical="/contribute"
				image="/assets/cover-contribute.png"
				imageAlt="Instructions on how to contribute to the Fluent Deck project on GitHub."
			/>
			<div className="py-10 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto">
					{/* HEADER */}
					<div className="mb-10">
						<div className="flex items-center gap-3 mb-4">
							<ContributeIcon />
							<h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
								Contribute
							</h1>
						</div>

						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
							<div className="max-w-xl">
								<h2 className="text-xl font-semibold text-text-primary mb-2">
									Add Your App to Fluent Deck
								</h2>
								<p className="text-text-secondary text-sm sm:text-base leading-relaxed">
									Got a WinUI 3 app? Awesome! Adding it to Fluent Deck is super easy.
									Follow the steps below or jump right in if you're familiar with GitHub.
								</p>
							</div>

							{/* CTA */}
							<a
								href={NEW_PULL_REQUEST_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="shrink-0 inline-flex items-center justify-center px-6 py-3 font-semibold text-bg-primary bg-accent rounded-lg hover:opacity-90 transition shadow-lg text-sm sm:text-base"
							>
								<AddIcon />
								<span className="ml-2">Create Pull Request</span>
							</a>
						</div>
					</div>

					{/* TIMELINE */}
					<div className="relative">
						{/* Vertical line */}
						<div className="hidden sm:block absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b
              from-blue-500 via-purple-500 to-red-500"></div>

						<div className="space-y-12 sm:space-y-16">

							{/* STEP 1 */}
							<section className="relative sm:pl-14">

								{/* Desktop number */}
								<div className="hidden sm:flex absolute left-0 top-0 h-10 w-10 rounded-full
                bg-blue-500 shadow-lg ring-4 ring-bg-primary
                items-center justify-center">
									<span className="text-white font-bold">1</span>
								</div>

								<div className="bg-bg-secondary rounded-lg shadow-sm border border-border-primary overflow-hidden">

									<div className="p-5 sm:p-6">

										<h3 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-text-primary mb-4">
											<span className="flex sm:hidden h-8 w-8 rounded-full bg-blue-500 text-white items-center justify-center text-sm">
												1
											</span>
											Fork the Repository
										</h3>

										<p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-4">
											Head over to the{' '}
											<a
												href="https://github.com/jishnu-kv/WinUI-3-Apps-List"
												target="_blank"
												rel="noopener noreferrer"
												className="text-text-link hover:opacity-80 font-medium underline"
											>
												WinUI 3 Apps List repository
											</a>{' '}
											and click the "Fork" button.
										</p>

										<img
											src="/assets/contribute/fork.webp"
											alt="GitHub fork button"
											className="rounded-lg border border-border-primary w-full shadow-sm"
											width={1280}
											height={720}
											fetchPriority="high"
										/>
									</div>
								</div>
							</section>

							{/* STEP 2 */}
							<section className="relative sm:pl-14">

								{/* Desktop number */}
								<div className="hidden sm:flex absolute left-0 top-0 h-10 w-10 rounded-full
                bg-purple-500 shadow-lg ring-4 ring-bg-primary
                items-center justify-center">
									<span className="text-white font-bold">2</span>
								</div>

								<div className="bg-bg-secondary rounded-lg shadow-sm border border-border-primary overflow-hidden">

									<div className="p-5 sm:p-6">

										<h3 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-text-primary mb-4">
											<span className="flex sm:hidden h-8 w-8 rounded-full bg-purple-500 text-white items-center justify-center text-sm">
												2
											</span>
											Update README.md
										</h3>

										<p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-5">
											Navigate to the README.md file in your fork and add your app under the correct category in alphabetical order.
										</p>

										{/* Format + Example */}
										<div className="space-y-4 mb-5">
											<div>
												<p className="text-sm font-bold text-text-secondary uppercase mb-1">Format</p>
												<pre className="bg-bg-active border border-border-primary p-3 rounded-md text-xs overflow-x-auto">
													<code>- `TAGS` [App Name](https://url.com) &lt;sup&gt;`PRICING`&lt;/sup&gt;</code>
												</pre>
											</div>

											<div>
												<p className="text-sm font-bold text-text-secondary uppercase mb-1">Example</p>
												<pre className="bg-bg-active border border-border-primary p-3 rounded-md text-xs overflow-x-auto">
													<code>- `WDM` [Fluent Player](https://fluentplayer.com) &lt;sup&gt;`FOSS`&lt;/sup&gt;</code>
												</pre>
											</div>
										</div>

										{/* Logo Section */}
										<div className="mb-6 bg-bg-active/50 p-4 rounded-lg border border-border-primary/50">
											<p className="text-text-primary text-sm font-semibold mb-2">Adding a Logo (Optional)</p>
											<code className="block bg-black/20 p-2 rounded border border-border-primary text-xs font-mono overflow-x-auto">
												&lt;!-- logo: YOUR_LOGO_URL --&gt;
											</code>
										</div>

										{/* Tag Tables */}
										<div className="space-y-6">
											<div>
												<h4 className="text-base sm:text-lg font-semibold text-text-primary mb-2">Tag Reference</h4>
												<div className="overflow-hidden rounded-lg border border-border-primary shadow-sm">
													<table className="w-full text-sm divide-y divide-border-primary">
														<thead className="bg-bg-active">
															<tr>
																<th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-primary w-24">Tag</th>
																<th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-primary">Description</th>
															</tr>
														</thead>

														<tbody className="bg-bg-secondary divide-y divide-border-primary">
															{designTags.map(item => (
																<tr key={item.tag}>
																	<td className="px-4 py-3 font-mono text-xs sm:text-sm font-semibold text-text-primary">{item.tag}</td>
																	<td className="px-4 py-3 text-text-secondary">{item.desc}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>

											<div>
												<h4 className="text-base sm:text-lg font-semibold text-text-primary mb-2">Other Abbreviations</h4>
												<div className="overflow-hidden rounded-lg border border-border-primary shadow-sm">
													<table className="w-full text-sm divide-y divide-border-primary">
														<thead className="bg-bg-active">
															<tr>
																<th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-primary w-24">Tag</th>
																<th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-primary">Description</th>
															</tr>
														</thead>

														<tbody className="bg-bg-secondary divide-y divide-border-primary">
															{otherTags.map((item, i) => (
																<tr key={i}>
																	<td className={`px-4 py-3 ${item.mono ? 'font-mono font-semibold text-xs sm:text-sm' : 'text-lg'}`}>
																		{item.tag}
																	</td>
																	<td className="px-4 py-3 text-text-secondary">{item.desc}</td>
																</tr>
															))}
														</tbody>

													</table>
												</div>
											</div>
										</div>

									</div>
								</div>
							</section>

							{/* STEP 3 */}
							<section className="relative sm:pl-14">

								{/* Desktop number */}
								<div className="hidden sm:flex absolute left-0 top-0 h-10 w-10 rounded-full
                bg-red-500 shadow-lg ring-4 ring-bg-primary
                items-center justify-center">
									<span className="text-white font-bold">3</span>
								</div>

								<div className="bg-bg-secondary rounded-lg shadow-sm border border-border-primary overflow-hidden">

									<div className="p-5 sm:p-6">

										<h3 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-text-primary mb-4">
											<span className="flex sm:hidden h-8 w-8 rounded-full bg-red-500 text-white items-center justify-center text-sm">
												3
											</span>
											Open Pull Request
										</h3>

										<p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-5">
											Click the "Contribute" button on GitHub and open a pull request. After merging, I'll redeploy the site! 🎉
										</p>

										<img
											src="/assets/contribute/pull-request.webp"
											alt="GitHub pull request button"
											className="rounded-lg border border-border-primary w-full shadow-sm"
											width={1280}
											height={720}
											loading="lazy"
										/>

									</div>
								</div>
							</section>

						</div>
					</div>

					{/* MISSING ICONS SECTION */}
					<div className="mt-12 bg-bg-active/50 border border-border-primary/50 rounded-lg p-5 flex gap-4 items-start shadow-sm">
						<div className="text-text-secondary pt-0.5" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="text-sm leading-relaxed">
							<h4 className="font-semibold text-text-primary mb-1">
								Missing Icons?
							</h4>
							<p className="text-text-secondary">
								Fluent Deck uses the official{' '}
								<a
									href="https://github.com/microsoft/fluentui-system-icons"
									className="text-text-link hover:opacity-80 font-medium underline"
									target="_blank"
								>
									Fluent UI System Icons
								</a>.
								If you find missing icons or updated upstream icons,{' '}
								<a
									href="https://github.com/jishnu-kv/fluentdeck/issues"
									className="text-text-link hover:opacity-80 font-medium underline"
									target="_blank"
								>
									create an issue
								</a> and I'll update the set.
							</p>
						</div>
					</div>

					{/* SUPPORT SECTION */}
					<div className="mt-12 mb-8 border-t border-border-primary pt-10">
						<h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
							Support the Project
						</h3>

						<p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
							Fluent Deck is completely free. If you enjoy it or want to support future improvements,
							consider buying me a coffee ☕.
						</p>

						<div className="flex justify-center">
							<a
								href={BUY_ME_A_COFFEE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-text-primary bg-bg-secondary
                border border-border-primary rounded-lg hover:bg-bg-active
                shadow-sm min-w-[200px]"
							>
								<CoffeeIcon className="w-5 h-5 text-yellow-500" />
								<span>Buy me a coffee</span>
							</a>
						</div>
					</div>
					</div>
			</div>
		</>
	);
};

export default ContributePage;