import { site } from "./site";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  slug: "privacy" | "terms";
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy policy",
  description: `How ${site.legalName} handles personal information.`,
  updated: "18 September 2026",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        `${site.legalName} is a company in South Africa. This policy covers ${site.url.replace("https://", "")} and related services we operate, including when you connect a Google account.`,
      ],
    },
    {
      heading: "How to reach us",
      paragraphs: [`Email ${site.contactEmail}.`],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "If you email us, we receive the address and the message you send.",
        "This website is static. We do not run accounts, contact forms, or advertising trackers on it.",
        "If you grant us access to Google (for example Gmail or Calendar), we receive the account data Google shows on the consent screen. We use it only to provide the service you asked for.",
      ],
    },
    {
      heading: "What we do not do",
      paragraphs: [
        "We do not sell personal information. We do not use Google user data for advertising. We do not share it except where the law requires us to.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "We keep personal information only as long as we need it for the purpose you gave it, or as the law requires. You can revoke Google access at any time in your Google Account settings.",
      ],
    },
    {
      heading: "Your rights (POPIA)",
      paragraphs: [
        "Under South Africa's Protection of Personal Information Act (POPIA) you may ask us for access to the personal information we hold about you, to correct it, or to delete it. Email us to do that.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: ["We may update this policy. The date at the top is the latest version."],
    },
  ],
};

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms of service",
  description: `Terms for using ${site.name} websites and related services.`,
  updated: "18 September 2026",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [`${site.legalName}, South Africa. Contact: ${site.contactEmail}.`],
    },
    {
      heading: "The site",
      paragraphs: [
        `${site.url.replace("https://", "")} is our company website. It is provided as-is, without warranties.`,
      ],
    },
    {
      heading: "Using it",
      paragraphs: [
        "Do not misuse the site. Do not attempt to break it or use it for anything unlawful.",
      ],
    },
    {
      heading: "Our work",
      paragraphs: [
        `Unless we agree otherwise in writing, material on this site belongs to ${site.legalName}. You may not copy it as your own.`,
      ],
    },
    {
      heading: "Google access",
      paragraphs: [
        "If you connect a Google account to a service we operate, you also agree that we may use that access only as described in the privacy policy.",
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        "To the extent South African law allows, we are not liable for loss arising from use of this site or our services, except where we cannot exclude that liability.",
      ],
    },
    {
      heading: "Law",
      paragraphs: ["These terms are governed by the law of South Africa."],
    },
    {
      heading: "Changes",
      paragraphs: ["We may update these terms. The date at the top is the latest version."],
    },
  ],
};
