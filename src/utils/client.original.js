const
  FADE_TIME = 150,
  TYPING_LAP = 400,
  COLORS = [
    '#FF8A80', '#ff80ab', '#ea80fc', '#b388ff',
    '#8c9eff', '#82B1FF', '#80d8ff', '#84ffff',
    '#a7ffeb', '#B9F6CA', '#ccff90', '#f4ff81',
    '#ffff8d', '#ffe57f', '#ffd180', '#ff9e80',
  ]

$(function () {

  // Initialize variables
  const $window = $(window)
  const $usernameInput = $('.usernameInput') // Input for agent
  const $messages = $('.messages') // Messages area
  const $inputMessage = $('.inputMessage') // Input message input box
  const $loginPage = $('.login.page') // The login page
  const $chatPage = $('.chat.page') // The chatroom page

  // Prompt for setting a agent
  let agent
  let connected = false
  let typing = false
  let lastTypingTime
  let $curInput = $usernameInput.focus()

  const socketClient = io()

  const addParticipantsMessage = (data) => {
    let message = ''
    message += data.pool === 1
      ? 'there\'s 1 participant'
      : 'there are ' + data.pool + ' participants'
    log(message)
  }

  // Sets the client's agent
  const setUsername = () => {
    agent = cleanInput($usernameInput.val().trim())
    // If the agent is valid
    if (agent) {
      $loginPage.fadeOut()
      $chatPage.show()
      $loginPage.off('click')
      $curInput = $inputMessage.focus()
      // Tell the server your agent
      socketClient.emit('user.add', agent)
    }
  }

  // Sends a chat message
  const sendMessage = () => {
    // Prevent markup from being injected into the message
    let message = cleanInput($inputMessage.val())
    // if there is a non-empty message and a socket comm
    if (message && connected) {
      $inputMessage.val('')
      addChatMessage({ agent, message })
      // tell server to execute 'say' and send along one parameter
      socketClient.emit('say', message)
    }
  }

  // Log a message
  const log = (message, options) => {
    const $el = $('<li>').addClass('log').text(message)
    addMessageElement($el, options)
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    // Don't fade the message in if there is an 'X was typing'
    const $typingMessages = getTypingMessages(data)
    options = options || {}
    if ($typingMessages.length !== 0) {
      options.fade = false
      $typingMessages.remove()
    }
    const $agentDiv = $('<span class="username"/>')
      .text(data.agent)
      .css('color', getAgentColor(data.agent))
    const $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message)
    const typingClass = data.typing ? 'typing' : ''
    const $messageDiv = $('<li class="message"/>')
      .data('agent', data.agent)
      .addTypingClass(typingClass)
      .append($agentDiv, $messageBodyDiv)
    addMessageElement($messageDiv, options)
  }

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true
    data.message = 'is typing'
    addChatMessage(data)
  }

  // Removes the visual chat typing message
  const removeChatTyping = (data) =>
    getTypingMessages(data).fadeOut(function () {$(this).remove()})

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    const $el = $(el)
    // Setup default options
    if (!options) options = {}
    if (typeof options.fade === 'undefined') options.fade = true
    if (typeof options.prepend === 'undefined') options.prepend = false
    // Apply options
    if (options.fade) $el.hide().fadeIn(FADE_TIME)
    options.prepend ? $messages.prepend($el) : $messages.append($el)
    $messages[0].scrollTop = $messages[0].scrollHeight
  }

  // Prevents input from having injected markup
  const cleanInput = (input) => $('<div/>').text(input).html()

  // Updates the typing event
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true
        socketClient.emit('typing.ini')
      }
      lastTypingTime = (new Date()).getTime()
      setTimeout(() => {
        const typingTime = (new Date()).getTime()
        const timeDiff = typingTime - lastTypingTime
        if (timeDiff >= TYPING_LAP && typing) {
          socketClient.emit('typing.end')
          typing = false
        }
      }, TYPING_LAP)
    }
  }

  // Gets the 'X is typing' messages of a user
  const getTypingMessages = (data) =>
    $('.typing.message').filter(function (i) {return $(this).data('agent') === data.agent})

  // Gets the color of a agent through our hash function
  const getAgentColor = (agent) => {
    let hash = 7 // Compute hash code
    for (let i = 0; i < agent.length; i++)
      hash = agent.charCodeAt(i) + (hash << 5) - hash
    // Calculate color
    const index = Math.abs(hash % COLORS.length)
    return COLORS[index]
  }

  // Keyboard events
  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) $curInput.focus()
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (agent) {
        sendMessage()
        socketClient.emit('typing.end')
        typing = false
      } else {
        setUsername()
      }
    }
  })

  $inputMessage.on('input', () => updateTyping())

  // Click events
  // Focus input when clicking anywhere on login page
  $loginPage.click(() => $curInput.focus())
  // Focus input when clicking on the message input's border
  $inputMessage.click(() => $inputMessage.focus())

  // Socket events
  // Whenever the server emits 'login', log the login message
  socketClient.on('login', (data) => {
    connected = true
    // Display the welcome message
    log('Welcome to Leagyun Club, powered by socket.io – ', { prepend: true })
    addParticipantsMessage(data)
  })

  // Whenever the server emits 'say', update the chat body
  socketClient.on('say', (data) => addChatMessage(data))

  // Whenever the server emits 'user.joined', log it in the chat body
  socketClient.on('user.joined', (data) => {
    log(data.agent + ' joined')
    addParticipantsMessage(data)
  })

  // Whenever the server emits 'user.left', log it in the chat body
  socketClient.on('user.left', (data) => {
    log(data.agent + ' left')
    addParticipantsMessage(data)
    removeChatTyping(data)
  })

  // Whenever the server emits 'typing.ini', show the typing message
  socketClient.on('typing.ini', (data) => addChatTyping(data))
  // Whenever the server emits 'typing.end', kill the typing message
  socketClient.on('typing.end', (data) => removeChatTyping(data))
  socketClient.on('disconnect', () => log('you have been disconnected'))
  socketClient.on('reconnect', () => {
    log('you have been reconnected')
    if (agent) socketClient.emit('user.add', agent)
  })
  socketClient.on('reconnect_error', () => log('attempt to reconnect has failed'))
})
