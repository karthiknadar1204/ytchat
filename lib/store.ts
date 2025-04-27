import { create } from 'zustand';

interface Collection {
  id: string;
  name: string;
  description: string;
  connections: Connection[];
}

interface Connection {
  id: string;
  name: string;
  type: string;
}

interface StoreState {
  collections: Collection[];
  addCollection: (name: string, description: string) => void;
  addConnection: (collectionId: string, connection: Omit<Connection, 'id'>) => void;
}

export const useStore = create<StoreState>((set) => ({
  collections: [],
  addCollection: (name: string, description: string) =>
    set((state) => ({
      collections: [
        ...state.collections,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          description,
          connections: [],
        },
      ],
    })),
  addConnection: (collectionId: string, connection: Omit<Connection, 'id'>) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              connections: [
                ...collection.connections,
                { ...connection, id: Math.random().toString(36).substr(2, 9) },
              ],
            }
          : collection
      ),
    })),
})); 