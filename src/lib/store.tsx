'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppStore {}

export const useStore = create<AppStore>()(
  persist(() => ({}), { name: 'team-tasks-store' })
)
