/**
 * Every piece of copy, every project, every photo the site renders.
 * Edit this one file to change the site; the components take it as props.
 *
 * Sources: photos and captions from instagram.com/duuz_design (Sept 2026).
 * Material brands below are the ones named in the studio's own captions.
 */
import type { ImageMetadata } from "astro";

import entryMirrorBench from "./assets/work/entry-mirror-bench.jpg";
import glassFrontWardrobe from "./assets/work/glass-front-wardrobe.jpg";
import hallwayTallCabinets from "./assets/work/hallway-tall-cabinets.jpg";
import kitchenApplianceWall from "./assets/work/kitchen-appliance-wall.jpg";
import kitchenIslandOpenShelving from "./assets/work/kitchen-island-open-shelving.jpg";
import kitchenMandalaGarden from "./assets/work/kitchen-mandala-garden.jpg";
import kitchenMarbleBacksplash from "./assets/work/kitchen-marble-backsplash.jpg";
import livingTvShelving from "./assets/work/living-tv-shelving.jpg";
import tvWallFloatingUnit from "./assets/work/tv-wall-floating-unit.jpg";
import vanityStoneBasin from "./assets/work/vanity-stone-basin.jpg";
import wardrobePremiumMatte from "./assets/work/wardrobe-premium-matte.jpg";
import wardrobeRoundHandles from "./assets/work/wardrobe-round-handles.jpg";
// Reels, re-encoded muted (Instagram music is not licensed off-platform).
import kitchenIslandOpenShelvingClip from "./assets/work/kitchen-island-open-shelving.mp4";
import tvWallFloatingUnitClip from "./assets/work/tv-wall-floating-unit.mp4";
import wardrobeRoundHandlesClip from "./assets/work/wardrobe-round-handles.mp4";

export interface Work {
	image: ImageMetadata;
	title: string;
	/** Short clip that plays over the photo in the grid and with controls in the lightbox. */
	video?: string;
}

export interface Category {
	key: string;
	label: string;
	icon: string;
}

export interface TimelineItem {
	title: string;
	date: string;
	category?: string;
	subtitle?: string;
	location?: string;
	description?: string;
	/** Photos of the finished job — reuse the imports the gallery already has. */
	images?: ImageMetadata[];
	highlights?: string[];
	tags?: string[];
	links?: { label: string; url: string; icon?: string }[];
	icon?: string;
	featured?: boolean;
}

const INSTAGRAM = "https://www.instagram.com/duuz_design/";
const FACEBOOK = "https://www.facebook.com/duuzdesigntavilga";

export const site = {
	name: "DuuZ design",
	owner: "Du Ulzii",
	title: "DuuZ design — гал тогоо, шүүгээ, ТВ хана",
	/** Small-caps line above the hero title. */
	eyebrow: "Улаанбаатар · Захиалгат тавилга",
	description:
		"Улаанбаатар хотод захиалгат гал тогоо, хувцасны шүүгээ, ТВ хана, үүдний тавилга зохиомжилж үйлдвэрлэдэг. Euromat, Kronospan, Blum материал.",
	tagline:
		"Захиалгат гал тогоо, шүүгээ, ТВ хана. Хэмжилтээс суурилуулалт хүртэл бүх зүйлийг нэг багаар.",
	servicesIntro:
		"Хэмжилт, зураг төсөл, үйлдвэрлэл, суурилуулалт — бүгдийг нь бид хийж өгнө. Та зөвхөн хүссэнээ хэлэхэд л хангалттай.",
	timelineIntro: "Сүүлд эзэндээ хүлээлгэн өгсөн ажлууд, он сар дарааллаар.",
	about:
		"Гал тогоо, хувцасны шүүгээ, ТВ хана, үүдний тавилгыг орон зайд тань тааруулан зохиомжилж, Европын чанартай материалаар үйлдвэрлэж, суурилуулж өгдөг. Хэмжилт, зураг төсөл үнэ төлбөргүй.",
	phone: "9411-3392",
	phoneHref: "tel:+97694113392",
	city: "Улаанбаатар",
	instagram: INSTAGRAM,
	facebook: FACEBOOK,
	nav: [
		{ label: "Ажлууд", href: "#works" },
		{ label: "Үйлчилгээ", href: "#services" },
		{ label: "Хийсэн ажлууд", href: "#timeline" },
		{ label: "Холбоо барих", href: "#contact" },
	],
};

/**
 * Masonry gallery. CSS columns fill top-down, so the three clips sit at
 * positions 3 / 6 / 10 to land in different columns on a wide screen.
 */
export const works: Work[] = [
	{ image: kitchenMandalaGarden, title: "Mandala Garden — гал тогоо" },
	{ image: kitchenMarbleBacksplash, title: "Гантиг ар хана, матт фасад" },
	{ image: kitchenIslandOpenShelving, title: "Арал бүхий гал тогоо", video: kitchenIslandOpenShelvingClip },
	{ image: kitchenApplianceWall, title: "Суурилуулсан техник, модон фасад" },
	{ image: vanityStoneBasin, title: "Угаалтуурын чулуун тавцан" },
	{ image: tvWallFloatingUnit, title: "Агаарт хөвөх ТВ тавиур", video: tvWallFloatingUnitClip },
	{ image: wardrobePremiumMatte, title: "Premium Matte шүүгээний хана" },
	{ image: hallwayTallCabinets, title: "Хөргөгчтэй өндөр шүүгээ" },
	{ image: entryMirrorBench, title: "Үүдний толь, сандал" },
	{ image: wardrobeRoundHandles, title: "Дугуй бариултай шүүгээ", video: wardrobeRoundHandlesClip },
	{ image: glassFrontWardrobe, title: "Шилэн хаалгатай гардероб" },
	{ image: livingTvShelving, title: "Зочны өрөөний ТВ хана" },
];

/** What happens after an order, in the order it happens. */
export const steps = [
	{
		icon: "material-symbols:straighten-rounded",
		title: "Хэмжилт",
		text: "Байран дээр тань очиж үнэ төлбөргүй хэмжинэ, орон зайг тань судална.",
	},
	{
		icon: "material-symbols:view-in-ar-rounded",
		title: "Зураг төсөл",
		text: "3D зураг гаргаж, өнгө, материал, механизмыг тантай хамт сонгоно.",
	},
	{
		icon: "material-symbols:precision-manufacturing-rounded",
		title: "Үйлдвэрлэл",
		text: "Euromat, Kronospan хавтан, Blum механизмаар өөрийн цехэд үйлдвэрлэнэ.",
	},
	{
		icon: "material-symbols:home-repair-service-rounded",
		title: "Суурилуулалт",
		text: "Хүргэж, суурилуулж, цэвэрлээд бэлэн болсон тавилгыг хүлээлгэн өгнө.",
	},
];

export const categories: Category[] = [
	{ key: "kitchen", label: "Гал тогоо", icon: "material-symbols:countertops-rounded" },
	{ key: "wardrobe", label: "Шүүгээ", icon: "material-symbols:checkroom-rounded" },
	{ key: "tv-wall", label: "ТВ хана", icon: "material-symbols:tv-gen-rounded" },
	{ key: "interior", label: "Дотоод засал", icon: "material-symbols:wall-lamp-rounded" },
];

/** Newest first — the page renders this order as-is. */
export const timeline: TimelineItem[] = [
	{
		title: "Mandala Garden — захиалгат гал тогоо",
		date: "2026.09",
		category: "kitchen",
		subtitle: "Орон сууцны гал тогоо",
		location: "Яармаг, Улаанбаатар",
		description:
			"Premium Matte цувралын beige өнгийг SCAP брэндийн хээ багатай модны өнгөтэй хослуулж, Fundermax Thasos тавцан тавьж эзэндээ хүлээлгэн өглөө.",
		images: [kitchenMandalaGarden, kitchenMarbleBacksplash, kitchenApplianceWall],
		highlights: [
			"Гантиг хээтэй ар хана, нуусан гэрэлтүүлэгтэй тавиур",
			"Суурилуулсан сорогч, хөргөгч, зуух",
			"Blum механизм — чимээгүй хаалт",
		],
		tags: ["Euromat", "Kronospan Mongolia", "Higold Mongolia", "Blum", "SCAP", "Fundermax"],
		links: [{ label: "Instagram дээр үзэх", url: "https://www.instagram.com/p/DdZIx_tCYVd/", icon: "fa6-brands:instagram" }],
		featured: true,
	},
	{
		title: "Угаалтуурын чулуун тавцан",
		date: "2026.08",
		category: "interior",
		subtitle: "Нийтийн ариун цэврийн өрөө",
		description:
			"Хоёр угаалтуур багтаасан чулуун тавцан, ургамлын суулгац, модон хананы бүрхүүл, дээврийн гэрэлтэй орон зай.",
		images: [vanityStoneBasin],
		highlights: ["Чулуун тавцан, суулгасан угаалтуур", "Модон хананы бүрхүүл, нуусан гэрэл"],
		tags: ["Чулуун тавцан", "Модон бүрхүүл"],
		icon: "material-symbols:faucet-rounded",
	},
	{
		title: "Premium Matte — шүүгээ ба ТВ хана",
		date: "2026.07",
		category: "wardrobe",
		subtitle: "Орон сууцны иж бүрэн тавилга",
		description:
			"Premium Matte цувралын beige өнгүүд орон зайд чимээгүй тансаглалыг бий болгоно. Сайжруулсан матт гадаргуу гэрлийн тусгалыг шингээж, зөөлөн мэдрэмж өгдөг.",
		images: [wardrobePremiumMatte, hallwayTallCabinets, tvWallFloatingUnit, entryMirrorBench],
		highlights: [
			"Таазны өндрөөр хийсэн шүүгээний хана",
			"Хөргөгч багтаасан өндөр шүүгээ, гүехэн тавиур",
			"Хөвөх ТВ тавиур, LED нуусан гэрэл",
			"Үүдний толь, суух сандал",
		],
		tags: ["Euromat", "Kronospan Mongolia", "Blum", "Premium Matte"],
		links: [
			{ label: "Instagram дээр үзэх", url: "https://www.instagram.com/p/DafxFbgiZfp/", icon: "fa6-brands:instagram" },
			{ label: "ТВ хана — reel", url: "https://www.instagram.com/reel/Da7zoUupfkt/", icon: "fa6-brands:instagram" },
		],
		featured: true,
	},
	{
		title: "Орон сууцны иж бүрэн тавилга",
		date: "2026.06",
		category: "interior",
		subtitle: "Гал тогоо, гардероб, зочны өрөө",
		description:
			"Нэг байранд гал тогоо, шилэн хаалгатай гардероб, зочны өрөөний ТВ ханыг нэг өнгөний системд оруулж хийсэн ажил.",
		images: [kitchenIslandOpenShelving, glassFrontWardrobe, livingTvShelving],
		highlights: [
			"Арал бүхий гал тогоо, нээлттэй модон тавиур",
			"Хар хүрээтэй шилэн хаалгатай гардероб",
			"Таазны шугаман гэрэлтүүлэг",
		],
		tags: ["Гал тогоо", "Гардероб", "ТВ хана"],
		links: [{ label: "Instagram дээр үзэх", url: "https://www.instagram.com/reel/DZDEPZCpv3k/", icon: "fa6-brands:instagram" }],
	},
	{
		title: "Дугуй бариултай хувцасны шүүгээ",
		date: "2026.05",
		category: "wardrobe",
		subtitle: "Унтлагын өрөө",
		description: "Таазанд нийлүүлж хийсэн beige шүүгээ, гүн өнгийн нээлттэй тавиур, дугуй бариул.",
		images: [wardrobeRoundHandles],
		tags: ["Хувцасны шүүгээ"],
		links: [{ label: "Instagram дээр үзэх", url: "https://www.instagram.com/reel/DYR-YDhpBIk/", icon: "fa6-brands:instagram" }],
		icon: "material-symbols:shelves-rounded",
	},
];
