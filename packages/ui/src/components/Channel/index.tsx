import * as db from '@tloncorp/shared/dist/db';
import { Story } from '@tloncorp/shared/dist/urbit';
import { Upload } from 'packages/shared/dist/api';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import {
  CalmProvider,
  CalmState,
  ContactsProvider,
  GroupsProvider,
} from '../../contexts';
import { Spinner, View, YStack } from '../../core';
import * as utils from '../../utils';
import { MessageInput } from '../MessageInput';
import { ChannelHeader } from './ChannelHeader';
import ChatScroll from './ChatScroll';
import UploadedImagePreview from './UploadedImagePreview';

export function Channel({
  channel,
  currentUserId,
  posts,
  selectedPost,
  contacts,
  group,
  calmSettings,
  goBack,
  goToChannels,
  goToSearch,
  goToImageViewer,
  goToPost,
  messageSender,
  setImageAttachment,
  onScrollEndReached,
  onScrollStartReached,
  uploadedImage,
  resetImageAttachment,
  // TODO: implement gallery and notebook
  type,
  isLoadingPosts,
}: {
  channel: db.ChannelWithLastPostAndMembers;
  currentUserId: string;
  selectedPost?: string;
  posts: db.PostWithRelations[] | null;
  contacts: db.Contact[] | null;
  group: db.GroupWithRelations | null;
  calmSettings: CalmState;
  goBack: () => void;
  goToChannels: () => void;
  goToPost: (post: db.PostInsert) => void;
  goToImageViewer: (post: db.PostInsert, imageUri?: string) => void;
  goToSearch: () => void;
  messageSender: (content: Story, channelId: string) => void;
  setImageAttachment: (image: string | null) => void;
  uploadedImage?: Upload | null;
  resetImageAttachment: () => void;
  type?: 'chat' | 'gallery' | 'notebook';
  onScrollEndReached?: () => void;
  onScrollStartReached?: () => void;
  isLoadingPosts?: boolean;
}) {
  const [inputShouldBlur, setInputShouldBlur] = useState(false);
  const title = utils.getChannelTitle(channel);

  return (
    <CalmProvider initialCalm={calmSettings}>
      <GroupsProvider groups={group ? [group] : null}>
        <ContactsProvider contacts={contacts ?? null}>
          <YStack justifyContent="space-between" width="100%" height="100%">
            <ChannelHeader
              title={title}
              goBack={goBack}
              goToChannels={goToChannels}
              goToSearch={goToSearch}
              showPickerButton={!!group}
              showSpinner={isLoadingPosts}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
              style={{ flex: 1 }}
              contentContainerStyle={{ flex: 1 }}
            >
              <YStack flex={1}>
                {uploadedImage && uploadedImage.url !== '' ? (
                  <UploadedImagePreview
                    uploadedImage={uploadedImage}
                    resetImageAttachment={resetImageAttachment}
                  />
                ) : !posts || !contacts ? (
                  <View flex={1} alignItems="center" justifyContent="center">
                    <Spinner />
                  </View>
                ) : (
                  <ChatScroll
                    currentUserId={currentUserId}
                    unreadCount={channel.unreadCount ?? undefined}
                    selectedPost={selectedPost}
                    firstUnread={channel.firstUnreadPostId ?? undefined}
                    posts={posts}
                    channelType={channel.type}
                    onPressReplies={goToPost}
                    onPressImage={goToImageViewer}
                    setInputShouldBlur={setInputShouldBlur}
                    onEndReached={onScrollEndReached}
                    onStartReached={onScrollStartReached}
                  />
                )}
                <MessageInput
                  shouldBlur={inputShouldBlur}
                  setShouldBlur={setInputShouldBlur}
                  send={messageSender}
                  channelId={channel.id}
                  setImageAttachment={setImageAttachment}
                  uploadedImage={uploadedImage}
                />
              </YStack>
            </KeyboardAvoidingView>
          </YStack>
        </ContactsProvider>
      </GroupsProvider>
    </CalmProvider>
  );
}
