export const getScoreColor = (score) => {
  if (score >= 75) {
    return '#10B981'
  }

  if (score >= 60) {
    return '#F97316'
  }

  return '#F59E0B'
}

export const getScoreMessage = (score) => {
  if (score >= 75) {
    return 'Excellent standing. Priority claim processing active.'
  }

  if (score >= 60) {
    return 'Good standing. Score improvement unlocks premium discounts.'
  }

  if (score >= 40) {
    return 'Average. Inconsistent activity is affecting your score.'
  }

  return 'Low score. Elevated fraud check frequency applied.'
}
