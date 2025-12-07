import React from 'react';
import { OtherSection } from '../types';
import { InfoIcon } from '../components/Icons';

interface AboutPageProps {
  sections: OtherSection[];
}

const ContentSection: React.FC<{ section?: OtherSection }> = ({ section }) => {
  if (!section) return null;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
      <h3 className="text-2xl font-semibold text-text-primary mb-4">{section.title}</h3>
      <div className="prose prose-sm dark:prose-invert text-text-secondary max-w-none whitespace-pre-wrap">
        {section.content}
      </div>
    </div>
  );
};

const AboutPage: React.FC<AboutPageProps> = ({ sections }) => {
  const disclaimer = sections.find(s => s.title.toLowerCase() === 'disclaimer');
  const abbreviations = sections.find(s => s.title.toLowerCase() === 'abbreviations');

  return (
    <div className="h-full overflow-y-auto max-w-4xl mx-auto animate-fade-in space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-3">
        <InfoIcon />
        <h1 className="text-4xl font-bold text-text-primary">About This List</h1>
      </div>
      <p className="text-text-tertiary">
        This page provides important information regarding the curated list of WinUI 3 applications, including disclaimers and definitions for common abbreviations used in app tags.
      </p>
      
      <ContentSection section={disclaimer} />
      <ContentSection section={abbreviations} />

    </div>
  );
};

export default AboutPage;