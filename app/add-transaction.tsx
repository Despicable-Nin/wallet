import { useState, useEffect } from "react";
import { View, ScrollView, Image, Platform, Alert, TouchableOpacity } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Chip,
  SegmentedButtons,
  useTheme,
  Portal,
  Modal,
  IconButton,
  Appbar,
  Card,
} from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { useTransactions } from "../hooks/useTransactions";
import { Category, TransactionType, PaymentMethod } from "../types";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Food", type: "expense" },
  { id: "2", name: "Bills", type: "expense" },
  { id: "3", name: "Transport", type: "expense" },
  { id: "4", name: "Shopping", type: "expense" },
  { id: "5", name: "Entertainment", type: "expense" },
  { id: "6", name: "Salary", type: "income" },
  { id: "7", name: "Freelance", type: "income" },
  { id: "8", name: "Others", type: "expense" },
  { id: "9", name: "Others", type: "income" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "cash" },
  { value: "card", label: "Card", icon: "credit-card" },
  { value: "bank_transfer", label: "Bank", icon: "bank" },
  { value: "e_wallet", label: "E-Wallet", icon: "cellphone" },
];

export default function AddTransaction() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [establishment, setEstablishment] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Split Bill state
  const [isSplit, setIsSplit] = useState(false);
  const [splitPeople, setSplitPeople] = useState("2");
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [splitNotes, setSplitNotes] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories");
      const data = await response.json();
      if (data && data.length > 0) {
        setAvailableCategories(data);
      } else {
        setAvailableCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAvailableCategories(DEFAULT_CATEGORIES);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowCalendar(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category.");
      return;
    }

    setLoading(true);
    try {
      const numPeople = parseInt(splitPeople) || 1;
      const finalAmount = isSplit ? numAmount / numPeople : numAmount;

      const splitInfo = isSplit ? {
        people: numPeople,
        amountPerPerson: finalAmount,
        notes: splitNotes
      } : undefined;

      const finalNote = isSplit
        ? `${note ? note + " " : ""} [Split Bill] Total: ₱${numAmount.toFixed(2)} split with ${numPeople} people.`
        : note;

      await addTransaction({
        amount: finalAmount,
        date: date.toISOString(),
        note: finalNote,
        type,
        category: selectedCategory,
        paymentMethod,
        establishment: establishment || undefined,
        receiptUrl: receiptImage || undefined,
        splitInfo
      });
      setLoading(false);
      router.back();
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to save transaction. Please check your connection.");
    }
  };

  const theme = useTheme();
  const splitAmountPerPerson = (parseFloat(amount) || 0) / (parseInt(splitPeople) || 1);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Transaction" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SegmentedButtons
          value={type}
          onValueChange={(val) => setType(val as TransactionType)}
          buttons={[
            { value: "expense", label: "Expense", icon: "arrow-down" },
            { value: "income", label: "Income", icon: "arrow-up" },
          ]}
          style={{ marginBottom: 16 }}
        />

        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          left={<TextInput.Affix text="₱" />}
          style={{ marginBottom: 16 }}
        />

        <TextInput
          label="Date"
          value={date.toLocaleDateString()}
          mode="outlined"
          editable={false}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowCalendar(true)} />}
          style={{ marginBottom: 16 }}
        />

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {availableCategories
            .filter((cat: Category) => cat.type === type)
            .map((cat: Category) => (
              <Chip
                key={cat.id}
                selected={selectedCategory?.id === cat.id}
                onPress={() => setSelectedCategory(cat)}
                mode="outlined"
                selectedColor={selectedCategory?.id === cat.id ? "#6200ee" : undefined}
                style={{ backgroundColor: selectedCategory?.id === cat.id ? "#e8def8" : "transparent" }}
              >
                {cat.name}
              </Chip>
            ))}
        </View>

        <TextInput
          label="Establishment / Location"
          value={establishment}
          onChangeText={setEstablishment}
          mode="outlined"
          placeholder="e.g., Jollibee, SM Mall"
          style={{ marginBottom: 16 }}
        />

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>Payment Method</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PAYMENT_METHODS.map((method) => (
            <Chip
              key={method.value}
              icon={method.icon}
              selected={paymentMethod === method.value}
              onPress={() => setPaymentMethod(method.value)}
              mode="outlined"
              selectedColor={paymentMethod === method.value ? "#6200ee" : undefined}
              style={{ backgroundColor: paymentMethod === method.value ? "#e8def8" : "transparent" }}
            >
              {method.label}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          style={{ marginBottom: 16 }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text variant="labelLarge">Split Bill?</Text>
          <Button
            mode={isSplit ? "contained" : "outlined"}
            onPress={() => setSplitModalVisible(true)}
            icon="account-group"
          >
            {isSplit ? `Split with ${splitPeople} people` : "Split with friends"}
          </Button>
        </View>

        {isSplit && (
          <View style={{ backgroundColor: "#e8def8", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text variant="bodySmall" style={{ color: "#6200ee", fontWeight: "bold" }}>
              Only your share (₱{splitAmountPerPerson.toFixed(2)}) will be added to your balance.
            </Text>
            <Text variant="bodySmall" style={{ marginTop: 4, color: "#666" }}>
              Total: ₱{(parseFloat(amount) || 0).toFixed(2)} split with {splitPeople} people.
            </Text>
            {splitNotes && <Text variant="bodySmall" style={{ marginTop: 4 }}>Notes: {splitNotes}</Text>}
          </View>
        )}

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>Receipt Image</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Button icon="camera" mode="outlined" onPress={takePhoto}>
            Take Photo
          </Button>
          <Button icon="image" mode="outlined" onPress={pickImage}>
            Gallery
          </Button>
        </View>

        {receiptImage && (
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{ uri: receiptImage }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
            <IconButton
              icon="close-circle"
              size={24}
              iconColor="red"
              style={{ position: "absolute", top: 0, right: 0 }}
              onPress={() => setReceiptImage(null)}
            />
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          Save Transaction
        </Button>

        <View style={{ height: 40 }} />

        <Portal>
          <Modal
            visible={splitModalVisible}
            onDismiss={() => setSplitModalVisible(false)}
            contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Split Bill</Text>

            <TextInput
              label="Number of People"
              value={splitPeople}
              onChangeText={setSplitPeople}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: 16 }}
            />

            <View style={{ backgroundColor: "#f0f0f0", padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Text variant="labelLarge">Amount per Person:</Text>
              <Text variant="headlineSmall" style={{ fontWeight: "bold", color: "#6200ee" }}>
                ₱{splitAmountPerPerson.toFixed(2)}
              </Text>
            </View>

            <TextInput
              label="Who owes you? (Optional)"
              value={splitNotes}
              onChangeText={setSplitNotes}
              mode="outlined"
              placeholder="e.g. John owes ₱50, Sarah owes ₱50"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
            />

            <Button mode="contained" onPress={() => {
              setIsSplit(true);
              setSplitModalVisible(false);
            }}>
              Confirm Split
            </Button>
            <Button mode="text" onPress={() => {
              setIsSplit(false);
              setSplitModalVisible(false);
            }} style={{ marginTop: 8 }}>
              Cancel Split
            </Button>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            visible={showCalendar}
            onDismiss={() => setShowCalendar(false)}
            contentContainerStyle={{
              backgroundColor: "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card style={{ width: "90%", borderRadius: 24, padding: 16, elevation: 10 }}>
              <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: "700", textAlign: "center" }}>
                Select Transaction Date
              </Text>
              <Calendar
                current={date.toISOString().split('T')[0]}
                onDayPress={(day) => {
                  setDate(new Date(day.timestamp));
                  setShowCalendar(false);
                }}
                markedDates={{
                  [date.toISOString().split('T')[0]]: { selected: true, selectedColor: theme.colors.primary }
                }}
                theme={{
                  backgroundColor: theme.colors.surface,
                  calendarBackground: theme.colors.surface,
                  textSectionTitleColor: theme.colors.primary,
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: theme.colors.primary,
                  dayTextColor: theme.colors.onSurface,
                  textDisabledColor: theme.colors.surfaceVariant,
                  dotColor: theme.colors.primary,
                  selectedDotColor: '#ffffff',
                  arrowColor: theme.colors.primary,
                  disabledArrowColor: theme.colors.surfaceVariant,
                  monthTextColor: theme.colors.onSurface,
                  indicatorColor: theme.colors.primary,
                  textDayFontWeight: '300',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14
                }}
              />
              <Button
                mode="text"
                onPress={() => setShowCalendar(false)}
                style={{ marginTop: 16 }}
              >
                Close
              </Button>
            </Card>
          </Modal>
        </Portal>
      </ScrollView>
    </View>
  );
}
