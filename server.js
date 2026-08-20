const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  converterPdfParaDocx,
  converterDocxParaPdf,
  converterPdfParaTxt,
  converterDocxParaTxt
} = require('./conversores');

const app = express();
const PORTA = 3000;

app.use(express.static('public'));

const armazenamento = multer.diskStorage({
  destination: (req, arquivo, cb) => cb(null, 'uploads/'),
  filename: (req, arquivo, cb) => cb(null, Date.now() + '-' + arquivo.originalname)
});

const upload = multer({ storage: armazenamento });

app.post('/upload', upload.single('documento'), async (requisicao, resposta) => {
  if (!requisicao.file) {
    return resposta.status(400).json({ erro: 'Nenhum arquivo foi enviado.' });
  }

  const tipoConversao = requisicao.body.tipoConversao;
  const caminhoArquivoEnviado = requisicao.file.path;
  const nomeBase = path.parse(requisicao.file.originalname).name;

  console.log('Arquivo recebido:', requisicao.file.filename, '| Conversão:', tipoConversao);

  try {
    let nomeArquivoConvertido;
    let caminhoSaida;

    switch (tipoConversao) {
      case 'pdf-docx':
        nomeArquivoConvertido = nomeBase + '_convertido.docx';
        caminhoSaida = path.join('converted', nomeArquivoConvertido);
        await converterPdfParaDocx(caminhoArquivoEnviado, caminhoSaida);
        break;

      case 'docx-pdf':
        nomeArquivoConvertido = nomeBase + '_convertido.pdf';
        caminhoSaida = path.join('converted', nomeArquivoConvertido);
        await converterDocxParaPdf(caminhoArquivoEnviado, caminhoSaida);
        break;

      case 'pdf-txt':
        nomeArquivoConvertido = nomeBase + '_convertido.txt';
        caminhoSaida = path.join('converted', nomeArquivoConvertido);
        await converterPdfParaTxt(caminhoArquivoEnviado, caminhoSaida);
        break;

      case 'docx-txt':
        nomeArquivoConvertido = nomeBase + '_convertido.txt';
        caminhoSaida = path.join('converted', nomeArquivoConvertido);
        await converterDocxParaTxt(caminhoArquivoEnviado, caminhoSaida);
        break;

      default:
        return resposta.status(400).json({ erro: 'Tipo de conversão inválido.' });
    }

    return resposta.json({
      mensagem: 'Arquivo convertido com sucesso!',
      nomeArquivoConvertido
    });

  } catch (erro) {
    console.error('Erro ao converter arquivo:', erro);
    return resposta.status(500).json({ erro: 'Ocorreu um erro ao converter o arquivo.' });
  }
});

// Rota de download: entrega o arquivo convertido para o navegador salvar
app.get('/download/:nomeArquivo', (requisicao, resposta) => {
  const nomeArquivo = requisicao.params.nomeArquivo;
  const caminhoArquivo = path.join(__dirname, 'converted', nomeArquivo);

  resposta.download(caminhoArquivo, (erro) => {
    if (erro) {
      console.error('Erro ao baixar arquivo:', erro);
      resposta.status(404).send('Arquivo não encontrado.');
    }
  });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando! Acesse: http://localhost:${PORTA}`);
});