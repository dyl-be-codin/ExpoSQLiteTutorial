import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Props = {
  name: string;
  yards: number;
  ypc: number;
  receptions: number;
  tds: number;
  onEdit: () => void;
  onDelete: () => void;
};

const ItemRow: React.FC<Props> = ({ name, yards, ypc, receptions, tds, onEdit, onDelete }) => {
  return (
    <View style={styles.rowData}>
      <Text style={styles.cell}>{name}</Text>
      <Text style={styles.cell}>{yards}</Text>
      <Text style={styles.cell}>{ypc}</Text>
      <Text style={styles.cell}>{receptions}</Text>
      <Text style={styles.cell}>{tds}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <MaterialIcons name="edit" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <MaterialIcons name="delete" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ItemRow;

const styles = StyleSheet.create({
  rowData: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});
