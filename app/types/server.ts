export interface ServerTheme {
  primary: string;
  secondary: string;
  accent: string;
  rounded: string;
}

export interface ServerEffects {
  snow: boolean;
  confetti: boolean;
  particles: boolean;
}

export interface ServerCustomButton {
  show: boolean;
  icon: string;
  text: string;
  link: string;
  color: string;
}

export interface Server {
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  backgroundType: 'video' | 'gradient' | 'image';
  backgroundUrl?: string;
  backgroundColor: string;
  backgroundGradient?: string;
  music?: string;
  theme: ServerTheme;
  effects: ServerEffects;
  customButton: ServerCustomButton;
}
