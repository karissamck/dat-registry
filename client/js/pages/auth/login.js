const html = require('choo/html')
const header = require('./../../components/header')

module.exports = (state, prev, send) => {
  if (!state.user.username) send('user:loginPanel', true)
  send('user:loginPanel', false)
  return html`
    <div class="landing">
      ${header(state, prev, send)}
    </div>`
}
