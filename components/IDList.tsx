import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { IDItem, SearchWord, getAllSearchWords } from '@/utils/database';
import { IconSymbol } from './ui/IconSymbol';

interface IDListProps {
  ids: IDItem[];
  onSelectID: (id: IDItem) => void;
  onDeleteID: (id: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onSearch: (query: string, item?: IDItem) => void;
}

export function IDList({ ids, onSelectID, onDeleteID, onRefresh, refreshing, onSearch }: IDListProps) {
  const [searchWords, setSearchWords] = useState<SearchWord[]>([]);

  useEffect(() => {
    loadSearchWords();
  }, []);

  useEffect(() => {
    loadSearchWords();
  }, [ids]); // IDが変更されたときも検索ワードを再読み込み

  const loadSearchWords = async () => {
    try {
      const words = await getAllSearchWords();
      setSearchWords(words);
    } catch (error) {
      console.error('Error loading search words:', error);
    }
  };

  const getSelectedSearchWords = (searchWordIds?: number[]) => {
    if (!searchWordIds || searchWordIds.length === 0) return [];
    const selectedWords = searchWords.filter(word => searchWordIds.includes(word.id));
    console.log('Search word IDs:', searchWordIds);
    console.log('Available search words:', searchWords);
    console.log('Selected search words:', selectedWords);
    return selectedWords;
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert(
      '削除の確認',
      `"${title}" を削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          onPress: () => onDeleteID(id),
          style: 'destructive'
        }
      ]
    );
  };

  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Text style={styles.deleteActionText}>削除</Text>
    </View>
  );

  const renderItem = ({ item }: { item: IDItem }) => (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => handleDelete(item.id, item.title)}
      rightThreshold={80}
    >
      <TouchableOpacity style={styles.item} onPress={() => onSelectID(item)}>
        <View style={styles.itemContent}>
          <View style={styles.itemInfo}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
              {getSelectedSearchWords(item.searchWordIds).length > 0 && (
                <View style={styles.searchWordBadges}>
                  {getSelectedSearchWords(item.searchWordIds).map((word) => (
                    <View key={word.id} style={styles.searchWordItem}>
                      <View style={[styles.colorIndicator, { backgroundColor: word.color }]} />
                      <Text style={styles.searchWordText}>{word.word}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {item.notes && (
              <Text style={styles.notes} numberOfLines={2}>
                {item.notes}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => onSearch(item.title, item)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <IconSymbol name="magnifyingglass" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <FlatList
      data={ids}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>IDが登録されていません</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'column',
    marginBottom: 4,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
  searchWordBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  searchWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  searchWordText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
  },
  notes: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  searchButton: {
    padding: 10,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    marginVertical: 6,
    marginRight: 20,
    borderRadius: 16,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 17,
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
});