export interface App {
  name: string;
  link: string;
  description: string;
  tags: string[];
  category: string;
  logo_url?: string;
  pricing: 'FOSS' | 'Paid' | 'Free';
}

export interface Category {
  name: string;
  apps: App[];
  emoji?: string;
}

export interface OtherSection {
  title: string;
  content: string;
}

export interface Emoji {
  name: string;
  keywords: string[];
  category?: string;
  styles: {
    '3D'?: string;
    'Modern'?: string;
    'Flat'?: string;
    'Mono'?: string;
    'Anim'?: string;
  };
  unicode?: string;
  symbol?: string;
}

export type NavItem = 'Home' | 'Apps' | 'Icons' | 'Emoji' | 'Contribute';

export type EmojiStyle = '3D' | 'Modern' | 'Flat' | 'Mono' | 'Anim';

export type IconStyle = 'filled' | 'outlined' | 'color';

export type SelectedItem = 
  | { type: 'app'; data: App } 
  | { type: 'icon'; data: { name: string; style: IconStyle } } 
  | { type: 'emoji'; data: { name: string; style: EmojiStyle } };