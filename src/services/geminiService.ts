export async function chatWithAI(messages: { role: string, content: string }[], context: any) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to communicate with AI");
  }
  
  return response.json();
}

export async function generateFinancialReport(transactions: any[], incomes: any[]) {
  const response = await fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions, incomes }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate report");
  }
  
  const data = await response.json();
  return data.text;
}
