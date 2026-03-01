import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useAppTheme } from "../context/ThemeContext";
import { CurrencyProvider } from "../context/CurrencyContext";
import { TransactionsProvider } from "../context/TransactionsContext";
import { UserProfileProvider } from "../context/UserProfileContext";

function MainLayout() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ title: "Welcome", animation: "fade" }} />
        <Stack.Screen name="index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="add-transaction" options={{ title: "Add Transaction" }} />
        <Stack.Screen name="edit-transaction" options={{ title: "Edit Transaction" }} />
        <Stack.Screen name="transaction-details" options={{ title: "Transaction Details" }} />
        <Stack.Screen name="calendar" options={{ title: "Calendar" }} />
        <Stack.Screen name="budgets" options={{ title: "Budgets" }} />
        <Stack.Screen name="reports" options={{ title: "Reports" }} />
        <Stack.Screen name="agenda" options={{ title: "Agenda" }} />
        <Stack.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
        <Stack.Screen name="savings" options={{ title: "Savings" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <UserProfileProvider>
          <TransactionsProvider>
            <MainLayout />
          </TransactionsProvider>
        </UserProfileProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
