import type * as db from '@tloncorp/shared/dist/db';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { View, YStack } from '../core';
import { ChannelHeader } from './Channel/ChannelHeader';
import Scroller from './Channel/Scroller';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';

export function PostScreenView({
  currentUserId,
  channel,
  posts,
  goBack,
}: {
  currentUserId: string;
  channel: db.Channel | null;
  posts: db.Post[] | null;
  goBack?: () => void;
}) {
  return (
    <YStack flex={1} backgroundColor={'$background'}>
      <ChannelHeader
        title={'Thread: ' + (channel?.title ?? null)}
        goBack={goBack}
        showPickerButton={false}
        showSearchButton={false}
      />
      <KeyboardAvoidingView
        //TODO: Standardize this component, account for tab bar in a better way
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={70}
        style={{ flex: 1 }}
      >
        {posts && channel && (
          <Scroller
            inverted
            renderItem={ChatMessage}
            channelType={channel.type}
            currentUserId={currentUserId}
            posts={posts}
            showReplies={false}
          />
        )}
        {channel && (
          // Interaction disabled for now, will implement whatever blur solution
          // we end up with.
          <View pointerEvents="none">
            <MessageInput
              shouldBlur={false}
              setShouldBlur={() => {}}
              send={() => {}}
              channelId={channel.id}
              setImageAttachment={() => {}}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </YStack>
  );
}
