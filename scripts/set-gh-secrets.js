#!/usr/bin/env node

// Usage:
//   GITHUB_TOKEN=... node scripts/set-gh-secrets.js <owner> <repo> KEY=VALUE [...]
// Supports KEY values loaded from @/path/to/file to read file contents.

const fs = require('fs');

async function main() {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		console.error('GITHUB_TOKEN env var is required');
		process.exit(1);
	}
	const [owner, repo, ...pairs] = process.argv.slice(2);
	if (!owner || !repo || pairs.length === 0) {
		console.error('Usage: GITHUB_TOKEN=... node set-gh-secrets.js <owner> <repo> KEY=VALUE [...]');
		process.exit(1);
	}

	const headers = {
		'Authorization': `Bearer ${token}`,
		'Accept': 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28'
	};

	// Fetch repo public key for secrets
	const keyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, { headers });
	if (!keyRes.ok) {
		const t = await keyRes.text();
		console.error('Failed to fetch public key:', keyRes.status, t);
		process.exit(1);
	}
	const { key_id, key } = await keyRes.json();

	// Lazy load libsodium
	const sodium = require('libsodium-wrappers-sumo');
	await sodium.ready;

	async function putSecret(name, value) {
		const messageBytes = typeof value === 'string' ? Buffer.from(value) : value;
		const publicKeyBytes = Buffer.from(key, 'base64');
		const encryptedBytes = sodium.crypto_box_seal(messageBytes, publicKeyBytes);
		const encrypted_value = Buffer.from(encryptedBytes).toString('base64');
		const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/${encodeURIComponent(name)}`, {
			method: 'PUT',
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({ encrypted_value, key_id })
		});
		if (!putRes.ok) {
			const t = await putRes.text();
			throw new Error(`Failed to set secret ${name}: ${putRes.status} ${t}`);
		}
	}

	for (const pair of pairs) {
		const [k, raw] = pair.split('=');
		if (!k || raw === undefined) {
			console.error('Invalid KEY=VALUE pair:', pair);
			process.exit(1);
		}
		let value = raw;
		if (raw.startsWith('@')) {
			const p = raw.slice(1);
			value = fs.readFileSync(p, 'utf8');
		}
		await putSecret(k, value);
		console.log(`Set secret: ${k}`);
	}

	console.log('All secrets set.');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});