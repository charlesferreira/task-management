import { getStoryPointsTone } from '../utils/storyPoints'

type StoryPointsBadgeProps = {
  storyPoints: 1 | 2 | 3 | 5 | 8 | null
}

const StoryPointsBadge = ({ storyPoints }: StoryPointsBadgeProps) => {
  return (
    <span
      className={`inline-flex min-w-6 items-center justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${getStoryPointsTone(
        storyPoints,
      )}`}
      title={storyPoints === null ? 'Sem story points' : `SP ${storyPoints}`}
    >
      {storyPoints ?? '-'}
    </span>
  )
}

export default StoryPointsBadge
