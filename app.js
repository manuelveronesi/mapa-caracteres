// ============================================
// MAPA DOS CARACTERES - APP LOGIC
// Multi-language support with proper contrast
// ============================================

let currentScores = {
    E: 0, O: 0, P: 0, M: 0, R: 0
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('analysisDate').valueAsDate = new Date();
    
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    calculateTotals();
});

function calculateTotals() {
    const rows = document.querySelectorAll('tbody tr[data-zone]');
    let columnTotals = { E: 0, O: 0, P: 0, M: 0, R: 0 };
    let allValid = true;
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('.score-input');
        let rowTotal = 0;
        
        inputs.forEach(input => {
            const value = parseInt(input.value) || 0;
            rowTotal += value;
            
            const trait = input.dataset.trait;
            columnTotals[trait] += value;
        });
        
        const rowTotalCell = row.querySelector('.row-total');
        rowTotalCell.textContent = rowTotal;
        
        if (rowTotal !== 10) {
            rowTotalCell.style.color = '#dc2626';
            rowTotalCell.style.fontWeight = '700';
            allValid = false;
        } else {
            rowTotalCell.style.color = '#059669';
        }
    });
    
    document.getElementById('totalE').textContent = columnTotals.E;
    document.getElementById('totalO').textContent = columnTotals.O;
    document.getElementById('totalP').textContent = columnTotals.P;
    document.getElementById('totalM').textContent = columnTotals.M;
    document.getElementById('totalR').textContent = columnTotals.R;
    
    const grandTotal = columnTotals.E + columnTotals.O + columnTotals.P + columnTotals.M + columnTotals.R;
    document.getElementById('grandTotal').textContent = grandTotal + '/60';
    
    if (grandTotal === 60) {
        document.getElementById('grandTotal').style.background = '#059669';
        currentScores = {
            E: Math.round((columnTotals.E / 60) * 100),
            O: Math.round((columnTotals.O / 60) * 100),
            P: Math.round((columnTotals.P / 60) * 100),
            M: Math.round((columnTotals.M / 60) * 100),
            R: Math.round((columnTotals.R / 60) * 100)
        };
    } else {
        document.getElementById('grandTotal').style.background = '#dc2626';
    }
    
    document.getElementById('percentE').textContent = currentScores.E + '%';
    document.getElementById('percentO').textContent = currentScores.O + '%';
    document.getElementById('percentP').textContent = currentScores.P + '%';
    document.getElementById('percentM').textContent = currentScores.M + '%';
    document.getElementById('percentR').textContent = currentScores.R + '%';
    
    const validationMsg = document.getElementById('validationMessage');
    if (!allValid) {
        validationMsg.className = 'validation-message error';
        validationMsg.textContent = t('error_invalid_scores');
    } else if (grandTotal !== 60) {
        validationMsg.className = 'validation-message error';
        validationMsg.textContent = t('error_total_60');
    } else {
        validationMsg.className = 'validation-message success';
        validationMsg.textContent = t('success_correct');
    }
    
    return allValid && grandTotal === 60;
}

function generateReport() {
    const clientName = document.getElementById('clientName').value.trim();
    const analysisDate = document.getElementById('analysisDate').value;
    
    if (!clientName) {
        alert(t('error_insert_name'));
        document.getElementById('clientName').focus();
        return;
    }
    
    if (!calculateTotals()) {
        alert(t('error_fix_scores'));
        return;
    }
    
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'block';
    
    const reportHTML = generateReportHTML(clientName, analysisDate);
    document.getElementById('reportContent').innerHTML = reportHTML;
    
    window.scrollTo(0, 0);
}

function generateReportHTML(clientName, analysisDate) {
    const analystName = document.getElementById('analystName').value.trim() || t('analyst_name');
    const dateFormatted = new Date(analysisDate).toLocaleDateString(currentLanguage === 'pt-BR' ? 'pt-BR' : currentLanguage);
    
    const traits = [
        { name: t('trait_e'), code: 'E', percent: currentScores.E, color: '#7c3aed' },
        { name: t('trait_o'), code: 'O', percent: currentScores.O, color: '#f59e0b' },
        { name: t('trait_p'), code: 'P', percent: currentScores.P, color: '#ef4444' },
        { name: t('trait_m'), code: 'M', percent: currentScores.M, color: '#6b7280' },
        { name: t('trait_r'), code: 'R', percent: currentScores.R, color: '#ec4899' }
    ];
    
    const sortedTraits = [...traits].sort((a, b) => b.percent - a.percent);
    const dominantTraits = sortedTraits.filter(t => t.percent >= 20);
    
    const metrics = calculateMetrics(currentScores);
    
    let html = `
        <div class="report-title">
            <h1>📊 Mapa dos Caracteres</h1>
            <h2 class="report-subtitle">${t('profile_summary')}</h2>
        </div>
        
        <div class="client-info">
            <p><strong>${t('client_name')}:</strong> ${clientName}</p>
            <p><strong>${t('analysis_date')}:</strong> ${dateFormatted}</p>
            <p><strong>${t('analyst_name')}:</strong> ${analystName}</p>
        </div>
        
        <div class="card">
            <h2>🎯 ${t('profile_summary')}</h2>
            <p style="font-size: 1.1em; line-height: 1.8; color: #374151;">
                ${clientName} apresenta um perfil caracterizado principalmente por <strong>${dominantTraits.map(t => `${t.name} (${t.percent}%)`).join(', ')}</strong>.
            </p>
        </div>
        
        <div class="card">
            <h2>${t('trait_distribution')}</h2>
            <div class="charts-container">
                <div class="chart-box">
                    <h3>${t('pie_chart')}</h3>
                    <canvas id="pieChart"></canvas>
                </div>
                <div class="chart-box">
                    <h3>${t('bar_chart')}</h3>
                    <canvas id="barChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>${t('detailed_scores')}</h2>
            ${generateScoreTable()}
        </div>
        
        <div class="card">
            <h2>${t('composite_metrics')}</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>${t('need_control')}</h4>
                    <div class="metric-value">${metrics.needControl}%</div>
                    <p>${getControlDescription(metrics.needControl)}</p>
                </div>
                <div class="metric-card">
                    <h4>${t('need_perfection')}</h4>
                    <div class="metric-value">${metrics.needPerfection}%</div>
                    <p>${getPerfectionDescription(metrics.needPerfection)}</p>
                </div>
                <div class="metric-card">
                    <h4>${t('ambition')}</h4>
                    <div class="metric-value">${metrics.ambition}%</div>
                    <p>${getAmbitionDescription(metrics.ambition)}</p>
                </div>
                <div class="metric-card">
                    <h4>${t('emotional_dependency')}</h4>
                    <div class="metric-value">${metrics.emotionalDependency}%</div>
                    <p>${getDependencyDescription(metrics.emotionalDependency)}</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>${t('behavioral_polarities')}</h2>
            ${generatePolarities(metrics)}
        </div>
        
        ${generateTraitDescriptions(dominantTraits, clientName)}
        
        ${generateConflicts(dominantTraits)}
        
        ${generateActionPlan(dominantTraits, clientName)}
        
        <div class="card" style="background: #f9fafb; border-left: 5px solid #2563eb; color: #374151;">
            <h2>${t('final_notes')}</h2>
            <p style="font-size: 1.05em; line-height: 1.8;">
                Questo report è uno strumento di <strong>autoconoscenza</strong> e <strong>crescita personale</strong>. 
                I tratti identificati non sono diagnosi cliniche, ma pattern comportamentali e corporei.
            </p>
        </div>
    `;
    
    setTimeout(() => {
        createCharts(traits);
    }, 100);
    
    return html;
}

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
        needControl, needPerfection, ambition, emotionalDependency,
        peoplePercent, cavePercent, emotionalPercent, rationalPercent,
        executorPercent, delegatorPercent
    };
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
    let html = '<table><thead><tr>';
    html += `<th>${t('body_zone')}</th><th>E</th><th>O</th><th>P</th><th>M</th><th>R</th><th>${t('total')}</th>`;
    html += '</tr></thead><tbody>';
    
    const zones = [
        { name: t('head'), zone: 'testa' },
        { name: t('eyes'), zone: 'occhi' },
        { name: t('mouth'), zone: 'bocca' },
        { name: t('torso'), zone: 'tronco' },
        { name: t('pelvis'), zone: 'bacino' },
        { name: t('legs'), zone: 'gambe' }
    ];
    
    zones.forEach(zone => {
        const row = document.querySelector(`tr[data-zone="${zone.zone}"]`);
        const inputs = row.querySelectorAll('.score-input');
        html += `<tr><td><strong>${zone.name}</strong></td>`;
        inputs.forEach(input => {
            html += `<td style="color: #374151;">${input.value}</td>`;
        });
        html += '<td style="color: #374151;">10</td></tr>';
    });
    
    html += '<tr style="background: #f3f4f6; font-weight: 700; color: #1a1a1a;">';
    html += `<td>${t('total_points')}</td>`;
    html += `<td>${currentScores.E * 0.6}</td>`;
    html += `<td>${currentScores.O * 0.6}</td>`;
    html += `<td>${currentScores.P * 0.6}</td>`;
    html += `<td>${currentScores.M * 0.6}</td>`;
    html += `<td>${currentScores.R * 0.6}</td>`;
    html += '<td>60</td></tr>';
    
    html += '<tr style="background: #dbeafe; font-weight: 700; color: #1a1a1a;">';
    html += `<td>${t('percentage')}</td>`;
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
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                <h4 style="text-align: center; margin-bottom: 15px; color: #1a1a1a;">${t('people_vs_cave')}</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #2563eb;">${metrics.peoplePercent}%</span>
                    <span style="color: #6b7280;">${metrics.cavePercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #6b7280;">
                    ${metrics.peoplePercent > 60 ? t('oriented_to_sociality') : metrics.cavePercent > 60 ? t('oriented_to_solitude') : t('balance')}
                </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                <h4 style="text-align: center; margin-bottom: 15px; color: #1a1a1a;">${t('emotional_vs_rational')}</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #ef4444;">${metrics.emotionalPercent}%</span>
                    <span style="color: #7c3aed;">${metrics.rationalPercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #6b7280;">
                    ${metrics.emotionalPercent > 60 ? t('guided_by_emotions') : metrics.rationalPercent > 60 ? t('guided_by_logic') : t('balance')}
                </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                <h4 style="text-align: center; margin-bottom: 15px; color: #1a1a1a;">${t('executor_vs_delegator')}</h4>
                <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: 700;">
                    <span style="color: #059669;">${metrics.executorPercent}%</span>
                    <span style="color: #f59e0b;">${metrics.delegatorPercent}%</span>
                </div>
                <p style="margin-top: 10px; text-align: center; color: #6b7280;">
                    ${metrics.executorPercent > 60 ? t('prefers_doing_himself') : metrics.delegatorPercent > 60 ? t('prefers_delegating') : t('balance')}
                </p>
            </div>
        </div>
    `;
}

function generateTraitDescriptions(dominantTraits, clientName) {
    let html = '';
    dominantTraits.forEach(trait => {
        html += `
            <div class="trait-section" style="border-left-color: ${trait.color};">
                <h3 style="color: ${trait.color};">🎭 ${trait.name}</h3>
                <h4>✨ Risorse</h4>
                <p style="color: #374151;">Capacità di leadership e strategia</p>
                <h4>⚠️ Sfide</h4>
                <p style="color: #374151;">Tendenza al controllo eccessivo</p>
            </div>
        `;
    });
    return html;
}

function generateConflicts(dominantTraits) {
    if (dominantTraits.length < 2) return '';
    
    let html = `<div class="card"><h2>${t('internal_conflicts')}</h2>`;
    html += '<p style="color: #374151;">Conflitti interni identificati tra i tratti dominanti</p>';
    html += '</div>';
    return html;
}

function generateActionPlan(dominantTraits, clientName) {
    let html = `<div class="card"><h2>${t('action_plan')}</h2>`;
    html += `<p style="font-size: 1.1em; margin-bottom: 25px; color: #374151;">Azioni concrete per ${clientName}</p>`;
    html += '</div>';
    return html;
}

function createCharts(traits) {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => drawCharts(traits);
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
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.label + ': ' + context.parsed + '%'
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
                    label: '%',
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
                            callback: (value) => value + '%'
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

function backToInput() {
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    window.scrollTo(0, 0);
}

function resetForm() {
    if (confirm(t('confirm_reset'))) {
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
        script.onload = () => generatePDF();
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