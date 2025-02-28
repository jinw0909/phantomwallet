import React, { useEffect, useState } from 'react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Helper: Build the deep link URL for Phantom.
const buildUrl = (path, params) => {
    return `https://phantom.app/ul/v1/${path}?${params.toString()}`;
};

// Helper: Decrypt an encrypted payload using the shared secret.
// In browsers, we use TextDecoder instead of Buffer.
const decryptPayload = (data, nonce, sharedSecret) => {
    const decodedData = bs58.decode(data);
    const decodedNonce = bs58.decode(nonce);
    const decryptedData = nacl.box.open.after(decodedData, decodedNonce, sharedSecret);
    if (!decryptedData) throw new Error("Unable to decrypt data");
    return JSON.parse(new TextDecoder().decode(decryptedData));
};

const MobilePhantomConnection = () => {

    // Generate a key pair for the dApp.
    const [dappKeyPair] = useState(nacl.box.keyPair());
    // State to hold the decrypted connection response.
    const [connectionResponse, setConnectionResponse] = useState(null);

    // Function to initiate the connection by building and opening the deep link.
    const connect = () => {
        // Create query parameters required by Phantom.
        const params = new URLSearchParams({
            dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
            cluster: "mainnet-beta",
            // The app_url is used by Phantom to fetch metadata (title, icon, etc.)
            app_url: window.location.origin,
            // The redirect_link tells Phantom where to return after connection.
            redirect_link: window.location.origin + "/mobile/onConnect",
        });
        const url = buildUrl("connect", params);
        // Redirect to Phantom via the deep link.
        window.location.href = url;
    };

    // When the page loads, check if we are on the redirect route (e.g., /mobile/onConnect)
    useEffect(() => {
        if (window.location.pathname.includes("onConnect")) {
            const url = new URL(window.location.href);
            const phantomEncryptionPublicKey = url.searchParams.get("phantom_encryption_public_key");
            const data = url.searchParams.get("data");
            const nonce = url.searchParams.get("nonce");

            if (phantomEncryptionPublicKey && data && nonce) {
                // Derive the shared secret between Phantom and the dApp.
                const sharedSecret = nacl.box.before(
                    bs58.decode(phantomEncryptionPublicKey),
                    dappKeyPair.secretKey
                );
                try {
                    // Decrypt the response payload.
                    const decrypted = decryptPayload(data, nonce, sharedSecret);
                    console.log("Decrypted connection data:", decrypted);
                    setConnectionResponse(decrypted);
                } catch (error) {
                    console.error("Decryption error:", error);
                }
            }
        }
    }, [dappKeyPair]);

    return (
        <div style={{ padding: 20 }}>
            <h1>Mobile Phantom Connection</h1>
            {connectionResponse ? (
                <div>
                    <h2>Connected!</h2>
                    <pre>{JSON.stringify(connectionResponse, null, 2)}</pre>
                </div>
            ) : (
                <button onClick={connect}>Connect to Phantom</button>
            )}
        </div>
    );
};

export default MobilePhantomConnection;
