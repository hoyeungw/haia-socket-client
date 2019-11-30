import io from 'socket.io-client'
import { ADDRESS, PORT } from './config/base'
import { configClient } from './modules/client/configClient'
import { initSignup } from './modules/readliner/initSignup'
import { rl } from './modules/readliner/initReadliner'

const socketClient = io(`http://${ADDRESS}:${PORT}`)

socketClient |> configClient

rl |> initSignup

export {
  socketClient
}
