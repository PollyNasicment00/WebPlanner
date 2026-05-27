// ============================================
// FOTOS (externas + slots)
// ============================================

document.querySelectorAll('.foto').forEach((label, index) => {

    const input = label.querySelector('input[type="file"]');
    const img = label.querySelector('img');
    const span = label.querySelector('span');

    const fotoKey = `foto_${index}`;
    const posicaoKey = `foto_posicao_${index}`;

    // CARREGAR FOTO SALVA
    const fotoSalva = localStorage.getItem(fotoKey);

    if (fotoSalva) {

        img.src = fotoSalva;
        img.style.display = 'block';
        span.style.display = 'none';

        if (fotoSalva.includes('image/png')) {
            label.classList.add('sem-borda');
        }

    }

    // CARREGAR POSIÇÃO SALVA
    const posicaoSalva = localStorage.getItem(posicaoKey);

    if (posicaoSalva) {

        const pos = JSON.parse(posicaoSalva);

        label.style.left = pos.left;
        label.style.top = pos.top;

        label.style.right = "auto";
        label.style.bottom = "auto";

    }

    // UPLOAD FOTO
    input.addEventListener('change', function() {

        const file = this.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {

            const imagemBase64 = e.target.result;

            img.src = imagemBase64;

            const isPng =
                file.type === 'image/png' ||
                file.name.toLowerCase().endsWith('.png');

            if (isPng) {

                label.classList.add('sem-borda');

            } else {

                label.classList.remove('sem-borda');

            }

            img.style.display = 'block';
            span.style.display = 'none';

            // SALVAR FOTO
            localStorage.setItem(fotoKey, imagemBase64);

        };

        reader.readAsDataURL(file);

    });

    // CLICAR NA IMAGEM = TROCAR
    img.addEventListener('click', function(e) {

        if (img.src && img.style.display !== 'none') {

            e.preventDefault();
            e.stopPropagation();

            input.click();

        }

    });

});

// ============================================
// SELETOR DE COR DO CADERNO
// ============================================

const btnCor = document.getElementById('btnCor');
const seletorCor = document.getElementById('seletorCor');
const paginas = document.querySelectorAll('.pagina');
const corOpcoes = document.querySelectorAll('.cor-opcao');

btnCor.addEventListener('click', function() {

    seletorCor.classList.toggle('ativo');

});

document.addEventListener('click', function(e) {

    if (!seletorCor.contains(e.target) && e.target !== btnCor) {

        seletorCor.classList.remove('ativo');

    }

});

corOpcoes.forEach(opcao => {

    opcao.addEventListener('click', function() {

        const cor = this.dataset.cor;

        paginas.forEach(pagina => {

            pagina.style.background = cor;

        });

        corOpcoes.forEach(o => o.classList.remove('ativa'));

        this.classList.add('ativa');

        localStorage.setItem('corCaderno', cor);

    });

});

window.addEventListener('DOMContentLoaded', function() {

    const corSalva = localStorage.getItem('corCaderno');

    if (corSalva) {

        paginas.forEach(pagina => {

            pagina.style.background = corSalva;

        });

        corOpcoes.forEach(opcao => {

            if (opcao.dataset.cor === corSalva) {

                opcao.classList.add('ativa');

            }

        });

    }

});

// ============================================
// MÚSICA - SPOTIFY
// ============================================

const btnMusica = document.getElementById('btnMusica');
const painelMusica = document.getElementById('painelMusica');
const spotifyLink = document.getElementById('spotifyLink');
const btnEmbed = document.getElementById('btnEmbed');
const spotifyPlayer = document.getElementById('spotifyPlayer');

btnMusica.addEventListener('click', function() {

    painelMusica.classList.toggle('ativo');

});

document.addEventListener('click', function(e) {

    if (!painelMusica.contains(e.target) && e.target !== btnMusica) {

        painelMusica.classList.remove('ativo');

    }

});

function carregarSpotify(link) {

    let embedUrl = '';
    let id = '';

    if (link.includes('open.spotify.com/playlist/')) {

        id = link.split('playlist/')[1].split('?')[0];

        embedUrl = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;

    }

    else if (link.includes('open.spotify.com/album/')) {

        id = link.split('album/')[1].split('?')[0];

        embedUrl = `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`;

    }

    else if (link.includes('open.spotify.com/track/')) {

        id = link.split('track/')[1].split('?')[0];

        embedUrl = `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;

    }

    spotifyPlayer.innerHTML =
    `<iframe src="${embedUrl}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

}

btnEmbed.addEventListener('click', function() {

    const link = spotifyLink.value.trim();

    if (!link) {

        alert('Cole um link do Spotify!');
        return;

    }

    carregarSpotify(link);

    localStorage.setItem('spotifyLink', link);

});

window.addEventListener('DOMContentLoaded', function() {

    const linkSalvo = localStorage.getItem('spotifyLink');

    if (linkSalvo) {

        spotifyLink.value = linkSalvo;

        carregarSpotify(linkSalvo);

    }

});

// ============================================
// CALENDÁRIO + ANOTAÇÕES
// ============================================

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

let dataAtual = new Date();
let datasSelecionadas = new Set();
let anotacoesPorMes = {};

const mesAnoEl = document.getElementById('mesAno');
const calendarioDiasEl = document.getElementById('calendarioDias');
const anotacoesTextarea = document.getElementById('anotacoes');
const tituloAnotacoes = document.getElementById('tituloAnotacoes');

function getChaveMes(ano, mes) {

    return `${ano}-${String(mes + 1).padStart(2, '0')}`;

}

function getChaveData(ano, mes, dia) {

    return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

}

function salvarTudo() {

    const dados = {

        anotacoes: anotacoesPorMes,
        datasSelecionadas: Array.from(datasSelecionadas)

    };

    localStorage.setItem('webplanner_dados', JSON.stringify(dados));

}

function carregarTudo() {

    const dadosSalvos = localStorage.getItem('webplanner_dados');

    if (dadosSalvos) {

        const dados = JSON.parse(dadosSalvos);

        if (dados.anotacoes) {

            anotacoesPorMes = dados.anotacoes;

        }

        if (dados.datasSelecionadas) {

            datasSelecionadas = new Set(dados.datasSelecionadas);

        }

    }

}

function salvarAnotacaoAtual() {

    const chave = getChaveMes(
        dataAtual.getFullYear(),
        dataAtual.getMonth()
    );

    anotacoesPorMes[chave] = anotacoesTextarea.value;

    salvarTudo();

}

function carregarAnotacaoMes(ano, mes) {

    const chave = getChaveMes(ano, mes);

    anotacoesTextarea.value = anotacoesPorMes[chave] || '';

    tituloAnotacoes.textContent =
    `✏️ Anotações - ${meses[mes]} ${ano}`;

}

function gerarCalendario(ano, mes) {

    calendarioDiasEl.innerHTML = '';

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const diasNoMes = ultimoDia.getDate();
    const diaSemanaPrimeiro = primeiroDia.getDay();

    const ultimoDiaMesAnterior =
    new Date(ano, mes, 0).getDate();

    for (let i = diaSemanaPrimeiro - 1; i >= 0; i--) {

        const dia = document.createElement('div');

        dia.className = 'dia-calendario outro-mes';

        dia.textContent = ultimoDiaMesAnterior - i;

        calendarioDiasEl.appendChild(dia);

    }

    const hoje = new Date();

    for (let i = 1; i <= diasNoMes; i++) {

        const dia = document.createElement('div');

        dia.className = 'dia-calendario';

        dia.textContent = i;

        const chaveData = getChaveData(ano, mes, i);

        if (
            i === hoje.getDate() &&
            mes === hoje.getMonth() &&
            ano === hoje.getFullYear()
        ) {

            dia.classList.add('hoje');

        }

        if (datasSelecionadas.has(chaveData)) {

            dia.classList.add('selecionado');

        }

        dia.addEventListener('click', function() {

            if (datasSelecionadas.has(chaveData)) {

                datasSelecionadas.delete(chaveData);

                dia.classList.remove('selecionado');

            } else {

                datasSelecionadas.add(chaveData);

                dia.classList.add('selecionado');

            }

            salvarTudo();

        });

        calendarioDiasEl.appendChild(dia);

    }

    mesAnoEl.textContent = `${meses[mes]} ${ano}`;

    carregarAnotacaoMes(ano, mes);

}

document.addEventListener('DOMContentLoaded', function() {

    carregarTudo();

    const mesAnteriorBtn = document.getElementById('mesAnterior');
    const mesProximoBtn = document.getElementById('mesProximo');

    mesAnteriorBtn.onclick = function() {

        salvarAnotacaoAtual();

        dataAtual.setMonth(dataAtual.getMonth() - 1);

        gerarCalendario(
            dataAtual.getFullYear(),
            dataAtual.getMonth()
        );

    };

    mesProximoBtn.onclick = function() {

        salvarAnotacaoAtual();

        dataAtual.setMonth(dataAtual.getMonth() + 1);

        gerarCalendario(
            dataAtual.getFullYear(),
            dataAtual.getMonth()
        );

    };

    anotacoesTextarea.addEventListener('input', function() {

        salvarAnotacaoAtual();

    });

    gerarCalendario(
        dataAtual.getFullYear(),
        dataAtual.getMonth()
    );

});

// ============================================
// ARRASTAR FOTOS + SALVAR POSIÇÃO
// ============================================

const fotosArrastaveis = document.querySelectorAll(".foto");

fotosArrastaveis.forEach((foto, index) => {

    let segurando = false;

    let offsetX = 0;
    let offsetY = 0;

    foto.addEventListener("mousedown", (e) => {

        if (e.target.tagName === "INPUT") return;

        segurando = true;

        foto.style.zIndex = "9999";
        foto.style.transition = "none";

        const rect = foto.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

    });

    document.addEventListener("mousemove", (e) => {

        if (!segurando) return;

        const fundo = document.querySelector(".fundo");

        const fundoRect = fundo.getBoundingClientRect();

        let x = e.clientX - fundoRect.left - offsetX;
        let y = e.clientY - fundoRect.top - offsetY;

        foto.style.left = `${x}px`;
        foto.style.top = `${y}px`;

        foto.style.right = "auto";
        foto.style.bottom = "auto";

    });

    document.addEventListener("mouseup", () => {

        if (!segurando) return;

        segurando = false;

        foto.style.transition = "0.3s";

        // SALVAR POSIÇÃO
        localStorage.setItem(

            `foto_posicao_${index}`,

            JSON.stringify({
                left: foto.style.left,
                top: foto.style.top
            })

        );

    });

});