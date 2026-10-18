import { profile, portrait, projects, appointment, scenes, WORK_RANGE } from './content.js';
import { sampleShot, waypointIndex } from './timeline.js';
import { buildStory, buildNav, buildExtras, initBooking, runCounters, createUpdater } from './ui.js';

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
	lenis = new Lenis( { lerp: 0.08, smoothWheel: true } );
	const limit = () => document.documentElement.scrollHeight - innerHeight;
	buildNav( $( 'nav' ), { fx, onGo: s => lenis.scrollTo( s.anchor * limit(), { duration: 1.6 } ) } );
	const update = createUpdater( { ...built, nav: $( 'nav' ), bar: $( 'progress' ) } );

	let last = - 1;
	const ptr = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
	on( window, 'pointermove', e => { tgt.x = e.clientX / innerWidth - 0.5; tgt.y = e.clientY / innerHeight - 0.5; } );
	const frame = t => {

		raf = requestAnimationFrame( frame );
		lenis.raf( t );
		const p = Math.min( 1, Math.max( 0, limit() > 0 ? lenis.animatedScroll / limit() : 0 ) );
		last = p;
		ptr.x += ( tgt.x - ptr.x ) * 0.05; ptr.y += ( tgt.y - ptr.y ) * 0.05; // the scene is alive: it renders every frame
		const u = ( p - WORK_RANGE[ 0 ] ) / ( WORK_RANGE[ 1 ] - WORK_RANGE[ 0 ] );
		const projFloat = waypointIndex( ( u - 0.08 ) / 0.84, projects.length );
		stage.update( sampleShot( p ), projFloat, p, calm ? 0 : t / 1000, calm ? { x: 0, y: 0 } : ptr );
		update( p, projFloat );

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
	on( window, 'resize', () => { if ( canFx() ) location.reload(); } );

}

// First paint is ready: reveal on the next frame so nothing flashes or jumps.
buildExtras( { appointment } );
initBooking( { appointment, onDialog: setDialog } );
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
