// Everything editable lives here. Text is taken from jerrymathew.com. Add a project by appending to `projects`.

const img = 'public/images/';

export const profile = {
	name: 'Dr. Jerry Mathew',
	title: 'Orthopaedic surgeon and public leader',
	location: 'Kattanam, Kerala, India',
	intro: 'Bridging clinical excellence in orthopaedics with a transformative vision for social development and youth empowerment in Kerala.',
	quote: 'Healing is not merely a surgical intervention; it is a restorative service to the community.',
	about: [
		'Orthopaedic surgeon and entrepreneur with more than 18,000 bone operations, known in Malayalam as “God’s gifted hands”. His COVID-era surgical protocol has received global recognition.',
		'Philosophy of care: quality healthcare is a basic human right, delivered through affordable treatment, cost-reducing technology, compassion and equity.',
		'MBBS, Rajiv Gandhi University of Health Sciences (2004) · MS Orthopaedics, Manipal (2009) · DNB (2015).',
	],
	expertise: [ 'Affordable care', 'Healthcare reform', 'Youth empowerment', 'Human rights', 'Peace outreach' ],
};

// One photo per scene (intro, person, experience, projects, contact); they crossfade as the camera cuts.
// focus = [x, y, rx, ry] of the soft oval (fractions of the image, y from top) keeping the subject and fading the
// backdrop; zoom evens out subject size. deg is only used to draw the placeholder if a file is missing.
// crop = opaque area of each cutout [ x0, y0, x1, y1, imageWidth, imageHeight ] in px, so the plain version can trim the transparent margins
export const portrait = [
	{ deg: 0, src: img + 'portrait/cutout/intro.webp', crop: [ 92, 418, 1017, 1511, 1066, 1600 ], focus: [ 0.5, 0.52, 0, 0 ], zoom: 1.3 },
	{ deg: 25, src: img + 'portrait/cutout/person.webp', crop: [ 309, 10, 1436, 1066, 1600, 1066 ], focus: [ 0.58, 0.55, 0, 0 ], zoom: 0.74 },
	{ deg: 45, src: img + 'portrait/cutout/experience.webp', crop: [ 388, 186, 1261, 1066, 1600, 1066 ], focus: [ 0.5, 0.6, 0, 0 ], zoom: 0.72 },
	{ deg: 65, src: img + 'portrait/cutout/work.webp', focus: [ 0.55, 0.6, 0, 0 ], zoom: 1, feather: 0.004 },
	{ deg: 90, src: img + 'portrait/cutout/contact.webp', crop: [ 79, 298, 1026, 1600, 1066, 1600 ], focus: [ 0.5, 0.42, 0, 0 ], zoom: 1.25 },
];

export const experience = [
	{ role: 'Director', org: 'St. Thomas Mission Hospital, Kattanam', period: '', summary: 'Runs operations and heads orthopaedics; introduced modern trauma protocols and community clinical programmes.', highlights: [] },
	{ role: 'Associate Professor of Orthopaedics', org: 'Mount Zion Institute of Medical Sciences', period: '', summary: 'Teaches and mentors future specialists.', highlights: [] },
	{ role: 'Head of Orthopaedics', org: 'Sunrise Hospital, Kochi', period: '', summary: 'Leads the robotic joint replacement and sports medicine clinics.', highlights: [] },
	{ role: 'Public service', org: 'JANANI · Kalam Foundation', period: '', summary: 'Executive Chairman of JANANI and National Director of the Dr. APJ Abdul Kalam International Foundation; Brand Ambassador for Y20 India.', highlights: [] },
];

export const expertise = {
	heading: 'Surgical expertise',
	items: [
		{ name: 'Joint replacement', text: 'Hip and knee arthroplasty to relieve arthritis pain.' },
		{ name: 'Robotic knee', text: 'Robotic-arm-assisted surgery for precise alignment and faster recovery.' },
		{ name: 'Arthroscopy & sports', text: 'Keyhole ACL/PCL reconstruction, meniscus repair and sports injuries.' },
		{ name: 'Trauma & fractures', text: 'Polytrauma, non-union fractures and internal fixation.' },
		{ name: 'Shoulder surgery', text: 'Arthroscopic rotator cuff repair, instability and replacement.' },
		{ name: 'Spine care', text: 'Herniated discs, stenosis, sciatica and spinal trauma.' },
	],
	story: 'Patient story: Maneeshkumar, unable to walk for 20 years after an accident, walked again after hip replacements and 1.5 years of treatment.',
};

export const recognitionPanel = {
	heading: 'Recognition and press',
	awards: [
		{ name: 'Ram Vilas Paswan Award', text: 'Medical leadership and emergency services during the pandemic.' },
		{ name: 'Gandhi Award of Peace', text: 'Peace interventions, youth programmes and communal unity.' },
		{ name: 'Icon of the Year Award', text: 'Presented by the Ministry of News Kerala.' },
		{ name: 'Prem Nazir Karunya Shreshta', text: 'Free medical camps and palliative outreach.' },
	],
	press: [
		{ source: 'Mathrubhumi News', title: 'Surgical Excellence during Pandemics' },
		{ source: 'Malayala Manorama', title: '20 Years after Accident, Reconstructive Marvel Walks Back to Life' },
	],
};

// media.image: add a real 16:10 photo path to show one (null shows none). figure: optional big number.
// "tech" = focus areas, "role" = your role, "year" = small label above the title. Any of live / repo / caseStudy may be null.
export const projects = [
	{
		name: 'JANANI',
		year: 'Flagship project',
		summary: 'Mobile health clinics, paediatric screenings and maternal nutrition support in marginalised communities.',
		details: [ 'JANANI is the flagship campaign led by Dr. Jerry Mathew as Executive Chairman: mobile health clinics, paediatric screenings and maternal nutrition support for marginalised communities across Kerala.' ],
		role: 'Executive Chairman',
		tech: [ 'Mobile clinics', 'Paediatric screening', 'Maternal nutrition' ],
		media: { image: null, video: null },
		live: 'https://myjanani.in',
		repo: null,
		caseStudy: null,
	},
	{
		name: 'Kalam Foundation',
		year: 'Dr. APJ Abdul Kalam International Foundation',
		summary: 'Geriatric palliative care, Green India Mission, Cup of Life, CPR training, nutrition and fitness, and the Heal in India initiative.',
		details: [ 'Programmes under the Dr. APJ Abdul Kalam International Foundation: free geriatric palliative care and outreach, the Green India Mission (large-scale tree planting), Cup of Life (menstrual hygiene camps), Jeevahita & CPR emergency training, holistic nutrition and fitness (including Sports Cities in Kuttanad), and the Heal in India Initiative.' ],
		role: 'National Director',
		tech: [ 'Palliative care', 'Public health', 'Youth & fitness' ],
		media: { image: null, video: null },
		live: null,
		repo: null,
		caseStudy: null,
	},
	{
		name: 'Kaithang and diagnostic camps',
		year: 'Medical relief',
		summary: 'Mega-camps with advanced medical scans, orthopaedic aid and free reconstructive surgery for accident victims and low-income patients.',
		details: [ 'Coordinating mega-camps with advanced medical scans, orthopaedic aid distribution, and free reconstructive surgeries for accident victims and low-income patients.' ],
		role: 'Coordinating the camps',
		tech: [ 'Medical scans', 'Orthopaedic aid', 'Reconstructive surgery' ],
		media: { image: null, video: null },
		live: null,
		repo: null,
		caseStudy: null,
	},
	{
		name: 'Operation Toofan Relief',
		year: 'Disaster response',
		summary: 'Swift medical rescue, emergency camps and relief kits for communities hit by floods and natural disasters.',
		details: [ 'Leading swift medical rescue operations, setting up emergency camps, and distributing relief kits to communities hit by floods and natural disasters.' ],
		role: 'Leading the response',
		tech: [ 'Medical rescue', 'Emergency camps', 'Relief kits' ],
		media: { image: null, video: null },
		live: null,
		repo: null,
		caseStudy: null,
	},
	{
		name: 'Manipur peace outreach',
		year: 'Special peace mission',
		summary: 'Medical supplies, community peace pacts and the relocation of 47 Kuki students to Thiruvalla, where they resumed their education.',
		details: [ 'Under the Kerala Council of Churches and the World Council of Churches, Dr. Mathew entered conflict-torn Manipur zones (including Churachandpur and Kangpokpi) to organise medical supplies, formulate community peace pacts, and safely relocate 47 Kuki students to Thiruvalla, Kerala, where they re-enrolled and continued their education.' ],
		role: 'Under the Kerala Council of Churches and World Council of Churches',
		figure: { value: '47', label: 'students re-enrolled and supported' },
		tech: [ 'Medical supplies', 'Peace pacts', 'Student relocation' ],
		media: { image: null, video: null },
		live: null,
		repo: null,
		caseStudy: null,
	},
];

// Hero stats (value counts up; text is shown as-is) and the ticker along the bottom.
export const stats = [
	{ value: 26000, suffix: '+', label: 'patients treated' },
	{ value: 18000, suffix: '+', label: 'surgeries' },
	{ value: 18, suffix: '+', label: 'years of experience' },
];

export const dashboard = {
	eyebrow: 'Clinical stats',
	heading: 'Surgical dashboard',
	items: [
		{ value: 8000, suffix: '+', label: 'Joint replacements' },
		{ value: 4500, suffix: '+', label: 'Arthroscopies' },
		{ value: 3500, suffix: '+', label: 'Trauma surgeries' },
		{ value: 120, suffix: '+', label: 'Medical camps' },
	],
};

export const treatments = {
	eyebrow: 'Orthopaedic care and specialty clinics',
	heading: 'Surgical expertise and treatments',
	items: [
		{ tag: 'Hip and knee arthroplasty', title: 'Joint reconstruction and replacement', text: 'Worn-out hip and knee joints replaced with durable implants to end arthritis pain and restore movement.' },
		{ tag: 'High precision surgery', title: 'Robotic knee replacement', text: 'Robotic-arm-assisted knee replacement for precise alignment and faster recovery.' },
		{ tag: 'Minimally invasive keyhole', title: 'Arthroscopy and sports medicine', text: 'Keyhole surgery for ACL/PCL ligament reconstruction, meniscus repair and sports injuries.' },
		{ tag: 'Emergency trauma care', title: 'Trauma and complex fracture surgery', text: 'Emergency stabilisation and reconstruction for polytrauma and complex or non-union fractures.' },
		{ tag: 'Shoulder and rotator cuff', title: 'Advanced shoulder surgery', text: 'Arthroscopic repair of rotator cuff tears and instability, plus shoulder replacement.' },
		{ tag: 'Spine and pelvis clinics', title: 'Comprehensive spine care', text: 'Treatment for herniated discs, spinal stenosis, sciatica and spinal trauma.' },
	],
};

export const service = {
	eyebrow: 'National service and social reform',
	heading: 'Public service and leadership',
	intro: 'A distinct brand of leadership that bridges healthcare management, policy reform and peace building.',
	items: [
		{ title: 'Public policy and healthcare reforms', text: 'Works with government bodies on affordable medicine schemes, digital patient records and rural clinic models.' },
		{ title: 'Nation building and youth development', text: 'Y20 India Brand Ambassador, leading "Plant a Tree against Drugs" and student leadership workshops.' },
		{ title: 'Women\'s empowerment', text: 'Works with the National Women\'s Forum (YMCA) on women\'s health, economic opportunity and rights.' },
		{ title: 'Community health administration', text: 'National Advisor to the Human Rights Protection Mission, monitoring medical access across states.' },
	],
	peace: {
		tag: 'Special peace mission',
		title: 'Manipur peace outreach',
		text: 'Led medical aid into conflict-torn Manipur, brokered community peace pacts and relocated 47 Kuki students to Kerala to continue their education.',
		stat: { value: 47, label: 'Students re-enrolled and supported' },
	},
	vision: {
		eyebrow: 'Development and policy manifesto',
		heading: 'Vision for India',
		items: [
			{ title: 'Decentralized clinical care', text: 'Digitally linked community clinics offering free primary care, screening and specialist access to rural panchayats.' },
			{ title: 'Youth empowerment and jobs', text: 'Vocational training, AI skill hubs and community-service fellowships to create local jobs for Kerala\'s youth.' },
			{ title: 'Sports cities and wellness', text: 'Multi-sport wellness corridors, starting in Kuttanad, to build athletic talent and counter drug abuse.' },
		],
	},
};

export const appointment = { label: 'Book appointment', href: 'https://wa.me/918590936816', phone: '+91 85909 36816', clinics: [ 'St. Thomas Mission Hospital, Kattanam', 'Sunrise Hospital, Kochi (robotic knee clinic)', 'Video consultation' ] };
export const secondary = { label: 'Visit the JANANI website', href: 'https://myjanani.in' };

export const contact = {
	heading: 'Book an appointment.',
	text: 'St. Thomas Mission Hospital, Kattanam (Mon to Sat, 9 AM to 1 PM) · Sunrise Hospital, Kochi (by appointment) · Video consultation.',
	email: 'drjerryortho@gmail.com',
	phone: '+91 85909 36816',
	links: [
		{ icon: 'mail', label: 'Email drjerryortho@gmail.com', href: 'mailto:drjerryortho@gmail.com' },
		{ icon: 'whatsapp', label: 'WhatsApp +91 85909 36816', href: 'https://wa.me/918590936816' },
		{ icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/dr.jerry_mathew_' },
		{ icon: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/jerry.mathew.812798' },
		{ icon: 'website', label: 'JANANI website', href: 'https://myjanani.in' },
	],
	resume: null,
};

// Scroll narrative (progress 0..1). from/to = fully visible range of the text panel; anchor = nav target.
export const scenes = [
	{ id: 'intro', label: 'Intro', from: 0, to: 0.1, anchor: 0 },
	{ id: 'about', label: 'Journey', from: 0.14, to: 0.24, anchor: 0.19 },
	{ id: 'experience', label: 'Career', from: 0.28, to: 0.38, anchor: 0.33 },
	{ id: 'dashboard', label: 'Numbers', from: 0.42, to: 0.5, anchor: 0.46 },
	{ id: 'expertise', label: 'Expertise', from: 0.54, to: 0.62, anchor: 0.58 },
	{ id: 'recognition', label: 'Recognition', from: 0.66, to: 0.74, anchor: 0.7 },
	{ id: 'transition', label: null, from: 0.78, to: 0.82, anchor: 0.8 },
	{ id: 'work', label: 'Impact', from: 0.85, to: 0.94, anchor: 0.86 },
	{ id: 'contact', label: 'Contact', from: 0.975, to: 1, anchor: 1 },
];

export const WORK_RANGE = [ 0.85, 0.94 ];
