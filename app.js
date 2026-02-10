// ============================================
// MAPA DOS CARACTERES - APP LOGIC
// ============================================

// Variabili globali
let currentScores = {
    E: 0, O: 0, P: 0, M: 0, R: 0
};

// ============================================
// INIZIALIZZAZIONE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Imposta data odierna
    document.getElementById('analysisDate').valueAsDate = new Date();
    
    // Aggiungi event listeners a tutti gli input score
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    // Calcola i totali iniziali
    calculateTotals();
});

// ============================================
// CALCOLO TOTALI
// ============================================

function calculateTotals() {
    const rows = document.querySelectorAll('tbody tr[data-zone]');
    let columnTotals = { E: 0, O: 0, P: 0, M: 0, R: 0 };
    let allValid = true;
    
    // Calcola totale per ogni riga
    rows.forEach(row => {
        const inputs = row.querySelectorAll('.score-input');
        let rowTotal = 0;
        
        inputs.forEach(input => {
            const value = parseInt(input.value) || 0;
            rowTotal += value;
            
            const trait = input.dataset.trait;
            columnTotals[trait] += value;
        });
        
        // Aggiorna il totale della riga
        const rowTotalCell = row.querySelector('.row-total');
        rowTotalCell.textContent = rowTotal;
        
        // Evidenzia la riga se non è valida
        if (rowTotal !== 10) {
            rowTotalCell.style.color = 'red';
            rowTotalCell.style.fontWeight = '700';
            allValid = false;
        } else {
            rowTotalCell.style.color = 'green';
        }
    });
    
    // Aggiorna i totali delle colonne
    document.getElementById('totalE').textContent = columnTotals.E;
    document.getElementById('totalO').textContent = columnTotals.O;
    document.getElementById('totalP').textContent = columnTotals.P;
    document.getElementById('totalM').textContent = columnTotals.M;
    document.getElementById('totalR').textContent = columnTotals.R;
    
    // Calcola percentuali
    const grandTotal = columnTotals.E + columnTotals.O + columnTotals.P + columnTotals.M + columnTotals.R;
    document.getElementById('grandTotal').textContent = grandTotal + '/60';
    
    if (grandTotal === 60) {
        document.getElementById('grandTotal').style.background = '#27ae60';
        currentScores = {
            E: Math.round((columnTotals.E / 60) * 100),
            O: Math.round((columnTotals.O / 60) * 100),
            P: Math.round((columnTotals.P / 60) * 100),
            M: Math.round((columnTotals.M / 60) * 100),
            R: Math.round((columnTotals.R / 60) * 100)
        };
    } else {
        document.getElementById('grandTotal').style.background = '#e74c3c';
    }
    
    // Aggiorna percentuali
    document.getElementById('percentE').textContent = currentScores.E + '%';
    document.getElementById('percentO').textContent = currentScores.O + '%';
    document.getElementById('percentP').textContent = currentScores.P + '%';
    document.getElementById('percentM').textContent = currentScores.M + '%';
    document.getElementById('percentR').textContent = currentScores.R + '%';
    
    // Validazione visuale
    const validationMsg = document.getElementById('validationMessage');
    if (!allValid) {
        validationMsg.className = 'validation-message error';
        validationMsg.textContent = '⚠️ Attenzione: Ogni riga deve sommare esattamente a 10 punti!';
    } else if (grandTotal !== 60) {
        validationMsg.className = 'validation-message error';
        validationMsg.textContent = '⚠️ Il totale generale deve essere 60 punti!';
    } else {
        validationMsg.className = 'validation-message success';
        validationMsg.textContent = '✓ Tutti i punteggi sono corretti! Puoi generare il report.';
    }
    
    return allValid && grandTotal === 60;
}

// ============================================
// GENERAZIONE REPORT
// ============================================

function generateReport() {
    // Validazione input
    const clientName = document.getElementById('clientName').value.trim();
    const analysisDate = document.getElementById('analysisDate').value;
    
    if (!clientName) {
        alert('⚠️ Inserisci il nome del cliente!');
        document.getElementById('clientName').focus();
        return;
    }
    
    if (!calculateTotals()) {
        alert('⚠️ Correggi i punteggi prima di generare il report!');
        return;
    }
    
    // Nascondi sezione input e mostra report
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'block';
    
    // Genera il contenuto del report
    const reportHTML = generateReportHTML(clientName, analysisDate);
    document.getElementById('reportContent').innerHTML = reportHTML;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function generateReportHTML(clientName, analysisDate) {
    const analystName = document.getElementById('analystName').value.trim() || 'Analista Certificato';
    const dateFormatted = new Date(analysisDate).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Identifica tratti dominanti
    const traits = [
        { name: 'Schizoide', code: 'E', percent: currentScores.E, color: '#9b59b6' },
        { name: 'Orale', code: 'O', percent: currentScores.O, color: '#f39c12' },
        { name: 'Psicopatico', code: 'P', percent: currentScores.P, color: '#e74c3c' },
        { name: 'Masochista', code: 'M', percent: currentScores.M, color: '#95a5a6' },
        { name: 'Rigido', code: 'R', percent: currentScores.R, color: '#e91e63' }
    ];
    
    const sortedTraits = [...traits].sort((a, b) => b.percent - a.percent);
    const dominantTraits = sortedTraits.filter(t => t.percent >= 20);
    
    // Calcola metriche derivate
    const metrics = calculateMetrics(currentScores);
    
    // Costruisci HTML
    let html = `
        <div class="report-title">
            <h1>📊 MAPA DOS CARACTERES</h1>
            <h2 class="report-subtitle">Analisi Corporea Professionale</h2>
        </div>
        
        <div class="client-info">
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Data Analisi:</strong> ${dateFormatted}</p>
            <p><strong>Analista:</strong> ${analystName}</p>
        </div>
        
        <div class="card">
            <h2>🎯 Sintesi del Profilo</h2>
            <p style="font-size: 1.1em; line-height: 1.8;">
                ${clientName} presenta un profilo caratterizzato principalmente da <strong>${dominantTraits.map(t => `${t.name} (${t.percent}%)`).join(', ')}</strong>.
                Questo indica una personalità ${getDominantDescription(dominantTraits)}.
            </p>
        </div>
        
        <div class="card">
            <h2>📈 Distribuzione dei Tratti</h2>
            <div class="charts-container">
                <div class="chart-box">
                    <h3>Grafico a Torta</h3>
                    <canvas id="pieChart"></canvas>
                </div>
                <div class="chart-box">
                    <h3>Grafico a Barre</h3>
                    <canvas id="barChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>📊 Punteggi Dettagliati per Zona</h2>
            ${generateScoreTable()}
        </div>
        
        <div class="card">
            <h2>🎲 Metriche Composite</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Necessità di Controllo</h4>
                    <div class="metric-value">${metrics.needControl}%</div>
                    <p>${getControlDescription(metrics.needControl)}</p>
                </div>
                <div class="metric-card">
                    <h4>Necessità di Perfezione</h4>
                    <div class="metric-value">${metrics.needPerfection}%</div>
                    <p>${getPerfectionDescription(metrics.needPerfection)}</p>
                </div>
                <div class="metric-card">
                    <h4>Ambizione</h4>
                    <div class="metric-value">${metrics.ambition}%</div>
                    <p>${getAmbitionDescription(metrics.ambition)}</p>
                </div>
                <div class="metric-card">
                    <h4>Dipendenza Emotiva</h4>
                    <div class="metric-value">${metrics.emotionalDependency}%</div>
                    <p>${getDependencyDescription(metrics.emotionalDependency)}</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>⚖️ Polarità Comportamentali</h2>
            ${generatePolarities(metrics)}
        </div>
        
        ${generateTraitDescriptions(dominantTraits, clientName)}
        
        ${generateConflicts(dominantTraits)}
        
        ${generateActionPlan(dominantTraits, clientName)}
        
        <div class="card" style="background: #f8f9fa; border-left: 5px solid #3498db;">
            <h2>📝 Note Finali</h2>
            <p style="font-size: 1.05em; line-height: 1.8;">
                Questo report è uno strumento di <strong>autoconoscenza</strong> e <strong>crescita personale</strong>. 
                I tratti identificati non sono diagnosi cliniche, ma pattern comportamentali e corporei che possono 
                aiutare ${clientName} a comprendere meglio sé stesso/a e a sviluppare strategie per vivere nel "risorsa" 
                piuttosto che nel "dolore" di ciascun tratto.
            </p>
            <p style="font-size: 1.05em; line-height: 1.8; margin-top: 15px;">
                Si consiglia di rivedere questo report insieme a un professionista certificato in Analisi Corporea 
                per massimizzare i benefici dell'analisi.
            </p>
        </div>
    `;
    
    // Genera i grafici dopo che l'HTML è stato inserito
    setTimeout(() => {
        createCharts(traits);
    }, 100);
    
    return html;
}

// ============================================
// FUNZIONI DI UTILITÀ PER IL REPORT
// ============================================

function calculateMetrics(scores) {
    const needControl = Math.round((scores.P + scores.R + scores.M) / 3);
    const needPerfection = Math.round((scores.R + scores.M) / 2);
    const ambition = Math.round((scores.R + scores.P) / 2);
    const rawDE = (scores.O * 3 + scores.R * 2 + scores.P * 1 + scores.M * 1 - scores.E * 2);
    const emotionalDependency = Math.max(0, Math.min(100, Math.round((rawDE / 300) * 100 + 50)));
    
    const people = scores.O + scores.P + scores.R;
    const cave = scores.E + scores.M;
    const totalPC = people + cave || 1;
    const peoplePercent = Math.round((people / totalPC) * 100);
    const cavePercent = Math.round((cave / totalPC) * 100);
    
    const emotional = scores.O + scores.M;
    const rational = scores.E + scores.P;
    const totalER = emotional + rational || 1;
    const emotionalPercent = Math.round((emotional / totalER) * 100);
    const rationalPercent = Math.round((rational / totalER) * 100);
    
    const executor = scores.R + scores.M;
    const delegator = scores.O + scores.E + scores.P;
    const totalED = executor + delegator || 1;
    const executorPercent = Math.round((executor / totalED) * 100);
    const delegatorPercent = Math.round((delegator / totalED) * 100);
    
    return {
        needControl,
        needPerfection,
        ambition,
        emotionalDependency,
        peoplePercent,
        cavePercent,
        emotionalPercent,
        rationalPercent,
        executorPercent,
        delegatorPercent
    };
}

function getDominantDescription(dominantTraits) {
    if (dominantTraits.length === 0) return "equilibrata senza tratti dominanti chiari";
    if (dominantTraits.length === 1) return `fortemente caratterizzata dal tratto ${dominantTraits[0].name}`;
    return `con una combinazione di tratti ${dominantTraits.map(t => t.name).join(' e ')}`;
}

function getControlDescription(value) {
    if (value >= 60) return "Molto alta - forte bisogno di gestire situazioni";
    if (value >= 40) return "Alta - preferisce avere il controllo";
    if (value >= 20) return "Media - equilibrio tra controllo e flessibilità";
    return "Bassa - si adatta facilmente alle circostanze";
}

function getPerfectionDescription(value) {
    if (value >= 60) return "Molto alta - standard elevati in tutto";
    if (value >= 40) return "Alta - cerca l'eccellenza";
    if (value >= 20) return "Media - fa bene ciò che conta";
    return "Bassa - accetta l'imperfezione";
}

function getAmbitionDescription(value) {
    if (value >= 60) return "Molto alta - orientato al successo";
    if (value >= 40) return "Alta - motivato a raggiungere obiettivi";
    if (value >= 20) return "Media - ambizione equilibrata";
    return "Bassa - priorità su altri valori";
}

function getDependencyDescription(value) {
    if (value >= 60) return "Alta - necessita conferme esterne";
    if (value >= 40) return "Media-alta - tende a cercare approvazione";
    if (value >= 20) return "Media - equilibrio tra autonomia e relazione";
    return "Bassa - molto indipendente";
}

function generateScoreTable() {
    const zones = [
        { name: 'Testa', zone: 'testa' },
        { name: 'Occhi', zone: 'occhi' },
        { name: 'Bocca', zone: 'bocca' },
        { name: 'Tronco', zone: 'tronco' },
        { name: 'Bacino', zone: 'bacino' },
        { name: 'Gambe', zone: 'gambe' }
    ];
    
    let html = '<table><thead><tr>';
    html += '<th>Zona</th><th>E</th><th>O</th><th>P</th><th>M</th><th>R</th><th>Tot</th>';
    html += '</tr></thead><tbody>';
    
    zones.forEach(zone => {
        const row = document.querySelector(`tr[data-zone="${zone.zone}"]`);
        const inputs = row.querySelectorAll('.score-input');
        html += `<tr><td><strong>${zone.name}</strong></td>`;
        inputs.forEach(input => {
            html += `<td>${input.value}</td>`;
        });
        html += '<td>10</td></tr>';
    });
    
    html += '<tr style="background: #ecf0f1; font-weight: 700;">';
    html += '<td>TOTALE</td>';
    html += `<td>${currentScores.E * 0.6}</td>`;
    html += `<td>${currentScores.O * 0.6}</td>`;
    html += `<td>${currentScores.P * 0.6}</td>`;
    html += `<td>${currentScores.M * 0.6}</td>`;
    html += `<td>${currentScores.R * 0.6}</td>`;
    html += '<td>60</td></tr>';
    
    html += '<tr style="background: #d1ecf1; font-weight: 700;">';
    html += '<td>%</td>';
    html += `<td>${currentScores.E}%</td>`;
    html += `<td>${currentScores.O}%</td>`;
    html += `<td>${currentScores.P}%</td>`;
    html += `<td>${currentScores.M}%</td>`;
    html += `<td>${currentScores.R}%</td>`;
    html += '<td>100%</td></tr>';
    
    html += '</tbody></table>';
    return html;
}

function generatePolarities(metrics) {
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="text-align: center; margin-bottom: 15px;">👥 Persone vs 🏔️ Caverna</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #3498db;">${metrics.peoplePercent}%</span>
                    <span style="color: #95a5a6;">${metrics.cavePercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #666;">
                    ${metrics.peoplePercent > 60 ? "Orientato alla socialità" : metrics.cavePercent > 60 ? "Orientato alla solitudine" : "Equilibrio"}
                </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="text-align: center; margin-bottom: 15px;">❤️ Emozionale vs 🧠 Razionale</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #e74c3c;">${metrics.emotionalPercent}%</span>
                    <span style="color: #9b59b6;">${metrics.rationalPercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #666;">
                    ${metrics.emotionalPercent > 60 ? "Guidato dalle emozioni" : metrics.rationalPercent > 60 ? "Guidato dalla logica" : "Equilibrio"}
                </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="text-align: center; margin-bottom: 15px;">⚡ Esecutore vs 🎯 Delegatore</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #27ae60;">${metrics.executorPercent}%</span>
                    <span style="color: #f39c12;">${metrics.delegatorPercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #666;">
                    ${metrics.executorPercent > 60 ? "Preferisce fare da sé" : metrics.delegatorPercent > 60 ? "Preferisce delegare" : "Equilibrio"}
                </p>
            </div>
        </div>
    `;
}

function generateTraitDescriptions(dominantTraits, clientName) {
    const descriptions = {
        'Schizoide': {
            resource: "Creatività eccezionale, pensiero innovativo, capacità di analisi profonda, intuizione sviluppata",
            pain: "Tendenza all'isolamento, difficoltà nelle relazioni, sensazione di non appartenere, paura del rifiuto",
            favorableEnv: "Ambienti dove può creare liberamente, lavorare in autonomia, essere apprezzato per le idee",
            unfavorableEnv: "Ambienti invasivi, che richiedono socialità forzata, che non valorizzano la creatività"
        },
        'Orale': {
            resource: "Comunicazione efficace, empatia naturale, capacità di connessione, sensibilità agli altri",
            pain: "Paura dell'abbandono, dipendenza emotiva, tendenza a mangiare per colmare vuoti affettivi",
            favorableEnv: "Ambienti accoglienti, relazioni autentiche, possibilità di esprimere emozioni",
            unfavorableEnv: "Ambienti freddi, isolamento, richiesta di trattenere le emozioni"
        },
        'Psicopatico': {
            resource: "Leadership naturale, capacità strategica, problem solving veloce, adattabilità",
            pain: "Difficoltà a fidarsi, tendenza al controllo eccessivo, paura di essere manipolato",
            favorableEnv: "Posizioni di comando, progetti strategici, autonomia decisionale",
            unfavorableEnv: "Situazioni dove non ha potere, richieste emotive eccessive, mancanza di chiarezza negli accordi"
        },
        'Masochista': {
            resource: "Metodo e organizzazione, attenzione ai dettagli, lealtà, capacità di sopportazione",
            pain: "Accumulo di rabbia, difficoltà a esprimersi, paura dell'umiliazione, auto-sabotaggio",
            favorableEnv: "Routine strutturate, riconoscimento del lavoro svolto, sicurezza e stabilità",
            unfavorableEnv: "Improvvisazione costante, critiche pubbliche, mancanza di sicurezza"
        },
        'Rigido': {
            resource: "Esecuzione eccellente, competitività sana, perfezionismo produttivo, seduzione e carisma",
            pain: "Paura del tradimento, perfezionismo paralizzante, difficoltà a essere vulnerabile",
            favorableEnv: "Opportunità di competere, riconoscimento come 'la migliore opzione', sfide stimolanti",
            unfavorableEnv: "Comparazioni con altri, sensazione di essere seconda scelta, mancanza di possibilità di eccellere"
        }
    };
    
    let html = '';
    dominantTraits.forEach(trait => {
        const desc = descriptions[trait.name];
        if (desc) {
            html += `
                <div class="trait-section" style="border-left-color: ${trait.color};">
                    <h3 style="color: ${trait.color};">🎭 ${trait.name.toUpperCase()} (${trait.percent}%)</h3>
                    
                    <h4>✨ Risorse (Superpotere)</h4>
                    <p>${desc.resource}</p>
                    
                    <h4>⚠️ Dolore (Quando nel Disagio)</h4>
                    <p>${desc.pain}</p>
                    
                    <h4>✅ Ambiente che Favorisce</h4>
                    <p>${desc.favorableEnv}</p>
                    
                    <h4>❌ Ambiente che Danneggia</h4>
                    <p>${desc.unfavorableEnv}</p>
                </div>
            `;
        }
    });
    
    return html;
}

function generateConflicts(dominantTraits) {
    if (dominantTraits.length < 2) return '';
    
    const conflicts = {
        'Rigido-Orale': "Il Rigido vuole apparire perfetto; l'Orale vuole essere vulnerabile. Negoziare momenti per ciascuno.",
        'Rigido-Schizoide': "Il Rigido ama i riflettori; lo Schizoide li teme. Pianificare 'caverna' dopo ogni esposizione.",
        'Orale-Schizoide': "L'Orale è emotivo; lo Schizoide razionale. Accettare l'oscillazione tra i due poli.",
        'Psicopatico-Schizoide': "Lo Schizoide non vuole disturbare; il Psicopatico ama sfidare. Scegliere quando attivare ciascuno.",
        'Orale-Psicopatico': "Il Psicopatico è freddo; l'Orale ipersensibile. Decidere caso per caso: risolvere o ascoltare?",
        'Psicopatico-Rigido': "Il Psicopatico vuole delegare; il Rigido eseguire. Delegare il meno importante, eseguire l'essenziale."
    };
    
    let html = '<div class="card"><h2>⚡ Conflitti Interni Principali</h2>';
    
    for (let i = 0; i < dominantTraits.length - 1; i++) {
        for (let j = i + 1; j < dominantTraits.length; j++) {
            const key1 = `${dominantTraits[i].name}-${dominantTraits[j].name}`;
            const key2 = `${dominantTraits[j].name}-${dominantTraits[i].name}`;
            
            if (conflicts[key1]) {
                html += `<div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #f39c12; border-radius: 5px;">
                    <h4>${dominantTraits[i].name} ⚔️ ${dominantTraits[j].name}</h4>
                    <p>${conflicts[key1]}</p>
                </div>`;
            } else if (conflicts[key2]) {
                html += `<div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #f39c12; border-radius: 5px;">
                    <h4>${dominantTraits[j].name} ⚔️ ${dominantTraits[i].name}</h4>
                    <p>${conflicts[key2]}</p>
                </div>`;
            }
        }
    }
    
    html += '</div>';
    return html;
}

function generateActionPlan(dominantTraits, clientName) {
    const actions = {
        'Rigido': [
            "Creare opportunità per scaricare energia fisica: palestra, sport, competizione",
            "Avere una persona di fiducia per mostrare vulnerabilità",
            "Dividere i progetti in micro-obiettivi e celebrare ogni vittoria",
            "Curare l'estetica personale in modo consapevole",
            "Ricordare: la perfezione al 100% non esiste"
        ],
        'Orale': [
            "Stare con persone positive e accoglienti",
            "Concedersi piaceri sensoriali quotidiani (cibo, musica, contatto)",
            "Imparare a chiedere aiuto esplicitamente",
            "Quando arriva la voglia di mangiare emotivamente, sostituire con abbraccio o conversazione",
            "Comunicare apertamente: 'Mi piace essere visto/a, ascoltato/a'"
        ],
        'Psicopatico': [
            "Avere chiarezza su cosa si guadagna da ogni situazione",
            "Stare in posizioni di comando e strategia",
            "Avere persone di fiducia con cui condividere senza paura",
            "Fare accordi con sé stessi e mantenerli",
            "Assicurarsi che gli accordi con gli altri siano equi"
        ],
        'Masochista': [
            "Esprimere la rabbia in modo sano prima che esploda",
            "Fare attività che liberino: arti marziali, danza, terapia di grito",
            "Creare routine sicure con micro-novità settimanali",
            "Dare valore ai propri contributi senza aspettare riconoscimento",
            "Imparare a dire 'no' senza sensi di colpa"
        ],
        'Schizoide': [
            "Annotare sempre le idee in un quaderno creativo",
            "Avere tempo protetto per stare soli: musica, film, meditazione",
            "Cercare persone che aiutino a realizzare le idee",
            "Non obbligarsi al contatto fisico quando non si ha voglia",
            "Valorizzare le proprie creazioni senza paragonarle"
        ]
    };
    
    let html = '<div class="card"><h2>🎯 Piano d\'Azione Personalizzato</h2>';
    html += `<p style="font-size: 1.1em; margin-bottom: 25px;">Azioni concrete per ${clientName} per vivere nel RISORSA di ciascun tratto:</p>`;
    
    dominantTraits.forEach(trait => {
        const traitActions = actions[trait.name];
        if (traitActions) {
            html += `<div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 5px solid ${trait.color};">`;
            html += `<h3 style="color: ${trait.color};">${trait.name}</h3><ul style="margin-left: 20px;">`;
            traitActions.forEach(action => {
                html += `<li style="margin: 10px 0;">${action}</li>`;
            });
            html += '</ul></div>';
        }
    });
    
    html += '</div>';
    return html;
}

// ============================================
// GRAFICI (usando Chart.js via CDN)
// ============================================

function createCharts(traits) {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            drawCharts(traits);
        };
        document.head.appendChild(script);
    } else {
        drawCharts(traits);
    }
}

function drawCharts(traits) {
    const colors = traits.map(t => t.color);
    const labels = traits.map(t => t.name);
    const data = traits.map(t => t.percent);
    
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Percentuale (%)',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: '#333'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// ============================================
// FUNZIONI DI NAVIGAZIONE E UTILITY
// ============================================

function backToInput() {
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    window.scrollTo(0, 0);
}

function resetForm() {
    if (confirm('⚠️ Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.')) {
        document.querySelectorAll('.score-input').forEach(input => input.value = 0);
        document.getElementById('clientName').value = '';
        document.getElementById('analystName').value = '';
        document.getElementById('analysisDate').valueAsDate = new Date();
        calculateTotals();
    }
}

function printReport() {
    window.print();
}

function downloadPDF() {
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
            generatePDF();
        };
        document.head.appendChild(script);
    } else {
        generatePDF();
    }
}

function generatePDF() {
    const clientName = document.getElementById('clientName').value.trim() || 'Cliente';
    const element = document.getElementById('reportContent');
    const opt = {
        margin: 10,
        filename: `Mapa_Caracteres_${clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}