const { mkdir, writeFile } = require('fs/promises');
const jsdom = require('jsdom');
const { exit } = require('process');
const { JSDOM } = jsdom;

class CustomResourceLoader extends jsdom.ResourceLoader {
    fetch(url, options) {
      if (url.includes('google') || url.includes('facebook') || url.includes('newrelic') /*|| url.includes('flickity') || url.includes('Theming')*/) {
        return Promise.resolve(Buffer.from(""));
      }

      return super.fetch(url, options);
    }
}

(async () => {
    await mkdir('./out/', { recursive: true });

    const { window } = await JSDOM.fromURL('https://akron.campusdish.com', { resources: new CustomResourceLoader(), runScripts: "dangerously" });
    window.document.addEventListener('load', async () => {
        const elements = Array.from(window.document.querySelectorAll("ul.locationsList li"))
            .map(e => Array.from(e.querySelectorAll('a.card-link, div.location__status, div.location__times span.hop')))
            .filter(e => e.length !== 0);
        const locations = elements.map(([link, status, times]) => ({ name: link.textContent.trim(), status: status.textContent.trim(), times: status.classList.contains('open') ? times.textContent.trim() : undefined }));
        await writeFile('./out/locations.json', JSON.stringify(locations));
        exit(0);
    });
})();