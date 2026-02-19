import { fetchAllParticles } from './Particles.mjs';
import { fetchAllConstants } from './Constants.mjs';
 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function populateParticles() {
    try {
        const particles = await fetchAllParticles();

        for (const part of particles) {
            const section = document.querySelector(`#${part.category}`);
            if (!section) continue; // Evita erro se a seção não existir
        
            const placeholder = document.createElement('div');
            const containerId = `container-${part.pdgId}`; // ID único
            placeholder.id = containerId;
            
            // 1. Mostra o Spinner (part.data ainda é undefined)
            placeholder.innerHTML = part.renderCard(); 
            section.appendChild(placeholder);
        
            // 2. Espera o tempo do spinner
            await sleep(500); 
        
            // 3. ATIVA OS DADOS: Define part.data como algo verdadeiro 
            // para que o renderCard saia do "if (!this.data)"
            part.data = part; 
        
            // 4. Seleciona o elemento que acabamos de criar e atualiza
            const targetElement = document.getElementById(containerId);
            if (targetElement) {
                targetElement.innerHTML = part.renderCard();
            }
        }
    } catch (error) {
        console.error("Error while populating the site.")
    }
}

populateParticles();

// buttons to see the properties
document.querySelector('#app').addEventListener('click', (e) => {
    if (e.target.classList.contains('details-btn')) {
        const particleId = e.target.getAttribute('data-id');
        const detailsDiv = document.querySelector(`#details-${particleId}`);
        
        detailsDiv.classList.toggle('hidden');
        
        e.target.textContent = detailsDiv.classList.contains('hidden') 
            ? 'See Properties' 
            : 'Close';
    }
    
});

// filters
const filterLinks = document.querySelectorAll('.nav-link[data-filter]');

filterLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const filter = e.target.getAttribute("data-filter");

        const allSections = document.querySelectorAll(".particleCards");

        allSections.forEach(section => {
            if (filter === 'All' || section.id.includes(filter)) {
                section.style.display = ''; //show
            } else {
                section.style.display = 'none'; // hide
            }
        })
    })
})

// the search functions

const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

function peformSearch(){
    const term = searchInput.value.toLowerCase();
    const allParticles = document.querySelectorAll(".particle-card");
    const allConstants = document.querySelectorAll(".constant-card");

    allParticles.forEach(card => {
        const name = card.querySelector("h2").textContent.toLowerCase();
        const id = card.querySelector("p").textContent.toLocaleLowerCase();

        if (term === "" || name.includes(term) || id.includes(term)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });

    allConstants.forEach(card => {
        const name = card.querySelector("h2").textContent.toLowerCase();
        const id = card.querySelector("p").textContent.toLocaleLowerCase();

        if (term === "" || name.includes(term) || id.includes(term)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

searchButton.addEventListener("click", (e) => {
    e.preventDefault();

    peformSearch();
})

// constants

async function populateConstants() {
    const container = document.querySelector("#constants-container");
    if (!container) {
        return; // Sai da função silenciosamente
    }
    const constants = await fetchAllConstants();

    container.innerHTML = constants.map(c => c.renderCard()).join('')
    
    // open the card
    const cards = container.querySelectorAll('.constant-card');
    cards.forEach(card => {
    card.addEventListener('click', () => {

        const details = card.querySelector('.details');
        details.classList.toggle('hidden');
        
        card.classList.toggle('active');
    });
});
}

populateConstants();
