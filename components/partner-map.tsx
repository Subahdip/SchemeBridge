"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Building,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Navigation,
} from "lucide-react";
import partnersData from "@/data/partners.json";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ChannelPartner {
  id: string | number;
  name: string;
  type: "PSB" | "RRB" | "SCA" | "NBFC" | string;
  schemes: ("Micro Finance" | "Term Loan" | "Education Loan" | string)[];
  lat: number;
  lng: number;
  status: "Active" | "Inactive" | string;
  npaFlag: boolean;
  address: string;
  city: string;
  contact?: string;
}

// City Center Coordinates for auto-zoom & pan
const CITY_COORDINATES: { [key: string]: { center: [number, number]; zoom: number } } = {
  "All States": { center: [20.5937, 78.9629], zoom: 5 },
  Delhi: { center: [28.6139, 77.2090], zoom: 11 },
  Mumbai: { center: [19.0760, 72.8777], zoom: 11 },
  Kolkata: { center: [22.5726, 88.3639], zoom: 11 },
  Chennai: { center: [13.0827, 80.2707], zoom: 11 },
  Bangalore: { center: [12.9716, 77.5946], zoom: 11 },
};

// Component to dynamically update map viewport on city filter change
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  return null;
}

// Custom Leaflet DivIcons for Green (Active) and Red (Inactive) pins
function createCustomPin(status: "Active" | "Inactive" | string, npaFlag: boolean, type: string) {
  const isGreen = status === "Active" && !npaFlag;
  const pinColor = isGreen ? "#10b981" : "#ef4444"; // Emerald vs Red
  const ringColor = isGreen ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${ringColor};
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        background: ${pinColor};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 10px; font-weight: 800; text-transform: uppercase;">
          ${type.slice(0, 3)}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-pin",
    html: html,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

export interface PartnerMapProps {
  selectedScheme?: string;
  onSchemeFilterChange?: (scheme: string) => void;
}

export function PartnerMap({ selectedScheme = "All Schemes", onSchemeFilterChange }: PartnerMapProps) {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<ChannelPartner[]>([]);
  const [cityFilter, setCityFilter] = useState<string>("All States");
  const [schemeFilter, setSchemeFilter] = useState<string>(selectedScheme);
  const [npaFilterActive, setNpaFilterActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);

  // Synchronize when scheme selection changes from props
  useEffect(() => {
    if (selectedScheme) {
      setSchemeFilter(selectedScheme);
    }
  }, [selectedScheme]);

  // Load sample dataset
  useEffect(() => {
    setPartners(partnersData as ChannelPartner[]);
  }, []);

  // Filter partners based on city, scheme, NPA toggle, and search query
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      // 1. City / State Filter
      if (cityFilter !== "All States" && partner.city !== cityFilter) {
        return false;
      }

      // 2. Scheme Type Filter
      if (schemeFilter !== "All Schemes" && !partner.schemes.includes(schemeFilter)) {
        return false;
      }

      // 3. NPA Filter Toggle (When ON, hide where npaFlag is true)
      if (npaFilterActive && partner.npaFlag) {
        return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = partner.name.toLowerCase().includes(query);
        const matchesAddress = partner.address.toLowerCase().includes(query);
        const matchesType = partner.type.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress && !matchesType) return false;
      }

      return true;
    });
  }, [partners, cityFilter, schemeFilter, npaFilterActive, searchQuery]);

  // Current map view target
  const currentView = CITY_COORDINATES[cityFilter] || CITY_COORDINATES["All States"];

  // Partner Counts for metrics
  const activeCount = filteredPartners.filter((p) => p.status === "Active" && !p.npaFlag).length;
  const npaCount = filteredPartners.filter((p) => p.npaFlag).length;
  // View Mode: Map & Cards vs Full Data Table
  const [viewMode, setViewMode] = useState<"map" | "table">("map");

  return (
    <Card id="partner-map-section" className="border-border/80 shadow-xl bg-card/80 backdrop-blur-md relative overflow-hidden my-12 transition-all duration-300 scroll-mt-20">
      {/* Top Gradient Decorative Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500" />

      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">
                {t("Locate Authorized Channel Partners")}
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("Approved Channel Partner Network")}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t("Find nearest verified Public Sector Banks, State Channelising Agencies (SCAs), and Regional Rural Banks (RRBs).")}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-background text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("Locate on Map")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-background text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("All Partner Types")}
              </button>
            </div>

            <Badge variant="secondary" className="text-xs px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse" />
              {activeCount} {t("Active")}
            </Badge>
            {schemeFilter !== "All Schemes" && (
              <Badge variant="glow" className="text-xs px-3 py-1">
                {t(schemeFilter)}
              </Badge>
            )}
            {npaCount > 0 && !npaFilterActive && (
              <Badge variant="destructive" className="text-xs px-3 py-1">
                {npaCount} {t("Higher NPA Risk")}
              </Badge>
            )}
          </div>
        </div>

        {/* Real-time Dynamic Counter Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-teal-900 dark:text-teal-200 animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-ping inline-block" />
            {t("16+ Bank Branches Mapped")} ({activeCount} {t("Active")}) {schemeFilter !== "All Schemes" && <span className="font-bold underline text-teal-700 dark:text-teal-300">- {t(schemeFilter)}</span>}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {cityFilter !== "All States" ? `${t("Coverage")}: ${cityFilter}` : t("Delhi • Mumbai • Kolkata")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
        
        {/* FILTERS & SEARCH TOOLBAR */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-muted/30 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Filter className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{t("Partner Locator")}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("Search by Bank, City, State")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={() => {
                  setCityFilter("All States");
                  setSchemeFilter("All Schemes");
                  setNpaFilterActive(false);
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                {t("Reset Form")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Filter 1: City / State Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="city-filter" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-teal-600" />
                <span>{t("Coverage")}</span>
              </label>
              <select
                id="city-filter"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="All States">{t("Delhi • Mumbai • Kolkata")}</option>
                <option value="Delhi">Delhi (NCR Region)</option>
                <option value="Mumbai">Mumbai (Maharashtra)</option>
                <option value="Kolkata">Kolkata (West Bengal)</option>
                <option value="Chennai">Chennai (Tamil Nadu)</option>
                <option value="Bangalore">Bangalore (Karnataka)</option>
              </select>
            </div>

            {/* Filter 2: Scheme Type Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="scheme-filter" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t("Key Schemes")}</span>
              </label>
              <select
                id="scheme-filter"
                value={schemeFilter}
                onChange={(e) => setSchemeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All Schemes">{t("All Schemes")}</option>
                <option value="Micro Finance">{t("Micro Finance (≤ ₹1.4L)")}</option>
                <option value="Term Loan">{t("Term Loan (≤ ₹50L)")}</option>
                <option value="Education Loan">{t("Education Loan (Subsidized)")}</option>
              </select>
            </div>

            {/* Filter 3: NPA Low-Performing Branches Toggle Switch */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("NPA risk health indicator filter")}</span>
              </span>
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-input bg-background cursor-pointer hover:bg-muted/40 transition-colors">
                <span className="text-xs font-medium text-foreground">
                  {t("NPA risk health indicator filter")}
                </span>
                <input
                  type="checkbox"
                  checked={npaFilterActive}
                  onChange={(e) => setNpaFilterActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              </label>
            </div>

          </div>

          {/* Quick Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground border-t border-border/50">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                <strong className="text-foreground">{t("Active")}:</strong> {t("Healthy")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                <strong className="text-foreground">{t("Higher NPA Risk")}:</strong> {t("Moderate Risk")}
              </span>
            </div>
            <span>
              {t("16+ Verified Hubs")}
            </span>
          </div>
        </div>

        {/* 5. INTERACTIVE MAP VIEW */}
        {viewMode === "map" && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-inner h-[500px] w-full z-10 bg-slate-900/10">
              <MapContainer
                center={currentView.center}
                zoom={currentView.zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
              >
                <MapViewController center={currentView.center} zoom={currentView.zoom} />

                {/* Clean OpenStreetMap Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Pins for Filtered Partners */}
                {filteredPartners.map((partner) => (
                  <Marker
                    key={partner.id}
                    position={[partner.lat, partner.lng]}
                    icon={createCustomPin(partner.status, partner.npaFlag, partner.type)}
                    eventHandlers={{
                      click: () => setSelectedPartner(partner),
                    }}
                  >
                    {/* Popup Dialog on Pin Click */}
                    <Popup className="custom-leaflet-popup">
                      <div className="p-3 space-y-3 min-w-[240px] max-w-[280px] text-foreground font-sans">
                        
                        {/* Header */}
                        <div className="space-y-1 border-b pb-2">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                              {partner.type}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                partner.status === "Active" && !partner.npaFlag
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {partner.status === "Active" && !partner.npaFlag ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t("Active")}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  {partner.npaFlag ? t("Higher NPA Risk") : t("Rejected")}
                                </>
                              )}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {partner.name}
                          </h4>
                        </div>

                        {/* Address & City */}
                        <div className="space-y-1 text-xs text-slate-600">
                          <p className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span>{partner.address}, <strong>{partner.city}</strong></span>
                          </p>
                        </div>

                        {/* Schemes Offered */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {t("Key Schemes")}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {partner.schemes.map((scheme) => (
                              <span
                                key={scheme}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                              >
                                {t(scheme)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2 border-t">
                          <button
                            onClick={() => alert(`Connecting with branch: ${partner.name} (${partner.city})`)}
                            className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors text-center cursor-pointer"
                          >
                            {t("Locate Branch")}
                          </button>
                        </div>

                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* 6. MATCHING PARTNER DIRECTORY (Cards Below Map) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-teal-600" />
                  <span>{t("Partner Locator")} ({filteredPartners.length})</span>
                </h4>
                <span className="text-xs text-muted-foreground">
                  {t("16+ verified metro bank branches")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-3.5 rounded-xl border bg-card/60 hover:bg-card hover:border-teal-500/40 transition-all text-xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground truncate pr-2">
                          {partner.name}
                        </span>
                        <Badge
                          variant={partner.status === "Active" && !partner.npaFlag ? "success" : "destructive"}
                          className="text-[10px] py-0 px-1.5 font-bold"
                        >
                          {partner.status === "Active" && !partner.npaFlag ? t("Active") : partner.npaFlag ? t("Higher NPA Risk") : t("Rejected")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-1">
                        {partner.address}, <strong>{partner.city}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50">
                      {partner.schemes.map((s) => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {t(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. APPROVED CHANNEL PARTNER NETWORK DATA TABLE VIEW */}
        {viewMode === "table" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-teal-600" />
                <span>{t("Approved Channel Partner Network")} ({filteredPartners.length})</span>
              </h4>
              <span className="text-xs text-muted-foreground">
                {t("Ministry of Social Justice & Empowerment Alignment")}
              </span>
            </div>

            <div className="rounded-xl border border-border/80 overflow-hidden bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border/80 font-bold text-foreground uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">{t("Platform")}</th>
                      <th className="py-3 px-3">{t("All Partner Types")}</th>
                      <th className="py-3 px-3">{t("Coverage")}</th>
                      <th className="py-3 px-4">{t("Key Schemes")}</th>
                      <th className="py-3 px-3">{t("Healthy")}</th>
                      <th className="py-3 px-3">{t("Current Status")}</th>
                      <th className="py-3 px-3 text-right">{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredPartners.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground max-w-[220px]">
                          <div className="space-y-0.5">
                            <p className="truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-normal truncate">{p.address}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted border">
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground">
                          {p.city}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.schemes.map((s) => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800/40">
                                {t(s)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {p.npaFlag ? (
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-[10px]">
                              <AlertTriangle className="h-3 w-3" />
                              {t("Higher NPA Risk")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              <CheckCircle2 className="h-3 w-3" />
                              {t("Healthy")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={p.status === "Active" && !p.npaFlag ? "success" : "destructive"}
                            className="text-[10px] py-0 px-2 font-bold"
                          >
                            {p.status === "Active" && !p.npaFlag ? t("Active") : p.npaFlag ? t("Higher NPA Risk") : t("Rejected")}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => alert(`Connecting with branch: ${p.name} (${p.city})`)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                          >
                            {t("Locate Branch")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </CardContent>

      <CardFooter className="bg-muted/30 border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {t("Official Ministry Guidelines")}
        </span>
        <span>{t("16+ Verified Hubs")}</span>
      </CardFooter>
    </Card>
  );
}
