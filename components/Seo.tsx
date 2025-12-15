import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title: string;
    description: string;
    keywords?: string;
    canonical: string;
    image: string;
    imageAlt: string;
    type?: 'website' | 'article';
    schema?: object | object[];
}

const BASE_URL = 'https://fluentdeck.vercel.app';

const Seo: React.FC<SeoProps> = ({
    title,
    description,
    keywords,
    canonical,
    image,
    imageAlt,
    type = 'website',
    schema
}) => {
    const fullTitle = `${title} | Fluent Deck`;
    const canonicalUrl = `${BASE_URL}${canonical}`;
    const imageUrl = `${BASE_URL}${image}`;

    const defaultKeywords = "Fluent Design, Fluent UI, Microsoft, WinUI, Fluent Icons, Fluent System Icons, Fluent Emojis, UI/UX, Design System, Windows Apps, Microsoft Fluent, Emoji Library, Icon Library";
    const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

    // Base Schema.org for the website
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Fluent Deck",
        "url": BASE_URL,
        "description": "A curated showcase of beautiful WinUI 3 apps, a comprehensive library of Microsoft's Fluent System Icons, and a vibrant collection of Fluent Emojis.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${canonicalUrl}?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    // Only add search action to searchable pages
    const searchablePages = ['/apps', '/emoji', '/icons'];
    if (!searchablePages.some(p => canonical.startsWith(p))) {
        delete (websiteSchema as any).potentialAction;
    }

    const schemas = Array.isArray(schema) ? [websiteSchema, ...schema] : schema ? [websiteSchema, schema] : [websiteSchema];

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={finalKeywords} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:site_name" content="Fluent Deck" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={imageAlt} />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
            />
        </Helmet>
    );
};

export default Seo;