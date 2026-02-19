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

// --- FUNÇÃO DE BUSCA CORRIGIDA ---
function peformSearch(){
    const term = searchInput.value.toLowerCase();
    
    // Selecionamos todos os cards (partículas e constantes)
    const allCards = document.querySelectorAll(".particle-card, .constant-card");

    allCards.forEach(card => {
        // Buscamos o título h2 de cada card
        const name = card.querySelector("h2").textContent.toLowerCase();
        
        // Pegamos todo o texto do card para aumentar a abrangência da busca
        const fullText = card.textContent.toLowerCase();

        if (term === "" || name.includes(term) || fullText.includes(term)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    peformSearch();
});

// --- CONSTANTES ---
async function populateConstants() {
    const container = document.querySelector("#constants-container");
    if (!container) return;

    const constants = await fetchAllConstants();
    container.innerHTML = constants.map(c => c.renderCard()).join('');
    
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

// --- CALCULADORA (LÓGICA UNIFICADA) ---
async function initCalculator() {
    const input = document.getElementById('calc-input');
    const suggestions = document.getElementById('constants-suggestions');
    const resultDiv = document.getElementById('calc-result');
    const clearBtn = document.getElementById('clear-calc');
    const executeBtn = document.getElementById('execute-calc');
    const clearHistoryBtn = document.getElementById('clear-history');

    if (!input || !resultDiv) return; // Segurança caso não esteja na página da calculadora

    const constants = await fetchAllConstants();

    // Eventos dos botões de operação
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value += btn.getAttribute('data-val');
            input.focus();
        });
    });

    clearBtn.addEventListener('click', () => {
        input.value = "";
        resultDiv.textContent = "Result: --";
    });

    // Lógica do Slash Command "\"
    input.addEventListener('input', () => {
        if (input.value.slice(-1) === '\\') {
            showSuggestions();
        } else if (!input.value.includes('\\')) {
            suggestions.classList.add('hidden');
        }
    });

    function showSuggestions() {
        suggestions.innerHTML = constants.map(c => `
            <div class="suggestion-item" data-value="${c.value}">
                ${c.name} (${c.value})
            </div>
        `).join('');
        suggestions.classList.remove('hidden');

        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const constantValue = item.getAttribute('data-value');
                input.value = input.value.replace(/\\$/, constantValue);
                suggestions.classList.add('hidden');
                input.focus();
            });
        });
    }

    // Execução do Cálculo e Salvamento
    executeBtn.addEventListener('click', () => {
        try {
            const expression = input.value;
            // O eval resolve a string matemática diretamente
            const resultValue = eval(expression);
            const formattedResult = resultValue.toExponential(6);
            
            resultDiv.innerHTML = `Result: <strong>${formattedResult}</strong>`;
            
            saveCalculation(expression, formattedResult);
        } catch (err) {
            resultDiv.innerHTML = `<span style="color:red">Invalid Expression</span>`;
        }
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem('calc_history');
            renderHistory();
        });
    }

    renderHistory();
}

// --- FUNÇÕES DE HISTÓRICO (FORA DA INIT PARA ACESSO GLOBAL) ---
function saveCalculation(expression, result) {
    const history = JSON.parse(localStorage.getItem('calc_history')) || [];
    const newEntry = { expression, result, date: new Date().toLocaleString() };
    history.unshift(newEntry);
    localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 5)));
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('calc-history-list');
    if (!historyContainer) return;

    const history = JSON.parse(localStorage.getItem('calc_history')) || [];
    historyContainer.innerHTML = history.map(item => `
        <div style="border-bottom: 1px solid #232936; padding: 5px 0; font-size: 0.8em;">
            <div style="color: var(--text-light-gray);">${item.expression}</div>
            <div style="color: var(--atomic-teal); font-family: 'Roboto Mono';">${item.result}</div>
        </div>
    `).join('');
}

// Inicializa a calculadora após carregar tudo
initCalculator();