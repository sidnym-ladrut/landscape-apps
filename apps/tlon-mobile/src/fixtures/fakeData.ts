import type { ClientTypes } from '@tloncorp/shared';
import type { Story } from '@tloncorp/shared/dist/urbit/channel';

export const createSimpleContent = (str: string): string => {
  return JSON.stringify([
    {
      inline: [str],
    },
  ] as Story);
};

export const emptyContact: ClientTypes.Contact = {
  id: '',
  nickname: null,
  bio: null,
  color: null,
  avatarImage: null,
  status: null,
  coverImage: null,
  pinnedGroupIds: [''],
};

export const galenContact: ClientTypes.Contact = {
  ...emptyContact,
  id: '~ravmel-ropdyl',
  nickname: 'galen',
};

export const jamesContact: ClientTypes.Contact = {
  ...emptyContact,
  id: '~rilfun-lidlen',
  nickname: 'james',
};

export const danContact: ClientTypes.Contact = {
  ...emptyContact,
  id: '~solfer-magfed',
  nickname: 'Dan',
};

export const hunterContact: ClientTypes.Contact = {
  ...emptyContact,
  id: '~nocsyx-lassul',
  nickname: '~nocsyx-lassul ⚗️',
};

export const brianContact: ClientTypes.Contact = {
  ...emptyContact,
  id: '~latter-bolden',
  nickname: 'brian',
};

export const initialContacts: Record<string, ClientTypes.Contact> = {
  '~ravmel-ropdyl': galenContact,
  '~rilfun-lidlen': jamesContact,
  '~solfer-magfed': danContact,
  '~nocsyx-lassul': hunterContact,
  '~latter-bolden': brianContact,
};

export const group: ClientTypes.Group = {
  id: '~nibset-napwyn/tlon',
  title: 'Tlon Local',
  members: [
    {
      id: '~ravmel-ropdyl',
      roles: ['admin'],
      joinedAt: 0,
    },
    {
      id: '~rilfun-lidlen',
      roles: ['admin'],
      joinedAt: 0,
    },
    {
      id: '~solfer-magfed',
      roles: ['admin'],
      joinedAt: 0,
    },
    {
      id: '~nocsyx-lassul',
      roles: ['admin'],
      joinedAt: 0,
    },
    {
      id: '~latter-bolden',
      roles: ['admin'],
      joinedAt: 0,
    },
  ],
  isSecret: false,
};

export const fakeContent: Record<string, ClientTypes.Post['content']> = {
  yo: createSimpleContent('yo'),
  hey: createSimpleContent('hey'),
  lol: createSimpleContent('lol'),
  sup: createSimpleContent('sup'),
  hi: createSimpleContent('hi'),
  hello: createSimpleContent('hello'),
  howdy: createSimpleContent('howdy'),
  greetings: createSimpleContent('greetings'),
  salutations: createSimpleContent('salutations'),
  why: createSimpleContent('why?'),
  what: createSimpleContent('what?'),
  where: createSimpleContent('where?'),
  when: createSimpleContent('when?'),
};

export const tlonLocalChannel: ClientTypes.Channel = {
  id: '~nibset-napwyn/intros',
  title: 'Intros',
  group,
};

const getRandomFakeContent = () => {
  const keys = Object.keys(fakeContent);
  return fakeContent[keys[Math.floor(Math.random() * keys.length)]];
};

const getRandomFakeContact = () => {
  const keys = Object.keys(initialContacts);
  return initialContacts[keys[Math.floor(Math.random() * keys.length)]];
};

export const createFakePost = (): ClientTypes.Post => {
  const ship = getRandomFakeContact().id;
  const id = Math.random().toString(36).substring(7);

  return {
    id: `${ship}-${id}`,
    author: getRandomFakeContact(),
    channel: tlonLocalChannel,
    content: getRandomFakeContent(),
    sentAt: '0',
    replyCount: 0,
    type: 'chat',
    group,
  };
};

export const createFakePosts = (count: number): ClientTypes.Post[] => {
  const posts = [];
  for (let i = 0; i < count; i++) {
    posts.push(createFakePost());
  }
  return posts;
};
