import chalk from 'chalk'

const COLORS = [
  '#FF8A80', '#ff80ab', '#ea80fc', '#b388ff',
  '#8c9eff', '#82B1FF', '#80d8ff', '#84ffff',
  '#a7ffeb', '#B9F6CA', '#ccff90', '#f4ff81',
  '#ffff8d', '#ffe57f', '#ffd180', '#ff9e80',
]

// Gets the color of a agent through our hash function
export const genAgentColor = (agent) => {
  let hash = 7 // Compute hash code
  for (let i = 0; i < agent.length; i++)
    hash = agent.charCodeAt(i) + (hash << 5) - hash
  // Calculate color
  const index = Math.abs(hash % COLORS.length)
  return chalk.hex(COLORS[index])
}
