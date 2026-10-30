import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, logout as firebaseLogout } from '../lib/firebase';
import { Transaction, Income, OperationType, CategoryBudget, UserProfile, FinancialReport, Archive } from '../types';

const GUEST_STORAGE_KEY = 'financeperso_guest_data_v2';
const GUEST_MODE_KEY = 'fp_guest_mode_active';

interface GuestStore {
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
  reports: FinancialReport[];
  archives: Archive[];
  profile: UserProfile;
}

const DEFAULT_GUEST_STORE: GuestStore = {
  transactions: [
    { id: 'demo-tx-1', amount: 950, category: 'Loyer', date: Date.now() - 3 * 86400000, note: 'Loyer mensuel', userId: 'guest-user' },
    { id: 'demo-tx-2', amount: 142.80, category: 'Courses', date: Date.now() - 2 * 86400000, note: 'Supermarché', userId: 'guest-user' },
    { id: 'demo-tx-3', amount: 55.00, category: 'Transport', date: Date.now() - 86400000, note: 'Carburant', userId: 'guest-user' },
    { id: 'demo-tx-4', amount: 35.00, category: 'Loisirs', date: Date.now(), note: 'Sortie cinéma', userId: 'guest-user' }
  ],
  incomes: [
    { id: 'demo-inc-1', salaryReceived: 2850, dateReceived: Date.now() - 6 * 86400000, userId: 'guest-user' }
  ],
  budgets: [
    { id: 'Loyer', category: 'Loyer', amount: 950, userId: 'guest-user' },
    { id: 'Courses', category: 'Courses', amount: 500, userId: 'guest-user' },
    { id: 'Transport', category: 'Transport', amount: 150, userId: 'guest-user' },
    { id: 'Loisirs', category: 'Loisirs', amount: 200, userId: 'guest-user' },
    { id: 'Santé', category: 'Santé', amount: 100, userId: 'guest-user' },
    { id: 'Épargne', category: 'Épargne', amount: 450, userId: 'guest-user' }
  ],
  reports: [],
  archives: [],
  profile: {
    uid: 'guest-user',
    email: 'invite@financeperso.pro',
    displayName: 'Invité Démo',
    photoURL: '',
    weeklyReports: false,
    budgetNotifications: true
  }
};

function loadGuestStore(): GuestStore {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read guest data from storage", e);
  }
  return DEFAULT_GUEST_STORE;
}

function saveGuestStore(data: GuestStore) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save guest data to storage", e);
  }
}

export function useFinance() {
  const initialStore = loadGuestStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  
  // Explicit guest demo mode only if chosen by user
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Watch Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsGuest(false);
        try {
          localStorage.removeItem(GUEST_MODE_KEY);
        } catch {}
      } else {
        try {
          const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
          setIsGuest(guestActive);
        } catch {
          setIsGuest(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Main data sync effect
  useEffect(() => {
    // Case 1: Real Firebase authenticated user
    if (user) {
      setLoading(true);
      const transactionsPath = `users/${user.uid}/transactions`;
      const incomesPath = `users/${user.uid}/incomes`;
      const budgetsPath = `users/${user.uid}/budgets`;
      const reportsPath = `users/${user.uid}/reports`;
      const profilePath = `users/${user.uid}`;
      const archivesPath = `users/${user.uid}/archives`;

      let txReady = false;
      let incReady = false;
      let budReady = false;
      let reportsReady = false;
      let profileReady = false;
      let archivesReady = false;

      const checkReady = () => {
        if (txReady && incReady && budReady && reportsReady && profileReady && archivesReady) {
          setLoading(false);
        }
      };

      const unsubscribeArchives = onSnapshot(query(collection(db, archivesPath), orderBy('archivedAt', 'desc')), (snapshot) => {
        const docs = snapshot.docs.map(docSnapshot => {
          const id = docSnapshot.id;
          const rawData = docSnapshot.data() as Archive;
          const data = { ...rawData };
          
          if (data.totalIncome === 350000) {
            data.totalIncome = 180000;
          }
          
          if (data.incomes) {
            data.incomes = data.incomes.map(inc => {
              if (inc.salaryReceived === 350000) {
                return { ...inc, salaryReceived: 180000 };
              }
              return inc;
            });
          }
          
          return { id, ...data } as Archive;
        });
        setArchives(docs);
        archivesReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, archivesPath);
        } catch (e) {
          console.warn("Firestore listener error for archives:", e);
        }
        archivesReady = true;
        checkReady();
      });

      const unsubscribeReports = onSnapshot(query(collection(db, reportsPath), orderBy('createdAt', 'desc')), (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialReport));
        setReports(docs);
        reportsReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, reportsPath);
        } catch (e) {
          console.warn("Firestore listener error for reports:", e);
        }
        reportsReady = true;
        checkReady();
      });

      const unsubscribeProfile = onSnapshot(doc(db, profilePath), (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          const initialProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Utilisateur',
            photoURL: user.photoURL || '',
            weeklyReports: false,
            budgetNotifications: true
          };
          setDoc(doc(db, profilePath), initialProfile).catch(err => {
            try {
              handleFirestoreError(err, OperationType.WRITE, profilePath);
            } catch (e) {
              console.warn("Error creating initial profile:", e);
            }
          });
          setProfile(initialProfile);
        }
        profileReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, profilePath);
        } catch (e) {
          console.warn("Firestore listener error for profile:", e);
        }
        profileReady = true;
        checkReady();
      });

      const qTransactions = query(collection(db, transactionsPath), orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(docs);
        txReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, transactionsPath);
        } catch (e) {
          console.warn("Firestore listener error for transactions:", e);
        }
        txReady = true;
        checkReady();
      });

      const qIncomes = query(collection(db, incomesPath), orderBy('dateReceived', 'desc'));
      const unsubscribeIncomes = onSnapshot(qIncomes, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
        setIncomes(docs);
        incReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, incomesPath);
        } catch (e) {
          console.warn("Firestore listener error for incomes:", e);
        }
        incReady = true;
        checkReady();
      });

      const qBudgets = query(collection(db, budgetsPath));
      const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryBudget));
        setBudgets(docs);
        budReady = true;
        checkReady();
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, budgetsPath);
        } catch (e) {
          console.warn("Firestore listener error for budgets:", e);
        }
        budReady = true;
        checkReady();
      });

      return () => {
        unsubscribeTransactions();
        unsubscribeIncomes();
        unsubscribeBudgets();
        unsubscribeReports();
        unsubscribeProfile();
        unsubscribeArchives();
      };
    }

    // Case 2: Guest Demo Mode (Explicitly chosen by user)
    if (isGuest) {
      const store = loadGuestStore();
      setTransactions(store.transactions);
      setIncomes(store.incomes);
      setBudgets(store.budgets);
      setReports(store.reports);
      setArchives(store.archives);
      setProfile(store.profile);
      setLoading(false);
      return;
    }

    // Case 3: Unauthenticated - waiting for login
    setTransactions([]);
    setIncomes([]);
    setBudgets([]);
    setReports([]);
    setArchives([]);
    setProfile(null);
    setLoading(false);
  }, [user, isGuest]);

  const loginAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_MODE_KEY, 'true');
    } catch {}
    setIsGuest(true);
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem(GUEST_MODE_KEY);
    } catch {}
    setIsGuest(false);
    await firebaseLogout();
  }, []);

  const archiveMonth = useCallback(async (monthYearKey: string, monthLabel: string) => {
    const activeUser = user || (isGuest ? { uid: 'guest-user' } : null);
    if (!activeUser) return;

    if (isGuest) {
      const store = loadGuestStore();
      const totalIncome = store.incomes.length > 0 ? store.incomes[0].salaryReceived : 0;
      const totalExpenses = store.transactions.reduce((acc, curr) => acc + curr.amount, 0);

      const newArchive: Archive = {
        id: monthYearKey,
        monthLabel,
        archivedAt: Date.now(),
        transactions: [...store.transactions],
        incomes: [...store.incomes],
        budgets: [...store.budgets],
        totalIncome,
        totalExpenses,
        userId: 'guest-user'
      };

      store.archives = [newArchive, ...store.archives.filter(a => a.id !== monthYearKey)];
      store.transactions = [];
      store.incomes = [];
      saveGuestStore(store);

      setArchives(store.archives);
      setTransactions([]);
      setIncomes([]);
      return;
    }

    const archivesPath = `users/${user!.uid}/archives`;
    const transactionsPath = `users/${user!.uid}/transactions`;
    const incomesPath = `users/${user!.uid}/incomes`;
    try {
      const totalIncome = incomes.length > 0 ? incomes[0].salaryReceived : 0;
      const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);

      const archiveDocRef = doc(db, archivesPath, monthYearKey);
      await setDoc(archiveDocRef, {
        id: monthYearKey,
        monthLabel,
        archivedAt: Date.now(),
        transactions: transactions.map(({ id, ...rest }) => rest),
        incomes: incomes.map(({ id, ...rest }) => rest),
        budgets: budgets.map(({ id, ...rest }) => rest),
        totalIncome,
        totalExpenses,
        userId: user!.uid
      });

      const { writeBatch, doc: firestoreDoc } = await import('firebase/firestore');
      const batch = writeBatch(db);

      transactions.forEach(t => {
        const docRef = firestoreDoc(db, transactionsPath, t.id);
        batch.delete(docRef);
      });

      incomes.forEach(i => {
        const docRef = firestoreDoc(db, incomesPath, i.id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, archivesPath);
    }
  }, [user, isGuest, transactions, incomes, budgets]);

  const deleteArchive = useCallback(async (id: string) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.archives = store.archives.filter(a => a.id !== id);
      saveGuestStore(store);
      setArchives(store.archives);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/archives/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user, isGuest]);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.profile = { ...store.profile, ...data };
      saveGuestStore(store);
      setProfile(store.profile);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [user, isGuest]);

  const addReport = useCallback(async (content: string) => {
    if (isGuest) {
      const store = loadGuestStore();
      const newReport: FinancialReport = {
        id: `demo-rep-${Date.now()}`,
        content,
        createdAt: new Date(),
        userId: 'guest-user'
      };
      store.reports = [newReport, ...store.reports];
      saveGuestStore(store);
      setReports(store.reports);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/reports`;
    try {
      await addDoc(collection(db, path), {
        content,
        createdAt: new Date(),
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }, [user, isGuest]);

  const updateCategoryBudget = useCallback(async (category: string, amount: number) => {
    if (isGuest) {
      const store = loadGuestStore();
      const idx = store.budgets.findIndex(b => b.category === category);
      const updated: CategoryBudget = { id: category, category, amount, userId: 'guest-user' };
      if (idx >= 0) {
        store.budgets[idx] = updated;
      } else {
        store.budgets.push(updated);
      }
      saveGuestStore(store);
      setBudgets([...store.budgets]);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/budgets`;
    try {
      await setDoc(doc(db, path, category), {
        category,
        amount,
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, [user, isGuest]);

  const deleteCategoryBudget = useCallback(async (category: string) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.budgets = store.budgets.filter(b => b.category !== category);
      saveGuestStore(store);
      setBudgets(store.budgets);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/budgets/${category}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user, isGuest]);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (isGuest) {
      const store = loadGuestStore();
      const newTx: Transaction = {
        id: `demo-tx-${Date.now()}`,
        ...data,
        userId: 'guest-user'
      };
      store.transactions = [newTx, ...store.transactions];
      saveGuestStore(store);
      setTransactions(store.transactions);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/transactions`;
    try {
      await addDoc(collection(db, path), { ...data, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }, [user, isGuest]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.transactions = store.transactions.map(t => t.id === id ? { ...t, ...data } : t);
      saveGuestStore(store);
      setTransactions(store.transactions);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/transactions/${id}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [user, isGuest]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.transactions = store.transactions.filter(t => t.id !== id);
      saveGuestStore(store);
      setTransactions(store.transactions);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user, isGuest]);

  const deleteTransactionsByCategory = useCallback(async (category: string) => {
    if (isGuest) {
      const store = loadGuestStore();
      store.transactions = store.transactions.filter(t => t.category !== category);
      saveGuestStore(store);
      setTransactions(store.transactions);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/transactions`;
    try {
      const targets = transactions.filter(t => t.category === category);
      if (targets.length === 0) return;

      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      targets.forEach(t => {
        const docRef = doc(db, path, t.id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user, isGuest, transactions]);

  const addIncome = useCallback(async (salary: number) => {
    if (isGuest) {
      const store = loadGuestStore();
      const newInc: Income = {
        id: `demo-inc-${Date.now()}`,
        salaryReceived: salary,
        dateReceived: Date.now(),
        userId: 'guest-user'
      };
      store.incomes = [newInc, ...store.incomes];
      saveGuestStore(store);
      setIncomes(store.incomes);
      return;
    }

    if (!user) return;
    const path = `users/${user.uid}/incomes`;
    try {
      await addDoc(collection(db, path), {
        salaryReceived: salary,
        dateReceived: Date.now(),
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }, [user, isGuest]);

  const syncUserProfile = useCallback(async () => {
    if (isGuest) return;
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, path), {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL || ''
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, [user, isGuest]);

  const activeUser = user || (isGuest ? {
    uid: 'guest-user',
    email: profile?.email || 'invite@financeperso.pro',
    displayName: profile?.displayName || 'Invité Démo',
    photoURL: profile?.photoURL || ''
  } as any : null);

  return {
    transactions,
    incomes,
    loading,
    budgets,
    reports,
    archives,
    user: activeUser,
    isGuest,
    loginAsGuest,
    logout: handleLogout,
    profile,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactionsByCategory,
    addIncome,
    addReport,
    syncUserProfile,
    updateUserProfile,
    updateCategoryBudget,
    deleteCategoryBudget,
    archiveMonth,
    deleteArchive
  };
}
