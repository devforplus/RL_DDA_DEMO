export type ModelInfo = {
  id: 'beginner' | 'medium' | 'master'
  name: string
  description: string
  previewImage: string
}

export const models: ModelInfo[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: '입문용 난이도. 보수적으로 회피하며 기본 전략을 수행합니다.',
    previewImage: '/previews/prev00.png',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: '중간 난이도. 공격과 회피의 균형이 잡힌 플레이를 합니다.',
    previewImage: '/previews/prev00.png',
  },
  {
    id: 'master',
    name: 'Master',
    description: '상급 난이도. 적극적인 공격과 정교한 움직임을 선보입니다.',
    previewImage: '/previews/prev01.gif',
  },
]

export function getModelById(id: string): ModelInfo | undefined {
  return models.find((m) => m.id === id)
}



