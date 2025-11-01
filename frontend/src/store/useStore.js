// simple global store avec Zustand
// Fait par Cl@udiu — stocke l'utilisateur connecté
import create from "zustand";

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useStore;
