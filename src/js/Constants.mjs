import { getJson } from './ExternalServices.mjs';

export default class Constants {
    constructor(data) {
        this.name = data.quantity;
        this.value = data.value;
        this.uncertainty = data.uncertainty;
        this.unit = data.unit || '';
    }

    renderCard() {
        return `
            <div class='constant-card'>
                <h2>${this.name}</h2>
                <div class="constant-preview-value">
                    ${this.value} <small>${this.unit}</small>
                </div>
                <div class="details hidden">
                    <p><strong>Uncertainty:</strong> ${this.uncertainty}</p>
                    <p><strong>Full Value:</strong> ${this.value} ${this.unit}</p>
                </div>
            </div>
        `;
    }
}

export async function fetchAllConstants() {
    const url = './json/constants.json';
    const data = await getJson(url);
    return data.map(item => new Constants(item));
}