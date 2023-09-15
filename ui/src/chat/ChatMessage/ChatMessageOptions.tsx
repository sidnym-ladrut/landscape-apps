import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useCopy, useIsInThread, useThreadParentId } from '@/logic/utils';
import { canWriteChannel } from '@/logic/channel';
import { useAmAdmin, useGroup, useRouteGroup, useVessel } from '@/state/groups';
import { useIsDmOrMultiDm, useChatState } from '@/state/chat';
import IconButton from '@/components/IconButton';
import useEmoji from '@/state/emoji';
import BubbleIcon from '@/components/icons/BubbleIcon';
import FaceIcon from '@/components/icons/FaceIcon';
import HashIcon from '@/components/icons/HashIcon';
import XIcon from '@/components/icons/XIcon';
import { useChatDialog } from '@/chat/useChatStore';
import CopyIcon from '@/components/icons/CopyIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import EmojiPicker from '@/components/EmojiPicker';
import ConfirmationModal from '@/components/ConfirmationModal';
import ActionMenu, { Action } from '@/components/ActionMenu';
import useRequestState from '@/logic/useRequestState';
import { useIsMobile } from '@/logic/useMedia';
import useGroupPrivacy from '@/logic/useGroupPrivacy';
import { captureGroupsAnalyticsEvent } from '@/logic/analytics';
import AddReactIcon from '@/components/icons/AddReactIcon';
import {
  useAddNoteFeelMutation,
  useAddQuipFeelMutation,
  useDeleteNoteMutation,
  usePerms,
} from '@/state/channel/channel';
import { emptyNote, Note } from '@/types/channel';

export default function ChatMessageOptions(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whom: string;
  writ: Note;
  hideThreadReply?: boolean;
  hideReply?: boolean;
  openReactionDetails: () => void;
}) {
  const {
    open,
    onOpenChange,
    whom,
    writ = emptyNote,
    hideThreadReply,
    hideReply,
    openReactionDetails,
  } = props;
  const { seal, essay } = writ;
  const groupFlag = useRouteGroup();
  const isAdmin = useAmAdmin(groupFlag);
  const { didCopy, doCopy } = useCopy(`/1/chan/chat/${whom}/msg/${seal.id}`);
  const { open: pickerOpen, setOpen: setPickerOpen } = useChatDialog(
    whom,
    seal.id,
    'picker'
  );
  const { open: deleteOpen, setOpen: setDeleteOpen } = useChatDialog(
    whom,
    seal.id,
    'delete'
  );
  const {
    isPending: isDeletePending,
    setPending: setDeletePending,
    setReady,
  } = useRequestState();
  const { chShip, chName } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { load: loadEmoji } = useEmoji();
  const isMobile = useIsMobile();
  const chFlag = `${chShip}/${chName}`;
  const nest = `chat/${chFlag}`;
  const perms = usePerms(nest);
  const vessel = useVessel(groupFlag, window.our);
  const group = useGroup(groupFlag);
  const { privacy } = useGroupPrivacy(groupFlag);
  const canWrite = canWriteChannel(perms, vessel, group?.bloc);
  const navigate = useNavigate();
  const location = useLocation();
  const inThread = useIsInThread();
  const threadParentId = useThreadParentId();
  const { mutate: deleteChatMessage } = useDeleteNoteMutation();
  const { mutate: addFeelToChat } = useAddNoteFeelMutation();
  const { mutate: addFeelToQuip } = useAddQuipFeelMutation();
  const isDMorMultiDM = useIsDmOrMultiDm(whom);

  const onDelete = async () => {
    if (isMobile) {
      onOpenChange(false);
    }

    setDeletePending();

    try {
      if (isDMorMultiDM) {
        useChatState.getState().delDm(whom, seal.id);
      } else {
        deleteChatMessage({
          nest,
          time: seal.id,
        });
      }
    } catch (e) {
      console.log('Failed to delete message', e);
    }
    setReady();
  };

  const onCopy = useCallback(() => {
    doCopy();

    if (isMobile) {
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  }, [doCopy, isMobile, onOpenChange]);

  const reply = useCallback(() => {
    setSearchParams({ chat_reply: seal.id }, { replace: true });
  }, [seal, setSearchParams]);

  const onEmoji = useCallback(
    (emoji: { shortcodes: string }) => {
      if (isDMorMultiDM) {
        useChatState.getState().addFeelToDm(whom, seal.id, emoji.shortcodes);
      } else if (inThread) {
        addFeelToQuip({
          nest,
          noteId: threadParentId!,
          quipId: seal.id,
          feel: emoji.shortcodes,
        });
      } else {
        addFeelToChat({
          nest,
          noteId: seal.id,
          feel: emoji.shortcodes,
        });
      }
      captureGroupsAnalyticsEvent({
        name: 'react_item',
        groupFlag,
        chFlag: whom,
        channelType: 'chat',
        privacy,
      });
      setPickerOpen(false);
    },
    [
      whom,
      groupFlag,
      privacy,
      seal,
      setPickerOpen,
      addFeelToChat,
      nest,
      isDMorMultiDM,
      addFeelToQuip,
      inThread,
      threadParentId,
    ]
  );

  const openPicker = useCallback(() => setPickerOpen(true), [setPickerOpen]);

  useEffect(() => {
    if (isMobile) {
      loadEmoji();
    }
  }, [isMobile, loadEmoji]);

  const showReactAction = canWrite;
  const showReplyAction = !hideReply;
  const showThreadAction = !threadParentId && !hideThreadReply;
  const showCopyAction = !!groupFlag;
  const showDeleteAction = isAdmin || window.our === essay.author;
  const reactionsCount = Object.keys(seal.feels).length;

  const actions: Action[] = [];

  if (showReactAction) {
    actions.push({
      key: 'react',
      content: (
        <div className="flex items-center" aria-label="React">
          <AddReactIcon className="mr-2 h-6 w-6" />
          React
        </div>
      ),
      onClick: () => {
        navigate(`picker/${seal.id}`, {
          state: { backgroundLocation: location },
        });
      },
    });
  }

  if (reactionsCount > 0) {
    actions.push({
      key: 'show-all-reactions',
      content: (
        <div className="flex items-center">
          <FaceIcon className="mr-2 h-6 w-6" />
          View Reactions
        </div>
      ),
      onClick: () => openReactionDetails(),
      keepOpenOnClick: false,
    });
  }

  if (showReplyAction) {
    actions.push({
      key: 'reply',
      content: (
        <div className="flex items-center">
          <BubbleIcon className="mr-2 h-6 w-6" />
          Reply
        </div>
      ),
      onClick: reply,
    });
  }

  if (showThreadAction) {
    actions.push({
      key: 'thread',
      content: (
        <div className="flex items-center">
          <HashIcon className="mr-2 h-6 w-6" />
          Start Thread
        </div>
      ),
      onClick: () => navigate(`message/${seal.id}`),
    });
  }

  if (showCopyAction) {
    actions.push({
      key: 'copy',
      content: (
        <div className="flex items-center">
          {didCopy ? (
            <CheckIcon className="mr-2 h-6 w-6" />
          ) : (
            <CopyIcon className="mr-2 h-6 w-6" />
          )}
          {didCopy ? 'Copied!' : 'Copy'}
        </div>
      ),
      onClick: onCopy,
      keepOpenOnClick: true,
    });
  }

  if (showDeleteAction) {
    actions.push({
      key: 'delete',
      type: 'destructive',
      content: (
        <div className="flex items-center">
          <XIcon className="mr-2 h-6 w-6" />
          Delete
        </div>
      ),
      onClick: () => setDeleteOpen(true),
      keepOpenOnClick: true,
    });
  }

  if (!open && !isMobile) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <ActionMenu open={open} onOpenChange={onOpenChange} actions={actions} />
      ) : (
        <div className="absolute right-2 -top-5 z-10 h-full">
          <div
            data-testid="chat-message-options"
            className="sticky top-0 flex space-x-0.5 rounded-lg border border-gray-100 bg-white p-[1px] align-middle"
          >
            {showReactAction && (
              <EmojiPicker
                open={pickerOpen}
                setOpen={setPickerOpen}
                onEmojiSelect={onEmoji}
                withTrigger={false}
              >
                <IconButton
                  icon={<FaceIcon className="h-6 w-6 text-gray-400" />}
                  label="React"
                  showTooltip
                  aria-label="React"
                  action={openPicker}
                />
              </EmojiPicker>
            )}
            {showReplyAction && (
              <IconButton
                icon={<BubbleIcon className="h-6 w-6 text-gray-400" />}
                label="Reply"
                showTooltip
                action={reply}
              />
            )}
            {showThreadAction && (
              <IconButton
                icon={<HashIcon className="h-6 w-6 text-gray-400" />}
                label="Start Thread"
                showTooltip
                action={() => navigate(`message/${seal.id}`)}
              />
            )}
            {showCopyAction && (
              <IconButton
                icon={
                  didCopy ? (
                    <CheckIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <CopyIcon className="h-6 w-6 text-gray-400" />
                  )
                }
                label="Copy"
                showTooltip
                action={onCopy}
              />
            )}
            {reactionsCount > 0 && (
              <IconButton
                icon={
                  <span className="align-baseline font-semibold text-gray-400">
                    {reactionsCount}
                  </span>
                }
                label="View Reactions"
                action={openReactionDetails}
              />
            )}
            {showDeleteAction && (
              <IconButton
                icon={<XIcon className="h-6 w-6 text-red" />}
                label="Delete"
                showTooltip
                action={() => setDeleteOpen(true)}
              />
            )}
          </div>
        </div>
      )}
      <ConfirmationModal
        title="Delete Message"
        message="Are you sure you want to delete this message?"
        onConfirm={onDelete}
        open={deleteOpen}
        setOpen={setDeleteOpen}
        confirmText="Delete"
        loading={isDeletePending}
      />
    </>
  );
}
