import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { IDItem } from '@/utils/database';
import { IconSymbol } from './ui/IconSymbol';

interface IDDetailProps {
  id: IDItem;
  onEdit: () => void;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function IDDetail({ id, onEdit, onClose, onSearch }: IDDetailProps) {
  const copyToClipboard = async (text: string, fieldName: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('コピーしました', `${fieldName}をクリップボードにコピーしました`);
  };

  const handleWebSearch = () => {
    onSearch(id.title);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{id.title}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Text style={styles.editButtonText}>編集</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {id.notes && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>メモ</Text>
            <Text style={styles.notesText}>{id.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={handleWebSearch}>
          <IconSymbol name="magnifyingglass" size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Webで検索</Text>
        </TouchableOpacity>

        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            作成日: {new Date(id.createdAt).toLocaleDateString('ja-JP')}
          </Text>
          <Text style={styles.metadataText}>
            更新日: {new Date(id.updatedAt).toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: '#000000',
    letterSpacing: 0.2,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  field: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  fieldValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldText: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
    letterSpacing: 0.2,
  },
  copyButton: {
    padding: 10,
  },
  notesText: {
    fontSize: 17,
    color: '#000000',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  metadata: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metadataText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
});