import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Transaction } from "../types";
import { useCurrency } from "../context/CurrencyContext";

export function SummaryCard({ transactions }: { transactions: Transaction[] }) {
  const { formatAmount } = useCurrency();

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = income - expense;

  return (
    <Card style={{ margin: 16, borderRadius: 16, elevation: 4 }}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={{ borderRadius: 16, padding: 20 }}
      >
        <Text variant="titleMedium" style={{ color: "#fff", opacity: 0.8, textAlign: "center" }}>
          Total Balance
        </Text>
        <Text variant="displayMedium" style={{ color: "#fff", fontWeight: "bold", textAlign: "center", marginVertical: 8 }}>
          {formatAmount(balance)}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
          <View>
            <Text variant="labelMedium" style={{ color: "#a5d6a7" }}>Income</Text>
            <Text variant="titleLarge" style={{ color: "#fff" }}>+{formatAmount(income)}</Text>
          </View>
          <View>
            <Text variant="labelMedium" style={{ color: "#ef9a9a", textAlign: "right" }}>Expense</Text>
            <Text variant="titleLarge" style={{ color: "#fff", textAlign: "right" }}>-{formatAmount(expense)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
}
