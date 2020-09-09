import * as Yup from 'yup'

import Sigep from 'sigep'
import Press from 'press'
import Codes from 'codes'

export default async (store, dev) => {
  const storeSchema = Yup.object().shape({
    logo: Yup.string().required(),
    contractId: Yup.string().length(10).required(),
    postCardId: Yup.string().length(10).required(),
    user: Yup.string().required(),
    password: Yup.string().required(),
    cnpj: Yup.string().length(14).required()
  })

  const tagSchema = Yup.object().shape({
    service: Yup.string().length(5).required(),
    orderCode: Yup.string().required(),
    weight: Yup.number().required(),
    trackingCode: Yup.string().length(13).required(),
    IDV: Yup.string().length(2).default('51'),
    groupingInfo: Yup.string().length(2).default('00'),
    value: Yup.number(),
    recipient: Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      cep: Yup.string().required(),
      cepComplement: Yup.string().default('00000'),
      number: Yup.string().required(),
      complement: Yup.string().required(),
      city: Yup.string().required(),
      uf: Yup.string().length(2).required(),
      phone: Yup.string()
        .length(12, 'Envie o número + ddd sem caractéres especiais. Ex: 011912345678')
        .default('000000000000'),
      lat: Yup.string().length(10, 'Ex: -12.345678').default('-00.000000'),
      lng: Yup.string().length(10, 'Ex: -12.345678').default('-00.000000')
    }),
    sender: Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      complement: Yup.string().required(),
      cep: Yup.string().required(),
      cepComplement: Yup.string().max(5).default('00000'),
      city: Yup.string().required(),
      uf: Yup.string().length(2).required()
    })
  })

  storeSchema.validateSync(store)
  const sigep = await Sigep(store, dev)  

  const formatCep = cep => (
    cep.replace(/\D/g, '')
  )

  const fetchCep = cep => (
    sigep.fetchCep(formatCep(cep))
  )

  const getTrackingCode = async service => {
    const { id } = await sigep.getService(service)

    const tags = await sigep.fetchTags(store.cnpj, id)
    const unverified = tags.split(',')[0]

    const verification = await sigep.fetchVerificationCode(unverified)
    return unverified.replace(' ', verification[0])
  }

  const getTag = async data => {
    await tagSchema.validate(data)

    data.recipient.cep = formatCep(data.recipient.cep)
    data.sender.cep = formatCep(data.sender.cep)

    const matrixData = Codes.formatMatrixData(store, data)
    const matrix = await Codes.getMatrix(matrixData)
    const trackingBarcode = await Codes.getTrackingBarcode(data.trackingCode)
    const cepBarcode = await Codes.getCepBarcode(data.recipient.cep)

    const service = await sigep.getService(data.service)
    const seal = Codes.getServiceSeal(service)
    const serviceName = Codes.getServiceName(service)

    return Press.generatePDF(store, data, {
      matrix,
      trackingBarcode,
      cepBarcode,
      seal,
      serviceName
    })
  }

  return { fetchCep, getTrackingCode, getTag }
}
