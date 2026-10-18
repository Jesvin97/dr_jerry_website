// POST /api/book: saves a booking request from the website popup to Supabase.
// Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in the Vercel project's environment variables (server-side only, never sent to the browser).
// Without them it runs as a demo: the request is validated and acknowledged but not stored.

const hits = new Map(); // best-effort per-instance rate limit: 5 requests per IP per 10 minutes
const limited = ip => {

	const now = Date.now(), recent = ( hits.get( ip ) || [] ).filter( t => now - t < 600000 );
	recent.push( now );
	hits.set( ip, recent );
	return recent.length > 5;

};

const clean = ( v, max ) => ( typeof v === 'string' ? v.replace( /[\u0000-\u001f\u007f]+/g, ' ' ).trim().slice( 0, max ) : '' );

module.exports = async ( req, res ) => {

	res.setHeader( 'Cache-Control', 'no-store' );
	if ( req.method !== 'POST' ) { res.setHeader( 'Allow', 'POST' ); return res.status( 405 ).json( { error: 'Method not allowed' } ); }

	const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
	const demo = ! SUPABASE_URL || ! SUPABASE_SERVICE_KEY;

	const ip = ( req.headers[ 'x-forwarded-for' ] || '' ).split( ',' )[ 0 ].trim() || 'unknown';
	if ( limited( ip ) ) return res.status( 429 ).json( { error: 'Too many requests, please try again later' } );

	const b = typeof req.body === 'string' ? safeParse( req.body ) : req.body || {};
	if ( b.website ) return res.status( 200 ).json( { ok: true } ); // honeypot: bots fill the hidden field, pretend it worked

	const name = clean( b.name, 80 ), phone = clean( b.phone, 18 ), clinic = clean( b.clinic, 120 ), note = clean( b.note, 400 );
	if ( name.length < 2 ) return res.status( 400 ).json( { error: 'Please enter your name' } );
	if ( ! /^[0-9 +()\-]+$/.test( phone ) || phone.replace( /\D/g, '' ).length < 10 ) return res.status( 400 ).json( { error: 'Please enter a valid phone number' } );

	if ( demo ) return res.status( 200 ).json( { ok: true, demo: true } );

	try {

		const r = await fetch( `${SUPABASE_URL.replace( /\/$/, '' )}/rest/v1/bookings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, Prefer: 'return=minimal' },
			body: JSON.stringify( { name, phone, clinic, note: note || null } ),
		} );
		if ( ! r.ok ) { console.error( 'Supabase insert failed', r.status, await r.text() ); return res.status( 502 ).json( { error: 'Could not save your request' } ); }
		return res.status( 200 ).json( { ok: true } );

	} catch ( e ) {

		console.error( 'Supabase request failed', e );
		return res.status( 502 ).json( { error: 'Could not save your request' } );

	}

};

function safeParse( s ) { try { return JSON.parse( s ); } catch ( e ) { return {}; } }
