import { create } from 'zustand';
import { Workspace, WorkspaceOptions } from './types';

export type WorkspaceStore = {
  workspaces: Array<Workspace>;
  dismiss: (id: string) => void;
  update: (store: Partial<WorkspaceStore>) => void;
  updateWorkspaces: (workspaces: Array<Workspace>) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  update: (store: Partial<WorkspaceStore>) =>
    set((state) => ({
      ...state,
      ...Object.entries(store)?.reduce((prev, [key, val]) => {
        if (val !== undefined && val !== null) {
          return { ...prev, [key]: val };
        }
        return prev;
      }, {}),
    })),
  updateWorkspaces: (workspaces: Array<Workspace>) => {
    set((state) => ({
      ...state,
      workspaces,
    }));
  },
  dismiss: (id: string) =>
    set((state) => ({
      ...state,
      workspaces: state.workspaces.filter((over) => over.id !== id),
    })),
}));

export const useWorkspaces = () => {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const dismiss = useWorkspaceStore((state) => state.dismiss);
  return { workspaces, dismiss };
};
export const useWorkspace = () => {
  const { workspaces, dismiss } = useWorkspaces();
  const latestWorkspace = workspaces.at(-1);

  const widthMapping = (width: WorkspaceOptions['width']) => {
    if (latestWorkspace?.expanded) {
      return '95vw';
    }
    switch (width) {
      case 'narrow':
        return 420;
      case 'wide':
        return 600;
      case 'extra-wide':
        return 840;
      default:
        break;
    }
  };

  return {
    workspace: latestWorkspace,
    dismiss: () => {
      if (latestWorkspace) {
        dismiss(latestWorkspace.id);
      }
    },
    width: widthMapping(latestWorkspace?.width),
  };
};
