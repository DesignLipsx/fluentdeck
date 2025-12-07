import React from 'react';
import { GithubIcon } from './Icons';
import { GITHUB_REPO_URL } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-secondary border-t border-border-primary">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row gap-4">
            <div className="flex items-center space-x-3">
                <img src="https://ovquzgethkugtnxcoeiq.supabase.co/storage/v1/object/public/fluent_deck_assets/logo.png" alt="Fluent Deck Logo" className="h-8 w-8" />
                <h1 className="text-lg font-semibold text-text-primary">Fluent Deck</h1>
            </div>
            <p className="text-center text-sm text-text-tertiary">
                © {new Date().getFullYear()} Fluent Deck. A project by Jishnu K V. All rights reserved.
            </p>
            <div className="flex space-x-6">
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-text-primary">
                    <span className="sr-only">GitHub</span>
                    <GithubIcon className="h-6 w-6" />
                </a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;