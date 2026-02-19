import { getJson} from './ExternalServices.mjs'; // comment bruh

export default class Particle {
    constructor(data) {
        this.pdgId = data.pdgId;
        this.name = data.name;
        this.category = data.category;
        this.src = data.src;
        this.symbol = data.symbol;
        this.mass = data.mass;
        this.charge = data.charge;
        this.spin = data.spin;
    }

    renderCard() {

        if (!this.data) {
            return `
                <div class='particle-card loading'>
                    <div class="loader"></div>
                    <span class="loading-text">Fetching ${this.name}...</span>
                </div>
            `;
        };
    
        return `
            <div class='particle-card' style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin: 10px;">
                <h2 style="margin-top: 0;">${this.name}</h2>
                <div class="particleImage">
                    <img src="images/${this.src}" alt="${this.name}">
                </div>
                <p><small>PDG ID: ${this.pdgId}</small></p>
                <button class="details-btn" data-id="${this.pdgId}">See Properties</button>
                <div id="details-${this.pdgId}" class="details-content hidden">
                    ${this._renderProperties()}
                </div>
            </div>
        `;
    }

    _renderProperties() {
        return `
            <div class="prop-item"><small>Symbol:</small> <span>${this.symbol}</span></div>
            <div class="prop-item"><small>Mass:</small> <span>${this.mass}</span></div>
            <div class="prop-item"><small>Charge:</small> <span>${this.charge}</span></div>
            <div class="prop-item"><small>Spin:</small> <span>${this.spin}</span></div>
        `;
    }
}

export async function fetchAllParticles() {
    const url = './json/particles.json';
    const data = await getJson(url);
    return data.map(item => new Particle(item));
}
