import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  fetchItems,
  insertItem,
  type Item,
  deleteItem,
  updateItem,
} from "../data/db";
import ItemRow from "./components/ItemRow";

export default function App() {
  const db = useSQLiteContext();

  const [name, setName] = useState<string>("");
  const [yards, setYards] = useState<string>("");
  const [receptions, setReceptions] = useState<string>("");
  const [tds, setTDs] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!db) return;
      try {
        await db.execAsync("DROP TABLE IF EXISTS items;");
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            yards INTEGER NOT NULL,
            ypc REAL NOT NULL,
            receptions INTEGER NOT NULL,
            tds INTEGER NOT NULL
          );
        `);
        await loadItems();
      } catch (err) {
        console.log("DB init error:", err);
      }
    };
    init();
  }, [db]);

  const loadItems = async () => {
    try {
      const value = await fetchItems(db);
      setItems(value);
    } catch (err) {
      console.log("Failed to fetch items", err);
    }
  };

  const resetForm = () => {
    setName("");
    setYards("");
    setReceptions("");
    setTDs("");
    setEditingId(null);
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setYards(item.yards.toString());
    setReceptions(item.receptions.toString());
    setTDs(item.tds.toString());
  };

  const saveOrUpdate = async () => {
    if (!name.trim()) return;

    const yardsNum = Number(yards) || 0;
    const receptionsNum = Number(receptions) || 0;
    const ypcNum = receptionsNum === 0 ? 0 : parseFloat((yardsNum / receptionsNum).toFixed(1));
    const tdsNum = Number(tds) || 0;

    try {
      if (editingId === null) {
        await insertItem(db, name.trim(), yardsNum, ypcNum, receptionsNum, tdsNum);
      } else {
        await updateItem(db, editingId, name.trim(), yardsNum, ypcNum, receptionsNum, tdsNum);
      }
      await loadItems();
      resetForm();
    } catch (err) {
      console.log("Failed to save/update item", err);
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete item?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem(db, id);
            await loadItems();
            if (editingId === id) resetForm();
          } catch (err) {
            console.log("Failed to delete item", err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Example</Text>

      <TextInput
        style={styles.input}
        placeholder="Player Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Yards"
        value={yards}
        onChangeText={setYards}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Receptions"
        value={receptions}
        onChangeText={setReceptions}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Touchdowns"
        value={tds}
        onChangeText={setTDs}
        keyboardType="numeric"
      />

      <Button
        title={editingId === null ? "Save Item" : "Update Item"}
        onPress={saveOrUpdate}
      />

      {/* Header */}
      <View style={styles.rowHeader}>
        <Text style={styles.cell}>Name</Text>
        <Text style={styles.cell}>Yards</Text>
        <Text style={styles.cell}>YPC</Text>
        <Text style={styles.cell}>Rec</Text>
        <Text style={styles.cell}>TDs</Text>
        <Text style={{ width: 60 }} /> {/* space for icons */}
      </View>

      {/* Data Rows */}
      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ItemRow
            name={item.name}
            yards={item.yards}
            ypc={item.ypc}
            receptions={item.receptions}
            tds={item.tds}
            onEdit={() => startEdit(item)}
            onDelete={() => confirmDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 24, color: "#888" }}>
            No items yet. Add your first one above.
          </Text>
        }
        contentContainerStyle={
          items.length === 0
            ? { flexGrow: 1, justifyContent: "center" }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  list: {
    marginTop: 20,
    width: "100%",
  },
});
