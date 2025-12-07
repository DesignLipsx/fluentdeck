import React, { useState, useEffect } from 'react';
import { GITHUB_REPO_URL } from '../constants';
import { ContributeIcon, AddIcon, CoffeeIcon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';

const ContributorsSection = () => {
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContributors() {
            try {
                const response = await fetch('https://api.github.com/repos/DesignLipsx/WinUI-3-Apps-List/contributors');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
                }
                const data = await response.json();
                setContributors(data.filter((c: any) => c.type === 'User'));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchContributors();
    }, []);

    return (
        <div id="contributors-section" className="mt-16">
            <h2 className="text-3xl font-bold text-text-primary mb-6">Our Contributors</h2>
            {loading && <div className="flex justify-center py-8"><LoadingSpinner text="Fetching contributors..." /></div>}
            {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-500/10 p-4 rounded-lg">Error: {error}</div>}
            
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {contributors.map(contributor => (
                        <a 
                            key={contributor.id} 
                            href={contributor.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-bg-secondary border border-border-primary rounded-xl p-3 sm:p-4 text-center transition duration-300 ease-in-out transform hover:-translate-y-1 block"
                        >
                            <img src={contributor.avatar_url} alt={contributor.login} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 object-cover border-4 border-border-secondary" />
                            <p className="text-sm font-semibold text-text-primary truncate">{contributor.login}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/20 rounded-full inline-block px-2 py-1 mt-1">
                                {contributor.contributions} contribution{contributor.contributions > 1 ? 's' : ''}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContributePage: React.FC = () => {
  const NEW_PULL_REQUEST_URL = 'https://github.com/DesignLipsx/WinUI-3-Apps-List/pulls';

  const tableHeaderClasses = "px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider";
  const tableCellClasses = "px-3 py-3 sm:px-4 sm:py-4 whitespace-normal text-sm";
  const codeCellClasses = `${tableCellClasses} font-mono text-text-primary`;

  return (
    // ✅ FIXED: Removed fixed max-width and improved responsive padding
    <div className="h-full overflow-y-auto w-full animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto"> {/* ✅ Added max-width only for larger screens */}
        <div className="flex items-center space-x-3">
          <ContributeIcon />
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Contribute</h1>
        </div>
        
        <div className="mt-6 sm:mt-8 bg-bg-secondary border border-border-primary rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="space-y-6 sm:space-y-8 text-text-secondary">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">How to Add an App</h3>
              <p className="mt-2 text-sm sm:text-base">
                Adding an app is done through a GitHub Pull Request. If you're new to this, don't worry! Just follow these three simple steps.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary">Step 1: Fork the Repository</h4>
              <p className="mt-2 text-sm sm:text-base">
                First, you'll need your own copy of the project. Go to the main repository page and click the <strong>"Fork"</strong> button in the top-right corner. This creates a personal copy of the repository under your GitHub account.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary">Step 2: Edit README.md</h4>
              <p className="mt-2 text-sm sm:text-base">
                Navigate to the <code className="bg-bg-tertiary px-1 py-0.5 rounded text-xs">README.md</code> file in your forked repository. Click the pencil icon to edit the file directly on GitHub. Find the appropriate category for the app and add a new line for it, keeping the list in alphabetical order.
              </p>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base">
                Follow this format for your entry:
              </p>
              {/* ✅ FIXED: Added break-words and whitespace-pre-wrap for mobile */}
              <pre className="bg-bg-tertiary p-3 rounded-md text-xs mt-2 overflow-x-auto break-words whitespace-pre-wrap">
                <code className="break-words whitespace-pre-wrap">
                  - `TAGS` [App Name](https://app-website.com) &lt;sup&gt;`PRICING`&lt;/sup&gt;
                </code>
              </pre>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base">
                <strong>Example:</strong> Let's add a new app called "Fluent Player", a free and open-source media player with Mica. It would look like this:
              </p>
              {/* ✅ FIXED: Added break-words and whitespace-pre-wrap for mobile */}
              <pre className="bg-bg-tertiary p-3 rounded-md text-xs mt-2 overflow-x-auto break-words whitespace-pre-wrap">
                <code className="break-words whitespace-pre-wrap">
                  - `WDM` [Fluent Player](https://fluentplayer.com) &lt;sup&gt;`FOSS`&lt;/sup&gt;
                </code>
              </pre>
              
              <h5 className="font-semibold text-text-primary mt-3 sm:mt-4">Result Preview:</h5>
              <div className="bg-bg-tertiary p-3 sm:p-4 rounded-md mt-2 text-text-primary text-sm">
                <ul className="list-disc pl-4 sm:pl-5">
                  <li>
                    <code className="bg-bg-inset px-1 py-0.5 rounded text-xs">WDM</code>{' '}
                    <a href="https://fluentplayer.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Fluent Player</a>{' '}
                    <sup><code className="bg-bg-inset px-1 py-0.5 rounded text-xs">FOSS</code></sup>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary">Step 3: Create a Pull Request</h4>
              <p className="mt-2 text-sm sm:text-base">
                Once you've added the app and saved your changes, GitHub will show a prompt to "Contribute" and "Open a pull request". Follow the prompts to submit your changes to the main repository. I'll review your submission and merge it if it meets the criteria.
              </p>
            </div>

            <div className="!mt-8 sm:!mt-10">
              <h4 className="text-lg font-semibold text-text-primary mb-3 sm:mb-4">Tag Reference</h4>
              {/* ✅ FIXED: Improved table responsiveness */}
              <div className="overflow-x-auto rounded-lg border border-border-primary">
                <table className="min-w-full divide-y divide-border-primary text-sm">
                  <thead className="bg-bg-tertiary">
                    <tr>
                      <th scope="col" className={tableHeaderClasses}>Tag</th>
                      <th scope="col" className={tableHeaderClasses}>Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-secondary divide-y divide-border-primary">
                    <tr><td className={codeCellClasses}>WD</td><td className={tableCellClasses}>App follows the WinUI 3 design language.</td></tr>
                    <tr><td className={codeCellClasses}>WDM</td><td className={tableCellClasses}>App features Mica material.</td></tr>
                    <tr><td className={codeCellClasses}>WDA</td><td className={tableCellClasses}>App features Acrylic material.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="!mt-6 sm:!mt-8">
              <h4 className="text-lg font-semibold text-text-primary mb-3 sm:mb-4">Other abbreviations</h4>
              {/* ✅ FIXED: Improved table responsiveness */}
              <div className="overflow-x-auto rounded-lg border border-border-primary">
                <table className="min-w-full divide-y divide-border-primary text-sm">
                  <thead className="bg-bg-tertiary">
                    <tr>
                      <th scope="col" className={tableHeaderClasses}>Tag</th>
                      <th scope="col" className={tableHeaderClasses}>Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-secondary divide-y divide-border-primary">
                    <tr><td className={codeCellClasses}>FOSS</td><td className={tableCellClasses}>Free and Open Source Software.</td></tr>
                    <tr><td className={codeCellClasses}>Paid</td><td className={tableCellClasses}>The app requires payment.</td></tr>
                    <tr><td className={`${tableCellClasses} text-lg sm:text-xl`}>💰</td><td className={tableCellClasses}>Paid Apps!</td></tr>
                    <tr><td className={`${tableCellClasses} text-lg sm:text-xl`}>🎨</td><td className={tableCellClasses}>Theme!</td></tr>
                    <tr><td className={`${tableCellClasses} text-lg sm:text-xl`}>📆</td><td className={tableCellClasses}><strong>Planned:</strong> Apps that are in development.</td></tr>
                    <tr><td className={`${tableCellClasses} text-lg sm:text-xl`}>❎</td><td className={tableCellClasses}><strong>Discontinued:</strong> App is discontinued/paused indefinitely.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <div className="text-center pt-6 sm:pt-8">
          <a
            href={NEW_PULL_REQUEST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover transition shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20 text-sm sm:text-base"
          >
            <AddIcon />
            <span className="ml-2">Create a Pull Request</span>
          </a>
        </div>

        <ContributorsSection />

        <div className="mt-8 sm:mt-10 bg-bg-secondary border border-border-primary rounded-xl p-4 sm:p-6 lg:p-8 text-center space-y-3 sm:space-y-4">
          <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">Support My Work ☕</h3>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
            If you appreciate this project and want to help me keep improving it, consider buying me a
            coffee. Every small contribution helps keep development going strong. 🙌
          </p>
          <a
            href="https://buymeacoffee.com/jishnujithu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover transition shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20 text-sm sm:text-base"
          >
            <CoffeeIcon className="w-5 h-5" />
            <span>Buy me a coffee</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContributePage;