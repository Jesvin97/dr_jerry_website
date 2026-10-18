import * as THREE from 'three';
import { portraitCanvas, projectCanvas, glowCanvas, bandCanvas, ghostCanvas } from './placeholders.js';
import { smoothstep } from './timeline.js';

const D = 10, FOV = 35, PROJECT_ASPECT = 1.6;
// Mood per shot (intro, person, experience, projects, contact): glow colour and background tint.
const MOOD = [
	{ glow: [ 0.55, 0.68, 1 ], bg: [ 0.957, 0.945, 0.918 ] },
	{ glow: [ 0.45, 0.8, 0.95 ], bg: [ 0.94, 0.95, 0.95 ] },
	{ glow: [ 0.6, 0.65, 1 ], bg: [ 0.95, 0.94, 0.94 ] },
	{ glow: [ 0.4, 0.55, 1 ], bg: [ 0.93, 0.945, 0.96 ] },
	{ glow: [ 0.55, 0.68, 1 ], bg: [ 0.957, 0.945, 0.918 ] },
];
const mix = ( key, f ) => { const i = Math.min( MOOD.length - 2, Math.floor( f ) ), k = f - i; return MOOD[ i ][ key ].map( ( v, j ) => v + ( MOOD[ i + 1 ][ key ][ j ] - v ) * k ); };
const visibleHeight = 2 * D * Math.tan( FOV * Math.PI / 360 );

const vertexShader = 'varying vec2 vUv; varying float vWx; void main(){ vUv = uv; vWx = (modelMatrix * vec4(position,1.0)).x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
// Image plane with feathered edges (hides photo borders) and a soft horizontal wipe (reveal).
const fragmentShader = `
uniform sampler2D map; uniform float opacity, feather, reveal, wipeMode, edgeX, soft; uniform vec3 tint; uniform vec4 focus; varying vec2 vUv; varying float vWx;
void main(){
	vec4 c = texture2D(map, vUv);
	float e = 1.0;
	if (focus.z > 0.0) e = 1.0 - smoothstep(0.3, 1.0, length((vUv - focus.xy) / focus.zw));
	else if (feather > 0.0) e = smoothstep(0.0,feather,vUv.x)*smoothstep(0.0,feather,1.0-vUv.x)*smoothstep(0.0,max(feather,0.07),vUv.y)*smoothstep(0.0,feather,1.0-vUv.y);
	float rv = 1.0 - smoothstep(reveal*1.1-0.1, reveal*1.1, vUv.x);
	// wipeMode 1: show left of the moving edge (incoming photo), 2: show right of it (outgoing photo)
	if (wipeMode > 0.5) { float w = smoothstep(edgeX - soft, edgeX + soft, vWx); e *= wipeMode < 1.5 ? 1.0 - w : w; }
	gl_FragColor = vec4(c.rgb*tint, c.a*opacity*e*rv);
	#include <colorspace_fragment>
}`;

export async function createStage( { container, portrait, projects, name } ) {

	const renderer = new THREE.WebGLRenderer( { antialias: true, powerPreference: 'high-performance' } );
	renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xf4f1ea );
	container.appendChild( renderer.domElement );

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( FOV, window.innerWidth / window.innerHeight, 1, 60 );
	camera.position.z = D;

	const plane = new THREE.PlaneGeometry( 1, 1 );
	const disposables = [ plane ];
	const loader = new THREE.TextureLoader();
	const misses = [];

	const toTexture = source => {

		const t = source instanceof HTMLCanvasElement ? new THREE.CanvasTexture( source ) : source;
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 4;
		disposables.push( t );
		return t;

	};
	const load = ( url, fallback ) => new Promise( resolve => loader.load(
		url,
		t => resolve( toTexture( t ) ),
		undefined,
		() => { misses.push( url ); resolve( toTexture( fallback() ) ); }
	) );

	const shaderMaterial = ( map, feather = 0, focus = [ 0, 0, 0, 0 ] ) => {

		const m = new THREE.ShaderMaterial( {
			uniforms: { map: { value: map }, opacity: { value: 1 }, tint: { value: new THREE.Color( 1, 1, 1 ) }, feather: { value: feather }, focus: { value: new THREE.Vector4( focus[ 0 ], 1 - focus[ 1 ], focus[ 2 ], focus[ 3 ] ) }, reveal: { value: 1 }, wipeMode: { value: 0 }, edgeX: { value: 0 }, soft: { value: 0.3 } },
			vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false,
		} );
		disposables.push( m );
		return m;

	};
	const basicMaterial = ( map, extra = {} ) => {

		const m = new THREE.MeshBasicMaterial( { map: toTexture( map ), transparent: true, depthWrite: false, depthTest: false, ...extra } );
		disposables.push( m );
		return m;

	};
	const add = ( material, order, parent = scene ) => {

		const mesh = new THREE.Mesh( plane, material );
		mesh.renderOrder = order;
		parent.add( mesh );
		return mesh;

	};

	// Textures: real files when present, drawn placeholders otherwise.
	const portraitTex = await Promise.all( portrait.map( s => load( s.src, () => portraitCanvas( s.deg ) ) ) );
	const projectMedia = await Promise.all( projects.map( ( p, i ) => {

		if ( p.media.video ) {

			const v = document.createElement( 'video' );
			Object.assign( v, { src: p.media.video, muted: true, loop: true, playsInline: true, preload: 'auto' } );
			const t = toTexture( new THREE.VideoTexture( v ) );
			return Promise.resolve( { tex: t, video: v } );

		}
		return ( p.media.image ? load( p.media.image, () => projectCanvas( i, p.name ) ) : Promise.resolve( toTexture( projectCanvas( i, p.name ) ) ) ).then( tex => ( { tex, video: null } ) );

	} ) );


	// Back to front: ghost name, project planes, key light, portrait stack, dust, foreground bands.
	const ghost = add( basicMaterial( ghostCanvas( name ) ), 0 );

	const projectPlanes = projectMedia.map( ( m, i ) => {

		const mat = shaderMaterial( m.tex, 0.02 );
		return { mesh: add( mat, 1 ), mat, video: m.video, i };

	} );

	const light = add( basicMaterial( glowCanvas() ), 2 ); // soft white halo lifting the subject off the pearl

	const portraitGroup = new THREE.Group();
	scene.add( portraitGroup );
	const layers = portraitTex.map( ( t, i ) => {

		const f = portrait[ i ].focus;
		const mat = shaderMaterial( t, portrait[ i ].feather ?? 0.05, f );
		const mesh = add( mat, 3 + i, portraitGroup );
		mesh.position.z = i * 0.001;
		return { mesh, mat, aspect: t.image.width / t.image.height, focus: f, zoom: portrait[ i ].zoom ?? 1 };

	} );

	const dustGeo = new THREE.BufferGeometry();
	const N = 160, dustPos = new Float32Array( N * 3 ), dustBase = new Float32Array( N ), dustSpeed = Array.from( { length: N }, () => 0.01 + Math.random() * 0.03 );
	for ( let i = 0; i < N; i ++ ) dustPos.set( [ Math.random() - 0.5, Math.random() - 0.5, - 4 + Math.random() * 7 ], i * 3 );
	for ( let i = 0; i < N; i ++ ) dustBase[ i ] = dustPos[ i * 3 + 1 ];
	dustGeo.setAttribute( 'position', new THREE.BufferAttribute( dustPos, 3 ) );
	const dustMat = new THREE.PointsMaterial( { size: 0.06, color: 0x2a56c6, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false } );
	const dust = new THREE.Points( dustGeo, dustMat );
	dust.renderOrder = 10;
	scene.add( dust );
	disposables.push( dustGeo, dustMat );

	const bandMat = basicMaterial( bandCanvas(), { side: THREE.DoubleSide } ); // right band is mirrored
	const bandL = add( bandMat, 11 );
	const bandR = add( bandMat, 11 );
	bandR.scale.x = - 1;

	let videoLive = false;

	function update( s, projFloat, p, t = 0, ptr = { x: 0, y: 0 } ) {

		const H = visibleHeight, W = H * camera.aspect;
		const a = s.shot / ( portrait.length - 1 ); // 0..1 across the story
		const sway = Math.sin( ( a - 0.5 ) * 1.2 ) * 2.4 + ptr.x * 1.4 + Math.sin( t * 0.35 ) * 0.15;
		camera.position.set( sway, 0.15 * ( 1 - a ) - ptr.y * 0.8, D - s.push * 3 );
		const glow = mix( 'glow', s.shot ), bg = mix( 'bg', s.shot );
		renderer.setClearColor( new THREE.Color().setRGB( bg[ 0 ], bg[ 1 ], bg[ 2 ], THREE.SRGBColorSpace ) ); // push = slow dolly-in during a shot
		camera.lookAt( 0, 0, 0 );

		const ph = s.ph * H, pw = ph * layers[ Math.round( s.shot ) ].aspect;
		portraitGroup.position.set( s.px * W, s.py * H, 0 );
		portraitGroup.rotation.y = Math.atan2( sway - portraitGroup.position.x, D ) * 0.8;
		portraitGroup.scale.setScalar( 1 + Math.sin( t * 1.3 ) * 0.006 ); // breathing
		// Cut between photos with a scroll-driven wipe: the new photo is revealed behind a moving edge, the old one retreats.
		const last = layers.length - 1, i0 = Math.min( last - 1, Math.floor( s.shot ) );
		const f = smoothstep( 0.05, 0.95, s.shot - i0 ), span = ph * 0.9, edge = portraitGroup.position.x + ( f * 2 - 1 ) * span;
		const dim = 1 - s.projIn * 0.18;
		layers.forEach( ( l, i ) => {

			const lh = ph * l.zoom, lw = lh * l.aspect;
			l.mesh.scale.set( lw, lh, 1 );
			l.mesh.position.x = ( 0.5 - l.focus[ 0 ] ) * lw; // subject centre sits on the group origin
			l.mesh.position.y = ( l.focus[ 1 ] - 0.5 ) * lh;
			const mode = f <= 0.001 || f >= 0.999 ? 0 : i === i0 ? 2 : i === i0 + 1 ? 1 : 0;
			const shown = f <= 0.001 ? i === i0 : f >= 0.999 ? i === i0 + 1 : mode > 0;
			l.mat.uniforms.opacity.value = 1;
			l.mat.uniforms.wipeMode.value = mode;
			l.mat.uniforms.edgeX.value = edge;
			l.mat.uniforms.soft.value = ph * 0.07;
			l.mat.uniforms.tint.value.setScalar( dim );
			l.mesh.visible = shown;

		} );

		// Key light stays on the lit side of the face as the "camera" moves round.
		light.position.set( portraitGroup.position.x + ( a - 0.2 ) * pw * 0.3, portraitGroup.position.y + ph * 0.12, - 0.5 );
		light.scale.setScalar( ph * 2.4 );
		light.material.opacity = ( 0.75 + Math.sin( t * 0.9 ) * 0.06 ) * ( 1 - s.projIn * 0.4 );

		ghost.scale.set( W * 3.6, W * 0.9, 1 );
		ghost.position.set( ( 0.5 - 1.5 * p ) * W, 0.22 * H, - 5 );
		ghost.material.opacity = 1 - s.projIn * 0.6;

		// Project planes: active one centre-right, neighbours peek in behind, deeper and dimmer.
		let playing = false;
		for ( const pl of projectPlanes ) {

			const d = pl.i - projFloat, ad = Math.min( 1, Math.abs( d ) );
			const z = - 2.2 - ad * 1.2, f = ( D - z ) / D;
			const w = 0.46 * W * f;
			pl.mesh.scale.set( w, w / PROJECT_ASPECT, 1 );
			pl.mesh.position.set( ( 0.13 + d * 0.5 ) * W * f, 0.12 * H * f, z );
			pl.mesh.rotation.y = - d * 0.35;
			pl.mat.uniforms.opacity.value = s.projIn * ( 1 - ( d < 0 ? 0.85 : 0.65 ) * ad );
			pl.mat.uniforms.reveal.value = s.projIn;
			pl.mat.uniforms.tint.value.setScalar( 1 - 0.35 * ad );
			pl.mesh.visible = s.projIn > 0.001;
			if ( pl.video ) {

				const on = s.projIn > 0.3 && ad < 0.5;
				if ( on && pl.video.paused ) pl.video.play().catch( () => {} );
				else if ( ! on && ! pl.video.paused ) pl.video.pause();
				playing = playing || on;

			}

		}
		videoLive = playing;

		for ( let i = 0; i < N; i ++ ) { // slow rise, wrapping inside the frame

			const y = dustBase[ i ] + t * dustSpeed[ i ];
			dustGeo.attributes.position.setY( i, ( ( y + 0.5 ) % 1 + 1 ) % 1 - 0.5 );

		}
		dustGeo.attributes.position.needsUpdate = true;
		dust.scale.set( W, H, 1 );
		dust.position.y = - p * 0.2 * H;

		const fl = ( D - 3 ) / D, fr = ( D - 2 ) / D;
		bandL.scale.set( 0.26 * W * fl, 1.6 * H * fl, 1 ); bandL.position.set( - 0.43 * W * fl, 0, 3 );
		bandR.scale.set( - 0.26 * W * fr, 1.6 * H * fr, 1 ); bandR.position.set( 0.43 * W * fr, 0, 2 );

		renderer.render( scene, camera );

	}

	function resize() {

		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

	}

	function dispose() {

		renderer.setAnimationLoop( null );
		projectPlanes.forEach( pl => { if ( pl.video ) { pl.video.pause(); pl.video.removeAttribute( 'src' ); pl.video.load(); } } );
		disposables.forEach( d => d.dispose() );
		renderer.dispose();
		renderer.domElement.remove();

	}

	return { update, resize, dispose, misses, get live() { return videoLive; } };

}
