document.addEventListener('DOMContentLoaded', () => {
    const colmeias = JSON.parse(localStorage.getItem('colmeias')) || [];
    let currentColmeiaIndex = null;

    // Funções auxiliares
    function saveColmeias() {
        localStorage.setItem('colmeias', JSON.stringify(colmeias));
    }

    function calcularSaude(inspecao) {
        let score = 100;
        if (inspecao.rainha === 'false') score -= 40;
        if (parseInt(inspecao.pragas) > 3) score -= 30;
        if (inspecao.mel === 'Baixo') score -= 20;
        return score;
    }

    function getAlertaSazonal() {
        const mes = new Date().getMonth(); // 0-11
        const lembretes = [
            "Janeiro: Verifique enxameação.", // Verão
            "Fevereiro: Controle de Varroa.",
            "Março: Monitore mel.",
            // Adicione para outros meses...
        ];
        return lembretes[mes] || "Nenhum alerta sazonal.";
    }

    function updateDashboard() {
        const list = document.getElementById('colmeias-list');
        list.innerHTML = '';
        colmeias.forEach((colmeia, index) => {
            const lastInspecao = colmeia.inspecoes[colmeia.inspecoes.length - 1];
            const score = lastInspecao ? calcularSaude(lastInspecao) : 'N/A';
            const daysSinceLast = lastInspecao ? Math.floor((Date.now() - new Date(lastInspecao.data)) / (1000 * 60 * 60 * 24)) : 'Nunca';
            const alerta = daysSinceLast > 14 ? ' (Alerta: Inspeção atrasada)' : '';
            const card = document.createElement('div');
            card.className = 'colmeia-card';
            card.innerHTML = `
                <h3>${colmeia.id}</h3>
                <p>Saúde: ${score}/100${alerta}</p>
                <p>Última inspeção: ${daysSinceLast} dias atrás</p>
                <button onclick="openInspecao(${index})">Inspecionar</button>
                <button onclick="openRelatorio(${index})">Relatório</button>
            `;
            list.appendChild(card);
        });
        document.getElementById('alerta-sazonal').textContent = getAlertaSazonal();
    }

    // Eventos
    document.getElementById('add-colmeia').addEventListener('click', () => {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('form-colmeia').style.display = 'block';
    });

    document.getElementById('save-colmeia').addEventListener('click', () => {
        const id = document.getElementById('colmeia-id').value;
        const loc = document.getElementById('colmeia-loc').value;
        const tipo = document.getElementById('colmeia-tipo').value;
        if (id) {
            colmeias.push({ id, loc, tipo, inspecoes: [] });
            saveColmeias();
            updateDashboard();
            document.getElementById('form-colmeia').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        }
    });

    document.getElementById('cancel-colmeia').addEventListener('click', () => {
        document.getElementById('form-colmeia').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    });

    window.openInspecao = (index) => {
        currentColmeiaIndex = index;
        document.getElementById('inspecao-colmeia-name').textContent = colmeias[index].id;
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('form-inspecao').style.display = 'block';
    };

    document.getElementById('save-inspecao').addEventListener('click', () => {
        const inspecao = {
            data: new Date().toISOString().split('T')[0],
            rainha: document.getElementById('rainha').value,
            mel: document.getElementById('mel').value,
            pragas: document.getElementById('pragas').value,
            notas: document.getElementById('notas').value
        };
        colmeias[currentColmeiaIndex].inspecoes.push(inspecao);
        saveColmeias();
        updateDashboard();
        document.getElementById('form-inspecao').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    });

    document.getElementById('cancel-inspecao').addEventListener('click', () => {
        document.getElementById('form-inspecao').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    });

    window.openRelatorio = (index) => {
        currentColmeiaIndex = index;
        document.getElementById('relatorio-colmeia-name').textContent = colmeias[index].id;
        const tbody = document.getElementById('relatorio-table').querySelector('tbody');
        tbody.innerHTML = '';
        colmeias[index].inspecoes.forEach(inspecao => {
            const score = calcularSaude(inspecao);
            const row = `<tr><td>${inspecao.data}</td><td>${score}</td><td>${inspecao.notas}</td></tr>`;
            tbody.innerHTML += row;
        });
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('relatorio').style.display = 'block';
    };

    document.getElementById('back-dashboard').addEventListener('click', () => {
        document.getElementById('relatorio').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    });

    document.getElementById('export-csv').addEventListener('click', () => {
        let csv = 'Data,Score,Notas\n';
        colmeias[currentColmeiaIndex].inspecoes.forEach(inspecao => {
            const score = calcularSaude(inspecao);
            csv += `${inspecao.data},${score},${inspecao.notas.replace(/\n/g, ' ')}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${colmeias[currentColmeiaIndex].id}_relatorio.csv`;
        a.click();
    });

    // Inicializar
    updateDashboard();

    // Service Worker para PWA offline
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(() => console.log('SW registered')).catch(err => console.error('SW error', err));
    }
});