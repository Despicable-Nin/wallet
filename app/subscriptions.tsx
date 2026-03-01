import { useState, useCallback } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Appbar, Text, FAB, Portal, Modal, TextInput, Button, Card, IconButton, useTheme, Chip } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useCurrency } from "../context/CurrencyContext";

const CATEGORIES = ["Entertainment", "Bills", "Gym", "Software", "Others"];

export default function SubscriptionsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { subscriptions, loading, addSubscription, deleteSubscription, refetch } = useSubscriptions();
    const { formatAmount } = useCurrency();

    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [category, setCategory] = useState("Entertainment");

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const handleAddSubscription = async () => {
        const numAmount = parseFloat(amount);
        const numDueDate = parseInt(dueDate);

        if (!name || isNaN(numAmount) || isNaN(numDueDate) || numDueDate < 1 || numDueDate > 31) {
            Alert.alert("Invalid Input", "Please provide a valid name, amount, and due date (1-31).");
            return;
        }

        try {
            await addSubscription({
                name,
                amount: numAmount,
                dueDate: numDueDate,
                category,
            });
            setModalVisible(false);
            setName("");
            setAmount("");
            setDueDate("");
        } catch (error) {
            Alert.alert("Error", "Failed to add subscription.");
        }
    };

    const getDaysUntilDue = (dueDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();
        if (dueDay >= currentDay) {
            return dueDay - currentDay;
        } else {
            // Due next month
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            return (lastDayOfMonth - currentDay) + dueDay;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Subscriptions" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {subscriptions.length === 0 ? (
                    <Card style={{ padding: 20 }}>
                        <Text style={{ textAlign: "center", color: "gray" }}>
                            No subscriptions tracked. Add your Netflix, Spotify, or gym membership!
                        </Text>
                    </Card>
                ) : (
                    subscriptions.map((sub) => {
                        const daysLeft = getDaysUntilDue(sub.dueDate);
                        const isSoon = daysLeft <= 2;

                        return (
                            <Card key={sub.id} style={{ marginBottom: 12, borderRadius: 12 }}>
                                <Card.Content>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <View>
                                            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>{sub.name}</Text>
                                            <Text variant="labelSmall" style={{ color: "gray" }}>{sub.category} • Day {sub.dueDate} of month</Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.primary }}>
                                                {formatAmount(sub.amount)}
                                            </Text>
                                            <Text variant="labelSmall" style={{ color: isSoon ? "#f44336" : "gray", fontWeight: isSoon ? "bold" : "normal" }}>
                                                {daysLeft === 0 ? "Due today!" : daysLeft === 1 ? "Due tomorrow" : `Due in ${daysLeft} days`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                                        <IconButton icon="delete" size={20} iconColor="red" onPress={() => deleteSubscription(sub.id)} />
                                    </View>
                                </Card.Content>
                            </Card>
                        );
                    })
                )}
            </ScrollView>

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}>
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add Subscription</Text>

                    <TextInput label="Service Name" value={name} onChangeText={setName} mode="outlined" style={{ marginBottom: 12 }} placeholder="e.g. Netflix" />
                    <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" mode="outlined" style={{ marginBottom: 12 }} left={<TextInput.Affix text="₱" />} />
                    <TextInput label="Due Day (1-31)" value={dueDate} onChangeText={setDueDate} keyboardType="numeric" mode="outlined" style={{ marginBottom: 12 }} placeholder="Day of the month" />

                    <Text variant="labelLarge" style={{ marginBottom: 8 }}>Category</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {CATEGORIES.map(cat => (
                            <Chip key={cat} selected={category === cat} onPress={() => setCategory(cat)} mode="outlined">
                                {cat}
                            </Chip>
                        ))}
                    </View>

                    <Button mode="contained" onPress={handleAddSubscription}>
                        Save Subscription
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
