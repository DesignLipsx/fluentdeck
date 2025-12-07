import React from 'react';
import { InstagramIcon, BehanceIcon, LinkedinIcon, GumroadIcon } from './Icons';

const PersonalInfo: React.FC = () => {
    const socialLinks = [
        { href: 'https://www.instagram.com/ji_shnu_z/', icon: <InstagramIcon className="w-5 h-5" />, name: 'Instagram' },
        { href: 'https://www.behance.net/jishnukv1', icon: <BehanceIcon className="w-5 h-5" />, name: 'Behance' },
        { href: 'https://www.linkedin.com/in/jishnu-kv-b7a4232aa/?trk=opento_sprofile_details', icon: <LinkedinIcon className="w-5 h-5" />, name: 'LinkedIn' },
        { href: 'https://jishnukv.gumroad.com/', icon: <GumroadIcon className="w-5 h-5" />, name: 'Gumroad' },
    ];

    return (
        <div
            className="rounded-2xl border border-border-primary overflow-hidden grid grid-cols-1 lg:grid-cols-5 bg-bg-tertiary has-noise-bg transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5"
            style={{
                backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(79, 70, 229, 0.1), transparent 50%)',
            }}
        >
            {/* Info Section */}
            <div className="p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1 lg:col-span-3">
                <div className="relative z-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                    <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        About the Creator
                    </h2>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                        Jishnu K V
                    </h3>
                    <p className="text-text-secondary mb-10 text-sm sm:text-base md:text-lg leading-relaxed">
                        As a creative individual, I am at the intersection of visual effects and software design. During the day, I work as a VFX artist, engaging with 3D and Python scripting to create immersive visual experiences. In my free time, I am passionate about user interface design, particularly drawn to WinUI 3 and the Fluent Design system.
                    </p>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.name}
                                className="inline-flex items-center justify-center space-x-3 bg-bg-secondary hover:bg-bg-active border border-border-secondary hover:border-blue-500/60 text-text-primary px-5 sm:px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="flex items-center justify-center order-1 lg:order-2 lg:col-span-2 p-6 sm:p-8 md:p-12 lg:p-0">
                <img
                    src="https://ovquzgethkugtnxcoeiq.supabase.co/storage/v1/object/public/fluent_deck_assets/character.webp"
                    alt="3D Male Character sitting on a sofa and working on a laptop"
                    className="relative z-10 w-3/4 sm:w-2/3 md:w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none h-auto object-contain"
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
