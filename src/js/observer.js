// Observer
module.exports = {
  events: {},

  addEvent: function(eventName, fn) {
    // add function to listener list for event
    this.events[eventName] = this.events[eventName] || []
    this.events[eventName].push(fn)
  },
  
  removeEvent: function(eventName, fn) {
    // remove function from listener list for event
    if (!this.events[eventName])
      return
    this.events[eventName] = this.events[eventName].filter(e => e != fn)
  },

  emitEvent: function(eventName, data) {
    console.info(`Observing ${eventName}${
      typeof(data) !== "undefined" ? ' with parameters ' + data : ''
    }`)
    if (!this.events[eventName])
      return
    for (let func of this.events[eventName]) {
      func(data)
    }
  },

}