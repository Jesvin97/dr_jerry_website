import { profile, portrait, experience, projects, contact, scenes, stats, appointment, secondary, expertise, recognitionPanel, dashboard, reach, WORK_RANGE } from './content.js';
import { panelAlpha, clamp01 } from './timeline.js';
import { portraitCanvas, projectCanvas } from './placeholders.js';

const h = ( tag, attrs = {}, ...kids ) => {

	const e = document.createElement( tag );
	for ( const [ k, v ] of Object.entries( attrs ) ) {

		if ( v == null || v === false ) continue;
		if ( k === 'class' ) e.className = v;
		else if ( k.startsWith( 'on' ) ) e.addEventListener( k.slice( 2 ), v );
		else e.setAttribute( k, v === true ? '' : v );

	}
	for ( const c of kids.flat( Infinity ) ) if ( c != null && c !== false ) e.append( c );
	return e;

};

// <img> that swaps to a drawn placeholder if the file is missing.
const safeImg = ( src, fallbackCanvas, alt ) => h( 'img', {
	src, alt, loading: 'lazy', decoding: 'async',
	onerror: e => { e.target.onerror = null; e.target.src = fallbackCanvas().toDataURL(); },
} );

const linkList = ( items, cls = 'links' ) => {

	const real = items.filter( i => i.href );
	return real.length ? h( 'ul', { class: cls }, real.map( i => h( 'li', {}, h( 'a', { href: i.href, target: '_blank', rel: 'noopener' }, i.label ) ) ) ) : null;

};

const ICONS = {
	mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
	whatsapp: '<path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 9.5c.5 2 2.5 4 5 5l1.5-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2z"/>',
	instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
	facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/>',
	website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
	file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
};
const iconLinks = items => h( 'ul', { class: 'icons' }, items.filter( i => i.href ).map( i => {

	const a = h( 'a', { class: 'icon', href: i.href, target: i.href.startsWith( 'mailto' ) ? null : '_blank', rel: 'noopener', 'aria-label': i.label, title: i.label } );
	a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ i.icon ] ?? ICONS.website}</svg>`; // static strings above only
	return h( 'li', {}, a );

} ) );

const projectLinks = p => linkList( [
	{ label: 'Live site', href: p.live }, { label: 'Source', href: p.repo }, { label: 'Full story', href: p.caseStudy },
] );

export function buildStory( story, { fx, onDialog } ) {

	const sceneById = Object.fromEntries( scenes.map( s => [ s.id, s ] ) );
	const sec = ( id, cls, ...kids ) => h( 'section', { id, class: `panel ${cls}`, 'aria-labelledby': `${id}-h` }, h( 'div', { class: 'copy' }, kids ) );

	const dialog = h( 'dialog', { id: 'case', 'data-lenis-prevent': true, 'aria-labelledby': 'case-h' } );
	dialog.addEventListener( 'close', () => onDialog( false ) );
	const openCase = p => {

		dialog.replaceChildren( ...[
			h( 'button', { class: 'close', onclick: () => dialog.close(), 'aria-label': 'Close' }, '✕' ),
			h( 'p', { class: 'eyebrow' }, p.year ),
			h( 'h3', { id: 'case-h' }, p.name ),
			p.media.image && h( 'div', { class: 'media' }, safeImg( p.media.image, () => projectCanvas( projects.indexOf( p ), p.name ), `${p.name} photo` ) ),
			p.details.map( t => h( 'p', {}, t ) ),
			h( 'dl', {}, h( 'dt', {}, 'Role' ), h( 'dd', {}, p.role ), h( 'dt', {}, 'Focus' ), h( 'dd', {}, p.tech.join( ', ' ) ) ),
			projectLinks( p )
		].flat().filter( Boolean ) ); // the DOM method would print null and arrays as text
		onDialog( true );
		dialog.showModal();

	};

	const projectEls = projects.map( ( p, i ) => h( 'article', { class: 'project', 'aria-labelledby': `p${i}-h` },
		! fx && p.media.image && h( 'div', { class: 'media' }, safeImg( p.media.image, () => projectCanvas( i, p.name ), `${p.name} photo` ) ),
		h( 'div', { class: 'project-head' },
			h( 'p', { class: 'eyebrow' }, p.year ),
			h( 'h3', { id: `p${i}-h` }, p.name ),
			h( 'p', { class: 'role' }, p.role ),
			p.figure && h( 'p', { class: 'figure' }, h( 'strong', {}, p.figure.value ), h( 'span', {}, p.figure.label ) ) ),
		h( 'div', { class: 'project-body' },
			h( 'p', {}, p.summary ),
			h( 'p', { class: 'tech' }, p.tech.join( ' · ' ) ),
			h( 'div', { class: 'actions' }, h( 'button', { onclick: () => openCase( p ) }, 'Read more' ), projectLinks( p ) ) )
	) );

	const heroImg = ( i, alt ) => safeImg( portrait[ i ].src, () => portraitCanvas( portrait[ i ].deg ), alt );
	const panels = [
		sec( 'intro', 'panel--left',
			h( 'h1', { id: 'intro-h' }, profile.name ),
			h( 'p', { class: 'lede' }, profile.title ),
			h( 'p', {}, profile.intro ),
			h( 'ul', { class: 'stats' }, stats.map( s => h( 'li', {},
				h( 'strong', s.value ? { 'data-to': s.value, 'data-suffix': s.suffix ?? '' } : {}, s.text ?? `0${s.suffix ?? ''}` ),
				h( 'span', {}, s.label ) ) ) ),
			h( 'p', { class: 'ctas' }, h( 'a', { class: 'cta big', href: appointment.href, target: '_blank', rel: 'noopener' }, appointment.label ), h( 'a', { class: 'text-link', href: secondary.href, target: '_blank', rel: 'noopener' }, secondary.label + ' ↗' ) ),
			null,
			null ),
		sec( 'about', 'panel--right',
			h( 'p', { class: 'eyebrow' }, 'About' ),
			h( 'h2', { id: 'about-h' }, 'Life and journey' ),
			h( 'blockquote', {}, profile.quote ),
			profile.about.map( t => h( 'p', {}, t ) ),
			h( 'ul', { class: 'tags' }, profile.expertise.map( t => h( 'li', {}, t ) ) ),
			null ),
		sec( 'experience', 'panel--right',
			h( 'p', { class: 'eyebrow' }, 'Experience' ),
			h( 'h2', { id: 'experience-h' }, 'Medical career' ),
			h( 'ol', { class: 'xp' }, experience.map( x => h( 'li', {},
				x.period && h( 'p', { class: 'period' }, x.period ),
				h( 'h3', {}, `${x.role}, ${x.org}` ),
				h( 'p', {}, x.summary ),
				x.highlights.length ? h( 'ul', {}, x.highlights.map( t => h( 'li', {}, t ) ) ) : null ) ) ) ),
		sec( 'dashboard', 'panel--left',
			h( 'p', { class: 'eyebrow' }, dashboard.eyebrow ),
			h( 'h2', { id: 'dashboard-h' }, dashboard.heading ),
			h( 'ul', { class: 'dash' }, dashboard.items.map( s => h( 'li', {},
				h( 'strong', { 'data-to': s.value, 'data-suffix': s.suffix ?? '' }, `0${s.suffix ?? ''}` ),
				h( 'span', {}, s.label ) ) ) ) ),
		sec( 'expertise', 'panel--right',
			h( 'p', { class: 'eyebrow' }, 'Expertise' ),
			h( 'h2', { id: 'expertise-h' }, expertise.heading ),
			h( 'ul', { class: 'cards' }, expertise.items.map( i => h( 'li', {}, h( 'strong', {}, i.name ), h( 'span', {}, i.text ) ) ) ),
			h( 'p', { class: 'story' }, expertise.story ),
			h( 'p', { class: 'ctas' }, h( 'a', { class: 'text-link', href: 'treatments.html' }, 'All treatments and clinics →' ) ) ),
		sec( 'recognition', 'panel--right',
			h( 'p', { class: 'eyebrow' }, 'Recognition' ),
			h( 'h2', { id: 'recognition-h' }, recognitionPanel.heading ),
			h( 'ul', { class: 'cards' }, recognitionPanel.awards.map( i => h( 'li', {}, h( 'strong', {}, i.name ), h( 'span', {}, i.text ) ) ) ),
			h( 'ul', { class: 'press' }, recognitionPanel.press.map( i => h( 'li', {}, h( 'em', {}, i.source ), `: ${i.title}` ) ) ) ),
		fx && sec( 'transition', 'panel--right', h( 'p', { class: 'eyebrow' }, 'Public service' ), h( 'h2', { id: 'transition-h', class: 'big' }, 'Impact beyond the clinic' ), h( 'p', { class: 'ctas' }, h( 'a', { class: 'text-link', href: 'service.html' }, 'Public service and vision →' ) ) ),
		h( 'section', { id: 'work', class: 'panel panel--work', 'aria-labelledby': 'work-h' },
			h( 'h2', { id: 'work-h', class: fx ? 'sr-only' : '' }, 'Impact beyond the clinic' ), projectEls, ! fx && h( 'p', { class: 'ctas' }, h( 'a', { class: 'text-link', href: 'service.html' }, 'Public service and vision →' ) ) ),
		sec( 'contact', 'panel--right',
			h( 'p', { class: 'eyebrow' }, 'Contact' ),
			h( 'h2', { id: 'contact-h' }, contact.heading ),
			h( 'ul', { class: 'places' }, contact.places.map( p => h( 'li', {},
				h( 'strong', {}, p.name ),
				h( 'span', {}, [ p.detail, p.hours ].filter( Boolean ).join( ' · ' ) ) ) ) ),
			h( 'p', { class: 'note' }, contact.note ),
			h( 'p', { class: 'ctas' },
				h( 'a', { class: 'cta big', href: appointment.href, target: '_blank', rel: 'noopener' }, 'Book on WhatsApp' ),
				h( 'a', { class: 'text-link', href: `tel:${contact.phone.replace( /\s/g, '' )}` }, `Call ${contact.phone}` ) ),
			iconLinks( [ ...contact.links, { icon: 'file', label: 'Résumé', href: contact.resume } ] ),
			h( 'p', { class: 'more' }, h( 'a', { href: 'treatments.html' }, 'Treatments and clinics' ), ' · ', h( 'a', { href: 'service.html' }, 'Public service and vision' ) ) ),
	].filter( Boolean );

	// Plain version: each portrait sits beside its section's text, alternating sides.
	if ( ! fx ) {

		[ [ 'intro', 0 ], [ 'about', 1 ], [ 'experience', 1 ], [ 'recognition', 2 ], [ 'contact', 4 ] ].forEach( ( [ id, i ], n ) => {

			const el = panels.find( p => p.id === id );
			el.classList.add( 'has-img' );
			if ( n % 2 ) el.classList.add( 'flip' );
			el.append( h( 'figure', { class: 'portrait' }, heroImg( i, `Portrait of ${profile.name}` ) ) );

		} );

	}


	story.replaceChildren( ...panels, dialog );
	return { projectEls, panelEls: Object.fromEntries( panels.map( p => [ p.id, p ] ) ), sceneById };

}

export function buildNav( nav, { fx, onGo } ) {

	const sections = scenes.filter( s => s.label ).map( s => h( 'li', {},
		h( 'a', { href: `#${s.id}`, 'data-scene': s.id, onclick: e => { if ( fx ) { e.preventDefault(); onGo( s ); } } }, s.label ) ) );
	// The two other pages live in the header too, set apart from the in-page sections.
	const pages = [ [ 'treatments.html', 'Treatments and clinics' ], [ 'service.html', 'Public service and vision' ] ].map( ( [ href, label ], i ) =>
		h( 'li', { class: i ? 'page-link' : 'page-link first' }, h( 'a', { href }, label ) ) );
	nav.replaceChildren( ...sections, ...pages );

}

// Per-frame text choreography, driven by scroll progress.
export function createUpdater( { panelEls, projectEls, nav, bar } ) {

	const cache = new Map();
	const set = ( el, alpha, shift ) => {

		const key = alpha.toFixed( 3 ) + shift.toFixed( 1 );
		if ( cache.get( el ) === key ) return;
		cache.set( el, key );
		el.style.opacity = alpha;
		el.style.transform = `translateY(${shift}px)`;
		el.inert = alpha < 0.02;
		el.style.visibility = alpha < 0.005 ? 'hidden' : 'visible';

	};
	const links = [ ...nav.querySelectorAll( 'a' ) ];
	// Panels reveal line by line: child i starts a little after child i-1 as the scene's alpha rises (and leaves in reverse).
	const kidsOf = new Map();
	const setPanel = ( el, alpha, shift ) => {

		const key = alpha.toFixed( 3 ) + ( shift >= 0 );
		if ( cache.get( el ) === key ) return;
		cache.set( el, key );
		if ( ! kidsOf.has( el ) ) kidsOf.set( el, [ ...el.querySelector( '.copy' ).children ] );
		const kids = kidsOf.get( el ), k = 0.16;
		kids.forEach( ( c, i ) => {

			const a = 1 - Math.pow( 1 - clamp01( alpha * ( 1 + k * ( kids.length - 1 ) ) - k * i ), 3 ); // ease-out
			c.style.opacity = a;
			c.style.transform = `translateY(${( 1 - a ) * ( shift >= 0 ? 26 : - 26 )}px)`;

		} );
		el.style.opacity = 1;
		el.style.transform = 'none';
		el.inert = alpha < 0.02;
		el.style.visibility = alpha < 0.005 ? 'hidden' : 'visible';

	};
	let dashOn = false; // count up every time the dashboard scene is revealed

	return ( p, projFloat ) => {

		let current = scenes[ 0 ];
		for ( const s of scenes ) {

			const { alpha, shift } = panelAlpha( p, s.from, s.to );
			if ( s.id === 'work' ) {

				panelEls.work.style.visibility = alpha < 0.005 ? 'hidden' : 'visible';
				projectEls.forEach( ( el, i ) => {

					const w = clamp01( 1 - Math.abs( i - projFloat ) * 2.5 ) * alpha;
					set( el, w, ( i - projFloat ) * 30 + shift );

				} );

			} else if ( panelEls[ s.id ] ) setPanel( panelEls[ s.id ], alpha, shift );
			if ( s.id === 'dashboard' ) {

				if ( alpha > 0.6 && ! dashOn ) { dashOn = true; runCounters( false, panelEls.dashboard ); }
				else if ( alpha < 0.05 && dashOn ) {

					dashOn = false;
					panelEls.dashboard.querySelectorAll( '[data-to]' ).forEach( e => { e.textContent = `0${e.dataset.suffix}`; } );

				}

			}
			if ( p >= s.from - 0.015 && s.label ) current = s;

		}
		links.forEach( a => a.toggleAttribute( 'aria-current', a.dataset.scene === current.id ) );
		bar.style.transform = `scaleX(${p})`;

	};

}

export { WORK_RANGE };

// Fixed header button + awards ticker (duplicated track so the loop is seamless).
export function buildExtras( { appointment } ) {

	const bar = document.getElementById( 'bar' );
	bar.insertBefore( h( 'a', { class: 'cta', href: appointment.href, target: '_blank', rel: 'noopener' }, appointment.label ), document.getElementById( 'mode-link' ) );

}

export function runCounters( instant, scope = document ) {

	for ( const el of scope.querySelectorAll( '[data-to]' ) ) {

		const to = +el.dataset.to, fmt = n => Math.round( n ).toLocaleString( 'en-IN' ) + el.dataset.suffix;
		if ( instant ) { el.textContent = fmt( to ); continue; }
		const t0 = performance.now();
		const tick = now => {

			const k = Math.min( 1, ( now - t0 ) / 2200 );
			el.textContent = fmt( to * ( 1 - Math.pow( 1 - k, 4 ) ) );
			if ( k < 1 ) requestAnimationFrame( tick );

		};
		requestAnimationFrame( tick );

	}

}

export { h, iconLinks };

// Contact card: non-modal, dismissible, shown once per visit. show(true/false) is driven by scroll position.
export function buildReach() {

	const KEY = 'reachDismissed';
	let dismissed = false;
	try { dismissed = sessionStorage.getItem( KEY ) === '1'; } catch ( e ) { /* storage blocked */ }
	const close = h( 'button', { class: 'reach-close', 'aria-label': 'Close this message' }, '✕' );
	const el = h( 'aside', { class: 'reach', 'aria-label': 'Contact options', inert: true },
		close,
		h( 'p', { class: 'reach-title' }, reach.title ),
		h( 'p', { class: 'reach-text' }, reach.text ),
		h( 'div', { class: 'reach-options' }, reach.options.map( ( o, i ) =>
			h( 'a', { class: i ? 'reach-opt' : 'reach-opt primary', href: o.href, target: o.href.startsWith( 'http' ) ? '_blank' : null, rel: 'noopener' },
				h( 'strong', {}, o.label ), h( 'span', {}, o.note ) ) ) ) );
	const dismiss = () => {

		dismissed = true; set( false );
		try { sessionStorage.setItem( KEY, '1' ); } catch ( e ) { /* storage blocked */ }

	};
	let on = false;
	function set( v ) { on = v && ! dismissed; el.classList.toggle( 'on', on ); el.inert = ! on; }
	close.addEventListener( 'click', dismiss );
	el.addEventListener( 'click', e => { if ( e.target.closest( '.reach-opt' ) ) dismiss(); } );
	el.addEventListener( 'keydown', e => { if ( e.key === 'Escape' ) dismiss(); } );
	document.body.append( el );
	return { show: set, flip: v => el.classList.toggle( 'flip', v ), el };

}
