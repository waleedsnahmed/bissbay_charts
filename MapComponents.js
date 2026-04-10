"use client";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import * as am5 from "@bissbay/bissbay-charts";
import * as am5map from "@bissbay/bissbay-charts/map";
import am5themes_Animated from "@bissbay/bissbay-charts/themes/Animated";
import am5geodata_worldLow from "@bissbay/bissbay-geodata/worldLow";
import am5geodata_data_countries2 from "@bissbay/bissbay-geodata/data/countries2";
import STATE_POPULATION from "./statePopulationData";

// ── Format helpers ──
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toString();
};

// ── Audience data (code → uppercase ISO-2) ──
const AUDIENCE_DATA = {
  AW: { count: 0, date: "Jan, 2026" },
  AF: { count: 44000, date: "Jan, 2026" },
  AO: { count: 85800, date: "Jan, 2026" },
  AI: { count: 0, date: "Jan, 2026" },
  AX: { count: 0, date: "Jan, 2026" },
  AL: { count: 47300, date: "Jan, 2026" },
  AD: { count: 5280, date: "Jan, 2026" },
  AE: { count: 770000, date: "Jan, 2026" },
  AR: { count: 1540000, date: "Jan, 2026" },
  AM: { count: 37400, date: "Jan, 2026" },
  AS: { count: 0, date: "Jan, 2026" },
  AQ: { count: 0, date: "Jan, 2026" },
  TF: { count: 0, date: "Jan, 2026" },
  AG: { count: 3960, date: "Jan, 2026" },
  AU: { count: 2000000, date: "Jan, 2026" },
  AT: { count: 220000, date: "Jan, 2026" },
  AZ: { count: 79200, date: "Jan, 2026" },
  BI: { count: 8800, date: "Jan, 2026" },
  BE: { count: 550000, date: "Jan, 2026" },
  BJ: { count: 40700, date: "Jan, 2026" },
  BQ: { count: 0, date: "Jan, 2026" },
  BF: { count: 37400, date: "Jan, 2026" },
  BD: { count: 550000, date: "Jan, 2026" },
  BG: { count: 96800, date: "Jan, 2026" },
  BH: { count: 53900, date: "Jan, 2026" },
  BS: { count: 18700, date: "Jan, 2026" },
  BA: { count: 39600, date: "Jan, 2026" },
  BL: { count: 0, date: "Jan, 2026" },
  BY: { count: 69300, date: "Jan, 2026" },
  BZ: { count: 8800, date: "Jan, 2026" },
  BM: { count: 0, date: "Jan, 2026" },
  BO: { count: 110000, date: "Jan, 2026" },
  BR: { count: 6000000, date: "Jan, 2026" },
  BB: { count: 14300, date: "Jan, 2026" },
  BN: { count: 12100, date: "Jan, 2026" },
  BT: { count: 10010, date: "Jan, 2026" },
  BV: { count: 0, date: "Jan, 2026" },
  BW: { count: 40700, date: "Jan, 2026" },
  CF: { count: 10890, date: "Jan, 2026" },
  CA: { count: 4000000, date: "Jan, 2026" },
  CC: { count: 0, date: "Jan, 2026" },
  CH: { count: 550000, date: "Jan, 2026" },
  CL: { count: 1000000, date: "Jan, 2026" },
  CN: { count: 5000000, date: "Jan, 2026" },
  CI: { count: 7480, date: "Jan, 2026" },
  CM: { count: 180000, date: "Jan, 2026" },
  CD: { count: 60500, date: "Jan, 2026" },
  CG: { count: 110000, date: "Jan, 2026" },
  CK: { count: 0, date: "Jan, 2026" },
  CO: { count: 1000000, date: "Jan, 2026" },
  KM: { count: 6050, date: "Jan, 2026" },
  CV: { count: 55000, date: "Jan, 2026" },
  CR: { count: 110000, date: "Jan, 2026" },
  CU: { count: 34100, date: "Jan, 2026" },
  CW: { count: 0, date: "Jan, 2026" },
  CX: { count: 0, date: "Jan, 2026" },
  KY: { count: 0, date: "Jan, 2026" },
  CY: { count: 49500, date: "Jan, 2026" },
  CZ: { count: 220000, date: "Jan, 2026" },
  DE: { count: 2500000, date: "Jan, 2026" },
  DJ: { count: 6820, date: "Jan, 2026" },
  DM: { count: 2200, date: "Jan, 2026" },
  DK: { count: 330000, date: "Jan, 2026" },
  DO: { count: 110000, date: "Jan, 2026" },
  DZ: { count: 330000, date: "Jan, 2026" },
  EC: { count: 440000, date: "Jan, 2026" },
  EG: { count: 1000000, date: "Jan, 2026" },
  ER: { count: 7150, date: "Jan, 2026" },
  EH: { count: 0, date: "Jan, 2026" },
  ES: { count: 2000000, date: "Jan, 2026" },
  EE: { count: 38500, date: "Jan, 2026" },
  ET: { count: 96800, date: "Jan, 2026" },
  FI: { count: 110000, date: "Jan, 2026" },
  FJ: { count: 23100, date: "Jan, 2026" },
  FK: { count: 0, date: "Jan, 2026" },
  FR: { count: 3000000, date: "Jan, 2026" },
  FO: { count: 0, date: "Jan, 2026" },
  FM: { count: 1045, date: "Jan, 2026" },
  GA: { count: 23100, date: "Jan, 2026" },
  GB: { count: 4000000, date: "Jan, 2026" },
  GE: { count: 57200, date: "Jan, 2026" },
  GG: { count: 0, date: "Jan, 2026" },
  GH: { count: 220000, date: "Jan, 2026" },
  GI: { count: 0, date: "Jan, 2026" },
  GN: { count: 24200, date: "Jan, 2026" },
  GP: { count: 0, date: "Jan, 2026" },
  GM: { count: 10890, date: "Jan, 2026" },
  GW: { count: 2200, date: "Jan, 2026" },
  GQ: { count: 3190, date: "Jan, 2026" },
  GR: { count: 220000, date: "Jan, 2026" },
  GD: { count: 3850, date: "Jan, 2026" },
  GL: { count: 0, date: "Jan, 2026" },
  GT: { count: 110000, date: "Jan, 2026" },
  GF: { count: 0, date: "Jan, 2026" },
  GU: { count: 0, date: "Jan, 2026" },
  GY: { count: 13200, date: "Jan, 2026" },
  HK: { count: 0, date: "Jan, 2026" },
  HM: { count: 0, date: "Jan, 2026" },
  HN: { count: 69300, date: "Jan, 2026" },
  HR: { count: 79200, date: "Jan, 2026" },
  HT: { count: 29700, date: "Jan, 2026" },
  HU: { count: 110000, date: "Jan, 2026" },
  ID: { count: 4000000, date: "Jan, 2026" },
  IM: { count: 0, date: "Jan, 2026" },
  IN: { count: 12000000, date: "Jan, 2026" },
  IO: { count: 0, date: "Jan, 2026" },
  IE: { count: 220000, date: "Jan, 2026" },
  IR: { count: 440000, date: "Jan, 2026" },
  IQ: { count: 110000, date: "Jan, 2026" },
  IS: { count: 22000, date: "Jan, 2026" },
  IT: { count: 2000000, date: "Jan, 2026" },
  JM: { count: 64900, date: "Jan, 2026" },
  JE: { count: 0, date: "Jan, 2026" },
  JO: { count: 110000, date: "Jan, 2026" },
  JP: { count: 330000, date: "Jan, 2026" },
  KZ: { count: 110000, date: "Jan, 2026" },
  KE: { count: 440000, date: "Jan, 2026" },
  KG: { count: 22000, date: "Jan, 2026" },
  KH: { count: 99000, date: "Jan, 2026" },
  KI: { count: 8250, date: "Jan, 2026" },
  KN: { count: 2090, date: "Jan, 2026" },
  KR: { count: 330000, date: "Jan, 2026" },
  KW: { count: 81400, date: "Jan, 2026" },
  LA: { count: 10340, date: "Jan, 2026" },
  LB: { count: 89100, date: "Jan, 2026" },
  LR: { count: 14300, date: "Jan, 2026" },
  LY: { count: 41800, date: "Jan, 2026" },
  LC: { count: 6050, date: "Jan, 2026" },
  LI: { count: 2200, date: "Jan, 2026" },
  LK: { count: 110000, date: "Jan, 2026" },
  LS: { count: 11000, date: "Jan, 2026" },
  LT: { count: 64900, date: "Jan, 2026" },
  LU: { count: 35200, date: "Jan, 2026" },
  LV: { count: 50600, date: "Jan, 2026" },
  MO: { count: 0, date: "Jan, 2026" },
  MF: { count: 0, date: "Jan, 2026" },
  MA: { count: 440000, date: "Jan, 2026" },
  MC: { count: 4840, date: "Jan, 2026" },
  MD: { count: 36300, date: "Jan, 2026" },
  MG: { count: 39600, date: "Jan, 2026" },
  MV: { count: 16500, date: "Jan, 2026" },
  MX: { count: 3000000, date: "Jan, 2026" },
  MH: { count: 825, date: "Jan, 2026" },
  MK: { count: 35200, date: "Jan, 2026" },
  ML: { count: 34100, date: "Jan, 2026" },
  MT: { count: 33000, date: "Jan, 2026" },
  MM: { count: 64900, date: "Jan, 2026" },
  ME: { count: 13200, date: "Jan, 2026" },
  MN: { count: 27500, date: "Jan, 2026" },
  MP: { count: 0, date: "Jan, 2026" },
  MZ: { count: 57200, date: "Jan, 2026" },
  MR: { count: 12100, date: "Jan, 2026" },
  MS: { count: 0, date: "Jan, 2026" },
  MQ: { count: 0, date: "Jan, 2026" },
  MU: { count: 45100, date: "Jan, 2026" },
  MW: { count: 31900, date: "Jan, 2026" },
  MY: { count: 880000, date: "Jan, 2026" },
  YT: { count: 0, date: "Jan, 2026" },
  NA: { count: 39600, date: "Jan, 2026" },
  NC: { count: 0, date: "Jan, 2026" },
  NE: { count: 13200, date: "Jan, 2026" },
  NF: { count: 0, date: "Jan, 2026" },
  NG: { count: 880000, date: "Jan, 2026" },
  NI: { count: 58300, date: "Jan, 2026" },
  NU: { count: 0, date: "Jan, 2026" },
  NL: { count: 1210000, date: "Jan, 2026" },
  NO: { count: 220000, date: "Jan, 2026" },
  NP: { count: 110000, date: "Jan, 2026" },
  NR: { count: 220, date: "Jan, 2026" },
  NZ: { count: 220000, date: "Jan, 2026" },
  OM: { count: 78100, date: "Jan, 2026" },
  PK: { count: 1000000, date: "Jan, 2026" },
  PA: { count: 106700, date: "Jan, 2026" },
  PN: { count: 0, date: "Jan, 2026" },
  PE: { count: 990000, date: "Jan, 2026" },
  PH: { count: 1650000, date: "Jan, 2026" },
  PW: { count: 605, date: "Jan, 2026" },
  PG: { count: 38500, date: "Jan, 2026" },
  PL: { count: 660000, date: "Jan, 2026" },
  PR: { count: 0, date: "Jan, 2026" },
  KP: { count: 330, date: "Jan, 2026" },
  PT: { count: 440000, date: "Jan, 2026" },
  PY: { count: 83600, date: "Jan, 2026" },
  PS: { count: 255200, date: "Jan, 2026" },
  PF: { count: 0, date: "Jan, 2026" },
  QA: { count: 110000, date: "Jan, 2026" },
  RE: { count: 0, date: "Jan, 2026" },
  RO: { count: 330000, date: "Jan, 2026" },
  RU: { count: 770000, date: "Jan, 2026" },
  RW: { count: 39600, date: "Jan, 2026" },
  SA: { count: 880000, date: "Jan, 2026" },
  SD: { count: 45100, date: "Jan, 2026" },
  SN: { count: 93500, date: "Jan, 2026" },
  SG: { count: 330000, date: "Jan, 2026" },
  GS: { count: 0, date: "Jan, 2026" },
  SH: { count: 0, date: "Jan, 2026" },
  SJ: { count: 0, date: "Jan, 2026" },
  SB: { count: 2420, date: "Jan, 2026" },
  SL: { count: 14300, date: "Jan, 2026" },
  SV: { count: 77000, date: "Jan, 2026" },
  SM: { count: 1320, date: "Jan, 2026" },
  SO: { count: 26400, date: "Jan, 2026" },
  PM: { count: 0, date: "Jan, 2026" },
  RS: { count: 110000, date: "Jan, 2026" },
  SS: { count: 9020, date: "Jan, 2026" },
  ST: { count: 990, date: "Jan, 2026" },
  SR: { count: 11000, date: "Jan, 2026" },
  SK: { count: 74800, date: "Jan, 2026" },
  SI: { count: 52800, date: "Jan, 2026" },
  SE: { count: 660000, date: "Jan, 2026" },
  SZ: { count: 11000, date: "Jan, 2026" },
  SX: { count: 0, date: "Jan, 2026" },
  SC: { count: 3740, date: "Jan, 2026" },
  SY: { count: 58300, date: "Jan, 2026" },
  TC: { count: 0, date: "Jan, 2026" },
  TD: { count: 880000, date: "Jan, 2026" },
  TG: { count: 28600, date: "Jan, 2026" },
  TH: { count: 440000, date: "Jan, 2026" },
  TJ: { count: 8140, date: "Jan, 2026" },
  TK: { count: 0, date: "Jan, 2026" },
  TM: { count: 5170, date: "Jan, 2026" },
  TL: { count: 3520, date: "Jan, 2026" },
  TO: { count: 1320, date: "Jan, 2026" },
  TT: { count: 58300, date: "Jan, 2026" },
  TN: { count: 110000, date: "Jan, 2026" },
  TR: { count: 1760000, date: "Jan, 2026" },
  TV: { count: 220, date: "Jan, 2026" },
  TW: { count: 1000000, date: "Jan, 2026" },
  TZ: { count: 110000, date: "Jan, 2026" },
  UG: { count: 110000, date: "Jan, 2026" },
  UA: { count: 330000, date: "Jan, 2026" },
  UM: { count: 0, date: "Jan, 2026" },
  UY: { count: 110000, date: "Jan, 2026" },
  US: { count: 26000000, date: "Jan, 2026" },
  UZ: { count: 68200, date: "Jan, 2026" },
  VA: { count: 385, date: "Jan, 2026" },
  VC: { count: 2970, date: "Jan, 2026" },
  VE: { count: 440000, date: "Jan, 2026" },
  VG: { count: 0, date: "Jan, 2026" },
  VI: { count: 0, date: "Jan, 2026" },
  VN: { count: 550000, date: "Jan, 2026" },
  VU: { count: 1980, date: "Jan, 2026" },
  WF: { count: 0, date: "Jan, 2026" },
  WS: { count: 1760, date: "Jan, 2026" },
  YE: { count: 49500, date: "Jan, 2026" },
  ZA: { count: 1430000, date: "Jan, 2026" },
  ZM: { count: 85800, date: "Jan, 2026" },
  ZW: { count: 91300, date: "Jan, 2026" },
};

// ── Continent color mapping ──
const CONTINENT_COLORS = {
  EU: 0x1acfbf,  // Europe — teal
  AS: 0xd9fa4f,  // Asia — lime
  NA: 0x7536f0,  // North America — purple
  SA: 0xff4200,  // South America — orange
  OC: 0x72bf44,  // Oceania — green
  AF: 0x05b9f0,  // Africa — sky blue
  AN: 0xcccccc,  // Antarctica — grey (excluded)
};

const CONTINENT_LABELS = {
  EU: "Europe",
  AS: "Asia",
  NA: "North America",
  SA: "South America",
  OC: "Oceania",
  AF: "Africa",
};

// ── Continent total audience data (in millions) ──
const CONTINENT_DATA = {
  AS: { total: "34.75M", label: "Asia" },
  EU: { total: "21.9M", label: "Europe" },
  NA: { total: "34.42M", label: "North America" },
  SA: { total: "11.92M", label: "South America" },
  AF: { total: "7.68M", label: "Africa" },
  OC: { total: "2.34M", label: "Oceania" },
};

function getContinentColor(continentCode) {
  return am5.color(CONTINENT_COLORS[continentCode] || 0xdddddd);
}

// ── Kept for backward compatibility (exported data used elsewhere) ──
const countryData = [
  { name: "United States", code: "us", count: 26000000, date: "Jan, 2026" },
  { name: "India", code: "in", count: 12000000, date: "Jan, 2026" },
  { name: "Brazil", code: "br", count: 6000000, date: "Jan, 2026" },
  { name: "China", code: "cn", count: 5000000, date: "Jan, 2026" },
];

export const data = [
  [
    "Country",
    "Customer Count",
    { role: "tooltip", type: "string", p: { html: true } }
  ],
  ...countryData.map(country => [
    country.code.toUpperCase(),
    country.count,
    `<div>${country.name}: ${formatNumber(country.count)}</div>`
  ])
];

export default function GeoChart() {
  const chartRef = useRef(null);
  const [activeContinent, setActiveContinent] = useState(null);
  // Refs to expose chart internals to the HTML legend click handler
  const chartInternalsRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // ── Root ──
    const root = am5.Root.new(chartRef.current, {
      useSafeResolution: false,
    });
    root._logo?.dispose();
    root.autoResize = true;

    // Force canvas to match container size
    const containerEl = chartRef.current;
    const resizeObserver = new ResizeObserver(() => {
      root.resize();
    });
    resizeObserver.observe(containerEl);

    // Force an initial resize after layout
    requestAnimationFrame(() => {
      root.resize();
    });

    // ── Theme ──
    const myTheme = am5.Theme.new(root);
    myTheme.rule("Tooltip").setAll({
      getFillFromSprite: false,
      getStrokeFromSprite: false,
      autoTextColor: false,
      getLabelFillFromSprite: false,
    });
    root.setThemes([am5themes_Animated.new(root), myTheme]);

    // ── Map Chart ──
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "none",
        panY: "none",
        projection: am5map.geoMercator(),
        maxWidth: am5.percent(100),
        maxHeight: am5.percent(100),
        width: am5.percent(100),
        height: am5.percent(100),
        homeZoomLevel: 1,
        wheelY: "none",
      })
    );

    // Save initial zoom level for zoom-out boundary
    let initialZoomLevel = 1;
    let initialReady = false;
    chart.events.once("boundschanged", () => {
      initialZoomLevel = chart.get("zoomLevel", 1);
      initialReady = true;
    });

    // Helper: restore map to exact initial position
    // goHome() without a custom homeGeoPoint resets to the auto-calculated center
    const restoreInitialView = () => {
      chart.goHome(0); // instant reset, no animation
      disablePan();
    };

    // Helpers: enable/disable mouse drag based on zoom state
    const enablePan = () => {
      chart.set("panX", "rotateX");
      chart.set("panY", "translateY");
    };
    const disablePan = () => {
      chart.set("panX", "none");
      chart.set("panY", "none");
    };

    // Shared state lock to prevent concurrent zooms
    let isZooming = false;

    // Track which continent is currently filtered (null = world view)
    let filteredContinent = null;

    // Build country→continent lookup from geodata
    const countryContinentMap = {};
    for (const id in am5geodata_data_countries2) {
      if (am5geodata_data_countries2.hasOwnProperty(id)) {
        countryContinentMap[id] = am5geodata_data_countries2[id].continent_code;
      }
    }

    // ── World polygon series ──
    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ", "IL"],
      })
    );

    worldSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xdddddd),
      stroke: am5.color(0xffffff),
      strokeWidth: 1,
      strokeOpacity: 1,
      templateField: "polygonSettings",
    });

    // ── Custom tooltip ──
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
      getLabelFillFromSprite: false,
    });

    tooltip.get("background").setAll({
      fill: am5.color(0xffffff),
      fillOpacity: 0.95,
      stroke: am5.color(0xff4200),
      strokeWidth: 1,
      strokeOpacity: 0.5,
      cornerRadiusTL: 12,
      cornerRadiusTR: 12,
      cornerRadiusBL: 12,
      cornerRadiusBR: 12,
      shadowColor: am5.color(0x000000),
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowOpacity: 0.12,
    });

    tooltip.label.setAll({
      fill: am5.color(0x222222),
      fontSize: 13,
      fontFamily: "Quicksand, sans-serif",
      fontWeight: "500",
    });

    worldSeries.mapPolygons.template.set("tooltip", tooltip);

    // ── Hover state ──
    worldSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xff4200),
      fillOpacity: 0.7,
      stroke: am5.color(0xffffff),
      strokeWidth: 2,
      strokeOpacity: 1,
    });

    // ── Tooltip adapter for rich content ──
    worldSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
      const id = target.dataItem?.get("id");
      // Look up continent for this country
      const countryInfo = am5geodata_data_countries2[id];
      const continentCode = countryInfo?.continent_code || "";
      const cData = CONTINENT_DATA[continentCode];
      const continentLine = cData
        ? `[fontSize:11px #888888]${cData.label}:[/] [bold fontSize:12px #333333]${cData.total}[/] [fontSize:10px #aaaaaa]total[/]`
        : "";

      if (id && AUDIENCE_DATA[id]) {
        const d = AUDIENCE_DATA[id];
        const formatted = d.count > 0 ? formatNumber(d.count) : "—";
        return `[bold fontSize:15px fontFamily:Quicksand]{name}[/]\n[fontSize:11px #666666]${d.date}[/]\n[bold fontSize:14px #ff4200]${formatted}[/] [fontSize:11px #888888]audience[/]${continentLine ? "\n" + continentLine : ""}`;
      }
      return `[bold fontSize:15px fontFamily:Quicksand]{name}[/]${continentLine ? "\n" + continentLine : "\n[fontSize:11px #999999]No data[/]"}`;
    });

    let countrySeries = null;
    let countryTooltip = null;
    let legendContainerRef = null;

    // ── Click to drill down ──
    worldSeries.mapPolygons.template.events.on("click", (ev) => {
      if (isZooming) return;

      const dataItem = ev.target.dataItem;
      const data = dataItem.dataContext;

      if (!data.map) return;

      isZooming = true;
      tooltip.hide(0);
      tooltip.set("forceHidden", true);
      worldSeries.mapPolygons.template.set("interactive", false);

      const zoomAnimation = worldSeries.zoomToDataItem(dataItem);

      dataItem.get("sprite")?.states.applyAnimate("default");

      const zoomPromise = Promise.race([
        zoomAnimation.waitForStop(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      Promise.all([
        zoomPromise,
        am5.net.load(
          "./lib/5/geodata/json/" + data.map + ".json",
          chart
        ),
      ]).then((results) => {
        const geodata = am5.JSONParser.parse(results[1].response);
        const countryFill = data.polygonSettings?.fill || am5.color(0xdddddd);

        if (countrySeries) {
          countrySeries.dispose();
          countrySeries = null;
        }
        if (countryTooltip) {
          countryTooltip.dispose();
          countryTooltip = null;
        }

        // ── Country Series & Tooltip ──
        countrySeries = chart.series.push(
          am5map.MapPolygonSeries.new(root, {
            visible: true,
          })
        );
        chart.series.moveValue(countrySeries, chart.series.indexOf(worldSeries) + 1);

        countryTooltip = am5.Tooltip.new(root, {
          getFillFromSprite: false,
          autoTextColor: false,
          getLabelFillFromSprite: false,
        });

        countryTooltip.get("background").setAll({
          fill: am5.color(0xffffff),
          fillOpacity: 0.95,
          stroke: am5.color(0xff4200),
          strokeWidth: 1,
          strokeOpacity: 0.5,
          pointerEvents: "none",
          cornerRadiusTL: 10,
          cornerRadiusTR: 10,
          cornerRadiusBL: 10,
          cornerRadiusBR: 10,
          shadowColor: am5.color(0x000000),
          shadowBlur: 8,
          shadowOffsetX: 0,
          shadowOffsetY: 3,
          shadowOpacity: 0.1,
        });

        countryTooltip.label.setAll({
          fill: am5.color(0x222222),
          fontSize: 13,
          fontFamily: "Quicksand, sans-serif",
          fontWeight: "500",
        });

        countrySeries.mapPolygons.template.setAll({
          tooltipText: "",
          interactive: true,
          fill: countryFill,
          stroke: am5.color(0xffffff),
          strokeWidth: 1,
          strokeOpacity: 1,
          tooltip: countryTooltip,
        });

        countrySeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
          const cItem = target.dataItem;
          if (cItem) {
            const ctx = cItem.dataContext;
            const regionName = ctx.name || ctx.NAME || ctx.name_en || ctx.id || "Region";
            const stateId = ctx.id || "";
            // Look up population from our dataset
            const pop = STATE_POPULATION[stateId] || ctx.pop || ctx.POP || ctx.population || null;
            if (pop) {
              const popFormatted = Number(pop).toLocaleString('en-US');
              return `[bold fontSize:14px fontFamily:Quicksand]${regionName}[/]\n[fontSize:11px #888888]Population:[/] [bold fontSize:12px #333333]${popFormatted}[/]`;
            }
            return `[bold fontSize:14px fontFamily:Quicksand]${regionName}[/]`;
          }
          return text;
        });

        countrySeries.mapPolygons.template.states.create("hover", {
          fill: am5.color(0xff4200),
          fillOpacity: 0.7,
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          strokeOpacity: 1,
        });

        countrySeries.mapPolygons.template.events.on("pointerout", () => {
          if (countryTooltip) {
            countryTooltip.hide();
          }
        });

        countrySeries.setAll({ geoJSON: geodata });

        worldSeries.mapPolygons.template.set("interactive", false);
        worldSeries.hide();

        backContainer.show();
        isZooming = false;
      }).catch((err) => {
        console.error("Map load failed", err);
        isZooming = false;
      });
    });

    // ── Build country data with continent-based coloring ──
    const amCountryData = [];
    for (const id in am5geodata_data_countries2) {
      if (am5geodata_data_countries2.hasOwnProperty(id)) {
        const country = am5geodata_data_countries2[id];
        const fillColor = getContinentColor(country.continent_code);

        if (country.maps.length) {
          amCountryData.push({
            id: id,
            map: country.maps[0],
            polygonSettings: {
              fill: fillColor,
            },
          });
        } else {
          amCountryData.push({
            id: id,
            polygonSettings: {
              fill: fillColor,
            },
          });
        }
      }
    }
    worldSeries.data.setAll(amCountryData);

    // ── Back button ──
    const containerWidth = containerEl.getBoundingClientRect().width;
    const isMobile = containerWidth < 768 || window.innerWidth < 768;
    const isSmallMobile = containerWidth < 480 || window.innerWidth < 480;

    const backContainer = chart.children.push(
      am5.Container.new(root, {
        x: am5.p100,
        centerX: am5.p100,
        dx: isMobile ? -8 : -16,
        y: isMobile ? 8 : 16,
        paddingTop: isMobile ? 6 : 10,
        paddingRight: isMobile ? 6 : 16,
        paddingBottom: isMobile ? 6 : 10,
        paddingLeft: isMobile ? 6 : 16,
        interactive: true,
        layout: root.horizontalLayout,
        cursorOverStyle: "pointer",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0.95,
          stroke: am5.color(0xff4200),
          strokeWidth: 1,
          strokeOpacity: 0.5,
          cornerRadiusTL: isMobile ? 50 : 10,
          cornerRadiusTR: isMobile ? 50 : 10,
          cornerRadiusBL: isMobile ? 50 : 10,
          cornerRadiusBR: isMobile ? 50 : 10,
          shadowColor: am5.color(0x000000),
          shadowBlur: isMobile ? 6 : 10,
          shadowOffsetX: 0,
          shadowOffsetY: isMobile ? 2 : 4,
          shadowOpacity: 0.1,
        }),
        visible: false,
      })
    );

    backContainer.children.push(
      am5.Graphics.new(root, {
        width: isMobile ? 18 : 18,
        height: isMobile ? 18 : 18,
        centerY: am5.p50,
        fill: am5.color(0xff4200),
        svgPath: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
      })
    );

    if (!isMobile) {
      backContainer.children.push(
        am5.Label.new(root, {
          text: "Back to World",
          centerY: am5.p50,
          paddingLeft: 8,
          fill: am5.color(0x333333),
          fontSize: 13,
          fontWeight: "600",
          fontFamily: "Quicksand, sans-serif",
        })
      );
    }

    backContainer.events.on("click", () => {
      // Case 1: Inside a country drill-down
      if (countrySeries) {
        if (countryTooltip) {
          countryTooltip.hide(0);
          countryTooltip.dispose();
          countryTooltip = null;
        }
        countrySeries.hide(0);

        // If we drilled down from a continent filter, go back to that filter
        if (filteredContinent) {
          const savedContinent = filteredContinent;
          // Restore world series visibility but keep filter
          worldSeries.show(0);
          // Re-apply continent filter (show only matching, hide others)
          worldSeries.mapPolygons.each((polygon) => {
            const id = polygon.dataItem?.get("id");
            const cc = countryContinentMap[id];
            if (cc === savedContinent) {
              polygon.set("forceHidden", false);
              polygon.set("interactive", true);
              polygon.states.applyAnimate("default");
            } else {
              polygon.set("forceHidden", true);
              polygon.set("interactive", false);
            }
          });
          tooltip.set("forceHidden", false);
          // Zoom back to continent view
          const view = CONTINENT_VIEW[savedContinent];
          if (view) {
            chart.zoomToGeoPoint(
              { latitude: view.lat, longitude: view.lon },
              view.zoom,
              true,
              800
            );
            enablePan();
          }
          setTimeout(() => {
            if (countrySeries) {
              countrySeries.dispose();
              countrySeries = null;
            }
            isZooming = false;
          }, 500);
        } else {
          // No continent filter — go back to full world view
          worldSeries.mapPolygons.each((polygon) => {
            polygon.set("forceHidden", false);
            polygon.set("interactive", true);
            polygon.states.applyAnimate("default");
          });
          tooltip.hide(0);
          tooltip.set("forceHidden", false);
          worldSeries.show(0);
          restoreInitialView();
          backContainer.hide();

          setTimeout(() => {
            if (countrySeries) {
              countrySeries.dispose();
              countrySeries = null;
            }
            worldSeries.mapPolygons.template.set("interactive", true);
            isZooming = false;
            filteredContinent = null;
            setActiveContinent(null);
            chart.goHome(0);
          }, 500);
        }
        return;
      }

      // Case 2: Continent filter only (no drill-down) — reset to world
      if (filteredContinent) {
        resetContinentFilter();
        return;
      }
    });

    // ── Zoom Controls (bottom-right) ──
    const btnSize = isMobile ? 24 : 32;
    const iconSize = isMobile ? 14 : 18;
    const ctrlPadding = isMobile ? 3 : 5;
    const ctrlGap = isMobile ? 2 : 3;

    const zoomContainer = chart.children.push(
      am5.Container.new(root, {
        x: am5.p100,
        centerX: am5.p100,
        y: isMobile ? 0 : am5.p100,
        centerY: isMobile ? 0 : am5.p100,
        dx: isMobile ? -8 : -16,
        dy: isMobile ? 8 : -16,
        layout: root.verticalLayout,
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0,
          strokeWidth: 0,
          strokeOpacity: 0,
        }),
        paddingTop: ctrlPadding,
        paddingBottom: ctrlPadding,
        paddingLeft: ctrlPadding,
        paddingRight: ctrlPadding,
      })
    );

    // Helper to create a zoom button
    const createZoomBtn = (svgPath, onClick) => {
      const btn = zoomContainer.children.push(
        am5.Container.new(root, {
          width: btnSize,
          height: btnSize,
          interactive: true,
          cursorOverStyle: "pointer",
          background: am5.RoundedRectangle.new(root, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
            cornerRadiusTL: isMobile ? 4 : 6,
            cornerRadiusTR: isMobile ? 4 : 6,
            cornerRadiusBL: isMobile ? 4 : 6,
            cornerRadiusBR: isMobile ? 4 : 6,
          }),
        })
      );

      btn.children.push(
        am5.Graphics.new(root, {
          width: iconSize,
          height: iconSize,
          centerX: am5.p50,
          centerY: am5.p50,
          x: am5.p50,
          y: am5.p50,
          fill: am5.color(0x555555),
          svgPath: svgPath,
        })
      );

      // Hover effect
      btn.events.on("pointerover", () => {
        btn.get("background").setAll({ fill: am5.color(0xfff0eb), fillOpacity: 1 });
        btn.children.getIndex(0).set("fill", am5.color(0xff4200));
      });
      btn.events.on("pointerout", () => {
        btn.get("background").setAll({ fill: am5.color(0xffffff), fillOpacity: 0 });
        btn.children.getIndex(0).set("fill", am5.color(0x555555));
      });

      btn.events.on("click", onClick);
      return btn;
    };

    // Zoom In (+)
    createZoomBtn(
      "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
      () => {
        const currentZoom = chart.get("zoomLevel", 1);
        chart.animate({ key: "zoomLevel", to: currentZoom * 2, duration: 300 });
        enablePan();
      }
    );

    // Home (reset to world map)
    createZoomBtn(
      "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
      () => {
        // Case 1: Inside country drill-down — reset everything
        if (countrySeries) {
          // Also clear continent filter if active
          filteredContinent = null;
          setActiveContinent(null);

          if (countryTooltip) {
            countryTooltip.hide(0);
            countryTooltip.dispose();
            countryTooltip = null;
          }
          countrySeries.hide(0);
          worldSeries.mapPolygons.each((polygon) => {
            polygon.set("forceHidden", false);
            polygon.set("interactive", true);
            polygon.states.applyAnimate("default");
          });
          tooltip.hide(0);
          tooltip.set("forceHidden", false);
          worldSeries.show(0);
          restoreInitialView();
          backContainer.hide();
          setTimeout(() => {
            if (countrySeries) {
              countrySeries.dispose();
              countrySeries = null;
            }
            worldSeries.mapPolygons.template.set("interactive", true);
            isZooming = false;
            chart.goHome(0);
          }, 500);
          return;
        }

        // Case 2: Continent filter active (no drill-down) — reset to world
        if (filteredContinent) {
          resetContinentFilter();
          return;
        }

        // Case 3: Normal world view — just restore initial position
        restoreInitialView();
      }
    );

    // Zoom Out (−)
    createZoomBtn(
      "M19 13H5v-2h14v2z",
      () => {
        const currentZoom = chart.get("zoomLevel", 1);
        const newZoom = Math.max(currentZoom / 2, initialZoomLevel);
        if (newZoom <= initialZoomLevel) {
          // If continent filter is active, keep pan enabled
          if (filteredContinent) {
            chart.goHome(0);
          } else {
            restoreInitialView();
          }
        } else {
          chart.animate({ key: "zoomLevel", to: newZoom, duration: 300 });
        }
      }
    );

    // ── Continent filter logic ──
    // Dynamic zoom based on actual container aspect ratio
    // A portrait container (mobile) can handle higher zoom; landscape (desktop) needs lower
    const cW = containerEl.clientWidth || 500;
    const cH = containerEl.clientHeight || 400;
    const aspectRatio = cW / cH; // e.g. mobile ~0.9, desktop ~2.5
    // Scale factor: at aspect 1.0 (square) use base zoom; wider = proportionally lower
    const zoomScale = Math.min(1, 1 / aspectRatio);

    const CONTINENT_VIEW = {
      EU: { lat: 54, lon: 15, zoom: 3.0 * zoomScale + 0.7 },
      AS: { lat: 30, lon: 80, zoom: 2.2 * zoomScale + 0.5 },
      NA: { lat: 48, lon: -95, zoom: 1.5 * zoomScale + 0.85 },
      SA: { lat: -18, lon: -58, zoom: 2.8 * zoomScale + 0.6 },
      AF: { lat: 2, lon: 22, zoom: 2.8 * zoomScale + 0.6 },
      OC: { lat: -28, lon: 145, zoom: 3.0 * zoomScale + 0.7 },
    };

    const filterToContinent = (continentCode) => {
      if (isZooming) return;
      if (filteredContinent === continentCode) {
        resetContinentFilter();
        return;
      }

      // ── If we're inside a country drill-down, clean it up first ──
      if (countrySeries) {
        if (countryTooltip) {
          countryTooltip.hide(0);
          countryTooltip.dispose();
          countryTooltip = null;
        }
        countrySeries.hide(0);
        countrySeries.dispose();
        countrySeries = null;

        // Restore world series so the continent filter can work on it
        worldSeries.mapPolygons.each((polygon) => {
          polygon.set("forceHidden", false);
          polygon.set("interactive", true);
          polygon.states.applyAnimate("default");
        });
        worldSeries.mapPolygons.template.set("interactive", true);
        worldSeries.show(0);
      }

      isZooming = true;
      filteredContinent = continentCode;
      setActiveContinent(continentCode);
      tooltip.hide(0);
      tooltip.set("forceHidden", true);

      // Hide non-matching countries, show matching ones
      worldSeries.mapPolygons.each((polygon) => {
        const id = polygon.dataItem?.get("id");
        const cc = countryContinentMap[id];
        if (cc === continentCode) {
          polygon.set("forceHidden", false);
          polygon.set("interactive", true);
        } else {
          polygon.set("forceHidden", true);
          polygon.set("interactive", false);
        }
      });

      // Keep the canvas legend visible so users can switch continents

      // Zoom to the continent center
      const view = CONTINENT_VIEW[continentCode];
      if (view) {
        chart.zoomToGeoPoint(
          { latitude: view.lat, longitude: view.lon },
          view.zoom,
          true,
          800
        );
        enablePan();
      }

      backContainer.show();
      setTimeout(() => {
        isZooming = false;
        // Re-enable tooltip so country names appear on hover
        tooltip.set("forceHidden", false);
        // Re-enable interactivity on matching polygons for hover/tooltip
        worldSeries.mapPolygons.each((polygon) => {
          const id = polygon.dataItem?.get("id");
          const cc = countryContinentMap[id];
          if (cc === continentCode) {
            polygon.set("interactive", true);
          }
        });
      }, 900);
    };

    const resetContinentFilter = () => {
      filteredContinent = null;
      setActiveContinent(null);
      tooltip.hide(0);
      tooltip.set("forceHidden", false);

      // Restore all polygons
      worldSeries.mapPolygons.each((polygon) => {
        polygon.set("forceHidden", false);
        polygon.set("interactive", true);
        polygon.states.applyAnimate("default");
      });

      // Re-enable country drill-down
      worldSeries.mapPolygons.template.set("interactive", true);

      // Canvas legend stays visible throughout (not hidden during filter)

      restoreInitialView();
      backContainer.hide();
      isZooming = false;
    };

    // Expose internals so React HTML legend can call filterToContinent
    chartInternalsRef.current = { filterToContinent, resetContinentFilter };

    // ── Continent Legend (inside canvas — desktop/tablet only, NEVER on mobile) ──
    if (!isMobile && window.innerWidth >= 768) {
      const legendCodes = ["AF", "AS", "EU", "NA", "OC", "SA"];
      const legendContainer = chart.children.push(
        am5.Container.new(root, {
          x: 16,
          centerX: 0,
          y: am5.p100,
          centerY: am5.p100,
          dy: -16,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 12,
          paddingRight: 14,
          layout: root.verticalLayout,
          background: am5.RoundedRectangle.new(root, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
            strokeWidth: 0,
            strokeOpacity: 0,
          }),
        })
      );
      legendContainerRef = legendContainer;

      const createLegendRow = (codes) => {
        const row = legendContainer.children.push(
          am5.Container.new(root, {
            layout: root.horizontalLayout,
            paddingTop: 2,
            paddingBottom: 2,
          })
        );
        codes.forEach((code) => {
          const item = row.children.push(
            am5.Container.new(root, {
              layout: root.horizontalLayout,
              paddingRight: 14,
              interactive: true,
              cursorOverStyle: "pointer",
              background: am5.Rectangle.new(root, {
                fill: am5.color(0xffffff),
                fillOpacity: 0,
              }),
            })
          );
          item.children.push(
            am5.RoundedRectangle.new(root, {
              width: 12,
              height: 12,
              cornerRadiusTL: 3,
              cornerRadiusTR: 3,
              cornerRadiusBL: 3,
              cornerRadiusBR: 3,
              fill: am5.color(CONTINENT_COLORS[code]),
              centerY: am5.p50,
            })
          );
          const cTotal = CONTINENT_DATA[code]?.total || "";
          const label = item.children.push(
            am5.Label.new(root, {
              text: `${CONTINENT_LABELS[code]} (${cTotal})`,
              centerY: am5.p50,
              paddingLeft: 5,
              fill: am5.color(0x444444),
              fontSize: 10,
              fontWeight: "600",
              fontFamily: "Quicksand, sans-serif",
              interactive: true,
              cursorOverStyle: "pointer",
            })
          );

          // Hover effects for legend items
          item.events.on("pointerover", () => {
            label.set("fill", am5.color(0xff4200));
          });
          item.events.on("pointerout", () => {
            label.set("fill", am5.color(0x444444));
          });

          // Click to filter
          item.events.on("click", () => {
            filterToContinent(code);
          });
        });
      };

      createLegendRow(legendCodes.slice(0, 3)); // AF, AS, EU
      createLegendRow(legendCodes.slice(3, 6)); // NA, OC, SA
    }

    // ── Appear ──
    chart.appear(1000, 100);

    return () => {
      resizeObserver.disconnect();
      root.dispose();
    };
  }, []);

  // Build HTML legend data for mobile
  const legendItems = [
    { code: "AF", color: `#${CONTINENT_COLORS.AF.toString(16).padStart(6, '0')}` },
    { code: "AS", color: `#${CONTINENT_COLORS.AS.toString(16).padStart(6, '0')}` },
    { code: "EU", color: `#${CONTINENT_COLORS.EU.toString(16).padStart(6, '0')}` },
    { code: "NA", color: `#${CONTINENT_COLORS.NA.toString(16).padStart(6, '0')}` },
    { code: "OC", color: `#${CONTINENT_COLORS.OC.toString(16).padStart(6, '0')}` },
    { code: "SA", color: `#${CONTINENT_COLORS.SA.toString(16).padStart(6, '0')}` },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <style>{`
        .geochart-wrapper {
          position: relative;
          width: 100%;
          max-width: 1512px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 16px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
        }
        .geochart-container {
          width: 100%;
          height: 300px;
          display: block;
          position: relative;
        }
        .geochart-container canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        @media (min-width: 480px) {
          .geochart-container {
            height: 380px;
          }
        }
        @media (min-width: 768px) {
          .geochart-container {
            height: 520px;
          }
          .geochart-mobile-legend {
            display: none !important;
          }
        }
        @media (min-width: 1024px) {
          .geochart-container {
            height: 650px;
          }
        }
        .geochart-mobile-legend {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px 16px;
          padding: 12px 0;
          background: #ffffff;
          border-top: 1px solid #f0f0f0;
        }
        .geochart-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 6px;
          transition: background 0.2s, transform 0.15s;
        }
        .geochart-legend-item:hover {
          background: rgba(255, 66, 0, 0.08);
          transform: scale(1.04);
        }
        .geochart-legend-item:hover .geochart-legend-label {
          color: #ff4200;
        }
        .geochart-legend-item.active {
          background: rgba(255, 66, 0, 0.12);
          box-shadow: 0 0 0 1.5px rgba(255, 66, 0, 0.3);
        }
        .geochart-legend-item.active .geochart-legend-label {
          color: #ff4200;
        }
        .geochart-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .geochart-legend-item:hover .geochart-legend-dot {
          transform: scale(1.15);
        }
        .geochart-legend-label {
          font-size: 11px;
          font-weight: 600;
          color: #444444;
          font-family: 'Quicksand', sans-serif;
          transition: color 0.2s;
        }
        @media (max-width: 374px) {
          .geochart-mobile-legend {
            gap: 5px 10px;
            padding: 10px 0;
          }
          .geochart-legend-label {
            font-size: 10px;
          }
          .geochart-legend-dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
      <div className="geochart-wrapper">
        <div
          ref={chartRef}
          id="geochart-chartdiv"
          className="geochart-container"
        />
        {/* HTML legend below map — visible only on mobile (<768px) */}
        <div className="geochart-mobile-legend">
          {legendItems.map(({ code, color }) => (
            <div
              key={code}
              className={`geochart-legend-item${activeContinent === code ? ' active' : ''}`}
              onClick={() => {
                if (chartInternalsRef.current) {
                  chartInternalsRef.current.filterToContinent(code);
                }
              }}
            >
              <span className="geochart-legend-dot" style={{ backgroundColor: color }} />
              <span className="geochart-legend-label">
                {CONTINENT_LABELS[code]} ({CONTINENT_DATA[code]?.total})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}