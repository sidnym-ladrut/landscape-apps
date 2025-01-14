import * as db from '@tloncorp/shared/dist/db';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactsProvider } from '../contexts';
import { SizableText } from '../core';
import ChannelNavSections from './ChannelNavSections';
import { Sheet } from './Sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: db.Group;
  channels: db.Channel[];
  contacts: db.Contact[];
  onSelect: (channel: db.Channel) => void;
}

export function ChannelSwitcherSheet({
  open,
  onOpenChange,
  group,
  channels,
  onSelect,
  contacts,
}: Props) {
  const [hasOpened, setHasOpened] = useState(open);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    setHasOpened(open);
  }, [open]);
  return (
    <ContactsProvider contacts={contacts}>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        modal
        dismissOnSnapToBottom
        snapPointsMode="percent"
        snapPoints={[90]}
        animation="quick"
      >
        <Sheet.Overlay animation="quick" />
        <Sheet.Frame>
          <Sheet.Handle paddingTop="$xl" />
          <Sheet.ScrollView gap="$xl" paddingHorizontal="$xl" paddingTop="$xl">
            <SizableText
              fontSize="$l"
              fontWeight="500"
              color="$primaryText"
              paddingHorizontal="$l"
            >
              {group?.title}
            </SizableText>
            {hasOpened && (
              <ChannelNavSections
                group={group}
                channels={channels}
                onSelect={onSelect}
                paddingBottom={bottom}
              />
            )}
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </ContactsProvider>
  );
}
