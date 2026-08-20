# DOCeDEX

Conversor gratuito de **PDF para DOCX** com uma interface inspirada em uma Dex.

🌐 **Teste o projeto:** https://docedex.onrender.com

## Sobre o projeto

Eu estava cansado de precisar criar conta, informar e-mail ou lidar com anúncios para converter um arquivo simples.

Então decidi criar a minha própria solução: o **DOCeDEX**.

A proposta é simples: enviar um PDF e receber um arquivo DOCX de forma rápida, sem cadastro e com uma interface mais divertida.

## Funcionalidades

- Upload de arquivos PDF
- Conversão de PDF para DOCX
- Download do arquivo convertido
- Limite de até 15 MB por arquivo
- Interface inspirada em uma dex

## Tecnologias utilizadas

- Node.js
- Express
- JavaScript
- HTML
- CSS
- Multer
- pdf-parse
- docx

## Como executar localmente

```bash
npm install
npm start
```

Depois, abra:

```text
http://localhost:3000
```

## Observação

PDFs escaneados como imagem podem não converter corretamente, pois exigem OCR.
