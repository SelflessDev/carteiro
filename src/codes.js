import path from 'path'
import bwipjs from 'bwip-js'

const formatCepComplement = complement => (
  String(complement).substring(0, 5).padEnd(5, ' ')
)

const getCepValidator = cep => {
  const sum = cep.split('').reduce((acc, cur) => acc + parseInt(cur), 0)
  const multiple = Math.ceil(sum / 10) * 10

  return multiple - sum
}

const formatExtraServices = services => (
  services ? services.join('').padEnd(8, '0') : '00000000'
)

const formatNumber = number => (
  String(number).substring(0, 5).padEnd(5, ' ')
)

const formatComplement = complement => (
  String(complement).substring(0, 20).padEnd(20, ' ')
)

const formatValue = value => (
  String(value).substring(0, 5).padStart(5, '0')
)

const formatCustomerReservation = customer => (
  String(customer).substring(0, 30).padEnd(30, ' ')
)

const formatMatrixData = (store, data) => (
  data.recipient.cep +
  formatCepComplement(data.recipient.cepComplement) +
  data.sender.cep +
  formatCepComplement(data.sender.cepComplement) +
  getCepValidator(data.recipient.cep) +
  data.IDV +
  data.trackingCode +
  formatExtraServices(data.extraServices) +
  store.postCardId +
  data.service +
  data.groupingInfo +
  formatNumber(data.recipient.number) +
  formatComplement(data.recipient.complement) +
  formatValue(data.value) +
  data.recipient.phone +
  data.recipient.lat +
  data.recipient.lng +
  '|' +
  formatCustomerReservation(data.recipient.name)
)

const getMatrix = text => (
  bwipjs.toBuffer({
    bcid: 'datamatrix',
    text,
    scale: 3,
    width: 25,
    height: 25
  })
)

const getTrackingBarcode = text => (
  bwipjs.toBuffer({
    bcid: 'code128',
    text,
    scale: 3,
    width: 80,
    height: 18
  })
)

const getCepBarcode = text => (
  bwipjs.toBuffer({
    bcid: 'code128',
    text,
    scale: 3,
    width: 40,
    height: 16
  })
)

const getServiceSeal = service => {
  let seal = 'carta'

  if (['SEDEX 10', 'SEDEX 12', 'SEDEX HOJE'].includes(service.servicoSigep.descricao)) {
    seal = 'sedex-special'
  }

  if (service.servicoSigep.categoriaServico === 'SEDEX') {
    seal = 'sedex'
  }

  if (service.servicoSigep.categoriaServico === 'PAC') {
    seal = 'pac'
  }

  return path.resolve(__dirname, `../symbols/${seal}.png`)
}

const getServiceName = service => (
  service.servicoSigep.categoriaServico
)

export default {
  formatMatrixData,
  getMatrix,
  getTrackingBarcode,
  getCepBarcode,
  getServiceSeal,
  getServiceName
}
