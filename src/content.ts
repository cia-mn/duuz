/**
 * Every piece of copy, every project, every photo the site renders.
 * Edit this one file to change the site; the components take it as props.
 *
 * Sources: photos and captions from instagram.com/duuz_design (Sept 2026);
 * the living room, dark-stone kitchen and Sista USA shop are the studio's own
 * iPhone originals, Minister Tower a photographer's shoot for the studio.
 * Material brands below are the ones named in the studio's own captions.
 */
import type { ImageMetadata } from "astro";

import entryMirrorBench from "./assets/work/entry-mirror-bench.jpg";
import glassFrontWardrobe from "./assets/work/glass-front-wardrobe.jpg";
import hallwayTallCabinets from "./assets/work/hallway-tall-cabinets.jpg";
import kitchenApplianceWall from "./assets/work/kitchen-appliance-wall.jpg";
import kitchenDarkStone from "./assets/work/kitchen-dark-stone.jpg";
import kitchenDarkStoneOvenColumn from "./assets/work/kitchen-dark-stone-oven-column.jpg";
import kitchenDarkStoneRoundedEnd from "./assets/work/kitchen-dark-stone-rounded-end.jpg";
import kitchenIslandOpenShelving from "./assets/work/kitchen-island-open-shelving.jpg";
import kitchenMandalaGarden from "./assets/work/kitchen-mandala-garden.jpg";
import kitchenMarbleBacksplash from "./assets/work/kitchen-marble-backsplash.jpg";
import livingRoomBedNiche from "./assets/work/living-room-bed-niche.jpg";
import livingRoomGlassVitrine from "./assets/work/living-room-glass-vitrine.jpg";
import livingRoomSlatPartition from "./assets/work/living-room-slat-partition.jpg";
import livingRoomWardrobeConsole from "./assets/work/living-room-wardrobe-console.jpg";
import livingRoomWindowDesk from "./assets/work/living-room-window-desk.jpg";
import livingTvShelving from "./assets/work/living-tv-shelving.jpg";
import ministerTowerKitchen from "./assets/work/minister-tower-kitchen.jpg";
import ministerTowerNiche from "./assets/work/minister-tower-niche.jpg";
import ministerTowerRoundedKitchen from "./assets/work/minister-tower-rounded-kitchen.jpg";
import ministerTowerWallUnit from "./assets/work/minister-tower-wall-unit.jpg";
import ministerTowerWardrobeShelving from "./assets/work/minister-tower-wardrobe-shelving.jpg";
import shopArchedVitrines from "./assets/work/shop-arched-vitrines.jpg";
import shopDisplayCounter from "./assets/work/shop-display-counter.jpg";
import shopWalkthrough from "./assets/work/shop-walkthrough.jpg";
import tvWallFloatingUnit from "./assets/work/tv-wall-floating-unit.jpg";
import vanityStoneBasin from "./assets/work/vanity-stone-basin.jpg";
import wardrobePremiumMatte from "./assets/work/wardrobe-premium-matte.jpg";
import wardrobeRoundHandles from "./assets/work/wardrobe-round-handles.jpg";
// Reels, re-encoded muted (Instagram music is not licensed off-platform).
import kitchenIslandOpenShelvingClip from "./assets/work/kitchen-island-open-shelving.mp4";
import tvWallFloatingUnitClip from "./assets/work/tv-wall-floating-unit.mp4";
import wardrobeRoundHandlesClip from "./assets/work/wardrobe-round-handles.mp4";
// Studio footage: iPhone HDR tone-mapped to SDR, muted; the poster is each clip's first frame.
import shopArchedVitrinesClip from "./assets/work/shop-arched-vitrines.mp4";
import shopDisplayCounterClip from "./assets/work/shop-display-counter.mp4";
import shopWalkthroughClip from "./assets/work/shop-walkthrough.mp4";
// The services stage's model: a SketchUp export run through `npm run model` (see README).
import vildwertModel from "./assets/models/vildwert.glb?url";

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

export interface Step {
	icon: string;
	title: string;
	text: string;
}

export interface Showcase {
	/** URL of the .glb that `npm run model` wrote. */
	model: string;
	eyebrow: string;
	/** What the canvas shows, for screen readers. */
	label: string;
	hint: string;
	loading: string;
	/** Button that loads the model when the browser asks to save data. */
	load: string;
	/** Read after a step's title on its button, for screen readers. */
	show: string;
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
	title: "DuuZ design — захиалгат гал тогоо, шүүгээ, ТВ хана · Улаанбаатар",
	/** Small-caps line above the hero title. */
	eyebrow: "Улаанбаатар · Захиалгат тавилга",
	description:
		"Улаанбаатар хотод захиалгат гал тогоо, хувцасны шүүгээ, ТВ хана, үүдний тавилга зохиомжилж үйлдвэрлэдэг. Euromat, Kronospan, Blum материал.",
	tagline:
		"Захиалгат гал тогоо, шүүгээ, ТВ хана. Хэмжилтээс суурилуулалт хүртэл бүх зүйлийг нэг дор.",
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
	// From the root, so the links also lead home from the 404 page.
	nav: [
		{ label: "Ажлууд", href: "/#works" },
		{ label: "Үйлчилгээ", href: "/#services" },
		{ label: "Хийсэн ажлууд", href: "/#timeline" },
		{ label: "Холбоо барих", href: "/#contact" },
	],
};

/**
 * Masonry gallery. CSS columns fill top-down and balance by height, so the
 * order decides which tiles end up side by side. This one evens out the
 * columns and keeps the clips out of each other's rows at four columns and
 * staggered at three and two; re-check the layout when adding a tile.
 */
export const works: Work[] = [
	{ image: kitchenMandalaGarden, title: "Mandala Garden — гал тогоо" },
	{ image: kitchenMarbleBacksplash, title: "Гантиг ар хана, матт фасад" },
	{ image: livingRoomSlatPartition, title: "Зочны өрөө — LED рейк хаалт" },
	{ image: tvWallFloatingUnit, title: "Агаарт хөвөх ТВ тавиур", video: tvWallFloatingUnitClip },
	{ image: livingRoomGlassVitrine, title: "Хар хүрээтэй шилэн витрин" },
	{ image: kitchenDarkStone, title: "Бараан чулуун хээтэй гал тогоо" },
	{ image: shopDisplayCounter, title: "Шилэн тавцантай лангуу", video: shopDisplayCounterClip },
	{ image: wardrobePremiumMatte, title: "Premium Matte шүүгээний хана" },
	{ image: kitchenDarkStoneRoundedEnd, title: "Дугуйруулсан төгсгөл, чулуун тавцан" },
	{ image: ministerTowerRoundedKitchen, title: "Anti-fingerprint фасадтай гал тогоо" },
	{ image: entryMirrorBench, title: "Үүдний толь, сандал" },
	{ image: ministerTowerWardrobeShelving, title: "Хувцасны шүүгээ, LED задгай тавиур" },
	{ image: livingRoomWindowDesk, title: "Ажлын ширээ, цонхны тавцан" },
	{ image: ministerTowerKitchen, title: "Minister Tower — гал тогоо, зочны өрөө" },
	{ image: hallwayTallCabinets, title: "Хөргөгчтэй өндөр шүүгээ" },
	{ image: ministerTowerWallUnit, title: "Native Steel хавтантай ханын шүүгээ" },
	{ image: glassFrontWardrobe, title: "Шилэн хаалгатай гардероб" },
	{ image: shopWalkthrough, title: "Sista USA shop — дэлгүүрийн тавилга", video: shopWalkthroughClip },
	{ image: livingTvShelving, title: "Зочны өрөөний ТВ хана" },
	{ image: kitchenIslandOpenShelving, title: "Арал бүхий гал тогоо", video: kitchenIslandOpenShelvingClip },
	{ image: vanityStoneBasin, title: "Угаалтуурын чулуун тавцан" },
	{ image: shopArchedVitrines, title: "Нуман оройтой шилэн витрин", video: shopArchedVitrinesClip },
	{ image: kitchenApplianceWall, title: "Суурилуулсан техник, модон фасад" },
	{ image: livingRoomWardrobeConsole, title: "Шүүгээ, хөвөх консол ширээ" },
	{ image: wardrobeRoundHandles, title: "Дугуй бариултай шүүгээ", video: wardrobeRoundHandlesClip },
];

/** What happens after an order, in the order it happens. */
export const steps: Step[] = [
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

/**
 * The 3D stage beside the steps: one project's SketchUp model shown measured,
 * drawn in glowing edges, built, and finished — one phase for each step.
 */
export const showcase: Showcase = {
	model: vildwertModel,
	eyebrow: "3D загвар",
	label: "Гал тогооны 3D загвар: хэмжилт, зураг төсөл, үйлдвэрлэл, суурилуулалт",
	hint: "Чирж эргүүлнэ үү",
	loading: "Ачаалж байна",
	load: "3D загварыг үзэх",
	show: "3D загвар дээр харах",
};

export const categories: Category[] = [
	{ key: "kitchen", label: "Гал тогоо", icon: "material-symbols:countertops-rounded" },
	{ key: "wardrobe", label: "Шүүгээ", icon: "material-symbols:checkroom-rounded" },
	{ key: "tv-wall", label: "ТВ хана", icon: "material-symbols:tv-gen-rounded" },
	{ key: "interior", label: "Дотоод засал", icon: "material-symbols:wall-lamp-rounded" },
	{ key: "commercial", label: "Худалдаа, үйлчилгээ", icon: "material-symbols:storefront-rounded" },
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
	{
		title: "Олон үйлдэлт зочны өрөө",
		date: "2026.02",
		category: "interior",
		subtitle: "Орон сууцны иж бүрэн тавилга",
		description:
			"Нэг өрөөнд унтах, ажиллах, хувцас хадгалах хэсгийг багтааж хийсэн ажил. Орны хэсгийг LED шугамтай рейк хаалтаар тусгаарлаж, цайвар саарал фасадыг бараан саарал элементүүдтэй хослуулсан.",
		images: [livingRoomSlatPartition, livingRoomWardrobeConsole, livingRoomWindowDesk, livingRoomGlassVitrine, livingRoomBedNiche],
		highlights: [
			"Таазны өндрөөр хийсэн шүүгээ, хар хүрээтэй шилэн витрин",
			"LED шугамтай рейк хаалт, хөвөх тавиур, консол ширээ",
			"Гэрэлтэй тавиуртай ажлын ширээ, орны дээд шүүгээ",
			"Цонхны тавцан, радиаторын хаалт, шургуулга",
		],
		tags: ["Матт фасад", "LED гэрэлтүүлэг", "Шилэн витрин", "Рейк хаалт"],
		icon: "material-symbols:weekend-rounded",
	},
	{
		title: "Бараан чулуун хээтэй гал тогоо",
		date: "2026.02",
		category: "kitchen",
		subtitle: "Орон сууцны гал тогоо",
		description:
			"Гэрээ бүрэн шинэчилсэн айлын гал тогоо. Цагаан матт фасадыг бараан чулуун хээтэй тавцан, ар ханатай хослуулж, тавцангийн төгсгөлийг дугуйруулж хийсэн.",
		images: [kitchenDarkStone, kitchenDarkStoneRoundedEnd, kitchenDarkStoneOvenColumn],
		highlights: [
			"Дугуйруулсан төгсгөлийн шүүгээ, тавцан",
			"Бараан чулуун хээтэй тавцан, ар хана",
			"Зуух, богино долгионы зуух суурилуулсан өндөр шүүгээ",
			"Таазанд тулсан дээд шүүгээ, доод талын LED гэрэл",
		],
		tags: ["Матт фасад", "Чулуун хээтэй тавцан", "LED гэрэлтүүлэг"],
		links: [{ label: "Facebook дээр үзэх", url: "https://www.facebook.com/reel/1085146147218328/", icon: "fa6-brands:facebook" }],
	},
	{
		title: "Minister Tower — орон сууцны иж бүрэн тавилга",
		date: "2025.12",
		category: "interior",
		subtitle: "Гал тогоо, зочны өрөө, хувцасны шүүгээ",
		description:
			"Дугуйрсан хийцлэл нь орон зайг илүү уужим, аюулгүй, орчин үеийн харагдуулдаг. Anti-fingerprint технологитой тавилгын нүүр нь хурууны хээ, толбыг бага татаж, өдөр тутмын арчилгааг илүү хялбар болгоно.",
		images: [ministerTowerKitchen, ministerTowerRoundedKitchen, ministerTowerWallUnit, ministerTowerNiche, ministerTowerWardrobeShelving],
		highlights: [
			"Дугуйруулсан арал, тавцангийн төгсгөл",
			"Rocko Tiles Native Steel хавтантай, LED гэрэлтэй тавиур",
			"Хар шилэн хаалгатай витрин шүүгээ",
			"Урт босоо бариултай хувцасны шүүгээ, LED гэрэлтэй задгай тавиур",
		],
		tags: ["Euromat", "PET-MDF Cream vanilla 6383SM", "Rocko Tiles R120 Native Steel", "Anti-fingerprint"],
		links: [
			{
				label: "Facebook дээр үзэх",
				url: "https://www.facebook.com/duuzdesigntavilga/posts/pfbid0DWT9w9kNcqwqvpVkn7WPsBAwKqg7n2fv7Tqy3biXskh6qXtEBh1WVB416yVbqec1l",
				icon: "fa6-brands:facebook",
			},
		],
		featured: true,
	},
	{
		title: "Sista USA shop — дэлгүүрийн тавилга",
		date: "2025.06",
		category: "commercial",
		subtitle: "Худалдааны төвийн дэлгүүр",
		description:
			"Rose gold металл хүрээтэй LED тавиур, хувцасны өлгүүр, нуман оройтой шилэн витрин, шилэн тавцантай лангууг нэг хэв маягаар хийж эзэндээ хүлээлгэн өглөө.",
		images: [shopWalkthrough, shopArchedVitrines, shopDisplayCounter],
		highlights: [
			"LED гэрэлтэй тавиур, rose gold металл хүрээ",
			"Хананы дагуух хувцасны өлгүүр, тавиур",
			"Нуман оройтой, арын гэрэлтэй шилэн витрин",
			"Шилэн тавцантай лангуу, цоожтой доод шүүгээ",
		],
		tags: ["Худалдааны тавилга", "LED гэрэлтүүлэг", "Шилэн витрин", "Металл хүрээ"],
		links: [{ label: "Facebook дээр үзэх", url: "https://www.facebook.com/share/p/1GrUXMqyME/", icon: "fa6-brands:facebook" }],
	},
];
