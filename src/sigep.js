import * as soap from 'soap'

export default async (store, dev) => {
  const devUrl = 'https://apphom.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl'
  const prodUrl = 'https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl'

  const client = await soap.createClientAsync(dev ? devUrl : prodUrl)

  const format = async req => {
    const response = await req()
    return response[0].return
  }

  const fetchCep = async cep => (
    format(() => client.consultaCEPAsync({ cep }))
  )

  const fetchClient = async () => (
    format(() => client.buscaClienteAsync({
      idContrato: store.contractId,
      idCartaoPostagem: store.postCardId,
      usuario: store.user,
      senha: store.password
    }))
  )

  const fetchTags = async (identificador, idServico) => (
    format(() => client.solicitaEtiquetasAsync({
      tipoDestinatario: 'C',
      identificador,
      idServico,
      qtdEtiquetas: 1,
      usuario: store.user,
      senha: store.password
    }))
  )

  const fetchVerificationCode = etiquetas => (
    format(() => client.geraDigitoVerificadorEtiquetasAsync({
      etiquetas,
      usuario: store.user,
      senha: store.password
    }))
  )

  const getService = async id => {
    const client = await fetchClient()

    return client.contratos[0].cartoesPostagem[0].servicos
      .find(service => service.codigo === id)
  }

  return { fetchCep, fetchClient, fetchTags, fetchVerificationCode, getService }
}
