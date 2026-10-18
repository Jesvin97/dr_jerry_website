import { profile, portrait, projects, appointment, scenes, WORK_RANGE } from './content.js';
import { sampleShot, waypointIndex } from './timeline.js';
import { buildStory, buildNav, buildExtras, buildReach, initBooking, initMenu, runCounters, createUpdater } from './ui.js';

const $ = id => document.getElementById( id );
const root = document.documentElement;
const ac = new AbortController(); // every listener registers with this signal -> one-call cleanup
const on = ( target, type, fn, opts = {} ) => target.addEventListener( type, fn, { ...opts, signal: ac.signal } );

const calm = matchMedia( '(prefers-reduced-motion: reduce)' ).matches; // desktops always get the film; with reduced motion only the ambient movement is switched off
const canFx = () => innerWidth >= 1000 && innerWidth / innerHeight >= 1.2;
let fx = canFx();

document.title = `${profile.name} | ${profile.title}`;
document.querySelector( '.brand' ).textContent = profile.name;

let lenis = null, stage = null, raf = 0;
let dialogOpen = false;
const setDialog = open => { dialogOpen = open; if ( open ) lenis?.stop(); else lenis?.start(); };

if ( fx ) {

	try {

		const { createStage } = await import( './stage.js' );
		stage = await createStage( { container: $( 'stage' ), portrait, projects, name: profile.name } );
		if ( stage.misses.length ) console.info( `Using placeholders for ${stage.misses.length} missing image(s):`, stage.misses );

	} catch ( e ) {

		console.error( 'WebGL stage unavailable, falling back to the plain version.', e );
		fx = false;

	}

}

root.classList.toggle( 'fx', fx );

const story = $( 'story' );
const built = buildStory( story, { fx, onDialog: setDialog } );

if ( fx ) {

	const { default: Lenis } = await import( 'lenis' ); // phones and tablets never download it
	lenis = new Lenis( { lerp: 0.065, smoothWheel: true } );
	const limit = () => document.documentElement.scrollHeight - innerHeight;
	let last = - 1, smooth = - 1, prevT = 0;
	// Nav clicks go straight to the section: a short fade, then an instant cut, so the scenes in between never play.
	const veil = Object.assign( document.createElement( 'div' ), { className: 'veil' } ); veil.setAttribute( 'aria-hidden', 'true' ); document.body.append( veil );
	let jumpTimer = 0;
	const jump = y => {

		clearTimeout( jumpTimer );
		const go = () => { lenis.scrollTo( y, { immediate: true } ); smooth = - 1; veil.classList.remove( 'on' ); };
		if ( calm ) { go(); return; }
		veil.classList.add( 'on' ); jumpTimer = setTimeout( go, 240 );

	};
	buildNav( $( 'nav' ), { fx, onGo: s => jump( s.anchor * limit() ) } );
	document.querySelector( '.brand' ).addEventListener( 'click', e => { e.preventDefault(); jump( 0 ); } ); // name = back to the top
	const update = createUpdater( { ...built, nav: $( 'nav' ), bar: $( 'progress' ) } );

	const ptr = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
	on( window, 'pointermove', e => { tgt.x = e.clientX / innerWidth - 0.5; tgt.y = e.clientY / innerHeight - 0.5; } );
	const frame = t => {

		raf = requestAnimationFrame( frame );
		lenis.raf( t );
		const raw = Math.min( 1, Math.max( 0, limit() > 0 ? lenis.animatedScroll / limit() : 0 ) );
		const dt = Math.min( 0.05, ( t - prevT ) / 1000 ); prevT = t;
		smooth = smooth < 0 || calm ? raw : smooth + ( raw - smooth ) * ( 1 - Math.exp( - dt * 5.5 ) ); // time-based glide: same feel at 30, 60 or 144 fps, hides stepped wheel ticks
		const p = smooth;
		last = p;
		ptr.x += ( tgt.x - ptr.x ) * 0.05; ptr.y += ( tgt.y - ptr.y ) * 0.05; // the scene is alive: it renders every frame
		const u = ( p - WORK_RANGE[ 0 ] ) / ( WORK_RANGE[ 1 ] - WORK_RANGE[ 0 ] );
		const projFloat = waypointIndex( ( u - 0.08 ) / 0.84, projects.length );
		stage.update( sampleShot( p ), projFloat, p, calm ? 0 : t / 1000, calm ? { x: 0, y: 0 } : ptr );
		update( p, projFloat );
		reachCard.flip( p > 0.41 && p < 0.515 ); // the one text-left scene (numbers): card goes right
		reachCard.show( p > 0.46 && p < 0.955 ); // after the clinical numbers, until the Contact scene itself

	};

	on( window, 'resize', () => {

		if ( ! canFx() ) { location.reload(); return; }
		const keep = last; // the page height scales with the viewport: keep the same scene, not the same pixel offset
		stage.resize();
		requestAnimationFrame( () => { lenis.resize(); if ( keep >= 0 ) lenis.scrollTo( keep * limit(), { immediate: true } ); last = - 1; } );

	} );
	// Restore the exact scroll position (refresh mid-page) before the first frame is shown.
	// The browser's own restore runs before the tall .fx layout exists, so keep progress ourselves.
	history.scrollRestoration = 'manual';
	let saved = 0;
	if ( performance.getEntriesByType( 'navigation' )[ 0 ]?.type !== 'navigate' ) try { saved = parseFloat( sessionStorage.getItem( 'scrollP' ) ) || 0; } catch ( e ) { /* storage blocked */ }
	const target = scenes.find( s => '#' + s.id === location.hash ); // e.g. index.html#work from the other pages
	if ( target ) saved = target.anchor;
	lenis.scrollTo( saved * limit(), { immediate: true } );
	raf = requestAnimationFrame( frame );

} else {

	buildNav( $( 'nav' ), { fx } );
	initMenu();
	// plain layout: show the card once the Expertise section has been reached, hide it at Contact (no scroll listener needed)
	const watch = ( id, fn ) => new IntersectionObserver( es => es.forEach( e => fn( e ) ), { rootMargin: '0px 0px -30% 0px' } ).observe( $( id ) );
	let past = false, atContact = false;
	const refresh = () => reachCard.show( past && ! atContact );
	watch( 'expertise', e => { if ( e.isIntersecting || e.boundingClientRect.top < 0 ) past = true; refresh(); } );
	watch( 'contact', e => { atContact = e.isIntersecting; refresh(); } );
	on( window, 'resize', () => { if ( canFx() ) location.reload(); } );

}

// First paint is ready: reveal on the next frame so nothing flashes or jumps.
buildExtras( { appointment } );
const reachCard = buildReach();
initBooking( { appointment, onDialog: setDialog, autoAt: 0 } ); // opens only from a[data-book] buttons; the contact card is the automatic prompt
requestAnimationFrame( () => requestAnimationFrame( () => {

	$( 'loader' ).classList.add( 'done' );
	document.body.classList.add( 'ready' );
	runCounters( calm, fx ? $( 'intro' ) : document );

} ) );

on( window, 'pagehide', () => {

	cancelAnimationFrame( raf );
	if ( fx ) try { sessionStorage.setItem( 'scrollP', String( lenis.animatedScroll / ( document.documentElement.scrollHeight - innerHeight ) ) ); } catch ( e ) { /* storage blocked */ }
	ac.abort();
	lenis?.destroy();
	stage?.dispose();

} );

// Cross-document view transitions can be skipped (reload, hidden tab): that is normal, so swallow the rejection instead of logging it.
addEventListener( 'pagereveal', e => { const v = e.viewTransition; if ( v ) [ v.ready, v.finished, v.updateCallbackDone ].forEach( p => p.catch( () => {} ) ); } );
