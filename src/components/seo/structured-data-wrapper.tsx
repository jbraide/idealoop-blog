"use server";

import { getCompanySettings } from "@/lib/company-settings";
import { getBaseUrl } from "@/lib/seo-utils";

export async function OrganizationStructuredDataWrapper() {
  const companySettings = await getCompanySettings();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: companySettings.companyName,
          url: getBaseUrl(),
          logo: companySettings.companyLogo || "/logo.png",
          description: companySettings.companyDescription,
          email: companySettings.companyEmail || undefined,
          telephone: companySettings.companyPhone || undefined,
          address: companySettings.companyAddress
            ? {
                "@type": "PostalAddress",
                streetAddress: companySettings.companyAddress,
              }
            : undefined,
          sameAs: [
            companySettings.twitterUrl,
            companySettings.linkedinUrl,
            companySettings.githubUrl,
            companySettings.instagramUrl,
          ].filter(Boolean),
        }),
      }}
    />
  );
}

export async function WebsiteStructuredDataWrapper() {
  const companySettings = await getCompanySettings();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: companySettings.companyName,
          url: getBaseUrl(),
          description: companySettings.companyDescription,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${getBaseUrl()}/posts?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}
