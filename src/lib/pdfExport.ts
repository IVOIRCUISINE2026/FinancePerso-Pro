import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, CategoryBudget, TransactionCategory } from '../types';
import { formatCurrency, getBudgetPeriodStart, getBudgetPeriodEnd, formatBudgetPeriod } from './utils';

export function exportBudgetStatusToPDF(
  transactions: Transaction[],
  budgets: CategoryBudget[],
) {
  const doc = new jsPDF();
  const now = new Date();
  const startOfPeriod = getBudgetPeriodStart(now);
  const endOfPeriod = getBudgetPeriodEnd(now);
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(46, 91, 255); // #2E5BFF
  doc.text('STATUT BUDGÉTAIRE PAR CATÉGORIE', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${now.toLocaleString('fr-FR')}`, 14, 30);
  doc.text(`Période : ${formatBudgetPeriod(startOfPeriod, endOfPeriod)}`, 14, 35);

  // Prepare data
  const statusData = Object.values(TransactionCategory).map((category) => {
    const budgetObj = budgets.find(b => b.category === category);
    let budget = budgetObj ? budgetObj.amount : 0;
    if (!budgetObj && category === TransactionCategory.EAU) {
      budget = 10000;
    }
    
    const actual = transactions
      .filter(t => t.category === category && t.date >= startOfPeriod && t.date <= endOfPeriod)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const remaining = budget - actual;
    const isOver = budget > 0 && actual > budget;

    return [
      category,
      formatCurrency(budget),
      formatCurrency(actual),
      formatCurrency(remaining),
      isOver ? 'DÉPASSEMENT' : budget > 0 ? 'RESPECTÉ' : 'AUCUN BUDGET'
    ];
  });

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalActual = transactions
    .filter(t => t.date >= startOfPeriod && t.date <= endOfPeriod)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalRemaining = totalBudget - totalActual;

  // Add summary row
  statusData.push([
    { content: 'TOTAL GLOBAL', styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } },
    { content: formatCurrency(totalBudget), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } },
    { content: formatCurrency(totalActual), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } },
    { content: formatCurrency(totalRemaining), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } },
    { content: `${totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}% Utilisation`, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }
  ] as any);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [['Catégorie', 'Budget', 'Actuel', 'Restant', 'Statut']],
    body: statusData,
    headStyles: { fillColor: [46, 91, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 40 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = data.cell.raw;
        if (typeof val === 'string' && val.includes('-')) {
          data.cell.styles.textColor = [244, 63, 94]; // Rose 500
        } else if (val !== '—') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald 500
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'DÉPASSEMENT') {
          data.cell.styles.textColor = [244, 63, 94];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'RESPECTÉ') {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    }
  });

  // Footer text
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'FinancePerso Pro - Rapport Budgétaire Mensuel',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`Rapport_Budget_${now.getFullYear()}_${now.getMonth() + 1}.pdf`);
}

export function exportDetailedExpensesToPDF(
  transactions: Transaction[]
) {
  const doc = new jsPDF();
  const now = new Date();
  const startOfPeriod = getBudgetPeriodStart(now);
  const endOfPeriod = getBudgetPeriodEnd(now);
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(46, 91, 255); // #2E5BFF
  doc.text('DÉTAILS DES DÉPENSES DE LA PÉRIODE', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${now.toLocaleString('fr-FR')}`, 14, 30);
  doc.text(`Période : ${formatBudgetPeriod(startOfPeriod, endOfPeriod)}`, 14, 35);

  // Filter current period transactions
  const monthTransactions = transactions
    .filter(t => t.date >= startOfPeriod && t.date <= endOfPeriod)
    .sort((a, b) => b.date - a.date);

  const totalAmount = monthTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Table Data
  const tableData = monthTransactions.map((t) => [
    new Date(t.date).toLocaleDateString('fr-FR'),
    t.category,
    t.note || '-',
    formatCurrency(t.amount)
  ]);

  // Add total row
  tableData.push([
    { content: 'TOTAL CUMULÉ', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [230, 230, 230], halign: 'right' } },
    { content: formatCurrency(totalAmount), styles: { fontStyle: 'bold', fillColor: [230, 230, 230], halign: 'right' } }
  ] as any);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [['Date', 'Catégorie', 'Note', 'Montant']],
    body: tableData,
    headStyles: { fillColor: [46, 91, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 40 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      3: { halign: 'right' },
    }
  });

  // Footer text
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'FinancePerso Pro - Détails des Dépenses Mensuelles',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`Details_Depenses_${now.getFullYear()}_${now.getMonth() + 1}.pdf`);
}
