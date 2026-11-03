import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/axios';

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/workspaces');
          const workspaces = res.data;
          set({ workspaces, isLoading: false });

          const currentActive = get().activeWorkspace;
          const stillExists = workspaces.find(w => w._id === currentActive?._id);

          if ((!currentActive || !stillExists) && workspaces.length > 0) {
            set({ activeWorkspace: workspaces[0] });
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Failed to fetch workspaces', error);
        }
      },

      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

      addWorkspace: (workspace) => set((state) => ({
        workspaces: [workspace, ...state.workspaces],
        activeWorkspace: workspace
      })),

      clearWorkspaceState: () => set({ workspaces: [], activeWorkspace: null }),
    }),
    {
      name: 'tf_workspace_store',
      // ⬇️ partialize HATA DIYA - ab sab kuch persist hoga
    }
  )
);