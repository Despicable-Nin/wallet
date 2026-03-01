import { View } from "react-native";
import { Appbar, List, RadioButton, Text, Card, Switch, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useCurrency, CURRENCIES, CurrencyCode } from "../context/CurrencyContext";
import { useAppTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode, toggleTheme } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <View style={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Appearance</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="bodyLarge">Dark Mode</Text>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Currency</Text>
            <RadioButton.Group onValueChange={(value) => setCurrency(value as CurrencyCode)} value={currency.code}>
              {Object.values(CURRENCIES).map((curr) => (
                <RadioButton.Item
                  key={curr.code}
                  label={`${curr.symbol} ${curr.name} (${curr.code})`}
                  value={curr.code}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
