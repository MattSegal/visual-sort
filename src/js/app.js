import styles from '../sass/style.sass'
import CONST from './constants'
import Model from './model'
import Observer from './observer.js'
import Actions from './actions.js'

import selectionGridView from './views/selectionGridView'
import controlPanelView from './views/controlPanelView'
import chartView from './views/chartView'

// When in doubt, redraw *everything*
const refreshScreen = () => {
  Model.randomArray()
  Observer.emitEvent(Actions.DRAW_SELECTION_GRID)
  Observer.emitEvent(Actions.DRAW_CONTROL_PANEL)
  Observer.emitEvent(Actions.DRAW_BAR_CHART)
}

// Kick off array sorting event loop on user click
Observer.addEvent(Actions.SORT_ARRAY, () => {
  if (Model.isSorted()) return
  Model.isSorting = true
  Observer.emitEvent(Actions.HIDE_CONTROL_PANEL)
  Observer.emitEvent(Actions.HIDE_SELECTION_GRID)
  
  // Build up and in-memory list of actions to replay for the user
  let actions = []
  const compare = (i, j) => actions.push({type: 'COMPARE', i: i, j: j})
  const swap = (i, j) => actions.push({type: 'SWAP', i: i, j: j})
  const sort = Model.getSorter()
  sort(compare, swap)

  // TODO: Count comparisons, swaps, total operations

  // Loop over sort actions and render for user
  let idx = 0
  const id = setInterval(() => {
    const action = actions[idx]

    // Replay action
    if (action.type === 'COMPARE') {
      console.log(`COMPARE ${Model.array[action.i]} to ${Model.array[action.j]}`)
      // Render comparison - don't redraw whole chart
      // use colors to show whats happening
      Observer.emitEvent(Actions.DRAW_BAR_CHART)
    } else {
      console.log(`SWAP ${Model.array[action.i]} to ${Model.array[action.j]}`)
      Model.swap(action.i, action.j)
      // Render swap - don't redraw whole chart
      // use colors to show whats happening
      Observer.emitEvent(Actions.DRAW_BAR_CHART)
    }

    // Iterate
    idx += 1
    if (idx === actions.length) {
      clearInterval(id)
      Model.isSorting = false
      Observer.emitEvent(Actions.SHOW_CONTROL_PANEL)
      Observer.emitEvent(Actions.SHOW_SELECTION_GRID)
    }
  }, Model.sortDelay) 
})

// Update bar height when user clicks the grid
Observer.addEvent(Actions.UPDATE_COLUMN, (rowIdx, colIdx) => {
  const newValue = rowIdx + 1
  Model.array[colIdx] = newValue
  Observer.emitEvent(Actions.DRAW_BAR_CHART)
})

// Update sort method on user radio-button click
Observer.addEvent(Actions.UPDATE_SORT_METHOD, (method) => {
  // FIXME: This fires twice for some reason
  Model.sortMethod = method
})

// Shuffle bar chart on user button click
Observer.addEvent(Actions.SHUFFLE_ARRAY, () => {
  Model.randomArray()
  Observer.emitEvent(Actions.DRAW_BAR_CHART)
})

// Reverse sort bar chart on user button click
Observer.addEvent(Actions.REVERSE_ARRAY, () => {
  Model.reverseArray()
  Observer.emitEvent(Actions.DRAW_BAR_CHART)
})

// Increase number of bars in chart on user click
Observer.addEvent(Actions.INCREMENT_BARS, () => {
  if (Model.arrayLength >= CONST.MAX_BARS) return
  Model.arrayLength += CONST.BARS_INCREMENT
  refreshScreen()
})

// Decrease number of bars in chart on user click
Observer.addEvent(Actions.DECREMENT_BARS, () => {
  if (Model.arrayLength <= CONST.MIN_BARS) return
  Model.arrayLength -= CONST.BARS_INCREMENT
  refreshScreen()
})

// Increase maximum possible bar value on user click
Observer.addEvent(Actions.INCREMENT_MAX_VALUE, () => {
  if (Model.maxValue >= CONST.MAX_VAL) return
  Model.maxValue += CONST.VAL_INCREMENT
  refreshScreen()
})

// Decrease maximum possible bar value on user click
Observer.addEvent(Actions.DECREMENT_MAX_VALUE, () => {
  if (Model.maxValue <= CONST.MIN_VAL) return
  Model.maxValue -= CONST.VAL_INCREMENT
  refreshScreen()
})

// Increase timing delay on user click
Observer.addEvent(Actions.INCREMENT_DELAY, () => {
  if (Model.sortDelay >= CONST.MAX_DELAY) return
  Model.sortDelay+=CONST.DELAY_INCREMENT
  Observer.emitEvent(Actions.DRAW_CONTROL_PANEL)
})

// Decrease timing delay on user click
Observer.addEvent(Actions.DECREMENT_DELAY, () => {
  if (Model.sortDelay <= CONST.MIN_DELAY) return
  Model.sortDelay-=CONST.DELAY_INCREMENT
  Observer.emitEvent(Actions.DRAW_CONTROL_PANEL)
})

// Initialise views
selectionGridView.init()
controlPanelView.init()
chartView.init()
refreshScreen()