import crypto from 'crypto';

const KEY_LENGTH = 256; // Length of the key in bits

/**
 * Generate the JWT Secret in hex format, with lenght of KEY_LENGTH
 */
function generateKey() {
	const key = crypto.randomBytes(KEY_LENGTH / 8).toString('hex'); // Convert to hex string
	return key;
}

console.log(`Secret: ${generateKey()}`);
