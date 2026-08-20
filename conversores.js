const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { Document, Packer, Paragraph } = require('docx');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');

async function extrairTextoPdf(caminhoPdf) {
  const bufferPdf = fs.readFileSync(caminhoPdf);
  const parser = new PDFParse({ data: bufferPdf });
  const dados = await parser.getText();
  return dados.text;
}

async function extrairTextoDocx(caminhoDocx) {
  const resultado = await mammoth.extractRawText({ path: caminhoDocx });
  return resultado.value;
}

async function converterPdfParaDocx(caminhoPdf, caminhoDocxSaida) {
  const textoExtraido = await extrairTextoPdf(caminhoPdf);

  const paragrafos = textoExtraido
    .split('\n')
    .filter((linha) => linha.trim() !== '')
    .map((linha) => new Paragraph(linha));

  const documento = new Document({ sections: [{ children: paragrafos }] });
  const bufferDocx = await Packer.toBuffer(documento);
  fs.writeFileSync(caminhoDocxSaida, bufferDocx);
}

async function converterDocxParaPdf(caminhoDocx, caminhoPdfSaida) {
  const textoExtraido = await extrairTextoDocx(caminhoDocx);

  const documentoPdf = new PDFDocument();
  const streamEscrita = fs.createWriteStream(caminhoPdfSaida);
  documentoPdf.pipe(streamEscrita);

  documentoPdf.fontSize(12);
  documentoPdf.text(textoExtraido, { align: 'left' });
  documentoPdf.end();

  return new Promise((resolver, rejeitar) => {
    streamEscrita.on('finish', resolver);
    streamEscrita.on('error', rejeitar);
  });
}

async function converterPdfParaTxt(caminhoPdf, caminhoTxtSaida) {
  const textoExtraido = await extrairTextoPdf(caminhoPdf);
  fs.writeFileSync(caminhoTxtSaida, textoExtraido, 'utf-8');
}

async function converterDocxParaTxt(caminhoDocx, caminhoTxtSaida) {
  const textoExtraido = await extrairTextoDocx(caminhoDocx);
  fs.writeFileSync(caminhoTxtSaida, textoExtraido, 'utf-8');
}

module.exports = {
  converterPdfParaDocx,
  converterDocxParaPdf,
  converterPdfParaTxt,
  converterDocxParaTxt
};