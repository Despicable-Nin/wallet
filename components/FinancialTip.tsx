import { View } from "react-native";
import { Card, Text, IconButton, useTheme } from "react-native-paper";
import { useState, useEffect } from "react";

const TIPS = [
  "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Always save at least 3-6 months of expenses for emergencies.",
  "Track every expense, no matter how small.",
  "Set specific, measurable financial goals.",
  "Review your subscriptions monthly and cancel unused ones.",
  "Pay yourself first - automate your savings.",
  "Avoid impulse purchases by waiting 24-48 hours before buying.",
  "Use cash for discretionary spending to stay within budget.",
  "Compare prices before making big purchases.",
  "Invest early - time in the market beats timing the market.",
];

export function FinancialTip() {
  const theme = useTheme();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length));
  }, []);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <Card style={{ margin: 16, marginTop: 8, backgroundColor: "#e8f5e9", borderRadius: 12 }}>
      <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text variant="labelSmall" style={{ color: theme.colors.primary, marginBottom: 4 }}>
             Financial Tip
          </Text>
          <Text variant="bodyMedium">{TIPS[tipIndex]}</Text>
        </View>
        <IconButton icon="refresh" onPress={nextTip} />
      </Card.Content>
    </Card>
  );
}
