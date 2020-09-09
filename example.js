import fs from 'fs'
import open from 'open'

import Carteiro from './app.js'

const main = async () => {
  try {
    const store = {
      logo: './logo.png',
      contractId: '9992157880',
      postCardId: '0067599079',
      user: 'sigep',
      password: 'n5f9t8',
      cnpj: '34028316000103'
    }
    const service = '04669'

    console.log('Store Config')
    console.log(store)

    const carteiro = await Carteiro(store, true)

    const cep = '85.601-610'
    const cepInfo = await carteiro.fetchCep(cep)

    console.log(`Cep Info(${ cep }):`)
    console.log(cepInfo)

    const trackingCode = await carteiro.getTrackingCode(service)

    const input = {
      service,
      orderCode: '123456',
      weight: 500,
      trackingCode,
      value: 300,
      recipient: {
        name: 'Júlio Michél Guadagnim',
        address: 'Rua Tenente Camargo',
        complement: 'Sala 73',
        cep: '85.601-610',
        number: '1777',
        city: 'Francisco Beltrão',
        uf: 'PR',
        phone: '046988058291'
      },
      sender: {
        name: 'Selfless',
        address: 'Rua Tenente Camargo',
        complement: 'Sala 73',
        cep: '85.601-610',
        city: 'Francisco Beltrão',
        uf: 'PR'
      }
    }

    console.log('Service(PAC):', service)
    console.log('Tag Input:')
    console.log(input)

    const tag = await carteiro.getTag(input)

    fs.writeFileSync('example.pdf', tag)
    await open('example.pdf')
  } catch (err) {
    console.log(err)
  }
}

main()
