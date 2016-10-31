const html = require('choo/html')
const loginForm = require('./../../components/login-form')
const header = require('./../../components/header')

const landingPage = (state, prev, send) => {
  return html`
    <div>
      ${header(state, prev, send)}
      <div class="landing-main container">
      <h1>Welcome!</h1>
      ${loginForm(state, prev, send)}
      </div>
    </div>`
}

module.exports = landingPage
