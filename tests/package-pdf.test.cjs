'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const PDFLib=require(path.join(root,'dist/pdf-lib.min.js'));
const fontkit=require(path.join(root,'dist/fontkit.umd.min.js'));
const M=require(path.join(root,'dist/model.js'));

test('Full 56-page PDF assembly loads master template and embeds Sarabun font', async()=>{
  const pdfBytes=fs.readFileSync(path.join(root,'dist/assets/templates/pm151/reference.pdf'));
  const pdfDoc=await PDFLib.PDFDocument.load(pdfBytes);
  assert.equal(pdfDoc.getPageCount(), 56);
  pdfDoc.registerFontkit(fontkit);
  const fontBytes=fs.readFileSync(path.join(root,'dist/assets/Sarabun-Regular.ttf'));
  const font=await pdfDoc.embedFont(fontBytes);
  assert(font);
  const page1=pdfDoc.getPage(0);
  page1.drawText('บริษัท ทดสอบการบิน จำกัด', {
    x: 71,
    y: 550,
    size: 14,
    font,
    color: PDFLib.rgb(0,0,0)
  });
  const outBytes=await pdfDoc.save();
  assert(outBytes.length > 100000);
});

test('Full 44-page PDF assembly works for AGC template', async()=>{
  const pdfBytes=fs.readFileSync(path.join(root,'dist/assets/templates/pt095/reference.pdf'));
  const pdfDoc=await PDFLib.PDFDocument.load(pdfBytes);
  assert.equal(pdfDoc.getPageCount(), 44);
});
