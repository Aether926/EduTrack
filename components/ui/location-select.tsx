/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { regions, provinces, citiesMunicipalities } from "ph-locations";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface LocationValue {
    country: string;
    regionCode: string;
    regionName: string;
    province: string;
    provinceName: string;
    city: string;
}

interface LocationSelectProps {
    value: LocationValue;
    onChange: (value: LocationValue) => void;
    disabled?: boolean;
    required?: boolean;
}

export function LocationSelect({
    value,
    onChange,
    disabled,
    required,
}: LocationSelectProps) {
    const isPhilippines = value.country === "PH";
    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryList, setShowCountryList] = useState(false);

    const [foreignRegions, setForeignRegions] = useState<
        { isoCode: string; name: string }[]
    >([]);
    const [foreignCities, setForeignCities] = useState<{ name: string }[]>([]);

    useEffect(() => {
        if (isPhilippines || !value.country) return setForeignRegions([]);
        setForeignRegions(State.getStatesOfCountry(value.country));
    }, [value.country, isPhilippines]);

    useEffect(() => {
        if (isPhilippines || !value.country || !value.regionCode)
            return setForeignCities([]);
        setForeignCities(
            City.getCitiesOfState(value.country, value.regionCode),
        );
    }, [value.country, value.regionCode, isPhilippines]);

    const allCountries = Country.getAllCountries();

    const filteredCountries = useMemo(
        () =>
            countrySearch.trim()
                ? allCountries.filter((c) =>
                      c.name
                          .toLowerCase()
                          .includes(countrySearch.toLowerCase()),
                  )
                : allCountries,
        [countrySearch, allCountries],
    );

    const phProvinces =
        isPhilippines && value.regionCode
            ? (provinces as any[]).filter((p) => p.region === value.regionCode)
            : [];

    const phCities =
        isPhilippines && value.province
            ? (citiesMunicipalities as any[]).filter(
                  (c) => c.province === value.province,
              )
            : [];

    const selectedCountryName =
        allCountries.find((c) => c.isoCode === value.country)?.name ?? "";

    const handleCountrySelect = (isoCode: string) => {
        onChange({
            country: isoCode,
            regionCode: "",
            regionName: "",
            province: "",
            provinceName: "",
            city: "",
        });
        setShowCountryList(false);
        setCountrySearch("");
    };

    const handleRegionChange = (code: string) => {
        if (isPhilippines) {
            const region = (regions as any[]).find((r) => r.code === code);
            onChange({
                ...value,
                regionCode: code,
                regionName: region?.name ?? "",
                province: "",
                provinceName: "",
                city: "",
            });
        } else {
            const region = foreignRegions.find((r) => r.isoCode === code);
            onChange({
                ...value,
                regionCode: code,
                regionName: region?.name ?? "",
                province: code,
                provinceName: region?.name ?? "",
                city: "",
            });
        }
    };

    const handleProvinceChange = (code: string) => {
        const province = (phProvinces as any[]).find((p) => p.code === code);
        onChange({
            ...value,
            province: code,
            provinceName: province?.name ?? "",
            city: "",
        });
    };

    const handleCityChange = (city: string) => {
        onChange({ ...value, city });
    };

    const triggerClass =
        "bg-white/5 border-white/10 focus:border-blue-500/50 text-[13.5px]";
    const contentClass = "bg-[#1c1c1e] border-[#2e2e32] text-[#f0f0f0]";
    const itemClass = "text-[13px] focus:bg-[#2e2e32] cursor-pointer";
    const labelClass =
        "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5";

    return (
        <div className="flex flex-col gap-3">
            {/* Row 1 — Country + Region */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {/* Country */}
                <div className="space-y-1.5 w-full">
                    <label className={labelClass}>Country</label>
                    <div className="relative w-full">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setShowCountryList((v) => !v)}
                            className="w-full h-10 flex items-center justify-between px-3 rounded-md bg-white/5 border border-white/10 text-[13.5px] text-left hover:bg-white/8 disabled:opacity-50"
                        >
                            <span
                                className={
                                    selectedCountryName
                                        ? "text-foreground truncate"
                                        : "text-muted-foreground"
                                }
                            >
                                {selectedCountryName || "Select country"}
                            </span>
                            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                        </button>
                        {showCountryList && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border border-[#2e2e32] bg-[#1c1c1e] shadow-lg">
                                <div className="p-2 border-b border-[#2e2e32]">
                                    <Input
                                        autoFocus
                                        value={countrySearch}
                                        onChange={(e) =>
                                            setCountrySearch(e.target.value)
                                        }
                                        placeholder="Search country..."
                                        className="h-8 text-[13px] bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                    {filteredCountries.length === 0 ? (
                                        <div className="px-3 py-2 text-[13px] text-muted-foreground">
                                            No country found.
                                        </div>
                                    ) : (
                                        filteredCountries.map((c) => (
                                            <button
                                                key={c.isoCode}
                                                type="button"
                                                onClick={() =>
                                                    handleCountrySelect(
                                                        c.isoCode,
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#2e2e32] transition-colors ${
                                                    value.country === c.isoCode
                                                        ? "text-blue-400 bg-blue-500/10"
                                                        : "text-[#f0f0f0]"
                                                }`}
                                            >
                                                {c.flag} {c.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Region */}
                <div className="space-y-1.5 w-full">
                    <label className={labelClass}>Region</label>
                    <Select
                        value={value.regionCode}
                        onValueChange={handleRegionChange}
                        disabled={disabled || !value.country}
                    >
                        <SelectTrigger
                            className={`${triggerClass} h-10 w-full`}
                        >
                            <SelectValue
                                placeholder={
                                    !value.country
                                        ? "Country first"
                                        : "Select region"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className={contentClass}>
                            {isPhilippines
                                ? (regions as any[]).map((r) => (
                                      <SelectItem
                                          key={r.code}
                                          value={r.code}
                                          className={itemClass}
                                      >
                                          {r.name}
                                      </SelectItem>
                                  ))
                                : foreignRegions.map((r) => (
                                      <SelectItem
                                          key={r.isoCode}
                                          value={r.isoCode}
                                          className={itemClass}
                                      >
                                          {r.name}
                                      </SelectItem>
                                  ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Row 2 — Province + City */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {/* Province (PH only) */}
                <div className="space-y-1.5 w-full">
                    <label className={labelClass}>Province</label>
                    <Select
                        value={value.province}
                        onValueChange={handleProvinceChange}
                        disabled={
                            disabled || !value.regionCode || !isPhilippines
                        }
                    >
                        <SelectTrigger
                            className={`${triggerClass} h-10 w-full`}
                        >
                            <SelectValue
                                placeholder={
                                    !isPhilippines
                                        ? "N/A"
                                        : !value.regionCode
                                          ? "Region first"
                                          : "Select province"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className={contentClass}>
                            {(phProvinces as any[]).map((p) => (
                                <SelectItem
                                    key={p.code}
                                    value={p.code}
                                    className={itemClass}
                                >
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* City / Municipality */}
                <div className="space-y-1.5 w-full">
                    <label className={labelClass}>City / Mun.</label>
                    <Select
                        value={value.city}
                        onValueChange={handleCityChange}
                        disabled={
                            disabled ||
                            (isPhilippines
                                ? !value.province
                                : !value.regionCode)
                        }
                    >
                        <SelectTrigger
                            className={`${triggerClass} h-10 w-full`}
                        >
                            <SelectValue
                                placeholder={
                                    isPhilippines
                                        ? !value.province
                                            ? "Province first"
                                            : "Select city"
                                        : !value.regionCode
                                          ? "Region first"
                                          : "Select city"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className={contentClass}>
                            {isPhilippines
                                ? (phCities as any[]).map((c) => (
                                      <SelectItem
                                          key={c.name}
                                          value={c.name}
                                          className={itemClass}
                                      >
                                          {c.fullName}
                                          <span className="ml-1.5 text-[10px] text-muted-foreground">
                                              {c.classification === "CC"
                                                  ? "City"
                                                  : c.classification === "Mun"
                                                    ? "Mun."
                                                    : c.classification}
                                          </span>
                                      </SelectItem>
                                  ))
                                : foreignCities.map((c) => (
                                      <SelectItem
                                          key={c.name}
                                          value={c.name}
                                          className={itemClass}
                                      >
                                          {c.name}
                                      </SelectItem>
                                  ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
