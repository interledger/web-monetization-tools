// Re-export everything
export * from './payments/widget.js'
export * from './payments/confirmation.js'
export * from './payments/interaction.js'

// Import for side-effects (component registration)
import './payments/widget.js'
import './payments/confirmation.js'
import './payments/interaction.js'
