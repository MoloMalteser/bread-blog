#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

function fetchJson(url, options = {}) {
	return new Promise((resolve, reject) => {
		const req = https.request(url, { method: options.method || 'GET', headers: { 'User-Agent': 'repo-secrets-setter', ...(options.headers || {}) } }, (res) => {
			let data = '';
			res.on('data', (c) => (data += c));
			res.on('end', () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
				} else {
					reject(new Error(`HTTP ${res.statusCode}: ${data}`));
				}
			});
		});
		req.on('error', reject);
		if (options.body) req.write(options.body);
		req.end();
	});
}

function fetchRaw(url, options = {}) {
	return new Promise((resolve, reject) => {
		const req = https.request(url, { method: options.method || 'GET', headers: { 'User-Agent': 'repo-secrets-setter', ...(options.headers || {}) } }, (res) => {
			let data = '';
			res.on('data', (c) => (data += c));
			res.on('end', () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve({ ok: true, status: res.statusCode, text: data });
				} else {
					resolve({ ok: false, status: res.statusCode, text: data });
				}
			});
		});
		req.on('error', reject);
		if (options.body) req.write(options.body);
		req.end();
	});
}

async function main() {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		console.error('GITHUB_TOKEN env var is required');
		process.exit(1);
	}
	const [owner, repo, ...pairs] = process.argv.slice(2);
	if (!owner || !repo || pairs.length === 0) {
		console.error('Usage: GITHUB_TOKEN=... node scripts/set-gh-secrets.cjs <owner> <repo> KEY=VALUE [...]');
		process.exit(1);
	}

	const headers = {
		'Authorization': `Bearer ${token}`,
		'Accept': 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28'
	};

	const { key_id, key } = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, { headers });

	const sodium = require('libsodium-wrappers-sumo');
	await sodium.ready;

	async function putSecret(name, value) {
		const messageBytes = Buffer.from(value);
		const publicKeyBytes = Buffer.from(key, 'base64');
		const encryptedBytes = sodium.crypto_box_seal(messageBytes, publicKeyBytes);
		const encrypted_value = Buffer.from(encryptedBytes).toString('base64');
		const res = await fetchRaw(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/${encodeURIComponent(name)}`, {
			method: 'PUT',
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({ encrypted_value, key_id })
		});
		if (!res.ok) throw new Error(`Failed to set secret ${name}: ${res.status} ${res.text}`);
	}

	for (const pair of pairs) {
		const eq = pair.indexOf('=');
		if (eq === -1) {
			console.error('Invalid KEY=VALUE pair:', pair);
			process.exit(1);
		}
		const k = pair.slice(0, eq);
		let raw = pair.slice(eq + 1);
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