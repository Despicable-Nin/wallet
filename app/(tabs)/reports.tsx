import { useState, useCallback } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { Appbar, Text, Card, SegmentedButtons, useTheme, Button } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { BarChart } from "react-native-chart-kit";
import { useTransactions } from "../../hooks/useTransactions";
import { useCurrency } from "../../context/CurrencyContext";
import { ChartCard } from "../../components/ChartCard";
import { PaymentMethodChart } from "../../components/PaymentMethodChart";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

export default function ReportsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { transactions, refetch } = useTransactions();
  const { formatAmount, currency } = useCurrency();
  const screenWidth = Dimensions.get("window").width;

  const [viewMode, setViewMode] = useState("monthly");

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // Get current and previous month data
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);

  const currentMonthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const prevMonthTx = transactions.filter((t) => t.date.startsWith(prevMonth));

  const currentExpense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const currentIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
  const prevExpense = prevMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const prevIncome = prevMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = monthNames[now.getMonth()];
  const prevMonthName = monthNames[prevDate.getMonth()];

  const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense * 100).toFixed(1) : "N/A";
  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome * 100).toFixed(1) : "N/A";

  const barData = {
    labels: [prevMonthName, currentMonthName],
    datasets: [
      { data: [prevExpense, currentExpense] },
    ],
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background, elevation: 0 }}>
        <Appbar.Content title="Reports" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Monthly Comparison</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="labelSmall" style={{ color: "gray" }}>{prevMonthName} Expense</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.error }}>{formatAmount(prevExpense)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="labelSmall" style={{ color: "gray" }}>{currentMonthName} Expense</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.error }}>{formatAmount(currentExpense)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="labelSmall" style={{ color: "gray" }}>{prevMonthName} Income</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{formatAmount(prevIncome)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="labelSmall" style={{ color: "gray" }}>{currentMonthName} Income</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{formatAmount(currentIncome)}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 8 }}>
              <Text variant="bodySmall">
                Expense Change: <Text style={{ color: Number(expenseChange) > 0 ? theme.colors.error : "green", fontWeight: "bold" }}>{expenseChange}%</Text>
              </Text>
              <Text variant="bodySmall">
                Income Change: <Text style={{ color: Number(incomeChange) > 0 ? "green" : theme.colors.error, fontWeight: "bold" }}>{incomeChange}%</Text>
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Expense Trend</Text>
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={200}
              yAxisLabel={currency.symbol}
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ borderRadius: 8 }}
            />
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>Export Data</Text>
            <Text variant="bodySmall" style={{ color: "gray", marginBottom: 16 }}>
              Download your transaction history for the current month.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                mode="contained-tonal"
                icon="file-excel"
                onPress={() => exportToCSV(currentMonthTx)}
                style={{ flex: 1 }}
              >
                CSV
              </Button>
              <Button
                mode="contained-tonal"
                icon="file-pdf-box"
                onPress={() => exportToPDF(currentMonthTx, formatAmount)}
                style={{ flex: 1 }}
              >
                PDF
              </Button>
            </View>
          </Card.Content>
        </Card>

        <ChartCard transactions={transactions} />
        <PaymentMethodChart transactions={transactions} />
      </ScrollView>
    </View>
  );
}
