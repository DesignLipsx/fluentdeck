import React from 'react';
import { InstagramIcon, BehanceIcon, LinkedinIcon, GumroadIcon, CoffeeIcon } from './Icons';

const PersonalInfo: React.FC = () => {
    const socialLinks = [
        { href: 'https://www.instagram.com/ji_shnu_z/', icon: <InstagramIcon className="w-5 h-5" />, name: 'Instagram' },
        { href: 'https://www.behance.net/jishnukv1', icon: <BehanceIcon className="w-5 h-5" />, name: 'Behance' },
        { href: 'https://www.linkedin.com/in/jishnu-kv-b7a4232aa/?trk=opento_sprofile_details', icon: <LinkedinIcon className="w-5 h-5" />, name: 'LinkedIn' },
        { href: 'https://jishnukv.gumroad.com/', icon: <GumroadIcon className="w-5 h-5" />, name: 'Gumroad' },
    ];

    return (
        <div 
            className="rounded-2xl border border-border-primary overflow-hidden grid grid-cols-1 lg:grid-cols-5 bg-bg-tertiary has-noise-bg"
            style={{
                backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(79, 70, 229, 0.1), transparent 50%)',
            }}
        >
            {/* Info Section */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1 lg:col-span-3">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">About the Creator</h2>
                    <h3 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">Jishnu K V</h3>
                    <p className="text-text-secondary mb-10 text-base md:text-lg leading-relaxed">
                        As a creative individual, I am at the intersection of visual effects and software design. During the day, I work as a VFX artist, engaging with 3D and Python scripting to create immersive visual experiences. In my free time, I am passionate about user interface design, particularly drawn to WinUI 3 and the Fluent Design system.
                    </p>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="https://buymeacoffee.com/jishnujithu"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Buy me a coffee"
                            className="sm:col-span-2 inline-flex items-center justify-center space-x-3 bg-bg-secondary hover:bg-bg-active border border-border-secondary hover:border-blue-500/60 text-text-primary px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold"
                        >
                            <CoffeeIcon className="w-5 h-5 text-yellow-400" />
                            <span>Buy me a coffee</span>
                        </a>
                        {socialLinks.map(link => (
                            <a 
                                key={link.name} 
                                href={link.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={link.name}
                                className="inline-flex items-center justify-center space-x-3 bg-bg-secondary hover:bg-bg-active border border-border-secondary hover:border-blue-500/60 text-text-primary px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold"
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="flex items-center justify-center order-1 lg:order-2 lg:col-span-2">
                <img
                    src="https://ovquzgethkugtnxcoeiq.supabase.co/storage/v1/object/public/fluent_deck_assets/character.webp"
                    alt="3D Male Character sitting on a sofa and working on a laptop"
                    className="relative z-10 w-full h-auto"
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
