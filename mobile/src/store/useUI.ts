import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  toasts: Toast[];
  modals: {
    [key: string]: boolean;
  };
  loading: {
    [key: string]: boolean;
  };
  
  // Actions
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: (id: string) => void;
  setModal: (key: string, visible: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  modals: {},
  loading: {},

  showToast: (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    
    set(state => ({
      toasts: [...state.toasts, toast]
    }));
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      get().hideToast(id);
    }, 3000);
  },

  hideToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  setModal: (key: string, visible: boolean) => {
    set(state => ({
      modals: { ...state.modals, [key]: visible }
    }));
  },

  setLoading: (key: string, loading: boolean) => {
    set(state => ({
      loading: { ...state.loading, [key]: loading }
    }));
  },
}));
