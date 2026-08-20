console.log('SCRIPT CARREGADO!');

// ===== REFERÊNCIAS =====
const botaoEscolher = document.getElementById('botaoEscolher');
const inputArquivo = document.getElementById('inputArquivo');
const areaUpload = document.getElementById('areaUpload');

const infoArquivo = document.getElementById('infoArquivo');
const infoNome = document.getElementById('infoNome');
const infoTipo = document.getElementById('infoTipo');
const infoTamanho = document.getElementById('infoTamanho');
const botaoOutroArquivo = document.getElementById('botaoOutroArquivo');
const listaCartoes = document.getElementById('listaCartoes');

const telaTipo = document.getElementById('telaTipo');
const telaTipoTexto = document.getElementById('telaTipoTexto');

const telaTransferencia = document.getElementById('telaTransferencia');
const textoTransferencia = document.getElementById('textoTransferencia');
const barraProgresso = document.getElementById('barraProgresso');

const telaConcluido = document.getElementById('telaConcluido');
const nomeArquivoConvertido = document.getElementById('nomeArquivoConvertido');
const botaoConverterOutro = document.getElementById('botaoConverterOutro');
const botaoBaixar = document.getElementById('botaoBaixar');

let arquivoAtual = null;
let ultimoNomeConvertido = null;

// Opções de conversão disponíveis por tipo de arquivo enviado
const OPCOES_POR_TIPO = {
  PDF: [
    { value: 'pdf-docx', icone: '📄', titulo: 'PDF → DOCX', subtitulo: 'Converter para Word' },
    { value: 'pdf-txt', icone: '📃', titulo: 'PDF → TXT', subtitulo: 'Extrair texto puro' }
  ],
  DOCX: [
    { value: 'docx-pdf', icone: '📕', titulo: 'DOCX → PDF', subtitulo: 'Converter para PDF' },
    { value: 'docx-txt', icone: '📃', titulo: 'DOCX → TXT', subtitulo: 'Extrair texto puro' }
  ],
  DOC: []
};

// ===== FUNÇÕES AUXILIARES =====

function formatarTamanho(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

function formatarTipo(nomeArquivo) {
  return nomeArquivo.split('.').pop().toUpperCase();
}

function atualizarTelaTipo(tipo) {
  telaTipoTexto.textContent = tipo;
  telaTipo.classList.remove('tipo-pdf', 'tipo-docx', 'tipo-doc');
  if (tipo === 'PDF') telaTipo.classList.add('tipo-pdf');
  else if (tipo === 'DOCX') telaTipo.classList.add('tipo-docx');
  else if (tipo === 'DOC') telaTipo.classList.add('tipo-doc');
}

// Monta os cartões de transformação de acordo com o tipo do arquivo
function montarCartoesConversao(tipo) {
  listaCartoes.innerHTML = '';

  const opcoes = OPCOES_POR_TIPO[tipo] || [];

  if (opcoes.length === 0) {
    listaCartoes.innerHTML = '<p class="aviso-sem-opcao">Formato ainda não suportado para conversão.</p>';
    return;
  }

  opcoes.forEach((opcao) => {
    const cartao = document.createElement('button');
    cartao.className = 'cartao-transformacao';
    cartao.innerHTML = `
      <span class="cartao-icone">${opcao.icone}</span>
      <span class="cartao-texto">
        <span class="cartao-titulo">${opcao.titulo}</span>
        <span class="cartao-subtitulo">${opcao.subtitulo}</span>
      </span>
    `;
    cartao.addEventListener('click', () => iniciarTransferencia(opcao.value));
    listaCartoes.appendChild(cartao);
  });
}

function mostrarInfoArquivo(arquivo) {
  arquivoAtual = arquivo;
  const tipo = formatarTipo(arquivo.name);

  infoNome.textContent = arquivo.name;
  infoTipo.textContent = tipo;
  infoTamanho.textContent = formatarTamanho(arquivo.size);

  atualizarTelaTipo(tipo);
  montarCartoesConversao(tipo);

  areaUpload.hidden = true;
  infoArquivo.hidden = false;
}

function resetarParaUpload() {
  infoArquivo.hidden = true;
  telaTransferencia.hidden = true;
  telaConcluido.hidden = true;
  areaUpload.hidden = false;
  inputArquivo.value = '';

  telaTipoTexto.textContent = '?';
  telaTipo.classList.remove('tipo-pdf', 'tipo-docx', 'tipo-doc');
  listaCartoes.innerHTML = '';
}

function impedirComportamentoPadrao(evento) {
  evento.preventDefault();
  evento.stopPropagation();
}

// ===== ANIMAÇÃO DE TRANSFERÊNCIA =====

const etapasTransferencia = [
  { texto: 'PREPARANDO DOCUMENTO...',    porcentagem: 5 },
  { texto: 'ANALISANDO ARQUIVO...',      porcentagem: 15 },
  { texto: 'INICIANDO TRANSFERÊNCIA...', porcentagem: 25 },
  { texto: 'CONVERTENDO...',             porcentagem: 40 },
  { texto: 'TRANSFERÊNCIA 25%',          porcentagem: 25 },
  { texto: 'TRANSFERÊNCIA 50%',          porcentagem: 50 },
  { texto: 'TRANSFERÊNCIA 75%',          porcentagem: 75 },
  { texto: 'TRANSFERÊNCIA 100%',         porcentagem: 100 },
  { texto: 'TRANSFERÊNCIA CONCLUÍDA!',   porcentagem: 100 }
];

function rodarAnimacaoTransferencia(indice) {
  return new Promise((resolver) => {
    function proximaEtapa(i) {
      if (i >= etapasTransferencia.length) {
        resolver();
        return;
      }
      const etapa = etapasTransferencia[i];
      textoTransferencia.textContent = etapa.texto;
      barraProgresso.style.width = etapa.porcentagem + '%';
      setTimeout(() => proximaEtapa(i + 1), 500);
    }
    proximaEtapa(indice);
  });
}

async function enviarArquivoParaServidor(dadosFormulario) {
  const resposta = await fetch('/upload', { method: 'POST', body: dadosFormulario });
  if (!resposta.ok) {
    throw new Error('O servidor respondeu com um erro: ' + resposta.status);
  }
  return resposta.json();
}

// Chamada automaticamente ao clicar em um cartão de transformação
async function iniciarTransferencia(tipoConversao) {
  infoArquivo.hidden = true;
  telaTransferencia.hidden = false;
  barraProgresso.style.width = '0%';

  const dadosFormulario = new FormData();
  dadosFormulario.append('documento', arquivoAtual);
  dadosFormulario.append('tipoConversao', tipoConversao);

  try {
    const [resultadoUpload] = await Promise.all([
      enviarArquivoParaServidor(dadosFormulario),
      rodarAnimacaoTransferencia(0)
    ]);

    if (resultadoUpload.erro) {
      throw new Error(resultadoUpload.erro);
    }

    ultimoNomeConvertido = resultadoUpload.nomeArquivoConvertido;
    mostrarTelaConcluido(ultimoNomeConvertido);

  } catch (erro) {
    console.error('Erro ao enviar/converter arquivo:', erro);
    alert('Ocorreu um erro: ' + erro.message);
    telaTransferencia.hidden = true;
    infoArquivo.hidden = false;
  }
}

function mostrarTelaConcluido(nomeReal) {
  nomeArquivoConvertido.textContent = nomeReal;
  telaTransferencia.hidden = true;
  telaConcluido.hidden = false;
}

// ===== EVENTOS =====

botaoEscolher.addEventListener('click', () => inputArquivo.click());

inputArquivo.addEventListener('change', () => {
  const arquivo = inputArquivo.files[0];
  if (arquivo) mostrarInfoArquivo(arquivo);
});

botaoOutroArquivo.addEventListener('click', resetarParaUpload);
botaoConverterOutro.addEventListener('click', resetarParaUpload);

botaoBaixar.addEventListener('click', () => {
  if (ultimoNomeConvertido) {
    window.location.href = '/download/' + encodeURIComponent(ultimoNomeConvertido);
  }
});

areaUpload.addEventListener('dragenter', (e) => { impedirComportamentoPadrao(e); areaUpload.classList.add('area-upload-ativa'); });
areaUpload.addEventListener('dragover', (e) => { impedirComportamentoPadrao(e); areaUpload.classList.add('area-upload-ativa'); });
areaUpload.addEventListener('dragleave', (e) => { impedirComportamentoPadrao(e); areaUpload.classList.remove('area-upload-ativa'); });

areaUpload.addEventListener('drop', (e) => {
  impedirComportamentoPadrao(e);
  areaUpload.classList.remove('area-upload-ativa');
  const arquivo = e.dataTransfer.files[0];
  if (arquivo) mostrarInfoArquivo(arquivo);
});