// Renders the secondary pages (treatments.html, service.html) from content.js.
import { profile, treatments, service, appointment, contact } from './content.js';
import { h, iconLinks, runCounters, initBooking, initMenu } from './ui.js';

const page = document.body.dataset.page;
const card = ( i, { tag, title, text, link } ) => h( 'article', { class: 'card reveal', style: `--d:${i * 70}ms` },
	tag && h( 'p', { class: 'tag' }, tag ),
	h( 'h3', {}, title ),
	h( 'p', {}, text ),
	link && h( 'a', { class: 'text-link', href: link.href, target: '_blank', rel: 'noopener' }, `${link.label} â†—` ) );
// Zig-zag row: title block on one side, copy on the other, alternating.
const row = ( i, { tag, title, text } ) => h( 'article', { class: 'row reveal' },
	h( 'div', { class: 'row-title' }, tag && h( 'p', { class: 'tag' }, tag ), h( 'h3', {}, title ) ),
	h( 'p', { class: 'row-text' }, text ) );
const head = ( eyebrow, title, lede ) => h( 'header', { class: 'page-hero reveal' }, h( 'p', { class: 'eyebrow' }, eyebrow ), h( 'h1', {}, title ), lede && h( 'p', { class: 'lede' }, lede ) );
const section = ( eyebrow, title, ...kids ) => h( 'section', { class: 'block' }, h( 'div', { class: 'block-head reveal' }, h( 'p', { class: 'eyebrow' }, eyebrow ), h( 'h2', {}, title ) ), ...kids );

const body = [];
if ( page === 'treatments' ) {

	document.title = `Treatments and clinics | ${profile.name}`;
	body.push(
		head( treatments.eyebrow, treatments.heading ),
		h( 'div', { class: 'rows' }, treatments.items.map( ( t, i ) => row( i, t ) ) ),
		h( 'p', { class: 'ctas reveal' }, h( 'a', { class: 'cta big', 'data-book': true, href: appointment.href, target: '_blank', rel: 'noopener' }, appointment.label ) )
	);

} else {

	document.title = `Public service and vision | ${profile.name}`;
	const { peace, vision, community } = service;
	body.push(
		head( service.eyebrow, service.heading, service.intro ),
		h( 'div', { class: 'stagger' }, service.items.map( ( t, i ) => card( i, t ) ) ),
		h( 'section', { class: 'peace reveal' },
			h( 'div', {}, h( 'p', { class: 'eyebrow' }, peace.tag ), h( 'h2', {}, peace.title ), h( 'p', {}, peace.text ) ),
			h( 'div', { class: 'big-stat' }, h( 'strong', { 'data-to': peace.stat.value, 'data-suffix': '' }, '0' ), h( 'span', {}, peace.stat.label ) ) ),
		section( vision.eyebrow, vision.heading, h( 'div', { class: 'asym' }, vision.items.map( ( t, i ) => card( i, t ) ) ) ),
		section( community.eyebrow, community.heading, h( 'div', { class: 'asym' }, community.items.map( ( t, i ) => card( i, t ) ) ) )
	);

}

const main = document.getElementById( 'story' );
main.replaceChildren( ...body );
document.getElementById( 'foot-links' ).replaceChildren( iconLinks( contact.links ) );
document.getElementById( 'cta' ).href = appointment.href;
initBooking( { appointment } );
initMenu();
document.querySelectorAll( '#nav a' ).forEach( a => a.toggleAttribute( 'aria-current', a.dataset.page === page ) );

const still = matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
const io = new IntersectionObserver( entries => {

	for ( const e of entries ) {

		if ( ! e.isIntersecting ) continue;
		e.target.classList.add( 'in' );
		runCounters( still, e.target );
		io.unobserve( e.target );

	}

}, { threshold: 0.15 } );
document.querySelectorAll( '.reveal' ).forEach( el => still ? el.classList.add( 'in' ) : io.observe( el ) );
if ( still ) runCounters( true );
addEventListener( 'pagehide', () => io.disconnect() );

// Cross-document view transitions can be skipped (reload, hidden tab): that is normal, so swallow the rejection instead of logging it.
addEventListener( 'pagereveal', e => { const v = e.viewTransition; if ( v ) [ v.ready, v.finished, v.updateCallbackDone ].forEach( p => p.catch( () => {} ) ); } );
