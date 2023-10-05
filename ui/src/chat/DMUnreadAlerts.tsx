import React, { useCallback } from 'react';
import { format, isToday } from 'date-fns';
import { daToUnix, udToDec } from '@urbit/api';
import bigInt from 'big-integer';
import { VirtuosoHandle } from 'react-virtuoso';
import XIcon from '@/components/icons/XIcon';
import { pluralize } from '@/logic/utils';
import { useChatKeys, useChatState, useGetFirstDMUnreadID } from '@/state/chat';
import { useChatInfo, useChatStore } from './useChatStore';

interface DMUnreadAlertsProps {
  scrollerRef: React.RefObject<VirtuosoHandle>;
  whom: string;
}

export default function DMUnreadAlerts({
  scrollerRef,
  whom,
}: DMUnreadAlertsProps) {
  const chatInfo = useChatInfo(whom);
  const markRead = useCallback(() => {
    useChatState.getState().markDmRead(whom);
    useChatStore.getState().read(whom);
  }, [whom]);

  // TODO: how to handle replies?
  const firstDMUnreadID = useGetFirstDMUnreadID(whom);
  const keys = useChatKeys({ whom, replying: false });
  const goToFirstUnread = useCallback(() => {
    if (!scrollerRef.current) {
      return;
    }

    if (!firstDMUnreadID) {
      return;
    }

    const idx = keys.findIndex((k) => k.greaterOrEquals(firstDMUnreadID));
    if (idx === -1) {
      return;
    }

    scrollerRef.current.scrollToIndex({
      index: idx,
      align: 'start',
      behavior: 'auto',
    });
  }, [firstDMUnreadID, keys, scrollerRef]);

  if (!chatInfo.unread || chatInfo.unread.seen) {
    return null;
  }

  const { unread } = chatInfo.unread;
  const readId = unread['read-id'];
  const udTime = readId
    ? daToUnix(bigInt(udToDec(readId.split('/')[1])))
    : null;
  const date = udTime ? new Date(udTime) : new Date();
  const since = isToday(date)
    ? `${format(date, 'HH:mm')} today`
    : format(date, 'LLLL d');

  const unreadMessage =
    unread &&
    `${unread.count} new ${pluralize('message', unread.count)} since ${since}`;

  if (!unread || unread?.count === 0) {
    return null;
  }

  return (
    <>
      <div className="absolute top-2 left-1/2 z-20 flex w-full -translate-x-1/2 flex-wrap items-center justify-center gap-2">
        <button
          className="button whitespace-nowrap bg-blue-soft text-sm text-blue dark:bg-blue-900 lg:text-base"
          onClick={goToFirstUnread}
        >
          <span className="whitespace-nowrap font-normal">
            {unreadMessage}&nbsp;&mdash;&nbsp;Click to View
          </span>
        </button>
        <button
          className="button whitespace-nowrap bg-blue-soft px-2 text-sm text-blue dark:bg-blue-900 lg:text-base"
          onClick={markRead}
        >
          <XIcon className="h-4 w-4" aria-label="Mark as Read" />
        </button>
      </div>
      <div />
    </>
  );
}
