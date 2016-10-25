var noop = function () {}
var defaultState = {
  isPanelOpen: false,
  isLoading: false,
  archiveKey: null,
  entryName: null,
  readStream: null,
  error: false
}

module.exports = {
  namespace: 'preview',
  state: module.parent ? defaultState : window.dl.init__dehydratedAppState.preview,
  reducers: {
    update: (data, state) => {
      if (!data.error || data.entry) data.isLoading = false
      return data
    },
    openPanel: (data, state) => {
      document.body.classList.add('panel-open') // not ideal
      return {isPanelOpen: true, isLoading: true}
    },
    closePanel: (data, state) => {
      document.body.classList.remove('panel-open')
      return defaultState
    }
  },
  effects: {
    file: (data, state, send, done) => {
      data.error = false
      send('preview:update', data, noop)
      send('preview:openPanel', {}, done)
      // TODO: state.preview.isPanelOpen + corresponding loading indicator in ui
    }
  }
}
