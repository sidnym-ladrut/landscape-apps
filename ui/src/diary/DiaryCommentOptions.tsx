import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useCopy } from '@/logic/utils';
import { canWriteChannel } from '@/logic/channel';
import { useAmAdmin, useGroup, useRouteGroup, useVessel } from '@/state/groups';
import IconButton from '@/components/IconButton';
import BubbleIcon from '@/components/icons/BubbleIcon';
import FaceIcon from '@/components/icons/FaceIcon';
import XIcon from '@/components/icons/XIcon';
import CopyIcon from '@/components/icons/CopyIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import EmojiPicker from '@/components/EmojiPicker';
import { Han, Quip } from '@/types/channel';
import {
  useAddQuipFeelMutation,
  useDeleteQuipMutation,
  usePerms,
} from '@/state/channel/channel';
import ConfirmationModal from '@/components/ConfirmationModal';
import useRequestState from '@/logic/useRequestState';
import { useIsMobile } from '@/logic/useMedia';

export default function DiaryCommentOptions({
  han,
  whom,
  noteId,
  quip,
  time,
  hideReply,
}: {
  han: Han;
  whom: string;
  noteId: string;
  quip: Quip;
  time: string;
  hideReply?: boolean;
}) {
  const groupFlag = useRouteGroup();
  const isAdmin = useAmAdmin(groupFlag);
  const [searchParams, setSearchParms] = useSearchParams();
  const { didCopy, doCopy } = useCopy(
    `/1/chan/${han}/${whom}/note/${noteId}/msg/${time}`
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { chShip, chName } = useParams();
  const chFlag = `${chShip}/${chName}`;
  const nest = `diary/${chFlag}`;
  const perms = usePerms(nest);
  const vessel = useVessel(groupFlag, window.our);
  const group = useGroup(groupFlag);
  const canWrite = canWriteChannel(perms, vessel, group?.bloc);
  const isMobile = useIsMobile();
  const { mutateAsync: delQuip } = useDeleteQuipMutation();
  const { mutateAsync: addQuipFeel } = useAddQuipFeelMutation();
  const {
    isPending: isDeletePending,
    setPending: setDeletePending,
    setReady: setDeleteReady,
    setFailed: setDeleteFailed,
  } = useRequestState();

  const onDelete = async () => {
    setDeletePending();
    try {
      await delQuip({ nest: `${han}/${whom}`, noteId, quipId: time });
    } catch (e) {
      setDeleteFailed();
      console.error('Failed to delete comment', e);
    }
    setDeleteReady();
  };

  const onCopy = useCallback(() => {
    doCopy();
  }, [doCopy]);

  const reply = useCallback(() => {
    setSearchParms({
      quip_reply: time,
    });
  }, [time, setSearchParms]);

  const onEmoji = useCallback(
    async (emoji: { shortcodes: string }) => {
      try {
        await addQuipFeel({
          nest: `${han}/${whom}`,
          noteId,
          quipId: time,
          feel: emoji.shortcodes,
        });
      } catch (e) {
        console.error('Failed to add emoji', e);
      }
      setPickerOpen(false);
    },
    [noteId, time, whom, addQuipFeel, han]
  );

  const openPicker = useCallback(() => setPickerOpen(true), [setPickerOpen]);

  return (
    <div className="absolute right-2 -top-5 z-10 flex space-x-0.5 rounded-lg border border-gray-100 bg-white p-[1px] align-middle opacity-0 group-one-hover:opacity-100">
      {canWrite && !isMobile ? (
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
            action={openPicker}
          />
        </EmojiPicker>
      ) : null}
      {!hideReply ? (
        <IconButton
          icon={<BubbleIcon className="h-6 w-6 text-gray-400" />}
          label="Reply"
          showTooltip
          action={reply}
        />
      ) : null}
      {groupFlag ? (
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
      ) : null}
      {/* <IconButton
        icon={<ShareIcon className="h-6 w-6 text-gray-400" />}
        label="Send to..."
        showTooltip
        action={() => console.log('send to..')}
      /> */}
      {isAdmin || window.our === quip.memo.author ? (
        <IconButton
          icon={<XIcon className="h-6 w-6 text-red" />}
          label="Delete"
          showTooltip
          action={() => setDeleteOpen(true)}
        />
      ) : null}

      {/* <IconButton
        icon={<EllipsisIcon className="h-6 w-6 text-gray-400" />}
        label="More..."
        showTooltip
        action={() => console.log('More...')}
      /> */}
      <ConfirmationModal
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        onConfirm={onDelete}
        open={deleteOpen}
        setOpen={setDeleteOpen}
        loading={isDeletePending}
      />
    </div>
  );
}
