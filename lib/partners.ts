import partnersData from "@/data/partners.json";

export type PartnerType = "PSB" | "RRB" | "SCA" | "NBFC";
export type PartnerScheme = "Micro Finance" | "Term Loan" | "Education Loan";
export type PartnerStatus = "Active" | "Inactive";

export interface ChannelPartner {
  id: string | number;
  name: string;
  type: PartnerType | string;
  schemes: (PartnerScheme | string)[];
  lat: number;
  lng: number;
  status: PartnerStatus | string;
  npaFlag: boolean;
  address: string;
  city: string;
  contact?: string;
}

export const channelPartners: ChannelPartner[] = partnersData as unknown as ChannelPartner[];

/**
 * Filter partners by city
 */
export function getPartnersByCity(city: string): ChannelPartner[] {
  return channelPartners.filter(
    (p) => p.city.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Filter partners by supported scheme
 */
export function getPartnersByScheme(scheme: PartnerScheme): ChannelPartner[] {
  return channelPartners.filter((p) => p.schemes.includes(scheme));
}

/**
 * Filter active partners with healthy NPA status
 */
export function getHealthyActivePartners(): ChannelPartner[] {
  return channelPartners.filter(
    (p) => p.status === "Active" && !p.npaFlag
  );
}
