import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { Transaction, Income, OperationType, TransactionCategory, CategoryBudget, UserProfile, FinancialReport, Archive } from '../types';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setIncomes([]);
      setBudgets([]);
      setProfile(null);
      setLoading(false);
      return;
    }

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
      handleFirestoreError(error, OperationType.GET, archivesPath);
      archivesReady = true;
      checkReady();
    });

    const unsubscribeReports = onSnapshot(query(collection(db, reportsPath), orderBy('createdAt', 'desc')), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialReport));
      setReports(docs);
      reportsReady = true;
      checkReady();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, reportsPath);
      reportsReady = true;
      checkReady();
    });

    const unsubscribeProfile = onSnapshot(doc(db, profilePath), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Utilisateur',
          photoURL: user.photoURL || '',
          weeklyReports: false,
          budgetNotifications: true
        };
        setDoc(doc(db, profilePath), initialProfile).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, profilePath);
        });
        setProfile(initialProfile);
      }
      profileReady = true;
      checkReady();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, profilePath);
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
      handleFirestoreError(error, OperationType.GET, transactionsPath);
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
      handleFirestoreError(error, OperationType.GET, incomesPath);
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
      handleFirestoreError(error, OperationType.GET, budgetsPath);
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
  }, [user]);

  const archiveMonth = useCallback(async (monthYearKey: string, monthLabel: string) => {
    if (!user) return;
    const archivesPath = `users/${user.uid}/archives`;
    const transactionsPath = `users/${user.uid}/transactions`;
    const incomesPath = `users/${user.uid}/incomes`;
    try {
      // 1. Calculate active totals
      const totalIncome = incomes.length > 0 ? incomes[0].salaryReceived : 0;
      const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);

      // 2. Save document to archives collection
      const archiveDocRef = doc(db, archivesPath, monthYearKey);
      await setDoc(archiveDocRef, {
        id: monthYearKey,
        monthLabel,
        archivedAt: Date.now(),
        transactions: transactions.map(({ id, ...rest }) => rest), // Keep transaction items in memory
        incomes: incomes.map(({ id, ...rest }) => rest),
        budgets: budgets.map(({ id, ...rest }) => rest),
        totalIncome,
        totalExpenses,
        userId: user.uid
      });

      // 3. Delete active data from Firestore chunk by chunk to prevent UI clearing errors
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
  }, [user, transactions, incomes, budgets]);

  const deleteArchive = useCallback(async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/archives/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user]);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [user]);

  const addReport = useCallback(async (content: string) => {
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
  }, [user]);

  const updateCategoryBudget = useCallback(async (category: string, amount: number) => {
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
  }, [user]);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    const path = `users/${user.uid}/transactions`;
    try {
      await addDoc(collection(db, path), { ...data, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    if (!user) return;
    const path = `users/${user.uid}/transactions/${id}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [user]);

  const deleteTransactionsByCategory = useCallback(async (category: string) => {
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
  }, [user, transactions]);

  const addIncome = useCallback(async (salary: number) => {
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
  }, [user]);

  const syncUserProfile = useCallback(async () => {
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
  }, [user]);

  return {
    transactions,
    incomes,
    loading,
    budgets,
    reports,
    archives,
    user,
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
    archiveMonth,
    deleteArchive
  };
}
