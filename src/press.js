import path from 'path'
import PDFDocument from 'pdfkit'

const mmToPt = mm => (
  mm * 2.83465
)

const generatePDF = async (store, data, generated) => (
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [mmToPt(106.36), mmToPt(138.11)],
      margin: 0
    })

    const buffers = []
    doc.on('data', buffer => buffers.push(buffer))
    doc.on('end', () => resolve(Buffer.concat(buffers)))

    doc
      .image(path.normalize(store.logo), mmToPt(7.25), mmToPt(2.25), {
        fit: [mmToPt(25), mmToPt(25)], valign: 'center'
      })
      .image(generated.matrix, (doc.page.width - mmToPt(24)) / 2, mmToPt(3.25), {
        width: mmToPt(24)
      })
      .image(generated.seal, (doc.page.width - mmToPt(7.25) - mmToPt(18)), mmToPt(2.25), {
        fit: [mmToPt(20), mmToPt(25)], valign: 'center'
      })

    doc
      .font('./fonts/arial.ttf')
      .fontSize(9)
      .text(`Pedido: ${data.orderCode}`, mmToPt(2.25), mmToPt(28))
      .text('Contrato:', (doc.page.width - mmToPt(25)) / 2, mmToPt(28))
      .font('./fonts/arial-bold.ttf')
      .text(store.contractId, (doc.page.width + mmToPt(3)) / 2, mmToPt(28))
      .text(generated.serviceName, (doc.page.width - mmToPt(25)) / 2)
      .font('./fonts/arial.ttf')
      .text('Volume: 1/1', (doc.page.width - mmToPt(7.25) - mmToPt(18)), mmToPt(28))
      .text('Peso (g):')
      .font('./fonts/arial-bold.ttf')
      .text(data.weight, (doc.page.width - mmToPt(7.25) - mmToPt(18) + mmToPt(13.75)), mmToPt(31.75))

    doc
      .font('./fonts/arial-bold.ttf')
      .fontSize(11)
      .text(data.trackingCode, mmToPt(5), mmToPt(36), { width: mmToPt(80), align: 'center' })
      .image(generated.trackingBarcode, mmToPt(5), mmToPt(41), { width: mmToPt(80) })

    doc
      .font('./fonts/arial.ttf')
      .fontSize(9)
      .text('Recebedor:', mmToPt(5), mmToPt(61))
      .moveTo(mmToPt(22), mmToPt(64))
      .lineTo(doc.page.width - mmToPt(2.25), mmToPt(64))
      .stroke()
      .text('Assinatura:', mmToPt(5), mmToPt(66))
      .moveTo(mmToPt(22), mmToPt(69))
      .lineTo(doc.page.width / 2, mmToPt(69))
      .stroke()
      .text('Documento:', (doc.page.width + mmToPt(5)) / 2, mmToPt(66))
      .moveTo((doc.page.width / 2) + mmToPt(20), mmToPt(69))
      .lineTo(doc.page.width - mmToPt(2.25), mmToPt(69))
      .stroke()

    doc
      .moveTo(0, mmToPt(72))
      .lineTo(doc.page.width, mmToPt(72))
      .stroke()
      .lineWidth(mmToPt(5.5))
      .moveTo(0, mmToPt(74.75))
      .lineTo(mmToPt(34), mmToPt(74.75))
      .stroke()
      .font('./fonts/arial-bold.ttf')
      .fontSize(11)
      .fillColor('white')
      .text('DESTINATÁRIO', mmToPt(2.25), mmToPt(72.5))

    doc
      .image(path.resolve(__dirname, '../symbols/correios.png'),
        (doc.page.width - mmToPt(7.25) - mmToPt(18)), mmToPt(75), {
          fit: [mmToPt(20), mmToPt(20)]
      })

    doc
      .font('./fonts/arial.ttf')
      .fontSize(11)
      .fillColor('black')
      .text(data.recipient.name, mmToPt(5), mmToPt(79))
      .text(data.recipient.address)
      .text(data.recipient.complement)

    doc
      .font('./fonts/arial-bold.ttf')
      .fontSize(11)
      .text(`${data.recipient.cep.slice(0, 5)}-${data.recipient.cep.slice(5, 8)}`, mmToPt(5), mmToPt(94))
      .font('./fonts/arial.ttf')
      .text(`${data.recipient.city}/${data.recipient.uf}`, mmToPt(25), mmToPt(94))
      .image(generated.cepBarcode, mmToPt(5), mmToPt(99), { width: mmToPt(40) })

    doc
      .lineWidth(1)
      .moveTo(0, mmToPt(118))
      .lineTo(doc.page.width, mmToPt(118))
      .stroke()

    doc
      .fontSize(10)
      .font('./fonts/arial-bold.ttf')
      .text('Remetente:', mmToPt(2.25), mmToPt(120))
      .font('./fonts/arial.ttf')
      .text(data.sender.address)
      .text(data.sender.complement)
      .font('./fonts/arial-bold.ttf')
      .text(`${data.sender.cep.slice(0, 5)}-${data.sender.cep.slice(5, 8)}`)
      .font('./fonts/arial.ttf')
      .text(data.sender.name, mmToPt(22), mmToPt(120))
      .text(`${data.sender.city}-${data.sender.uf}`, mmToPt(21), mmToPt(132.25))

    doc.end()
  })
)

export default { generatePDF }
