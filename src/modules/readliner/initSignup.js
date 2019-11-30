import { socketClient } from '../../index'

export const initSignup = (rl) => {
  rl.question(
    'tell us your name: > ',
    (answer) => {
      if (answer === 'exit') rl.close()
      if (answer?.length) {
        socketClient.emit('client.signup', answer)
      }
    })
}
