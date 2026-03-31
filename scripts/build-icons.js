const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');

const sizes = [16, 32, 48, 64, 128, 256];

(async () => {
    for (const size of sizes) {
        await sharp('public/logo.svg')
            .resize(size, size)
            .toFile(`public/icon-${size}.png`);
    }

    const ico = await pngToIco(
        sizes.map(size => `public/icon-${size}.png`)
    );

    fs.writeFileSync('public/icon.ico', ico);

    console.log('✅ icon.ico ready');
})();