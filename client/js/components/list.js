const html = require('choo/html')
const css = require('sheetify')

var prefix = css`
  :host {
    background-color: var(--color-neutral-04);
  }
`

module.exports = (state, prev, send) => {
  var dats = state.list.data || []
  function open (dat) {
    var shortname = `${dat.username}/${dat.name}`
    window.location.href = '/' + shortname
  }
  return html`
  <div>
  ${dats.map(function (dat) {
    return html`
    <div class="mb3 ph3 pv1 flex items-center ${prefix}">
      <div class="flex-auto">
        <div>
          <a href="#" class="f4" onclick=${() => open(dat)}>${dat.name}</a> <span class="f7">Copy Link</span>
        </div>
        ${dat.title}
        <div class="dat-detail">
          ${dat.username}
        </div>
        <div class="dat-detail">
          ${dat.created_at}
        </div>
      </div>
      <div class="flex-none">
        <a href="#" class="btn btn--small btn--green btn--full">
          Preview
        </a>
      </div>
    </div>
    `
  })}
  </div>`
}
