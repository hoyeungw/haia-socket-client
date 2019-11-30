import { log } from '../../utils/log'
import { st } from '../../config/state'
import ora from 'ora'
import { genAgentColor } from '../../utils/genAgentColor'
import { palette } from 'spettro'
import chalk from 'chalk'
import { rl } from '../readliner/initReadliner'
import { initSignup } from '../readliner/initSignup'
import { initConversation } from '../readliner/initConversation'
import { StrX } from 'xbrief'

let spn = ora({
  hideCursor: false,
  discardStdin: false,
})
let chalkify = chalk.hex(palette.amber.accent_3)

const events = [
  'friend.says'
]

export const configClient = (socketClient) => {
  socketClient.on('client.signed-in', ({ agent, pool }) => {
    st.connected = true
    if (agent) {
      chalkify = genAgentColor(agent)
      st.agent = agent
      'Welcome to Leagyun Club, powered by socket.io – ' |> log
      rl |> initConversation
      rl.prompt(true)
    } else {
      rl |> initSignup
    }
  })

  // Whenever the server emits 'user.joined', log it in the chat body
  socketClient.on('friend.joins', (data) => {
    if (spn.isSpinning) spn.stop()
    data.agent + ' joins' |> log
  })

  // Whenever the server emits 'user.left', log it in the chat body
  socketClient.on('friend.left', (data) => {
    if (spn.isSpinning) spn.stop()
    data.agent + ' left' |> log
    // removeChatTyping(data)
  })

  // Whenever the server emits 'say', update the chat body
  socketClient.on('friend.says', ({ agent, message }) => {
    if (spn.isSpinning) spn.stop();
    `${agent |> chalkify}: ${message}` |> log
    rl.prompt(true)
  })

  // Whenever the server emits 'typing.ini', show the typing message
  socketClient.on('friend.typing', ({ agent }) => {
    if (!st.agent) return void 0
    spn.start(`${agent} is typing`)
  })
  // Whenever the server emits 'typing.end', kill the typing message
  socketClient.on('friend.typed', (data) => {
    if (spn.isSpinning) spn.stop()
  })

  socketClient.on('disconnect', () => {
    if (spn.isSpinning) spn.stop()
    'you have been disconnected' |> log
  })

  socketClient.on('reconnect', () => {
    if (spn.isSpinning) spn.stop()
    'you have been reconnected' |> log
    if (st.agent) socketClient.emit('client.signup', st.agent)
  })

  socketClient.on('reconnect_error', () => {
    if (spn.isSpinning) spn.stop()
    'attempt to reconnect has failed' |> log
  })

  return socketClient
}


