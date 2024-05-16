import * as db from '@tloncorp/shared/dist/db';
import * as store from '@tloncorp/shared/dist/store';
import React, { useCallback, useMemo } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStyle } from '../core';
import ChannelListItem from './ChannelListItem';
import { GroupListItem } from './GroupListItem';
import { ListItemProps } from './ListItem';
import { ListSectionHeader } from './ListSectionHeader';
import { navHeight } from './NavBar/NavBar';
import { SwipableChatRow } from './SwipableChatListItem';

export function ChatList({
  pinned,
  unpinned,
  pendingGroups,
  onLongPressItem,
  onPressItem,
}: store.CurrentChats & {
  onPressItem?: (chat: db.Channel) => void;
  onLongPressItem?: (chat: db.Channel) => void;
}) {
  const { bottom } = useSafeAreaInsets();

  const data = useMemo(() => {
    if (pinned.length === 0) {
      return [{ title: 'All', data: [...pendingGroups, ...unpinned] }];
    }

    return [
      { title: 'Pinned', data: pinned },
      { title: 'All', data: [...pendingGroups, ...unpinned] },
    ];
  }, [pinned, unpinned, pendingGroups]);

  const contentContainerStyle = useStyle(
    {
      gap: '$s',
      paddingTop: '$l',
      paddingHorizontal: '$l',
      paddingBottom: navHeight + bottom,
    },
    { resolveValues: 'value' }
  ) as StyleProp<ViewStyle>;

  const renderItem = useCallback(
    ({ item }: SectionListRenderItemInfo<db.Channel, { title: string }>) => {
      // Invitation not affected by swipe or long press
      if (item.currentUserIsMember === false) {
        return <ChatListItem model={item} onPress={onPressItem} />;
      }

      return (
        <SwipableChatRow model={item}>
          <ChatListItem
            model={item}
            onPress={onPressItem}
            onLongPress={onLongPressItem}
          />
        </SwipableChatRow>
      );
    },
    [onPressItem, onLongPressItem]
  );

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<db.Channel, { title: string }>;
    }) => {
      return <ListSectionHeader>{section.title}</ListSectionHeader>;
    },
    []
  );

  return (
    <SectionList
      sections={data}
      contentContainerStyle={contentContainerStyle}
      keyExtractor={getChannelKey}
      stickySectionHeadersEnabled={false}
      renderItem={renderItem}
      maxToRenderPerBatch={11}
      initialNumToRender={11}
      windowSize={2}
      viewabilityConfig={{
        minimumViewTime: 1000,
        itemVisiblePercentThreshold: 50,
      }}
      renderSectionHeader={renderSectionHeader}
    />
  );
}

function getChannelKey(channel: db.Channel) {
  return channel.id + channel.pin?.itemId ?? '';
}

const ChatListItem = React.memo(function ChatListItemComponent({
  model,
  onPress,
  onLongPress,
  ...props
}: ListItemProps<db.Channel | db.Group>) {
  const handlePress = useCallback(() => {
    onPress?.(model);
  }, [model, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(model);
  }, [model, onLongPress]);

  if (db.isGroup(model)) {
    return (
      <GroupListItem
        onPress={handlePress}
        onLongPress={handleLongPress}
        model={{
          ...model,
        }}
        borderRadius="$m"
        {...props}
      />
    );
  }

  if (db.isChannel(model)) {
    if (
      model.type === 'dm' ||
      model.type === 'groupDm' ||
      model.pin?.type === 'channel'
    ) {
      return (
        <ChannelListItem
          model={model}
          onPress={handlePress}
          onLongPress={handleLongPress}
          {...props}
        />
      );
    } else if (model.group) {
      return (
        <GroupListItem
          onPress={handlePress}
          onLongPress={handleLongPress}
          model={{
            ...model.group,
            unreadCount: model.unread?.count,
            lastPost: model.lastPost,
          }}
          borderRadius="$m"
          {...props}
        />
      );
    }
  }

  console.warn('unable to render chat list item', model.id, model);
  return null;
});
