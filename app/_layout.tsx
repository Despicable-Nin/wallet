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
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />

        {/* Main App with Bottom Tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modals / Sub-screens */}
        <Stack.Screen name="add-transaction" options={{ presentation: "modal" }} />
        <Stack.Screen name="edit-transaction" options={{ presentation: "modal" }} />
        <Stack.Screen name="transaction-details" options={{ title: "Details" }} />
        <Stack.Screen name="budgets" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="agenda" />
        <Stack.Screen name="subscriptions" />
        <Stack.Screen name="savings" />
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
