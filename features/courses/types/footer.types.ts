
export interface FooterLink {
    id: string;
    label: string;
    href: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
}

export interface SocialLink {
    id: string;
    label: string;
    href: string;
}
