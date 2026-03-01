import { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { Appbar, Text, FAB, Portal, Modal, TextInput, Button, Card, ProgressBar, useTheme } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useBudgets } from "../hooks/useBudgets";
import { useTransactions } from "../hooks/useTransactions";
import { useCurrency } from "../context/CurrencyContext";

export default function BudgetsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { budgets, addBudget, refetch: refetchBudgets } = useBudgets();
  const { transactions, refetch: refetchTx } = useTransactions();
  const { formatAmount } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  useFocusEffect(
    useCallback(() => {
      refetchBudgets();
      refetchTx();
    }, [])
  );

  const handleAddBudget = async () => {
    if (!categoryName || !budgetAmount) return;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    await addBudget({
      categoryId: Date.now(),
      amount: parseFloat(budgetAmount),
      month: currentMonth,
    });

    setCategoryName("");
    setBudgetAmount("");
    setModalVisible(false);
  };

  // Calculate spending per category
  const getCategorySpending = (categoryId: number) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category.id === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background, elevation: 0 }}>
        <Appbar.Content title="Budgets" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {budgets.length === 0 ? (
          <Card style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: "gray" }}>
              No budgets set. Tap + to create your first budget!
            </Text>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent = getCategorySpending(Number(budget.categoryId));
            const percentage = Math.min(spent / budget.amount, 1);
            const isOverBudget = spent > budget.amount;
            const remaining = budget.amount - spent;

            const progressColor = isOverBudget
              ? theme.colors.error
              : percentage > 0.8
                ? "#ff9800"
                : theme.colors.primary;

            return (
              <Card key={budget.id} style={{ marginBottom: 12, borderRadius: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text variant="titleMedium">Budget: {budget.month}</Text>
                    <Text variant="bodyMedium" style={{ color: isOverBudget ? theme.colors.error : "gray" }}>
                      {formatAmount(spent)} / {formatAmount(budget.amount)}
                    </Text>
                  </View>

                  <ProgressBar
                    progress={percentage}
                    color={progressColor}
                    style={{ height: 12, borderRadius: 6 }}
                  />

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                    <Text variant="labelSmall" style={{ color: "gray" }}>
                      {(percentage * 100).toFixed(0)}% used
                    </Text>
                    <Text variant="labelSmall" style={{ color: isOverBudget ? theme.colors.error : "green" }}>
                      {isOverBudget ? `Over by ${formatAmount(Math.abs(remaining))}` : `${formatAmount(remaining)} left`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>Set New Budget</Text>

          <TextInput
            label="Category Name"
            value={categoryName}
            onChangeText={setCategoryName}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label="Budget Amount"
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            keyboardType="numeric"
            mode="outlined"
            left={<TextInput.Affix text="₱" />}
            style={{ marginBottom: 16 }}
          />

          <Button mode="contained" onPress={handleAddBudget} disabled={!categoryName || !budgetAmount}>
            Save Budget
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
}
