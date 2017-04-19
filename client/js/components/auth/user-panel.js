const css = require('sheetify')
const html = require('choo/html')

const prefix = css`
  :host {
    position: fixed;
    right: .5rem;
    top: .5rem;
    z-index: 100;
    min-width: 16rem;
    padding: 1rem;
    background-color: var(--color-white);
    color: var(--color-neutral-80);
    box-shadow: 0 0 1rem rgba(0,0,0,.2);
    .gravatar {
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      display: block;
      margin: 0 .5rem 0 0;
      border: 2px solid var(--color-neutral-04);
    }

    .content {
      margin-top: .5rem;
      margin-bottom: .5rem;
      padding-top: .5rem;
      padding-bottom: .5rem;
      border-top: 1px solid var(--color-neutral-10);
      border-bottom: 1px solid var(--color-neutral-10);
    }
    .close-button {
      position: absolute;
      right: .5rem;
      top: .5rem;
      display: block;
      overflow: hidden;
      color: var(--color-neutral-20);
      &:hover, &:focus {
        color: var(--color-neutral-40);
      }
      svg {
        fill: currentColor;
        max-width: 1.5rem;
        max-height: 1.5rem;
      }
    }
    ul {
      a {
        color: var(--color-neutral-60);
        &:hover, &:focus {
          color: var(--color-neutral-80);
        }
      }
      li {
        margin-top: .5rem;
        margin-bottom: .5rem;
      }
      &:hover, &:focus {
        .delete-btn {
          visibility: visible;
        }
      }
      svg {
        fill: currentColor;
        max-width: 1rem;
        max-height: 1.5rem;
      }
    }

  }
`

module.exports = function (state, prev, send) {
  if (!state.township.username) return

  return html`<div class="user-panel ${prefix} ${state.township.sidePanel}">
      <a class="close-button" title="Close" href="#" onclick=${() => send('township:sidePanel')}>
        <svg>
          <use xlink:href="#daticon-cross" />
        </svg>
      </a>
      <div class="flex items-center mb2">
        <div>
          ${state.township.email}
        </div>
      </div>
      <ul>
        <li><a href="/profile/${state.township.username}" data-no-routing>View Profile</a></li>
        <li><a href="/profile/edit" data-no-routing>Edit Profile</a></li>
        <li><a href="http://github.com/datproject/datproject.org/issues" target="_blank" class="color-neutral-50 hover-color-neutral-70">Report Bug</a></li>
        <li><a href="#" onclick=${() => send('township:logout', {})}>Logout</a></li>
      </ul>

  </div>`
}
