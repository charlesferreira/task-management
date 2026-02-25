export const getStoryPointsTone = (storyPoints: 1 | 2 | 3 | 5 | 8 | null) => {
  if (storyPoints === null) {
    return 'border-slate-200/70 text-slate-400 dark:border-slate-700 dark:text-slate-500'
  }
  if (storyPoints <= 2) {
    return 'border-emerald-200 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300'
  }
  if (storyPoints <= 5) {
    return 'border-amber-200 text-amber-700 dark:border-amber-500/40 dark:text-amber-300'
  }
  return 'border-rose-200 text-rose-700 dark:border-rose-500/40 dark:text-rose-300'
}

export const getStoryPointsTextTone = (
  storyPoints: 1 | 2 | 3 | 5 | 8 | null,
) => {
  if (storyPoints === null) return 'text-slate-500 dark:text-slate-400'
  if (storyPoints <= 2) return 'text-emerald-700 dark:text-emerald-300'
  if (storyPoints <= 5) return 'text-amber-700 dark:text-amber-300'
  return 'text-rose-700 dark:text-rose-300'
}
