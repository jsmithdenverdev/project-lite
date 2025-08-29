import type { ProjectData, Project, WorkItem, Metadata } from '../schemas';

export interface DBProject extends Omit<Project, 'id'> {
  id: string;
  lastAccessed: string;
  isActive: boolean;
  version: number;
}

export interface DBWorkItem extends WorkItem {
  projectId: string;
}

export interface DBMetadata extends Metadata {
  projectId: string;
}

export interface AppSettings {
  key: string;
  value: any;
}

const DB_NAME = 'project-lite-db';
const DB_VERSION = 1;

const STORES = {
  PROJECTS: 'projects',
  WORK_ITEMS: 'workItems',
  METADATA: 'metadata',
  SETTINGS: 'settings'
} as const;

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async initDB(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
          projectStore.createIndex('lastAccessed', 'lastAccessed');
          projectStore.createIndex('isActive', 'isActive');
        }

        // Work items store
        if (!db.objectStoreNames.contains(STORES.WORK_ITEMS)) {
          const workItemStore = db.createObjectStore(STORES.WORK_ITEMS, { keyPath: 'id' });
          workItemStore.createIndex('projectId', 'projectId');
          workItemStore.createIndex('parentId', 'parentId');
          workItemStore.createIndex('status', 'status');
          workItemStore.createIndex('type', 'type');
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'projectId' });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  private async getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): Promise<IDBTransaction> {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(storeNames, mode);
  }

  // Project Operations
  async createProject(projectData: ProjectData): Promise<string> {
    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    const dbProject: DBProject = {
      ...projectData.project,
      id: projectId,
      lastAccessed: now,
      isActive: false,
      version: 1
    };

    const dbWorkItems: DBWorkItem[] = projectData.workItems.map(item => ({
      ...item,
      projectId
    }));

    const dbMetadata: DBMetadata = {
      ...projectData.metadata,
      projectId,
      lastUpdated: now,
      totalWorkItems: dbWorkItems.length,
      completedWorkItems: dbWorkItems.filter(item => item.status === 'done').length
    };

    const transaction = await this.getTransaction([STORES.PROJECTS, STORES.WORK_ITEMS, STORES.METADATA], 'readwrite');
    
    try {
      // Add project
      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PROJECTS).add(dbProject);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Add work items
      const workItemStore = transaction.objectStore(STORES.WORK_ITEMS);
      for (const workItem of dbWorkItems) {
        await new Promise<void>((resolve, reject) => {
          const request = workItemStore.add(workItem);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Add metadata
      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.METADATA).add(dbMetadata);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      return projectId;
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  async getProject(projectId: string): Promise<ProjectData | null> {
    const transaction = await this.getTransaction([STORES.PROJECTS, STORES.WORK_ITEMS, STORES.METADATA]);

    const [project, workItems, metadata] = await Promise.all([
      new Promise<DBProject | null>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PROJECTS).get(projectId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      }),
      
      new Promise<DBWorkItem[]>((resolve, reject) => {
        const request = transaction.objectStore(STORES.WORK_ITEMS).index('projectId').getAll(projectId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      }),
      
      new Promise<DBMetadata | null>((resolve, reject) => {
        const request = transaction.objectStore(STORES.METADATA).get(projectId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      })
    ]);

    if (!project) return null;

    // Convert DBProject back to Project (remove extra fields)
    const { lastAccessed, isActive, version, ...projectData } = project;
    
    // Convert DBWorkItem back to WorkItem (remove projectId)
    const cleanWorkItems: WorkItem[] = workItems.map(({ projectId, ...item }) => item);

    // Convert DBMetadata back to Metadata (remove projectId)
    const cleanMetadata: Metadata = metadata ? 
      (({ projectId, ...meta }) => meta)(metadata) : 
      { lastUpdated: new Date().toISOString() };

    return {
      project: projectData,
      workItems: cleanWorkItems,
      metadata: cleanMetadata
    };
  }

  async updateProject(projectId: string, projectData: ProjectData): Promise<void> {
    const transaction = await this.getTransaction([STORES.PROJECTS, STORES.WORK_ITEMS, STORES.METADATA], 'readwrite');
    
    try {
      // Get current project for version check
      const currentProject = await new Promise<DBProject | null>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PROJECTS).get(projectId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (!currentProject) throw new Error('Project not found');

      const now = new Date().toISOString();
      const updatedProject: DBProject = {
        ...projectData.project,
        id: projectId,
        lastAccessed: now,
        isActive: currentProject.isActive,
        version: currentProject.version + 1
      };

      // Update project
      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PROJECTS).put(updatedProject);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Clear existing work items
      const workItemStore = transaction.objectStore(STORES.WORK_ITEMS);
      const workItemIndex = workItemStore.index('projectId');
      await new Promise<void>((resolve, reject) => {
        const request = workItemIndex.getAllKeys(projectId);
        request.onsuccess = () => {
          const deletePromises = request.result.map(key => 
            new Promise<void>((res, rej) => {
              const delReq = workItemStore.delete(key);
              delReq.onsuccess = () => res();
              delReq.onerror = () => rej(delReq.error);
            })
          );
          Promise.all(deletePromises).then(() => resolve()).catch(reject);
        };
        request.onerror = () => reject(request.error);
      });

      // Add updated work items
      const dbWorkItems: DBWorkItem[] = projectData.workItems.map(item => ({
        ...item,
        projectId
      }));

      for (const workItem of dbWorkItems) {
        await new Promise<void>((resolve, reject) => {
          const request = workItemStore.add(workItem);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Update metadata
      const dbMetadata: DBMetadata = {
        ...projectData.metadata,
        projectId,
        lastUpdated: now,
        totalWorkItems: dbWorkItems.length,
        completedWorkItems: dbWorkItems.filter(item => item.status === 'done').length
      };

      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.METADATA).put(dbMetadata);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const transaction = await this.getTransaction([STORES.PROJECTS, STORES.WORK_ITEMS, STORES.METADATA], 'readwrite');
    
    try {
      // Delete project
      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PROJECTS).delete(projectId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Delete work items
      const workItemStore = transaction.objectStore(STORES.WORK_ITEMS);
      const workItemIndex = workItemStore.index('projectId');
      await new Promise<void>((resolve, reject) => {
        const request = workItemIndex.getAllKeys(projectId);
        request.onsuccess = () => {
          const deletePromises = request.result.map(key => 
            new Promise<void>((res, rej) => {
              const delReq = workItemStore.delete(key);
              delReq.onsuccess = () => res();
              delReq.onerror = () => rej(delReq.error);
            })
          );
          Promise.all(deletePromises).then(() => resolve()).catch(reject);
        };
        request.onerror = () => reject(request.error);
      });

      // Delete metadata
      await new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.METADATA).delete(projectId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  async getAllProjects(): Promise<DBProject[]> {
    const transaction = await this.getTransaction(STORES.PROJECTS);
    
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORES.PROJECTS).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async setActiveProject(projectId: string): Promise<void> {
    const transaction = await this.getTransaction(STORES.PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROJECTS);
    
    try {
      // Get all projects
      const allProjects = await new Promise<DBProject[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      // Update all projects
      for (const project of allProjects) {
        const updatedProject: DBProject = {
          ...project,
          isActive: project.id === projectId,
          lastAccessed: project.id === projectId ? new Date().toISOString() : project.lastAccessed
        };

        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedProject);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  async getActiveProject(): Promise<DBProject | null> {
    const transaction = await this.getTransaction(STORES.PROJECTS);
    
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORES.PROJECTS).index('isActive').get(IDBKeyRange.only(true));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Settings Operations
  async setSetting(key: string, value: any): Promise<void> {
    const transaction = await this.getTransaction(STORES.SETTINGS, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORES.SETTINGS).put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    const transaction = await this.getTransaction(STORES.SETTINGS);
    
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORES.SETTINGS).get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Migration utilities
  async migrateFromLocalStorage(): Promise<void> {
    const STORAGE_KEYS = {
      PROJECT_DATA: 'project-lite-data',
      PROJECT_FILENAME: 'project-lite-filename',
    };

    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.PROJECT_DATA);
      const filename = localStorage.getItem(STORAGE_KEYS.PROJECT_FILENAME) || 'Migrated Project';
      
      if (dataStr) {
        const data = JSON.parse(dataStr);
        
        // Validate and migrate
        if (data && data.project && data.workItems) {
          const projectId = await this.createProject(data);
          await this.setActiveProject(projectId);
          
          // Clear localStorage after successful migration
          localStorage.removeItem(STORAGE_KEYS.PROJECT_DATA);
          localStorage.removeItem(STORAGE_KEYS.PROJECT_FILENAME);
          
          console.log(`Migrated project "${filename}" from localStorage to IndexedDB`);
        }
      }
    } catch (error) {
      console.warn('Failed to migrate from localStorage:', error);
    }
  }

  // Cleanup and maintenance
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();