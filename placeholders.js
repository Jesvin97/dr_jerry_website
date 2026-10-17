// Drawn stand-ins used when a real image is missing. Never shipped as "the portrait".

function canvas( w, h ) {

	const c = document.createElement( 'canvas' );
	c.width = w; c.height = h;
	return c;

}

export function portraitCanvas( deg ) {

	const c = canvas( 800, 1200 ), g = c.getContext( '2d' );
	const a = deg * Math.PI / 180, cs = Math.cos( a ), sn = Math.sin( a );
	const fill = g.createLinearGradient( 200, 0, 600, 0 );
	fill.addColorStop( 0, '#242428' ); fill.addColorStop( 1, '#6f695f' );
	g.fillStyle = fill;
	const hx = 400 + sn * 30;
	g.beginPath(); g.ellipse( 400, 1160, 100 + 240 * cs, 340, 0, 0, Math.PI * 2 ); g.fill();
	g.fillRect( 400 - 48 + sn * 14, 620, 96, 240 );
	g.beginPath(); g.ellipse( hx, 470, 110 + 30 * cs, 170, 0, 0, Math.PI * 2 ); g.fill();
	if ( sn > 0.05 ) {

		const nx = hx + sn * 100;
		g.beginPath(); g.moveTo( nx, 440 ); g.lineTo( nx + sn * 55, 520 ); g.lineTo( nx, 545 ); g.fill();

	}
	g.fillStyle = 'rgba(255,255,255,0.45)';
	g.font = '600 34px system-ui, sans-serif'; g.textAlign = 'center';
	g.fillText( `PLACEHOLDER · ${deg}°`, 400, 1120 );
	return c;

}

export function projectCanvas( i, name ) {

	const c = canvas( 1600, 1000 ), g = c.getContext( '2d' );
	const f = g.createLinearGradient( 0, 0, 1600, 1000 );
	f.addColorStop( 0, '#0b1f4a' ); f.addColorStop( 1, '#2a56c6' );
	g.fillStyle = f; g.fillRect( 0, 0, 1600, 1000 );
	g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2;
	for ( let x = 0; x <= 1600; x += 100 ) { g.beginPath(); g.moveTo( x, 0 ); g.lineTo( x, 1000 ); g.stroke(); }
	for ( let y = 0; y <= 1000; y += 100 ) { g.beginPath(); g.moveTo( 0, y ); g.lineTo( 1600, y ); g.stroke(); }
	g.fillStyle = 'rgba(255,255,255,0.8)'; g.textAlign = 'center';
	g.font = '700 120px Georgia, serif'; g.fillText( String( i + 1 ).padStart( 2, '0' ), 800, 480 );
	g.font = '500 44px system-ui, sans-serif'; g.fillText( `${name} · placeholder screenshot`, 800, 570 );
	return c;

}

// Soft radial glow used for the key light.
export function glowCanvas() {

	const c = canvas( 256, 256 ), g = c.getContext( '2d' );
	const r = g.createRadialGradient( 128, 128, 0, 128, 128, 128 );
	r.addColorStop( 0, 'rgba(255,255,255,1)' ); r.addColorStop( 0.4, 'rgba(255,255,255,0.35)' ); r.addColorStop( 1, 'rgba(255,255,255,0)' );
	g.fillStyle = r; g.fillRect( 0, 0, 256, 256 );
	return c;

}

// Dark edge band for foreground depth: opaque on the outer (left) edge, transparent inward.
export function bandCanvas() {

	const c = canvas( 256, 16 ), g = c.getContext( '2d' );
	const l = g.createLinearGradient( 0, 0, 256, 0 );
	l.addColorStop( 0, 'rgba(244,241,234,0.95)' ); l.addColorStop( 1, 'rgba(244,241,234,0)' );
	g.fillStyle = l; g.fillRect( 0, 0, 256, 16 );
	return c;

}

export function ghostCanvas( text ) {

	const c = canvas( 2048, 512 ), g = c.getContext( '2d' );
	g.font = '700 300px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
	g.fillStyle = 'rgba(11,31,74,0.07)';
	g.fillText( text.toUpperCase(), 1024, 270, 1980 );
	return c;

}
