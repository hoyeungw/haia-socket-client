import { st } from '../../config/state'
import { socketClient } from '../../index'

export const initConversation = (rl) => {
  if (rl.listenerCount('line')) return void 0
  rl.on('line', answer => {
    answer = answer.trim()
    if (answer === 'exit') rl.close()
    if (!answer?.length || !st.connected) return void 0
    st.typing = false
    socketClient.emit('client.says', answer) // tell server to execute 'say' and send along one parameter
    rl.prompt()
  })
}

