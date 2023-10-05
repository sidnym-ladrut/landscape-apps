import _ from 'lodash';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import EmojiPicker from '@/components/EmojiPicker';
import AddReactIcon from '@/components/icons/AddReactIcon';
import { useIsMobile } from '@/logic/useMedia';
import { useChatState } from '@/state/chat';
import { useRouteGroup } from '@/state/groups';
import useGroupPrivacy from '@/logic/useGroupPrivacy';
import { captureGroupsAnalyticsEvent } from '@/logic/analytics';
import { useAddPostReactMutation } from '@/state/channel/channel';
import { useIsDmOrMultiDm } from '@/logic/utils';
import { PostSeal } from '@/types/channel';
import ChatReaction from './ChatReaction';

interface ChatReactionsProps {
  whom: string;
  seal: PostSeal;
  id?: string;
}

export default function ChatReactions({ whom, seal, id }: ChatReactionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reacts = _.invertBy(seal.reacts);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const groupFlag = useRouteGroup();
  const { privacy } = useGroupPrivacy(groupFlag);
  const isDMOrMultiDM = useIsDmOrMultiDm(whom);
  const { mutate: addChatReact } = useAddPostReactMutation();
  const nest = `chat/${whom}`;

  const onEmoji = useCallback(
    (emoji: { shortcodes: string }) => {
      if (isDMOrMultiDM) {
        useChatState.getState().addReactToDm(whom, seal.id, emoji.shortcodes);
      } else {
        addChatReact({
          nest,
          postId: seal.id,
          react: emoji.shortcodes,
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
    [whom, groupFlag, privacy, seal, isDMOrMultiDM, addChatReact, nest]
  );

  const openPicker = useCallback(() => setPickerOpen(true), [setPickerOpen]);

  return (
    <div id={id} className="my-2 flex items-center space-x-2">
      {Object.entries(reacts).map(([react, ships]) => (
        <ChatReaction
          key={react}
          seal={seal}
          ships={ships}
          react={react}
          whom={whom}
        />
      ))}
      {!isMobile ? (
        <EmojiPicker
          open={pickerOpen}
          setOpen={setPickerOpen}
          onEmojiSelect={onEmoji}
        >
          <button
            className="appearance-none border-none bg-transparent"
            onClick={openPicker}
            aria-label="Add Reaction"
          >
            <AddReactIcon className="h-6 w-6 text-gray-400" />
          </button>
        </EmojiPicker>
      ) : (
        <button
          className="appearance-none border-none bg-transparent"
          onClick={() =>
            navigate(`picker/${seal.id}`, {
              state: { backgroundLocation: location },
            })
          }
          aria-label="Add Reaction"
        >
          <AddReactIcon className="h-6 w-6 text-gray-400" />
        </button>
      )}
    </div>
  );
}
