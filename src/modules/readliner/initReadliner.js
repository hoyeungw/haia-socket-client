import { st } from '../../config/state'
import { socketClient } from '../../index'
import { currentTime } from '../../utils/currentTime'
import { TYPING_LAP } from '../../config/base'
import readline from 'readline'
import { GP } from 'elprimero'
import { log } from '../../utils/log'

let lastTime
process.stdin.on('keypress', (key, data) => {
  if (!st.connected) return void 0
  if (!st.typing) {
    st.typing = true
    socketClient.emit('client.typing')
  }
  lastTime = currentTime()
  setTimeout(() => {
    if (currentTime() >= lastTime + TYPING_LAP && st.typing) {
      socketClient.emit('client.typed')
      st.typing = false
    }
  }, TYPING_LAP)
})

const rl = readline
  .createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `> `,
  })
  .on('error', (err) => {
    err |> log
  })
  .on('close', () => {
    `[${GP.now()}] See you / さようなら / خداحافظ / Прощай ...` |> log
    process.exit(0)
  })

export {
  rl
}
