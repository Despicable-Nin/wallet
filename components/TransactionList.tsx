import { View } from "react-native";
import { List, Text, useTheme, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { Transaction } from "../types";
import { useCurrency } from "../context/CurrencyContext";

const PAYMENT_ICONS: Record<string, string> = {
  cash: "cash",
  card: "credit-card",
  bank_transfer: "bank",
  e_wallet: "cellphone",
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const theme = useTheme();
  const router = useRouter();
  const { formatAmount } = useCurrency();

  const recentTransactions = [...transactions].reverse().slice(0, 10);

  return (
    <View style={{ backgroundColor: "white", marginHorizontal: 16, borderRadius: 16, padding: 8, elevation: 2 }}>
      <Text variant="titleMedium" style={{ padding: 16, paddingBottom: 8 }}>Recent Activity</Text>
      {recentTransactions.map((item, index) => (
        <View key={item.id}>
          <List.Item
            title={item.category?.name || "Unknown"}
            description={`${item.establishment || item.note || item.date.split("T")[0]}  ${item.paymentMethod?.replace("_", " ") || "cash"}`}
            left={(props) => (
              <List.Icon 
                {...props} 
                icon={PAYMENT_ICONS[item.paymentMethod || "cash"]} 
                color={item.type === "income" ? theme.colors.primary : theme.colors.error}
              />
            )}
            right={() => (
              <Text
                variant="bodyLarge"
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: item.type === "income" ? theme.colors.primary : theme.colors.error,
                }}
              >
                {item.type === "income" ? "+" : "-"}{formatAmount(item.amount)}
              </Text>
            )}
            onPress={() => router.push(`/transaction-details?id=${item.id}`)}
          />
          {index < recentTransactions.length - 1 && <Divider />}
        </View>
      ))}
      {recentTransactions.length === 0 && (
        <Text style={{ textAlign: "center", padding: 20, color: "gray" }}>No transactions yet.</Text>
      )}
    </View>
  );
}
