// Scroll -> camera/composition. Same idea as the original waypoint path: keyframes + eased interpolation + hold zones.
// px/py: portrait centre as a fraction of visible width/height. ph: portrait height as a fraction of visible height.
// shot: which photo. projIn: project showcase visibility.

export const easeInOutQuart = t => ( t < 0.5 ? 4 * t * t * t : 1 - Math.pow( - 2 * t + 2, 3 ) / 2 ) // gentle start and end;
export const clamp01 = x => Math.min( 1, Math.max( 0, x ) );
export const smoothstep = ( a, b, x ) => { const t = clamp01( ( x - a ) / ( b - a ) ); return t * t * ( 3 - 2 * t ); };
const lerp = ( a, b, t ) => a + ( b - a ) * t;

// Repeated identical shots are hold zones.
const S = ( at, shot, px, py, ph, projIn, push ) => ( { at, shot, px, py, ph, projIn, push } );
// shot: photo index (0 intro, 1 person, 2 experience, 3 projects, 4 contact). push: slow dolly-in per shot.
const shots = [
	S( 0, 0, 0.2, - 0.03, 0.9, 0, 0 ),
	S( 0.09, 0, 0.2, - 0.03, 0.9, 0, 0.05 ),
	S( 0.145, 1, - 0.26, - 0.03, 0.9, 0, 0 ), // intro to journey: a long, slow cut
	S( 0.365, 1, - 0.26, - 0.03, 0.9, 0, 0.05 ), // Life and journey and Medical career share one shot
	S( 0.425, 2, 0.28, - 0.03, 0.9, 0, 0 ), // the camera slides the portrait across the frame
	S( 0.5, 2, 0.28, - 0.03, 0.9, 0, 0.04 ),
	S( 0.555, 2, - 0.26, - 0.03, 0.9, 0, 0 ),
	S( 0.75, 2, - 0.26, - 0.03, 0.9, 0, 0.04 ), // expertise and recognition share one position: no slide between them
	S( 0.84, 3, - 0.21, - 0.13, 0.78, 0, 0 ),
	S( 0.925, 3, - 0.21, - 0.13, 0.78, 0, 0.05 ),
	S( 0.975, 4, - 0.2, - 0.03, 0.85, 0, 0 ),
	S( 1, 4, - 0.2, - 0.03, 0.85, 0, 0.05 ),
];

export function sampleShot( p ) {

	let i = 0;
	while ( i < shots.length - 2 && p > shots[ i + 1 ].at ) i ++;
	const a = shots[ i ], b = shots[ i + 1 ];
	const t = easeInOutQuart( clamp01( ( p - a.at ) / ( b.at - a.at ) ) );
	const out = {};
	for ( const k of [ 'shot', 'px', 'py', 'ph', 'projIn', 'push' ] ) out[ k ] = lerp( a[ k ], b[ k ], t );
	return out;

}

// Original remapProgress, generalised: dwell on each of n waypoints, eased travel between them. Returns 0..n-1.
export function waypointIndex( u, n, hold = 0.2 ) {

	if ( n < 2 ) return 0;
	const segs = n - 1;
	const raw = clamp01( u ) * segs;
	const idx = Math.min( Math.floor( raw ), segs - 1 );
	const local = raw - idx;
	if ( local < hold ) return idx;
	if ( local > 1 - hold ) return idx + 1;
	return idx + easeInOutQuart( ( local - hold ) / ( 1 - hold * 2 ) );

}

export function panelAlpha( p, from, to, fade = 0.025 ) {

	const i = smoothstep( from - fade, from, p ), o = smoothstep( to, to + fade, p );
	return { alpha: i * ( 1 - o ), shift: ( 1 - i ) * 28 - o * 28 };

}

// Self-check (run in the console: import('/timeline.js').then(m => m.selfTest())).
export function selfTest() {

	const near = ( a, b ) => Math.abs( a - b ) < 1e-9;
	console.assert( near( sampleShot( 0 ).shot, 0 ) && near( sampleShot( 0.5 ).shot, 2 ) && near( sampleShot( 1 ).projIn, 0 ), 'shots' );
	console.assert( near( waypointIndex( 0, 3 ), 0 ) && near( waypointIndex( 1, 3 ), 2 ) && near( waypointIndex( 0.5, 3 ), 1 ), 'waypoints' );
	console.assert( panelAlpha( 0, 0, 0.1 ).alpha === 1 && panelAlpha( 0.5, 0, 0.1 ).alpha === 0, 'panel' );
	return 'ok';

}
