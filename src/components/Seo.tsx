import React, { useEffect } from 'react';

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
const SITE_NAME = 'Fluent Deck';

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
    const fullTitle = `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}${canonical}`;
    const imageUrl = `${BASE_URL}${image}`;

    const defaultKeywords = "Fluent Design, Fluent UI, Microsoft, WinUI, Fluent Icons, Fluent System Icons, Fluent Emojis, UI/UX, Design System, Windows Apps, Microsoft Fluent, Emoji Library, Icon Library";
    const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

    // Base Schema.org for the website
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
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

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Helper function to set or update meta tag
        const setMetaTag = (property: string, content: string, isName = false) => {
            const attribute = isName ? 'name' : 'property';
            let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, property);
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Set basic meta tags
        setMetaTag('description', description, true);
        setMetaTag('keywords', finalKeywords, true);

        // Set Open Graph tags
        setMetaTag('og:title', fullTitle);
        setMetaTag('og:description', description);
        setMetaTag('og:image', imageUrl);
        setMetaTag('og:image:alt', imageAlt);
        setMetaTag('og:url', canonicalUrl);
        setMetaTag('og:type', type);
        setMetaTag('og:site_name', SITE_NAME);

        // Set Twitter Card tags
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', fullTitle);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', imageUrl);
        setMetaTag('twitter:image:alt', imageAlt);

        // Set canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = canonicalUrl;

        // Set JSON-LD schema
        let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(schemas);

    }, [fullTitle, description, finalKeywords, canonicalUrl, imageUrl, imageAlt, type, schemas]);

    return null;
};

export default Seo;