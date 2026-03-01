import { View, ActivityIndicator, ScrollView } from "react-native";
import { FAB, Appbar, Text, Button, Card } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useCurrency } from "../context/CurrencyContext";
import { Subscription } from "../types";
import { SummaryCard } from "../components/SummaryCard";
import { ChartCard } from "../components/ChartCard";
import { TransactionList } from "../components/TransactionList";
import { FinancialTip } from "../components/FinancialTip";
import { BudgetCard } from "../components/BudgetCard";

export default function Dashboard() {
  const router = useRouter();
  const { transactions, loading: txLoading, refetch: refetchTx } = useTransactions();
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets();
  const { subscriptions, refetch: refetchSubs } = useSubscriptions();
  const { formatAmount } = useCurrency();

  const loading = txLoading || budgetsLoading;

  useFocusEffect(
    useCallback(() => {
      refetchTx();
      refetchBudgets();
      refetchSubs();
    }, [])
  );

  if (loading && transactions.length === 0 && budgets.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only show budgets for the current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudgets = budgets.filter(b => b.month === currentMonth);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Appbar.Header>
        <Appbar.Content title="WiseWallet" />
        <Appbar.Action icon="calendar" onPress={() => router.push("/calendar")} />
        <Appbar.Action icon="chart-bar" onPress={() => router.push("/reports")} />
        <Appbar.Action icon="wallet" onPress={() => router.push("/budgets")} />
        <Appbar.Action icon="bell-ring" onPress={() => router.push("/subscriptions")} />
        <Appbar.Action icon="piggy-bank" onPress={() => router.push("/savings")} />
        <Appbar.Action icon="clipboard-list" onPress={() => router.push("/agenda")} />
        <Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <SummaryCard transactions={transactions} />

        {currentBudgets.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 }}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>Budget Progress</Text>
              <Button compact onPress={() => router.push("/budgets")}>View All</Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
              {currentBudgets.map(budget => (
                <View key={budget.id} style={{ width: 300 }}>
                  <BudgetCard budget={budget} transactions={transactions} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {(() => {
          const soon = subscriptions.filter(sub => {
            const today = new Date().getDate();
            let daysLeft;
            if (sub.dueDate >= today) {
              daysLeft = sub.dueDate - today;
            } else {
              const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
              daysLeft = (daysInCurrentMonth - today) + sub.dueDate;
            }
            return daysLeft <= 3 && daysLeft >= 0;
          });

          if (soon.length === 0) return null;

          const todayDay = new Date().getDate();

          return (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              <Text variant="titleMedium" style={{ fontWeight: "bold", marginBottom: 8 }}>Upcoming Bills</Text>
              {soon.map(sub => {
                const daysUntil = sub.dueDate >= todayDay ? sub.dueDate - todayDay : (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - todayDay) + sub.dueDate;
                return (
                  <Card key={sub.id} style={{ marginBottom: 8, backgroundColor: "#fff5f5" }} onPress={() => router.push("/subscriptions")}>
                    <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}>
                      <View>
                        <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>{sub.name}</Text>
                        <Text variant="labelSmall" style={{ color: "red" }}>Due in {daysUntil} days</Text>
                      </View>
                      <Text variant="titleMedium" style={{ fontWeight: "bold" }}>{formatAmount(sub.amount)}</Text>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          );
        })()}

        <FinancialTip />
        <ChartCard transactions={transactions} />
        <TransactionList transactions={transactions} />
      </ScrollView>

      <FAB
        icon="plus"
        label="Add"
        style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
        onPress={() => router.push("/add-transaction")}
      />
    </View>
  );
}
