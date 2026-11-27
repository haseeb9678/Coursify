export interface HeroSlide {
    id: string;
    src: string;
    mobileSrc?: string;
    alt: string;

    eyebrow?: string;
    title?: string;
    description?: string;

    ctaLabel?: string;
    ctaHref?: string;

    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;

    imagePosition?: string;
    label?: string;
}