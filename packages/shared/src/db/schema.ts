import { relations } from 'drizzle-orm';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { Rank } from '../urbit';

const boolean = (name: string) => {
  return integer(name, { mode: 'boolean' });
};

const timestamp = (name: string) => {
  return integer(name);
};

const metaFields = {
  iconImage: text('icon_image'),
  iconImageColor: text('icon_image_color'),
  coverImage: text('cover_image'),
  coverImageColor: text('cover_image_color'),
  title: text('title'),
  description: text('description'),
};

export const settings = sqliteTable('settings', {
  userId: text('user_id').primaryKey(),
  theme: text('theme'),
  disableAppTileUnreads: boolean('disable_app_tile_unreads'),
  disableAvatars: boolean('disable_avatars'),
  disableRemoteContent: boolean('disable_remote_content'),
  disableSpellcheck: boolean('disable_spellcheck'),
  disableNicknames: boolean('disable_nicknames'),
  orderedGroupPins: text('ordered_group_pins', { mode: 'json' }),
  sideBarSort: text('side_bar_sort').$type<
    'alphabetical' | 'arranged' | 'recent'
  >(),
  groupSideBarSort: text('group_side_bar_sort', { mode: 'json' }),
  showActivityMessage: boolean('show_activity_message'),
  logActivity: boolean('log_activity'),
  analyticsId: text('analytics_id'),
  seenWelcomeCard: boolean('seen_welcome_card'),
  newGroupFlags: text('new_group_flags', { mode: 'json' }),
  groupsNavState: text('groups_nav_state'),
  messagesNavState: text('messages_nav_state'),
  messagesFilter: text('messages_filter'),
  gallerySettings: text('gallery_settings'),
  notebookSettings: text('notebook_settings', { mode: 'json' }),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  nickname: text('nickname'),
  bio: text('bio'),
  status: text('status'),
  color: text('color'),
  avatarImage: text('avatarImage'),
  coverImage: text('coverImage'),
  isBlocked: boolean('blocked'),
});

export const contactsRelations = relations(contacts, ({ many }) => ({
  pinnedGroups: many(contactGroups),
}));

export const contactGroups = sqliteTable(
  'contact_group_pins',
  {
    contactId: text('contact_id')
      .references(() => contacts.id, { onDelete: 'cascade' })
      .notNull(),
    groupId: text('group_id')
      .references(() => groups.id)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.contactId, table.groupId] }),
    };
  }
);

export const contactGroupRelations = relations(contactGroups, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactGroups.contactId],
    references: [contacts.id],
  }),
  group: one(groups, {
    fields: [contactGroups.groupId],
    references: [groups.id],
  }),
}));

export const unreads = sqliteTable('unreads', {
  channelId: text('channel_id').primaryKey(),
  type: text('type').$type<'channel' | 'dm'>().notNull(),
  count: integer('count').notNull(),
  countWithoutThreads: integer('count_without_threads').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  firstUnreadPostId: text('first_unread_post_id'),
  firstUnreadPostReceivedAt: timestamp('first_unread_post_received_at'),
});

export const unreadsRelations = relations(unreads, ({ one, many }) => ({
  channel: one(channels, {
    fields: [unreads.channelId],
    references: [channels.id],
  }),
  threadUnreads: many(threadUnreads),
}));

export const threadUnreads = sqliteTable(
  'thread_unreads',
  {
    channelId: text('channel_id'),
    threadId: text('thread_id'),
    count: integer('count'),
    firstUnreadPostId: text('first_unread_post_id'),
    firstUnreadPostReceivedAt: timestamp('first_unread_post_received_at'),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.channelId, table.threadId],
    }),
  })
);

export const threadUnreadsRelations = relations(threadUnreads, ({ one }) => ({
  channel: one(channels, {
    fields: [threadUnreads.channelId],
    references: [channels.id],
  }),
  channelUnread: one(unreads, {
    fields: [threadUnreads.channelId],
    references: [unreads.channelId],
  }),
}));

export type PinType = 'group' | 'channel' | 'dm' | 'groupDm';
export const pins = sqliteTable(
  'pins',
  {
    type: text('type').$type<PinType>().notNull(),
    index: integer('index').notNull(),
    itemId: text('item_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.itemId] }),
    };
  }
);

export const pinRelations = relations(pins, ({ one }) => ({
  group: one(groups, {
    fields: [pins.itemId],
    references: [groups.id],
  }),
  channel: one(channels, {
    fields: [pins.itemId],
    references: [channels.id],
  }),
}));

export type GroupJoinStatus = 'joining' | 'errored';
export type GroupPrivacy = 'public' | 'private' | 'secret';

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  ...metaFields,
  privacy: text('privacy').$type<GroupPrivacy>(),
  haveInvite: boolean('have_invite'),
  haveRequestedInvite: boolean('have_requested_invite'),
  currentUserIsMember: boolean('current_user_is_member').notNull(),
  isNew: boolean('is_new'),
  joinStatus: text('join_status').$type<GroupJoinStatus>(),
  lastPostId: text('last_post_id'),
  lastPostAt: timestamp('last_post_at'),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  pin: one(pins),
  roles: many(groupRoles),
  members: many(chatMembers),
  navSections: many(groupNavSections),
  flaggedPosts: many(groupFlaggedPosts),
  channels: many(channels),
  posts: many(posts),
  lastPost: one(posts, {
    fields: [groups.lastPostId],
    references: [posts.id],
  }),
}));

export const groupRoles = sqliteTable(
  'group_roles',
  {
    id: text('id'),
    groupId: text('group_id').references(() => groups.id, {
      onDelete: 'cascade',
    }),
    ...metaFields,
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.groupId, table.id] }),
    };
  }
);

export const groupRolesRelations = relations(groupRoles, ({ one, many }) => ({
  members: many(chatMemberGroupRoles),
  group: one(groups, {
    fields: [groupRoles.groupId],
    references: [groups.id],
  }),
  writeChannels: many(channelWriters),
}));

export const chatMembers = sqliteTable(
  'group_members',
  {
    membershipType: text('membership_type')
      .$type<'group' | 'channel'>()
      .notNull(),
    chatId: text('chat_id'),
    contactId: text('contact_id').notNull(),
    joinedAt: timestamp('joined_at'),
    status: text('status').$type<'invited' | 'joined'>(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.chatId, table.contactId],
      }),
    };
  }
);

export const groupFlaggedPosts = sqliteTable(
  'group_flagged_posts',
  {
    groupId: text('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    postId: text('post_id').notNull(),
    channelId: text('channel_id').notNull(),
    flaggedByContactId: text('flagged_by_contact_id').notNull(),
    flaggedAt: timestamp('flagged_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.groupId, table.postId],
      }),
    };
  }
);

export const groupFlaggedPostsRelations = relations(
  groupFlaggedPosts,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupFlaggedPosts.groupId],
      references: [groups.id],
    }),
    post: one(posts, {
      fields: [groupFlaggedPosts.postId],
      references: [posts.id],
    }),
    channel: one(channels, {
      fields: [groupFlaggedPosts.channelId],
      references: [channels.id],
    }),
    flaggedBy: one(contacts, {
      fields: [groupFlaggedPosts.flaggedByContactId],
      references: [contacts.id],
    }),
  })
);

export const groupMemberInvites = sqliteTable(
  'group_member_invites',
  {
    groupId: text('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    contactId: text('contact_id').notNull(),
    invitedAt: timestamp('invited_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.groupId, table.contactId],
      }),
    };
  }
);

export const groupMemberInviteRelations = relations(
  groupMemberInvites,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupMemberInvites.groupId],
      references: [groups.id],
    }),
    contact: one(contacts, {
      fields: [groupMemberInvites.contactId],
      references: [contacts.id],
    }),
  })
);

export const groupMemberBans = sqliteTable(
  'group_member_bans',
  {
    groupId: text('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    contactId: text('contact_id').notNull(),
    bannedAt: timestamp('banned_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.groupId, table.contactId],
      }),
    };
  }
);

export const groupMemberBanRelations = relations(
  groupMemberBans,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupMemberBans.groupId],
      references: [groups.id],
    }),
    contact: one(contacts, {
      fields: [groupMemberBans.contactId],
      references: [contacts.id],
    }),
  })
);

export const groupRankBans = sqliteTable(
  'group_rank_bans',
  {
    groupId: text('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    rankId: text('rank_id').notNull().$type<Rank>(),
    bannedAt: timestamp('banned_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.groupId, table.rankId],
      }),
    };
  }
);

export const groupRankBanRelations = relations(groupRankBans, ({ one }) => ({
  group: one(groups, {
    fields: [groupRankBans.groupId],
    references: [groups.id],
  }),
}));

export const channelWriters = sqliteTable(
  'channel_writers',
  {
    channelId: text('channel_id').notNull(),
    roleId: text('role_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.channelId, table.roleId],
      }),
    };
  }
);

export const channelWriterRelations = relations(channelWriters, ({ one }) => {
  return {
    channel: one(channels, {
      fields: [channelWriters.channelId],
      references: [channels.id],
    }),
    role: one(groupRoles, {
      fields: [channelWriters.roleId],
      references: [groupRoles.id],
    }),
  };
});

export const chatMembersRelations = relations(chatMembers, ({ one, many }) => ({
  roles: many(chatMemberGroupRoles),
  group: one(groups, {
    fields: [chatMembers.chatId],
    references: [groups.id],
  }),
  channel: one(channels, {
    fields: [chatMembers.chatId],
    references: [channels.id],
  }),
  contact: one(contacts, {
    fields: [chatMembers.contactId],
    references: [contacts.id],
  }),
}));

export const chatMemberGroupRoles = sqliteTable(
  'chat_member_roles',
  {
    groupId: text('group_id')
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    contactId: text('contact_id').notNull(),
    roleId: text('role_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.groupId, table.contactId, table.roleId],
      }),
    };
  }
);

export const chatMemberRolesRelations = relations(
  chatMemberGroupRoles,
  ({ one }) => ({
    groupMember: one(chatMembers, {
      fields: [chatMemberGroupRoles.groupId, chatMemberGroupRoles.contactId],
      references: [chatMembers.chatId, chatMembers.contactId],
    }),
    groupRole: one(groupRoles, {
      fields: [chatMemberGroupRoles.groupId, chatMemberGroupRoles.roleId],
      references: [groupRoles.groupId, groupRoles.id],
    }),
  })
);

export const groupNavSections = sqliteTable('group_nav_sections', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, {
    onDelete: 'cascade',
  }),
  ...metaFields,
  index: integer('index'),
});

export const groupNavSectionRelations = relations(
  groupNavSections,
  ({ one, many }) => ({
    channels: many(groupNavSectionChannels),
    group: one(groups, {
      fields: [groupNavSections.groupId],
      references: [groups.id],
    }),
  })
);

export const groupNavSectionChannels = sqliteTable(
  'group_nav_section_channels',
  {
    groupNavSectionId: text('group_nav_section_id').references(
      () => groupNavSections.id
    ),
    channelId: text('channel_id').references(() => channels.id),
    index: integer('index'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupNavSectionId, table.channelId] }),
  })
);

export const groupNavSectionChannelsRelations = relations(
  groupNavSectionChannels,
  ({ one }) => ({
    groupNavSection: one(groupNavSections, {
      fields: [groupNavSectionChannels.groupNavSectionId],
      references: [groupNavSections.id],
    }),
    channel: one(channels, {
      fields: [groupNavSectionChannels.channelId],
      references: [channels.id],
    }),
  })
);

export type ChannelType = 'chat' | 'notebook' | 'gallery' | 'dm' | 'groupDm';

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(),
  type: text('type').$type<ChannelType>().notNull(),
  groupId: text('group_id').references(() => groups.id, {
    onDelete: 'cascade',
  }),
  ...metaFields,
  addedToGroupAt: timestamp('added_to_group_at'),
  currentUserIsMember: boolean('current_user_is_member'),
  postCount: integer('post_count'),
  unreadCount: integer('unread_count'),
  firstUnreadPostId: text('first_unread_post_id'),
  lastPostId: text('last_post_id'),
  lastPostAt: timestamp('last_post_at'),
  isPendingChannel: boolean('is_cached_pending_channel'),
  isDmInvite: boolean('is_dm_invite'),
  /**
   * Last time we ran a sync, in local time
   */
  syncedAt: timestamp('synced_at'),
  /**
   * Remote time that this channel was last updated.
   * From `recency` on unreads on the Urbit side
   */
  remoteUpdatedAt: timestamp('remote_updated_at'),
});

export const channelRelations = relations(channels, ({ one, many }) => ({
  pin: one(pins),
  group: one(groups, {
    fields: [channels.groupId],
    references: [groups.id],
  }),
  posts: many(posts),
  lastPost: one(posts, {
    fields: [channels.lastPostId],
    references: [posts.id],
  }),
  unread: one(unreads, {
    fields: [channels.id],
    references: [unreads.channelId],
  }),
  threadUnreads: many(threadUnreads),
  members: many(chatMembers),
  writerRoles: many(channelWriters),
}));

export type PostDeliveryStatus = 'pending' | 'sent' | 'failed';

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey().notNull(),
    authorId: text('author_id').notNull(),
    channelId: text('channel_id').notNull(),
    groupId: text('group_id'),
    parentId: text('parent_id'),
    type: text('type')
      .$type<'block' | 'chat' | 'notice' | 'note' | 'reply'>()
      .notNull(),
    title: text('title'),
    image: text('image'),
    content: text('content', { mode: 'json' }),
    receivedAt: timestamp('received_at').notNull(),
    sentAt: timestamp('sent_at').unique().notNull(),
    // client-side time
    replyCount: integer('reply_count'),
    replyTime: timestamp('reply_time'),
    replyContactIds: text('reply_contact_ids', {
      mode: 'json',
    }).$type<string[]>(),
    textContent: text('text_content'),
    hasAppReference: boolean('has_app_reference'),
    hasChannelReference: boolean('has_channel_reference'),
    hasGroupReference: boolean('has_group_reference'),
    hasLink: boolean('has_link'),
    hasImage: boolean('has_image'),
    hidden: boolean('hidden').default(false),
    isEdited: boolean('is_edited'),
    deliveryStatus: text('delivery_status').$type<PostDeliveryStatus>(),
  },
  (table) => ({
    cacheId: uniqueIndex('cache_id').on(table.authorId, table.sentAt),
  })
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  channel: one(channels, {
    fields: [posts.channelId],
    references: [channels.id],
  }),
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
  reactions: many(postReactions),
  author: one(contacts, {
    fields: [posts.authorId],
    references: [contacts.id],
  }),
  parent: one(posts, {
    fields: [posts.parentId],
    references: [posts.id],
    relationName: 'parent',
  }),
  replies: many(posts, { relationName: 'parent' }),
  images: many(postImages),
}));

export const postImages = sqliteTable(
  'post_images',
  {
    postId: text('post_id').references(() => posts.id),
    src: text('src'),
    alt: text('alt'),
    width: integer('width'),
    height: integer('height'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.src] }),
  })
);

export const postImageRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));

export const postReactions = sqliteTable(
  'post_reactions',
  {
    contactId: text('contact_id').notNull(),
    postId: text('post_id')
      .references(() => posts.id)
      .notNull(),
    value: text('value').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.contactId, table.postId] }),
    };
  }
);

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(posts, {
    fields: [postReactions.postId],
    references: [posts.id],
  }),
  contact: one(contacts, {
    fields: [postReactions.contactId],
    references: [contacts.id],
  }),
}));

export const postWindows = sqliteTable(
  'post_windows',
  {
    channelId: text('channel_id').notNull(),
    oldestPostId: text('oldest_post_id').notNull(),
    newestPostId: text('newest_post_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.channelId, table.oldestPostId, table.newestPostId],
      }),
    };
  }
);
